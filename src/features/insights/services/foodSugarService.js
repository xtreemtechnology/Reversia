// src/features/insights/services/foodSugarService.js
//
// Pure helpers for the food-to-sugar insights. No Firestore, no network,
// no imports from the rest of the app, so they are safe to use in Jest.
//
// Data sources (read-only, existing logs in users/{uid}/logs):
//   meal:    { category: "meal", name: "Jollof Rice, Chicken Stew",
//              mealType: "Lunch", calories, protein, carbs, fat,
//              createdAt: serverTimestamp, date: "YYYY-MM-DD" }
//            NOTE: the per-food `foods` array stored on the raw document is
//            dropped by useUserLogs' normaliser, so foods are matched from
//            the comma-joined `name` against the Food Guide names/aliases.
//            There is no health score, GI or diabetesSafe field stored on
//            meal logs anywhere in the app.
//   glucose: { category: "glucose", value, unit: "mg/dL" | "mmol/L",
//              context: "fasting" | "before_meal" | "after_meal_1h" |
//              "after_meal_2h" | "bedtime" | "random",
//              readingTime: ISO string, createdAt: serverTimestamp }
//            No meal link is stored on a reading today.
//
// Pairing rule: a glucose reading counts as "after a meal" only when it
// was logged within 2 hours after that meal. A reading with no meal in
// the window is unpaired, never force-matched.
//
// Rise: after-meal reading minus the most recent reading before that
// meal. Where no earlier reading exists, fall back to the median of the
// user's fasting readings in the loaded logs (their typical fasting
// level). Where neither exists the pair has no baseline and its rise is
// not classified.
//
// Classes (a simple guide, NOT a medical standard):
//   steady   — rise of 30 mg/dL or less (including a fall)
//   moderate — rise of 31–70 mg/dL
//   sharp    — rise over 70 mg/dL
// A food or meal only gets a verdict once it has at least 2 paired
// readings with a baseline; with fewer it shows "not enough readings yet".

import { FOOD_GUIDE } from "../../food-guide/data/foodGuideData";

export const PAIRING_WINDOW_MS = 2 * 60 * 60 * 1000;
export const RISE_STEADY_MAX = 30;
export const RISE_MODERATE_MAX = 70;
export const MIN_READINGS_FOR_VERDICT = 2;
export const MGDL_PER_MMOL = 18.0182;

export const RISE_CLASSES = ["steady", "moderate", "sharp", "no-baseline"];

export const RISE_LABELS = {
  steady: "Steady",
  moderate: "Moderate rise",
  sharp: "Sharp rise",
  "no-baseline": "No earlier reading",
};

// ─── Time and unit helpers ────────────────────────────────────────────────────

/** Accept a Firestore Timestamp, Date, ISO string or ms number. */
export function toDate(value) {
  if (!value) return null;
  if (value?.toDate) {
    try {
      return value.toDate();
    } catch (_) {
      return null;
    }
  }
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Normalise a glucose value to mg/dL. Returns null for missing/invalid. */
export function toMgdl(value, unit) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  if (unit === "mmol/L") return Math.round(num * MGDL_PER_MMOL);
  return Math.round(num);
}

/** The time a log happened: glucose prefers readingTime, meals use createdAt. */
export function getLogTime(log) {
  if (!log) return null;
  if (log.category === "glucose") {
    return toDate(log.readingTime) || toDate(log.createdAt);
  }
  return toDate(log.createdAt);
}

// ─── Rise classification ─────────────────────────────────────────────────────

/** Classify a rise in mg/dL. null rise (no baseline) is "no-baseline". */
export function classifyRise(riseMgdl) {
  if (riseMgdl === null || riseMgdl === undefined) return "no-baseline";
  if (riseMgdl <= RISE_STEADY_MAX) return "steady";
  if (riseMgdl <= RISE_MODERATE_MAX) return "moderate";
  return "sharp";
}

// ─── Matching logged meal names to the Food Guide ────────────────────────────

function normalizeFoodName(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFoodNameFull(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Match the comma-joined food names on a logged meal to Food Guide foods.
 * Matches on exact name or alias (full or with the parenthetical dropped),
 * never on substrings, so "Chicken" does not claim "Chicken Stew".
 * Returns the matched guide foods in the order they appear in the meal.
 */
export function matchGuideFoods(mealName) {
  if (!mealName) return [];
  const parts = String(mealName)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const matched = [];
  const seen = new Set();
  for (const part of parts) {
    const full = normalizeFoodNameFull(part);
    const stripped = normalizeFoodName(part);
    for (const food of FOOD_GUIDE) {
      if (seen.has(food.id)) continue;
      const names = [food.name, ...(food.aliases || [])];
      const hit = names.some((candidate) => {
        const cFull = normalizeFoodNameFull(candidate);
        const cStripped = normalizeFoodName(candidate);
        return (
          cFull === full ||
          cStripped === stripped ||
          cFull === stripped ||
          cStripped === full
        );
      });
      if (hit) {
        matched.push(food);
        seen.add(food.id);
      }
    }
  }
  return matched;
}

// ─── Pairing meals with glucose readings ─────────────────────────────────────

function median(values) {
  if (!values || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Pair every glucose reading with the most recent meal logged within
 * the 2-hour window before it. A reading with no meal in the window is
 * returned in `unpairedReadings`, never force-matched.
 *
 * Each pair carries its baseline (most recent reading before the meal,
 * or the median of fasting readings before the meal) and its rise class.
 */
export function pairReadingsWithMeals(logs) {
  const pairs = [];
  const unpairedReadings = [];
  if (!logs || logs.length === 0) return { pairs, unpairedReadings };

  const meals = logs
    .filter((log) => log?.category === "meal")
    .map((meal) => ({ log: meal, time: getLogTime(meal) }))
    .filter((entry) => entry.time !== null)
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  const readings = logs
    .filter((log) => log?.category === "glucose")
    .map((reading) => ({
      log: reading,
      time: getLogTime(reading),
      mgdl: toMgdl(reading.value, reading.unit),
    }))
    .filter((entry) => entry.time !== null && entry.mgdl !== null)
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  for (const reading of readings) {
    // Most recent meal at or before this reading, inside the window.
    let meal = null;
    for (let i = meals.length - 1; i >= 0; i--) {
      const diff = reading.time.getTime() - meals[i].time.getTime();
      if (diff < 0) continue;
      if (diff <= PAIRING_WINDOW_MS) meal = meals[i];
      break;
    }
    if (!meal) {
      unpairedReadings.push(reading.log);
      continue;
    }

    // Baseline: most recent reading strictly before the meal.
    let baselineMgdl = null;
    let baselineSource = null;
    for (let i = readings.length - 1; i >= 0; i--) {
      if (readings[i].time.getTime() < meal.time.getTime()) {
        baselineMgdl = readings[i].mgdl;
        baselineSource = "previous";
        break;
      }
    }
    if (baselineMgdl === null) {
      // No earlier reading at all: fall back to the user's typical
      // fasting level — the median of their fasting readings in the
      // loaded logs. Where they have never logged a fasting reading,
      // the pair stays without a baseline instead of guessing one.
      const fastingValues = readings
        .filter((entry) => entry.log.context === "fasting")
        .map((entry) => entry.mgdl);
      const fastingMedian = median(fastingValues);
      if (fastingMedian !== null) {
        baselineMgdl = fastingMedian;
        baselineSource = "fasting";
      }
    }

    const riseMgdl = baselineMgdl === null ? null : reading.mgdl - baselineMgdl;
    pairs.push({
      id: `${meal.log.id || meal.log.name}__${
        reading.log.id || reading.time.getTime()
      }`,
      mealId: meal.log.id || null,
      mealName: meal.log.name || "Meal",
      mealType: meal.log.mealType || meal.log.type || "",
      mealTime: meal.time,
      readingId: reading.log.id || null,
      readingTime: reading.time,
      readingContext: reading.log.context || "",
      afterMgdl: reading.mgdl,
      baselineMgdl,
      baselineSource,
      riseMgdl,
      riseClass: classifyRise(riseMgdl),
    });
  }

  return { pairs, unpairedReadings };
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

function emptyCounts() {
  return { steady: 0, moderate: 0, sharp: 0, noBaseline: 0, total: 0 };
}

function verdictFor(counts) {
  const classified = counts.steady + counts.moderate + counts.sharp;
  if (classified < MIN_READINGS_FOR_VERDICT) return null;
  // Most common class; ties go to the more cautious class.
  const order = ["sharp", "moderate", "steady"];
  let best = "steady";
  let bestCount = -1;
  for (const cls of order) {
    if (counts[cls] > bestCount) {
      best = cls;
      bestCount = counts[cls];
    }
  }
  return best;
}

export const VERDICT_LABELS = {
  steady: "Usually steady",
  moderate: "Often a moderate rise",
  sharp: "Often a sharp rise",
};

function aggregatePairs(pairs, keyFor) {
  const byKey = new Map();
  for (const pair of pairs) {
    const keys = keyFor(pair);
    for (const key of keys) {
      if (!byKey.has(key.id)) {
        byKey.set(key.id, { ...key, counts: emptyCounts(), pairs: [] });
      }
      const entry = byKey.get(key.id);
      entry.counts.total += 1;
      if (pair.riseClass === "no-baseline") entry.counts.noBaseline += 1;
      else entry.counts[pair.riseClass] += 1;
      entry.pairs.push(pair);
    }
  }
  const results = [...byKey.values()].map((entry) => ({
    ...entry,
    verdict: verdictFor(entry.counts),
    classifiedTotal:
      entry.counts.steady + entry.counts.moderate + entry.counts.sharp,
  }));
  results.sort((a, b) => b.counts.total - a.counts.total);
  return results;
}

/** Aggregate pairs by the Food Guide foods in each meal. */
export function aggregateByFood(pairs) {
  return aggregatePairs(pairs || [], (pair) =>
    matchGuideFoods(pair.mealName).map((food) => ({
      id: food.id,
      food,
    }))
  );
}

/** Aggregate pairs by meal name (the logged meal as a whole). */
export function aggregateByMeal(pairs) {
  return aggregatePairs(pairs || [], (pair) => [
    {
      id: (pair.mealName || "Meal").toLowerCase(),
      mealName: pair.mealName || "Meal",
      mealType: pair.mealType || "",
    },
  ]);
}

/**
 * Build the whole food-to-sugar picture from raw logs.
 * Returns { pairs, unpairedReadings, byFood, byMeal, totals }.
 * Every pair references a real logged meal; nothing is invented.
 */
export function buildFoodSugarSummary(logs) {
  const { pairs, unpairedReadings } = pairReadingsWithMeals(logs);
  const byFood = aggregateByFood(pairs);
  const byMeal = aggregateByMeal(pairs);
  const totals = {
    pairedReadings: pairs.length,
    unpairedReadings: unpairedReadings.length,
    mealsWithPairs: new Set(pairs.map((pair) => pair.mealId || pair.mealName))
      .size,
    foodsObserved: byFood.length,
  };
  return { pairs, unpairedReadings, byFood, byMeal, totals };
}
