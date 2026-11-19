import {
  getCurrentWeek,
  getPhaseForWeek,
  calculateProgress,
  getNextMilestone,
} from "../features/reversal/services/reversalService";
import {
  PHASES,
  WEEKLY_GOALS,
  MILESTONES,
} from "../features/reversal/data/planData";

describe("reversalPlan helpers", () => {
  const start = new Date("2026-11-18T00:00:00.000Z");

  describe("getCurrentWeek", () => {
    it("is week 1 on the start date", () => {
      expect(getCurrentWeek(start, new Date("2026-11-18T12:00:00.000Z"))).toBe(
        1
      );
    });

    it("is week 2 after 7 days", () => {
      expect(getCurrentWeek(start, new Date("2026-11-25T00:00:00.000Z"))).toBe(
        2
      );
    });

    it("is week 3 after 14 days", () => {
      expect(getCurrentWeek(start, new Date("2026-12-02T00:00:00.000Z"))).toBe(
        3
      );
    });

    it("is week 12 after 77 days", () => {
      expect(getCurrentWeek(start, new Date("2027-02-03T00:00:00.000Z"))).toBe(
        12
      );
    });

    it("clamps at week 12 long after the plan ends", () => {
      expect(getCurrentWeek(start, new Date("2027-06-01T00:00:00.000Z"))).toBe(
        12
      );
    });

    it("returns 0 when there is no start date", () => {
      expect(getCurrentWeek(null, new Date("2026-11-18T00:00:00.000Z"))).toBe(
        0
      );
      expect(
        getCurrentWeek(undefined, new Date("2026-11-18T00:00:00.000Z"))
      ).toBe(0);
    });

    it("returns 0 when now is before the start date", () => {
      expect(getCurrentWeek(start, new Date("2026-11-17T00:00:00.000Z"))).toBe(
        0
      );
    });
  });

  describe("getPhaseForWeek", () => {
    it("maps weeks 1-3 to Reset", () => {
      expect(getPhaseForWeek(1).id).toBe("reset");
      expect(getPhaseForWeek(3).id).toBe("reset");
    });

    it("maps weeks 4-6 to Rebuild", () => {
      expect(getPhaseForWeek(4).id).toBe("rebuild");
      expect(getPhaseForWeek(6).id).toBe("rebuild");
    });

    it("maps weeks 7-9 to Steady", () => {
      expect(getPhaseForWeek(7).id).toBe("steady");
      expect(getPhaseForWeek(9).id).toBe("steady");
    });

    it("maps weeks 10-12 to Sustain", () => {
      expect(getPhaseForWeek(10).id).toBe("sustain");
      expect(getPhaseForWeek(12).id).toBe("sustain");
    });

    it("returns null outside weeks 1-12", () => {
      expect(getPhaseForWeek(0)).toBeNull();
      expect(getPhaseForWeek(13)).toBeNull();
    });
  });

  describe("calculateProgress", () => {
    it("reports week 1 at 8 percent in the Reset phase", () => {
      const progress = calculateProgress(
        start,
        new Date("2026-11-18T12:00:00.000Z")
      );
      expect(progress.week).toBe(1);
      expect(progress.totalWeeks).toBe(12);
      expect(progress.percent).toBe(8);
      expect(progress.phase.id).toBe("reset");
    });

    it("reports 50 percent at week 6", () => {
      const progress = calculateProgress(
        start,
        new Date("2026-12-23T00:00:00.000Z")
      );
      expect(progress.week).toBe(6);
      expect(progress.percent).toBe(50);
      expect(progress.phase.id).toBe("rebuild");
    });

    it("reports 0 percent with no start date", () => {
      const progress = calculateProgress(null);
      expect(progress.week).toBe(0);
      expect(progress.percent).toBe(0);
      expect(progress.phase).toBeNull();
    });
  });

  describe("getNextMilestone", () => {
    it("returns the week 3 milestone during week 1", () => {
      expect(getNextMilestone(1).week).toBe(3);
    });

    it("returns the week 12 milestone during week 9", () => {
      expect(getNextMilestone(9).week).toBe(12);
    });

    it("returns null once the plan is finished", () => {
      expect(getNextMilestone(12)).toBeNull();
    });
  });

  describe("plan content", () => {
    it("has 4 phases covering weeks 1-12", () => {
      expect(PHASES).toHaveLength(4);
      expect(PHASES.map((phase) => phase.id)).toEqual([
        "reset",
        "rebuild",
        "steady",
        "sustain",
      ]);
      const covered = PHASES.flatMap((phase) => phase.weeks);
      expect(covered).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it("has 12 weekly goals, one per week, each with 3 goals", () => {
      expect(WEEKLY_GOALS).toHaveLength(12);
      expect(WEEKLY_GOALS.map((entry) => entry.week)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      ]);
      WEEKLY_GOALS.forEach((entry) => {
        expect(entry.goals).toHaveLength(3);
        expect(entry.naturalFoodFocus).toBeTruthy();
      });
    });

    it("has milestones at weeks 3, 6, 9 and 12", () => {
      expect(MILESTONES.map((milestone) => milestone.week)).toEqual([
        3, 6, 9, 12,
      ]);
    });
  });
});
