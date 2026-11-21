// src/utils/mealTimes.js
//
// Usual meal times, learned from the user's own log history — the
// contextual part of meal reminders. Pure helpers only, no navigation,
// no Firestore, no imports from the rest of the app, so they are safe
// to use in Jest tests. Works over the raw log docs (the same shape
// useUserLogs returns): { category, type, createdAt }.
//
// A meal type's usual time is the median of its logged times over the
// last 14 days, clamped to a sane window for that meal and rounded to
// the nearest 5 minutes. A type with fewer than 3 logged meals in that
// window has no pattern yet and falls back to the fixed default time.

const DEFAULT_TIMES = {
  breakfast: { hour: 7, minute: 30 },
  lunch: { hour: 13, minute: 0 },
  dinner: { hour: 19, minute: 30 },
};

// Windows a usual time is allowed to fall in (minutes since midnight).
const TIME_WINDOWS = {
  breakfast: { min: 5 * 60, max: 11 * 60 },
  lunch: { min: 11 * 60, max: 15 * 60 },
  dinner: { min: 17 * 60, max: 21 * 60 },
};

const MIN_SAMPLES = 3;
const LOOKBACK_DAYS = 14;

function toDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function clampToWindow(minutes, { min, max }) {
  return Math.min(max, Math.max(min, minutes));
}

function roundToFive(minutes) {
  return Math.round(minutes / 5) * 5;
}

function toHourMinute(minutes) {
  return { hour: Math.floor(minutes / 60), minute: minutes % 60 };
}

/**
 * The usual time for one meal type from its logged times, or the
 * default when there is no pattern yet. `times` are minutes since
 * midnight; `now` bounds the 14-day lookback.
 */
function usualTimeFor(logs, mealType, now) {
  const fallback = DEFAULT_TIMES[mealType];
  const cutoff = now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
  const times = logs
    .filter((log) => log?.category === "meal")
    .filter((log) => log?.type?.toLowerCase?.() === mealType)
    .map((log) => toDate(log?.createdAt))
    .filter((date) => date && date.getTime() >= cutoff)
    .map((date) => date.getHours() * 60 + date.getMinutes());
  if (times.length < MIN_SAMPLES) return { ...fallback };
  const usual = roundToFive(
    clampToWindow(median(times), TIME_WINDOWS[mealType])
  );
  return toHourMinute(usual);
}

/**
 * Usual breakfast/lunch/dinner times from the log history:
 * { breakfast: { hour, minute }, lunch: {...}, dinner: {...} }.
 */
export function getUsualMealTimes(logs, now = new Date()) {
  const list = Array.isArray(logs) ? logs : [];
  return {
    breakfast: usualTimeFor(list, "breakfast", now),
    lunch: usualTimeFor(list, "lunch", now),
    dinner: usualTimeFor(list, "dinner", now),
  };
}

export default { getUsualMealTimes };
