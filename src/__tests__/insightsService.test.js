/**
 * Tests for deriveRuleBasedInsights from insightsService.js
 *
 * Note: This service is rule-based (pure functions over log arrays).
 * No network or Firestore calls are made in these tests.
 */

import { deriveRuleBasedInsights } from '../features/learn/services/insightsService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTimestamp(date = new Date()) {
  return { toDate: () => (date instanceof Date ? date : new Date(date)) };
}

function makeLog(overrides = {}) {
  return {
    createdAt: makeTimestamp(),
    ...overrides,
  };
}

/** Build a date offset from "now" by `offsetMs` milliseconds */
function dateOffset(offsetMs) {
  return new Date(Date.now() + offsetMs);
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('deriveRuleBasedInsights', () => {
  // ── 1. Empty / null inputs ──────────────────────────────────────────────────
  describe('empty or insufficient logs', () => {
    it('returns an empty array when given an empty array', () => {
      const result = deriveRuleBasedInsights([]);
      expect(result).toEqual([]);
    });

    it('returns an empty array when given null', () => {
      const result = deriveRuleBasedInsights(null);
      expect(result).toEqual([]);
    });

    it('returns an empty array when given undefined', () => {
      const result = deriveRuleBasedInsights(undefined);
      expect(result).toEqual([]);
    });

    it('does not produce a high_carb_low_energy insight if fewer than 2 high-carb meals', () => {
      const logs = [
        makeLog({ category: 'meal', name: 'Jollof Rice', carbs: 65 }),
        makeLog({ category: 'body_check', energy: 2 }),
      ];
      const result = deriveRuleBasedInsights(logs);
      const ids = result.map((i) => i.id);
      expect(ids).not.toContain('high_carb_low_energy');
    });

    it('does not produce a sleep_fatigue insight if fewer than 2 sleep logs', () => {
      const logs = [
        makeLog({ category: 'sleep', duration: 5 }),
        makeLog({ category: 'body_check', energy: 2, symptoms: ['tired'] }),
      ];
      const result = deriveRuleBasedInsights(logs);
      const ids = result.map((i) => i.id);
      expect(ids).not.toContain('sleep_fatigue');
    });

    it('does not produce a glucose_trend insight if fewer than 3 glucose readings', () => {
      const logs = [
        makeLog({ category: 'glucose', value: 100 }),
        makeLog({ category: 'glucose', value: 115 }),
      ];
      const result = deriveRuleBasedInsights(logs);
      const ids = result.map((i) => i.id);
      expect(ids).not.toContain('glucose_trend');
    });
  });

  // ── 2. High-carb meal + low energy body check within 2-3 hrs ───────────────
  describe('high-carb meal → low energy correlation', () => {
    it('produces high_carb_low_energy insight when pattern is present', () => {
      const mealTime = dateOffset(-2.5 * HOUR); // 2.5 hrs ago
      const checkTime = dateOffset(0);           // now (2.5 hrs after meal)

      const logs = [
        makeLog({ category: 'meal', name: 'Jollof Rice', carbs: 70, createdAt: makeTimestamp(mealTime) }),
        makeLog({ category: 'meal', name: 'Fufu', carbs: 80, createdAt: makeTimestamp(dateOffset(-3.5 * HOUR)) }),
        // A second meal that also pairs with a low-energy check
        makeLog({ category: 'meal', name: 'Eba', carbs: 72, createdAt: makeTimestamp(dateOffset(-26 * HOUR)) }),
        makeLog({ category: 'body_check', energy: 2, createdAt: makeTimestamp(checkTime) }),
        makeLog({ category: 'body_check', energy: 2, createdAt: makeTimestamp(dateOffset(-24 * HOUR)) }),
      ];

      const result = deriveRuleBasedInsights(logs);
      const insight = result.find((i) => i.id === 'high_carb_low_energy');
      expect(insight).toBeDefined();
      expect(insight).toEqual(
        expect.objectContaining({
          id: 'high_carb_low_energy',
          category: 'meal',
          confidence: expect.any(String),
          supportingDataCount: expect.any(Number),
        })
      );
      expect(insight.supportingDataCount).toBeGreaterThanOrEqual(1);
    });

    it('does NOT produce high_carb_low_energy when body checks show normal energy after high-carb meals', () => {
      const mealTime = dateOffset(-2.5 * HOUR);
      const logs = [
        makeLog({ category: 'meal', name: 'Rice', carbs: 65, createdAt: makeTimestamp(mealTime) }),
        makeLog({ category: 'meal', name: 'Yam', carbs: 70, createdAt: makeTimestamp(dateOffset(-26 * HOUR)) }),
        // Energy is high — no low-energy dip
        makeLog({ category: 'body_check', energy: 8, createdAt: makeTimestamp(dateOffset(0)) }),
        makeLog({ category: 'body_check', energy: 7, createdAt: makeTimestamp(dateOffset(-24 * HOUR)) }),
      ];
      const result = deriveRuleBasedInsights(logs);
      const ids = result.map((i) => i.id);
      expect(ids).not.toContain('high_carb_low_energy');
    });
  });

  // ── 3. Low hydration / hydration-energy correlation ─────────────────────────
  describe('hydration insights', () => {
    it('produces hydration_energy insight when well-hydrated days show higher energy', () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - DAY);
      const twoDaysAgo = new Date(Date.now() - 2 * DAY);
      const threeDaysAgo = new Date(Date.now() - 3 * DAY);

      const logs = [
        // Well-hydrated day (today) — 6+ water logs, high energy body check
        ...Array.from({ length: 6 }, () =>
          makeLog({ category: 'water', createdAt: makeTimestamp(today) })
        ),
        makeLog({ category: 'body_check', energy: 9, createdAt: makeTimestamp(today) }),
        // Poor hydration day (yesterday) — 2 water logs, low energy
        ...Array.from({ length: 2 }, () =>
          makeLog({ category: 'hydration', createdAt: makeTimestamp(yesterday) })
        ),
        makeLog({ category: 'body_check', energy: 3, createdAt: makeTimestamp(yesterday) }),
        // Another well-hydrated day
        ...Array.from({ length: 7 }, () =>
          makeLog({ category: 'water', createdAt: makeTimestamp(twoDaysAgo) })
        ),
        makeLog({ category: 'body_check', energy: 8, createdAt: makeTimestamp(twoDaysAgo) }),
        // Another poor day
        ...Array.from({ length: 1 }, () =>
          makeLog({ category: 'hydration', createdAt: makeTimestamp(threeDaysAgo) })
        ),
        makeLog({ category: 'body_check', energy: 2, createdAt: makeTimestamp(threeDaysAgo) }),
      ];

      const result = deriveRuleBasedInsights(logs);
      const insight = result.find((i) => i.id === 'hydration_energy');
      expect(insight).toBeDefined();
      expect(insight).toEqual(
        expect.objectContaining({
          id: 'hydration_energy',
          category: 'hydration',
        })
      );
    });
  });

  // ── 4. Consistent short sleep + tired symptoms ───────────────────────────────
  describe('sleep insights', () => {
    it('produces sleep_fatigue insight when short sleep is followed by tired symptoms', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * DAY);
      const yesterday = new Date(Date.now() - 1 * DAY);
      const today = new Date(Date.now());

      const logs = [
        makeLog({
          category: 'sleep',
          duration: 5,
          createdAt: makeTimestamp(twoDaysAgo),
        }),
        makeLog({
          category: 'sleep',
          duration: 4.5,
          createdAt: makeTimestamp(yesterday),
        }),
        makeLog({
          category: 'body_check',
          energy: 2,
          symptoms: ['tired', 'foggy'],
          createdAt: makeTimestamp(yesterday), // next day after first sleep log
        }),
        makeLog({
          category: 'body_check',
          energy: 3,
          symptoms: ['tired'],
          createdAt: makeTimestamp(today),
        }),
      ];

      const result = deriveRuleBasedInsights(logs);
      const insight = result.find((i) => i.id === 'sleep_fatigue');
      expect(insight).toBeDefined();
      expect(insight).toEqual(
        expect.objectContaining({
          id: 'sleep_fatigue',
          category: 'sleep',
          supportingDataCount: expect.any(Number),
        })
      );
    });

    it('does NOT produce sleep_fatigue if sleep was adequate (>= 6 hrs)', () => {
      const logs = [
        makeLog({ category: 'sleep', duration: 7, createdAt: makeTimestamp(new Date(Date.now() - 2 * DAY)) }),
        makeLog({ category: 'sleep', duration: 8, createdAt: makeTimestamp(new Date(Date.now() - 1 * DAY)) }),
        makeLog({ category: 'body_check', energy: 7, symptoms: [], createdAt: makeTimestamp(new Date()) }),
      ];
      const result = deriveRuleBasedInsights(logs);
      const ids = result.map((i) => i.id);
      expect(ids).not.toContain('sleep_fatigue');
    });
  });

  // ── 5. Glucose trend ────────────────────────────────────────────────────────
  describe('glucose trend insights', () => {
    it('produces a rising glucose_trend insight when readings trend upward by > 15', () => {
      const logs = [
        makeLog({ category: 'glucose', value: 90, createdAt: makeTimestamp(new Date(Date.now() - 4 * DAY)) }),
        makeLog({ category: 'glucose', value: 100, createdAt: makeTimestamp(new Date(Date.now() - 3 * DAY)) }),
        makeLog({ category: 'glucose', value: 110, createdAt: makeTimestamp(new Date(Date.now() - 2 * DAY)) }),
        makeLog({ category: 'glucose', value: 120, createdAt: makeTimestamp(new Date(Date.now() - 1 * DAY)) }),
      ];
      const result = deriveRuleBasedInsights(logs);
      const insight = result.find((i) => i.id === 'glucose_trend');
      expect(insight).toBeDefined();
      expect(insight.title).toContain('rising');
    });

    it('produces a falling glucose_trend insight when readings trend downward by > 15', () => {
      const logs = [
        makeLog({ category: 'glucose', value: 140, createdAt: makeTimestamp(new Date(Date.now() - 3 * DAY)) }),
        makeLog({ category: 'glucose', value: 125, createdAt: makeTimestamp(new Date(Date.now() - 2 * DAY)) }),
        makeLog({ category: 'glucose', value: 115, createdAt: makeTimestamp(new Date(Date.now() - 1 * DAY)) }),
      ];
      const result = deriveRuleBasedInsights(logs);
      const insight = result.find((i) => i.id === 'glucose_trend');
      expect(insight).toBeDefined();
      expect(insight.title).toContain('falling');
    });

    it('produces a stable glucose_trend insight when readings stay within 15', () => {
      const logs = [
        makeLog({ category: 'glucose', value: 100, createdAt: makeTimestamp(new Date(Date.now() - 2 * DAY)) }),
        makeLog({ category: 'glucose', value: 105, createdAt: makeTimestamp(new Date(Date.now() - 1 * DAY)) }),
        makeLog({ category: 'glucose', value: 102, createdAt: makeTimestamp(new Date()) }),
      ];
      const result = deriveRuleBasedInsights(logs);
      const insight = result.find((i) => i.id === 'glucose_trend');
      expect(insight).toBeDefined();
      expect(insight.title).toContain('stable');
    });
  });

  // ── 6. Meal consistency insight ─────────────────────────────────────────────
  describe('meal consistency insight', () => {
    it('always produces a meal_consistency insight when meals are present', () => {
      const logs = [
        makeLog({ category: 'meal', name: 'Oatmeal' }),
        makeLog({ category: 'meal', name: 'Suya' }),
      ];
      const result = deriveRuleBasedInsights(logs);
      const insight = result.find((i) => i.id === 'meal_consistency');
      expect(insight).toBeDefined();
    });

    it('reports high confidence when meals logged on 5+ of last 7 days', () => {
      const logs = Array.from({ length: 5 }, (_, idx) =>
        makeLog({
          category: 'meal',
          name: 'Test meal',
          createdAt: makeTimestamp(new Date(Date.now() - idx * DAY)),
        })
      );
      const result = deriveRuleBasedInsights(logs);
      const insight = result.find((i) => i.id === 'meal_consistency');
      expect(insight).toBeDefined();
      expect(insight.confidence).toBe('High');
    });
  });

  // ── 7. Result shape validation ───────────────────────────────────────────────
  describe('result shape', () => {
    it('every insight has required fields: id, title, description, confidence, supportingDataCount, category', () => {
      const logs = [
        makeLog({ category: 'meal', name: 'Rice', carbs: 65 }),
        makeLog({ category: 'meal', name: 'Yam', carbs: 70 }),
        makeLog({ category: 'body_check', energy: 5 }),
        makeLog({ category: 'body_check', energy: 6 }),
      ];
      const result = deriveRuleBasedInsights(logs);
      result.forEach((insight) => {
        expect(insight).toHaveProperty('id');
        expect(insight).toHaveProperty('title');
        expect(insight).toHaveProperty('description');
        expect(insight).toHaveProperty('confidence');
        expect(insight).toHaveProperty('supportingDataCount');
        expect(insight).toHaveProperty('category');
      });
    });
  });
});
