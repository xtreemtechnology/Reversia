import {
  classifyReading,
  toMgdl,
  mgdlToMmol,
  mmolToMgdl,
  isPlausibleMgdl,
} from "../utils/glucose";

// A 45 mg/dL entry is never green and never says Normal (brief 0.1).
describe("classifyReading — screening branch (not diagnosed)", () => {
  const screening = (mgdl, context = "fasting") =>
    classifyReading(mgdl, { context, diagnosis: null });

  it("never calls a low reading Normal", () => {
    expect(screening(40).level).toBe("urgent_low");
    expect(screening(40).label).toBe("Dangerously low");
    expect(screening(53).level).toBe("urgent_low");
    expect(screening(54).level).toBe("low");
    expect(screening(54).label).toBe("Low");
    expect(screening(69).level).toBe("low");
    expect(screening(45).label).not.toBe("Normal");
  });

  it("fasting: 70–99 Normal, 100–125 pre-diabetic, 126+ diabetes range", () => {
    expect(screening(70).level).toBe("normal");
    expect(screening(99).level).toBe("normal");
    expect(screening(100).level).toBe("prediabetic_range");
    expect(screening(125).level).toBe("prediabetic_range");
    expect(screening(126).level).toBe("diabetes_range");
    expect(screening(126).label).toBe(
      "In the diabetes range, discuss with a clinician"
    );
    expect(screening(179).level).toBe("diabetes_range");
    expect(screening(180).level).toBe("diabetes_range");
    expect(screening(299).level).toBe("diabetes_range");
  });

  it("above 300 is very high, whatever the context", () => {
    expect(screening(301).level).toBe("very_high");
    expect(screening(301).label).toBe("Very high");
    expect(classifyReading(301, { context: "after_meal_2h" }).level).toBe(
      "very_high"
    );
  });

  it("after meal: 70–139 Normal, 140–199 pre-diabetic, 200+ diabetes range", () => {
    const afterMeal = (mgdl) =>
      classifyReading(mgdl, { context: "after_meal_2h", diagnosis: null });
    expect(afterMeal(70).level).toBe("normal");
    expect(afterMeal(139).level).toBe("normal");
    expect(afterMeal(140).level).toBe("prediabetic_range");
    expect(afterMeal(199).level).toBe("prediabetic_range");
    expect(afterMeal(200).level).toBe("diabetes_range");
  });

  it("random: 70–99 Normal, 100–179 Moderate, 180+ Elevated", () => {
    const random = (mgdl) =>
      classifyReading(mgdl, { context: "random", diagnosis: null });
    expect(random(70).level).toBe("normal");
    expect(random(99).level).toBe("normal");
    expect(random(100).level).toBe("moderate");
    expect(random(179).level).toBe("moderate");
    expect(random(180).level).toBe("elevated");
  });

  it("mmol/L inputs classify identically after conversion", () => {
    // 2.8 mmol/L ≈ 50 mg/dL → dangerously low; 16.7 mmol/L ≈ 301 → very high.
    expect(toMgdl(2.8, "mmol/L")).toBe(50);
    expect(
      classifyReading(toMgdl(2.8, "mmol/L"), { context: "fasting" }).level
    ).toBe("urgent_low");
    expect(toMgdl(16.7, "mmol/L")).toBe(301);
    expect(
      classifyReading(toMgdl(16.7, "mmol/L"), { context: "fasting" }).level
    ).toBe("very_high");
  });
});

describe("classifyReading — diabetes branch (management targets)", () => {
  const diabetes = (mgdl, context = "fasting") =>
    classifyReading(mgdl, { context, diagnosis: "type2" });

  it("fasting: below 80 below target, 80–130 in target, above 130 above target", () => {
    expect(diabetes(70).level).toBe("below_target");
    expect(diabetes(79).level).toBe("below_target");
    expect(diabetes(80).level).toBe("in_target");
    expect(diabetes(130).level).toBe("in_target");
    expect(diabetes(131).level).toBe("above_target");
  });

  it("after meal: under 180 in target, 180+ above target", () => {
    const afterMeal = (mgdl) => diabetes(mgdl, "after_meal_2h");
    expect(afterMeal(70).level).toBe("in_target");
    expect(afterMeal(179).level).toBe("in_target");
    expect(afterMeal(180).level).toBe("above_target");
  });

  it("lows and very highs behave the same as the screening branch", () => {
    expect(diabetes(40).level).toBe("urgent_low");
    expect(diabetes(69).level).toBe("low");
    expect(diabetes(301).level).toBe("very_high");
  });

  it("never uses diagnostic labels for a diagnosed user", () => {
    [70, 99, 100, 125, 126, 179, 180, 299].forEach((mgdl) => {
      const label = diabetes(mgdl).label;
      expect(label).not.toMatch(/pre-diabetic|diabetes range/i);
    });
  });
});

describe("classifyReading — pre-diabetes uses the screening branch", () => {
  it("prediabetes and prevention read like not-diagnosed", () => {
    expect(
      classifyReading(110, { context: "fasting", diagnosis: "prediabetes" })
        .level
    ).toBe("prediabetic_range");
    expect(
      classifyReading(110, { context: "fasting", diagnosis: "prevention" })
        .level
    ).toBe("prediabetic_range");
  });
});

describe("unit conversions and plausibility bounds", () => {
  it("converts both ways", () => {
    expect(mmolToMgdl(5.5)).toBe(99);
    expect(mgdlToMmol(99)).toBe("5.5");
    expect(toMgdl(5.5, "mmol/L")).toBe(99);
    expect(toMgdl(99, "mg/dL")).toBe(99);
    expect(toMgdl("abc", "mg/dL")).toBeNull();
    expect(toMgdl(0, "mg/dL")).toBeNull();
    expect(toMgdl(-5, "mg/dL")).toBeNull();
  });

  it("rejects values outside 20–600 mg/dL", () => {
    expect(isPlausibleMgdl(20)).toBe(true);
    expect(isPlausibleMgdl(600)).toBe(true);
    expect(isPlausibleMgdl(19)).toBe(false);
    expect(isPlausibleMgdl(601)).toBe(false);
    expect(isPlausibleMgdl(3)).toBe(false);
    expect(isPlausibleMgdl(3000)).toBe(false);
  });
});
