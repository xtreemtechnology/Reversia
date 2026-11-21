// src/utils/glucose.js
//
// Shared glucose classification — the one place that decides what a
// reading means (brief 0.1). Pure helpers only, no navigation, no
// Firestore, no imports from the rest of the app except the static
// theme tokens, so they are safe to use in Jest tests. Every screen
// that classifies or colours a glucose reading must use this module:
// GlucoseLogScreen, GlucoseTrendChart, ExportReportScreen, the Guide's
// "Check my sugar" answer, and the insights services. No screen may
// show a low reading as good news.
//
// Diagnosis branches on the profile's `diabetesType`:
//   "type2"        — has diabetes: management targets, not diagnostic
//                    labels (proposed adult, non-pregnant defaults —
//                    CLINICAL REVIEW NEEDED, see below).
//   "prediabetes" / "prevention" / null — screening-style labels.
// A missing diagnosis defaults to the screening branch; it never
// assumes the user has diabetes.
//
// Clinical numbers used here (all CLINICAL REVIEW NEEDED):
//   - Plausibility bounds 20–600 mg/dL on save.
//   - Urgent low below 54 mg/dL; low 54–69 mg/dL.
//   - Urgent high above 300 mg/dL.
//   - Diabetes targets: fasting / before meal 80–130 mg/dL,
//     2 hours after meal under 180 mg/dL. Other contexts reuse the
//     under-180 ceiling; that reuse is also for clinical review.

import { T } from "../theme/tokens";

export const MGDL_PER_MMOL = 18.0182;

/** Plausibility bounds for a saved reading, in mg/dL. */
export const GLUCOSE_MIN_MGDL = 20;
export const GLUCOSE_MAX_MGDL = 600;

/** Below this (mg/dL) a reading is dangerously low. */
export const URGENT_LOW_MGDL = 54;
/** Below this (mg/dL) a reading is low. */
export const LOW_MGDL = 70;
/** Above this (mg/dL) a reading is very high. */
// CLINICAL REVIEW NEEDED: 300 mg/dL urgent-high threshold (brief 0.1).
export const VERY_HIGH_MGDL = 300;

export function mgdlToMmol(mgdl) {
  return (mgdl / MGDL_PER_MMOL).toFixed(1);
}

export function mmolToMgdl(mmol) {
  return Math.round(mmol * MGDL_PER_MMOL);
}

/**
 * Normalise a glucose value to mg/dL (rounded). Returns null for
 * missing, non-numeric, or non-positive values. Accepts "mg/dL"
 * (default) and "mmol/L" (also "mmol").
 */
export function toMgdl(value, unit) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  const u = (unit || "").toLowerCase().trim();
  if (u === "mmol/l" || u === "mmol") {
    return Math.round(num * MGDL_PER_MMOL);
  }
  return Math.round(num);
}

/** Whether a mg/dL value is plausible enough to save. */
export function isPlausibleMgdl(mgdl) {
  return (
    typeof mgdl === "number" &&
    Number.isFinite(mgdl) &&
    mgdl >= GLUCOSE_MIN_MGDL &&
    mgdl <= GLUCOSE_MAX_MGDL
  );
}

const LEVELS = {
  urgentLow: { level: "urgent_low", label: "Dangerously low", color: T.DANGER },
  low: { level: "low", label: "Low", color: T.WARNING },
  veryHigh: { level: "very_high", label: "Very high", color: T.DANGER },
};

/**
 * Classify a reading already converted to mg/dL.
 *
 * @param {number} mgdl - the reading in mg/dL.
 * @param {{ context?: string, diagnosis?: string | null }} opts
 *   context: "fasting" | "before_meal" | "after_meal_1h" |
 *   "after_meal_2h" | "bedtime" | "random" (anything else is treated
 *   as random). diagnosis: the profile's `diabetesType`
 *   ("type2" | "prediabetes" | "prevention" | null).
 * @returns {{ level: string, label: string, color: string }}
 *   level is one of: urgent_low, low, very_high, below_target,
 *   in_target, above_target, normal, prediabetic_range,
 *   diabetes_range, moderate, elevated, unknown.
 */
export function classifyReading(mgdl, { context, diagnosis } = {}) {
  if (typeof mgdl !== "number" || !Number.isFinite(mgdl)) {
    return { level: "unknown", label: "", color: T.MUTED };
  }
  if (mgdl < URGENT_LOW_MGDL) return { ...LEVELS.urgentLow };
  if (mgdl < LOW_MGDL) return { ...LEVELS.low };
  if (mgdl > VERY_HIGH_MGDL) return { ...LEVELS.veryHigh };

  const isFasting = context === "fasting" || context === "before_meal";
  const isAfterMeal =
    context === "after_meal_1h" || context === "after_meal_2h";

  // Has diabetes: management targets, never diagnostic labels.
  // CLINICAL REVIEW NEEDED: fasting / before meal 80–130 mg/dL,
  // 2 hours after meal under 180 mg/dL (brief 0.1, proposed adult,
  // non-pregnant defaults). Bedtime / random reuse the under-180
  // ceiling; that reuse is also for clinical review.
  if (diagnosis === "type2") {
    if (isFasting) {
      if (mgdl < 80) {
        return {
          level: "below_target",
          label: "Below target",
          color: T.WARNING,
        };
      }
      if (mgdl <= 130) {
        return { level: "in_target", label: "In target", color: T.SUCCESS };
      }
      return { level: "above_target", label: "Above target", color: T.WARNING };
    }
    if (mgdl < 180) {
      return { level: "in_target", label: "In target", color: T.SUCCESS };
    }
    return { level: "above_target", label: "Above target", color: T.WARNING };
  }

  // Not diagnosed, pre-diabetes, prevention, or unknown: screening
  // labels. "Diabetic" is reworded — the user may already have
  // diabetes, so the label points at a clinician conversation.
  if (isFasting) {
    if (mgdl < 100)
      return { level: "normal", label: "Normal", color: T.SUCCESS };
    if (mgdl < 126) {
      return {
        level: "prediabetic_range",
        label: "Pre-diabetic range",
        color: T.WARNING,
      };
    }
    return {
      level: "diabetes_range",
      label: "In the diabetes range, discuss with a clinician",
      color: T.DANGER,
    };
  }
  if (isAfterMeal) {
    if (mgdl < 140)
      return { level: "normal", label: "Normal", color: T.SUCCESS };
    if (mgdl < 200) {
      return {
        level: "prediabetic_range",
        label: "Pre-diabetic range",
        color: T.WARNING,
      };
    }
    return {
      level: "diabetes_range",
      label: "In the diabetes range, discuss with a clinician",
      color: T.DANGER,
    };
  }
  // Bedtime / random
  if (mgdl < 100) return { level: "normal", label: "Normal", color: T.SUCCESS };
  if (mgdl < 180)
    return { level: "moderate", label: "Moderate", color: T.WARNING };
  return { level: "elevated", label: "Elevated", color: T.DANGER };
}

export default {
  classifyReading,
  toMgdl,
  mgdlToMmol,
  mmolToMgdl,
  isPlausibleMgdl,
};
