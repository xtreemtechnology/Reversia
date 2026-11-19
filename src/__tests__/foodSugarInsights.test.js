/**
 * Tests for the food-to-sugar insights service.
 *
 * Pure functions over log arrays shaped like the Firestore logs in
 * users/{uid}/logs. No network or Firestore calls are made here.
 */

import {
  classifyRise,
  matchGuideFoods,
  pairReadingsWithMeals,
  aggregateByFood,
  aggregateByMeal,
  buildFoodSugarSummary,
  toMgdl,
  toDate,
} from "../features/insights/services/foodSugarService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTimestamp(date) {
  const d = date instanceof Date ? date : new Date(date);
  return { toDate: () => d };
}

const BASE = new Date("2026-11-19T08:00:00.000Z");
const HOUR = 60 * 60 * 1000;

function at(hoursOffset) {
  return new Date(BASE.getTime() + hoursOffset * HOUR);
}

let seq = 0;

function makeMeal(overrides = {}) {
  seq += 1;
  return {
    id: `meal-${seq}`,
    category: "meal",
    name: "Jollof Rice, Chicken Stew",
    mealType: "Lunch",
    carbs: 70,
    createdAt: makeTimestamp(at(0)),
    ...overrides,
  };
}

function makeReading(overrides = {}) {
  seq += 1;
  return {
    id: `reading-${seq}`,
    category: "glucose",
    value: 150,
    unit: "mg/dL",
    context: "after_meal_2h",
    readingTime: at(1).toISOString(),
    createdAt: makeTimestamp(at(1)),
    ...overrides,
  };
}

// ─── Unit conversion ────────────────────────────────────────────────────────────

describe("toMgdl", () => {
  it("passes mg/dL values through rounded", () => {
    expect(toMgdl(150.4, "mg/dL")).toBe(150);
    expect(toMgdl("180", "mg/dL")).toBe(180);
  });

  it("converts mmol/L to mg/dL", () => {
    // 7.5 mmol/L is about 135 mg/dL
    expect(toMgdl(7.5, "mmol/L")).toBe(135);
    expect(toMgdl(5.5, "mmol/L")).toBe(99);
  });

  it("returns null for missing or invalid values", () => {
    expect(toMgdl(null, "mg/dL")).toBe(null);
    expect(toMgdl(undefined, "mg/dL")).toBe(null);
    expect(toMgdl("abc", "mg/dL")).toBe(null);
    expect(toMgdl(0, "mg/dL")).toBe(null);
    expect(toMgdl(-10, "mg/dL")).toBe(null);
  });
});

describe("toDate", () => {
  it("accepts Firestore Timestamps, Dates, ISO strings and ms numbers", () => {
    expect(toDate(makeTimestamp(at(0))).getTime()).toBe(at(0).getTime());
    expect(toDate(at(0)).getTime()).toBe(at(0).getTime());
    expect(toDate(at(0).toISOString()).getTime()).toBe(at(0).getTime());
    expect(toDate(at(0).getTime()).getTime()).toBe(at(0).getTime());
  });

  it("returns null for missing or unparseable values", () => {
    expect(toDate(null)).toBe(null);
    expect(toDate(undefined)).toBe(null);
    expect(toDate("not a date")).toBe(null);
    expect(toDate({})).toBe(null);
  });
});

// ─── Rise classification ────────────────────────────────────────────────────────

describe("classifyRise", () => {
  it("classifies the threshold edges exactly", () => {
    expect(classifyRise(30)).toBe("steady");
    expect(classifyRise(31)).toBe("moderate");
    expect(classifyRise(70)).toBe("moderate");
    expect(classifyRise(71)).toBe("sharp");
  });

  it("treats a fall as steady", () => {
    expect(classifyRise(-20)).toBe("steady");
    expect(classifyRise(0)).toBe("steady");
  });

  it("returns no-baseline when there is no rise to classify", () => {
    expect(classifyRise(null)).toBe("no-baseline");
    expect(classifyRise(undefined)).toBe("no-baseline");
  });
});

// ─── Matching logged meal names to the Food Guide ───────────────────────────────

describe("matchGuideFoods", () => {
  it("matches comma-joined meal names to guide foods", () => {
    const foods = matchGuideFoods("Jollof Rice, Chicken Stew");
    expect(foods.map((f) => f.id)).toEqual([
      "jollof-rice",
      "chicken-stew",
    ]);
  });

  it("matches names with parentheticals and aliases", () => {
    expect(matchGuideFoods("Beans (Ewa)").map((f) => f.id)).toEqual([
      "beans-ewa",
    ]);
    expect(matchGuideFoods("Ofe Onugbu (Bitter Leaf Soup)").map((f) => f.id)).toEqual([
      "bitter-leaf-soup",
    ]);
    expect(matchGuideFoods("Moin Moin").map((f) => f.id)).toEqual(["moi-moi"]);
    expect(matchGuideFoods("Dodo").map((f) => f.id)).toEqual([
      "fried-plantain",
    ]);
  });

  it("never matches on substrings", () => {
    // "Chicken" is an alias of Grilled Chicken, not of Chicken Stew.
    expect(matchGuideFoods("Chicken").map((f) => f.id)).toEqual([
      "grilled-chicken",
    ]);
    // "Yam" is the alias of Boiled Yam only.
    expect(matchGuideFoods("Yam").map((f) => f.id)).toEqual(["boiled-yam"]);
  });

  it("returns an empty array for unknown foods and empty names", () => {
    expect(matchGuideFoods("Pizza, Burger")).toEqual([]);
    expect(matchGuideFoods("")).toEqual([]);
    expect(matchGuideFoods(null)).toEqual([]);
  });

  it("does not return the same food twice", () => {
    const foods = matchGuideFoods("Beans (Ewa), Ewa");
    expect(foods.map((f) => f.id)).toEqual(["beans-ewa"]);
  });
});

// ─── Pairing ────────────────────────────────────────────────────────────────────

describe("pairReadingsWithMeals", () => {
  it("returns empty results for empty or null logs", () => {
    expect(pairReadingsWithMeals([])).toEqual({
      pairs: [],
      unpairedReadings: [],
    });
    expect(pairReadingsWithMeals(null)).toEqual({
      pairs: [],
      unpairedReadings: [],
    });
  });

  it("pairs a reading logged 1 hour after a meal", () => {
    const logs = [
      makeMeal({ createdAt: makeTimestamp(at(0)) }),
      makeReading({ readingTime: at(1).toISOString() }),
    ];
    const { pairs, unpairedReadings } = pairReadingsWithMeals(logs);
    expect(pairs.length).toBe(1);
    expect(unpairedReadings).toEqual([]);
    expect(pairs[0].mealName).toBe("Jollof Rice, Chicken Stew");
    expect(pairs[0].afterMgdl).toBe(150);
  });

  it("pairs a reading logged exactly 2 hours after a meal (window edge)", () => {
    const logs = [
      makeMeal({ createdAt: makeTimestamp(at(0)) }),
      makeReading({ readingTime: at(2).toISOString() }),
    ];
    const { pairs } = pairReadingsWithMeals(logs);
    expect(pairs.length).toBe(1);
  });

  it("does not pair a reading logged just past the 2-hour window", () => {
    const logs = [
      makeMeal({ createdAt: makeTimestamp(at(0)) }),
      makeReading({
        readingTime: new Date(at(2).getTime() + 60 * 1000).toISOString(),
      }),
    ];
    const { pairs, unpairedReadings } = pairReadingsWithMeals(logs);
    expect(pairs).toEqual([]);
    expect(unpairedReadings.length).toBe(1);
  });

  it("does not pair a reading logged before the meal", () => {
    const logs = [
      makeMeal({ createdAt: makeTimestamp(at(2)) }),
      makeReading({ readingTime: at(1).toISOString() }),
    ];
    const { pairs, unpairedReadings } = pairReadingsWithMeals(logs);
    expect(pairs).toEqual([]);
    expect(unpairedReadings.length).toBe(1);
  });

  it("leaves a reading unpaired when there is no meal at all", () => {
    const logs = [makeReading({})];
    const { pairs, unpairedReadings } = pairReadingsWithMeals(logs);
    expect(pairs).toEqual([]);
    expect(unpairedReadings.length).toBe(1);
  });

  it("pairs a reading with the most recent meal in the window", () => {
    const logs = [
      makeMeal({ id: "meal-early", createdAt: makeTimestamp(at(-3)) }),
      makeMeal({ id: "meal-late", createdAt: makeTimestamp(at(0)) }),
      makeReading({ readingTime: at(1).toISOString() }),
    ];
    const { pairs } = pairReadingsWithMeals(logs);
    expect(pairs.length).toBe(1);
    expect(pairs[0].mealId).toBe("meal-late");
  });

  it("pairs two readings after one meal as two separate pairs", () => {
    const logs = [
      makeMeal({ createdAt: makeTimestamp(at(0)) }),
      makeReading({
        context: "after_meal_1h",
        readingTime: at(1).toISOString(),
      }),
      makeReading({
        context: "after_meal_2h",
        readingTime: at(2).toISOString(),
      }),
    ];
    const { pairs } = pairReadingsWithMeals(logs);
    expect(pairs.length).toBe(2);
    expect(pairs[0].readingContext).toBe("after_meal_1h");
    expect(pairs[1].readingContext).toBe("after_meal_2h");
  });

  it("uses the most recent reading before the meal as the baseline", () => {
    const logs = [
      makeReading({
        context: "fasting",
        value: 100,
        readingTime: at(-5).toISOString(),
        createdAt: makeTimestamp(at(-5)),
      }),
      makeReading({
        context: "before_meal",
        value: 110,
        readingTime: at(-0.5).toISOString(),
        createdAt: makeTimestamp(at(-0.5)),
      }),
      makeMeal({ createdAt: makeTimestamp(at(0)) }),
      makeReading({ value: 150, readingTime: at(1).toISOString() }),
    ];
    const { pairs } = pairReadingsWithMeals(logs);
    expect(pairs.length).toBe(1);
    expect(pairs[0].baselineMgdl).toBe(110);
    expect(pairs[0].baselineSource).toBe("previous");
    expect(pairs[0].riseMgdl).toBe(40);
    expect(pairs[0].riseClass).toBe("moderate");
  });

  it("falls back to the median fasting reading when no earlier reading exists", () => {
    const logs = [
      makeMeal({ createdAt: makeTimestamp(at(0)) }),
      makeReading({ value: 160, readingTime: at(1).toISOString() }),
      // Fasting readings exist in the logs, but only after the meal.
      makeReading({
        context: "fasting",
        value: 95,
        readingTime: at(24).toISOString(),
        createdAt: makeTimestamp(at(24)),
      }),
      makeReading({
        context: "fasting",
        value: 105,
        readingTime: at(48).toISOString(),
        createdAt: makeTimestamp(at(48)),
      }),
    ];
    const { pairs } = pairReadingsWithMeals(logs);
    expect(pairs.length).toBe(1);
    expect(pairs[0].baselineMgdl).toBe(100);
    expect(pairs[0].baselineSource).toBe("fasting");
    expect(pairs[0].riseMgdl).toBe(60);
    expect(pairs[0].riseClass).toBe("moderate");
  });

  it("leaves the rise unclassified when no baseline exists at all", () => {
    const logs = [
      makeMeal({ createdAt: makeTimestamp(at(0)) }),
      makeReading({ value: 150, readingTime: at(1).toISOString() }),
    ];
    const { pairs } = pairReadingsWithMeals(logs);
    expect(pairs.length).toBe(1);
    expect(pairs[0].baselineMgdl).toBe(null);
    expect(pairs[0].baselineSource).toBe(null);
    expect(pairs[0].riseMgdl).toBe(null);
    expect(pairs[0].riseClass).toBe("no-baseline");
  });

  it("normalises mmol/L readings before comparing", () => {
    const logs = [
      makeReading({
        context: "fasting",
        value: 5.5,
        unit: "mmol/L",
        readingTime: at(-1).toISOString(),
        createdAt: makeTimestamp(at(-1)),
      }),
      makeMeal({ createdAt: makeTimestamp(at(0)) }),
      makeReading({
        value: 8.0,
        unit: "mmol/L",
        readingTime: at(1).toISOString(),
      }),
    ];
    const { pairs } = pairReadingsWithMeals(logs);
    expect(pairs[0].baselineMgdl).toBe(99);
    expect(pairs[0].afterMgdl).toBe(144);
    expect(pairs[0].riseMgdl).toBe(45);
    expect(pairs[0].riseClass).toBe("moderate");
  });

  it("ignores glucose readings with no usable value", () => {
    const logs = [
      makeMeal({ createdAt: makeTimestamp(at(0)) }),
      makeReading({ value: null, readingTime: at(1).toISOString() }),
      makeReading({ value: "abc", readingTime: at(1.5).toISOString() }),
    ];
    const { pairs, unpairedReadings } = pairReadingsWithMeals(logs);
    expect(pairs).toEqual([]);
    expect(unpairedReadings).toEqual([]);
  });
});

// ─── Aggregation ────────────────────────────────────────────────────────────────

function pairedHistory() {
  // Two lunches of jollof + chicken stew, each with its own baseline.
  const logs = [
    makeReading({
      context: "fasting",
      value: 110,
      readingTime: at(-1).toISOString(),
      createdAt: makeTimestamp(at(-1)),
    }),
    makeMeal({
      id: "meal-a",
      name: "Jollof Rice, Chicken Stew",
      createdAt: makeTimestamp(at(0)),
    }),
    makeReading({ value: 195, readingTime: at(1).toISOString() }),
    makeReading({
      context: "before_meal",
      value: 115,
      readingTime: at(23).toISOString(),
      createdAt: makeTimestamp(at(23)),
    }),
    makeMeal({
      id: "meal-b",
      name: "Jollof Rice, Chicken Stew",
      createdAt: makeTimestamp(at(24)),
    }),
    makeReading({ value: 190, readingTime: at(25).toISOString() }),
  ];
  return pairReadingsWithMeals(logs).pairs;
}

describe("aggregateByFood", () => {
  it("gives no verdict with only one paired reading", () => {
    const { pairs } = pairReadingsWithMeals([
      makeReading({
        context: "fasting",
        value: 110,
        readingTime: at(-1).toISOString(),
        createdAt: makeTimestamp(at(-1)),
      }),
      makeMeal({ createdAt: makeTimestamp(at(0)) }),
      makeReading({ value: 200, readingTime: at(1).toISOString() }),
    ]);
    const byFood = aggregateByFood(pairs);
    const jollof = byFood.find((entry) => entry.id === "jollof-rice");
    expect(jollof.counts.total).toBe(1);
    expect(jollof.counts.sharp).toBe(1);
    expect(jollof.verdict).toBe(null);
  });

  it("gives a verdict once there are 2 paired readings", () => {
    const pairs = pairedHistory();
    const byFood = aggregateByFood(pairs);
    const jollof = byFood.find((entry) => entry.id === "jollof-rice");
    expect(jollof.counts.total).toBe(2);
    expect(jollof.counts.sharp).toBe(2);
    expect(jollof.verdict).toBe("sharp");
    const stew = byFood.find((entry) => entry.id === "chicken-stew");
    expect(stew.verdict).toBe("sharp");
  });

  it("picks the most common class, ties going to the more cautious one", () => {
    const pairs = [
      { mealName: "Jollof Rice", riseClass: "steady", mealId: "m1" },
      { mealName: "Jollof Rice", riseClass: "sharp", mealId: "m2" },
    ];
    const byFood = aggregateByFood(pairs);
    expect(byFood[0].verdict).toBe("sharp");
  });

  it("does not count no-baseline pairs towards a verdict", () => {
    const pairs = [
      { mealName: "Jollof Rice", riseClass: "no-baseline", mealId: "m1" },
      { mealName: "Jollof Rice", riseClass: "no-baseline", mealId: "m2" },
      { mealName: "Jollof Rice", riseClass: "steady", mealId: "m3" },
    ];
    const byFood = aggregateByFood(pairs);
    expect(byFood[0].counts.total).toBe(3);
    expect(byFood[0].counts.noBaseline).toBe(2);
    expect(byFood[0].verdict).toBe(null);
  });
});

describe("aggregateByMeal", () => {
  it("groups pairs by meal name with the same minimum", () => {
    const pairs = pairedHistory();
    const byMeal = aggregateByMeal(pairs);
    expect(byMeal.length).toBe(1);
    expect(byMeal[0].mealName).toBe("Jollof Rice, Chicken Stew");
    expect(byMeal[0].counts.total).toBe(2);
    expect(byMeal[0].verdict).toBe("sharp");
  });
});

// ─── Whole summary ──────────────────────────────────────────────────────────────

describe("buildFoodSugarSummary", () => {
  it("references only real logged meals and never invents data", () => {
    const logs = [
      makeReading({
        context: "fasting",
        value: 110,
        readingTime: at(-1).toISOString(),
        createdAt: makeTimestamp(at(-1)),
      }),
      makeMeal({
        id: "meal-real",
        name: "Beans (Ewa)",
        createdAt: makeTimestamp(at(0)),
      }),
      makeReading({ value: 130, readingTime: at(1).toISOString() }),
      makeReading({ value: 120, readingTime: at(10).toISOString() }),
    ];
    const summary = buildFoodSugarSummary(logs);
    expect(summary.totals.pairedReadings).toBe(1);
    // Two unpaired: the fasting reading (no meal before it) and the
    // reading 10 hours after the meal (outside the 2-hour window).
    expect(summary.totals.unpairedReadings).toBe(2);
    expect(summary.totals.mealsWithPairs).toBe(1);
    summary.pairs.forEach((pair) => {
      expect(pair.mealId).toBe("meal-real");
    });
    const beans = summary.byFood.find((entry) => entry.id === "beans-ewa");
    expect(beans.counts.total).toBe(1);
    expect(beans.verdict).toBe(null);
    expect(summary.unpairedReadings.length).toBe(2);
  });

  it("returns empty structures when there are no logs", () => {
    const summary = buildFoodSugarSummary([]);
    expect(summary.pairs).toEqual([]);
    expect(summary.byFood).toEqual([]);
    expect(summary.byMeal).toEqual([]);
    expect(summary.totals).toEqual({
      pairedReadings: 0,
      unpairedReadings: 0,
      mealsWithPairs: 0,
      foodsObserved: 0,
    });
  });
});
