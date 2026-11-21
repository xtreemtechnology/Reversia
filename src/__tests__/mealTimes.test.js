import { getUsualMealTimes } from "../utils/mealTimes";

function mealLog(type, iso) {
  return { category: "meal", type, createdAt: new Date(iso) };
}

describe("getUsualMealTimes", () => {
  const now = new Date("2026-11-21T12:00:00");

  it("falls back to the fixed defaults with no logs", () => {
    expect(getUsualMealTimes([], now)).toEqual({
      breakfast: { hour: 7, minute: 30 },
      lunch: { hour: 13, minute: 0 },
      dinner: { hour: 19, minute: 30 },
    });
  });

  it("takes the median logged time when there are enough samples", () => {
    const logs = [
      mealLog("breakfast", "2026-11-20T08:10:00"),
      mealLog("breakfast", "2026-11-19T08:20:00"),
      mealLog("breakfast", "2026-11-18T08:30:00"),
    ];
    expect(getUsualMealTimes(logs, now).breakfast).toEqual({
      hour: 8,
      minute: 20,
    });
  });

  it("ignores a type with fewer than 3 samples", () => {
    const logs = [
      mealLog("lunch", "2026-11-20T12:10:00"),
      mealLog("lunch", "2026-11-19T12:20:00"),
    ];
    expect(getUsualMealTimes(logs, now).lunch).toEqual({
      hour: 13,
      minute: 0,
    });
  });

  it("ignores logs older than 14 days", () => {
    const logs = [
      mealLog("dinner", "2026-11-20T19:05:00"),
      mealLog("dinner", "2026-11-19T19:10:00"),
      mealLog("dinner", "2026-11-01T20:00:00"),
    ];
    expect(getUsualMealTimes(logs, now).dinner).toEqual({
      hour: 19,
      minute: 30,
    });
  });

  it("clamps an out-of-window median and rounds to 5 minutes", () => {
    const logs = [
      mealLog("breakfast", "2026-11-20T04:05:00"),
      mealLog("breakfast", "2026-11-19T04:10:00"),
      mealLog("breakfast", "2026-11-18T04:12:00"),
    ];
    // Median 04:10 is before the 05:00 breakfast window, so it clamps.
    expect(getUsualMealTimes(logs, now).breakfast).toEqual({
      hour: 5,
      minute: 0,
    });
  });

  it("ignores non-meal logs and other meal types", () => {
    const logs = [
      { category: "glucose", type: "glucose", createdAt: new Date() },
      mealLog("snack", "2026-11-20T16:00:00"),
      mealLog("breakfast", "2026-11-20T08:00:00"),
      mealLog("breakfast", "2026-11-19T08:00:00"),
      mealLog("breakfast", "2026-11-18T08:00:00"),
    ];
    const times = getUsualMealTimes(logs, now);
    expect(times.breakfast).toEqual({ hour: 8, minute: 0 });
    expect(times.lunch).toEqual({ hour: 13, minute: 0 });
  });
});
