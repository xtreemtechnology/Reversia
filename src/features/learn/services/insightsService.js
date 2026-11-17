// src/features/learn/services/insightsService.js
// Real AI insights engine — rule-based correlations + optional Gemini AI
// Log schema (from useUserLogs / Firestore):
//   { id, category, createdAt (Timestamp), name?, type?, amount?,
//     mood?, energy?, symptoms?[], notes?, carbs?, protein?, calories? }
// Categories in use: "meal", "hydration" (or "water"), "sleep", "body_check", "glucose"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toDate(ts) {
  if (!ts) return null;
  if (ts?.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

/** Milliseconds between two log timestamps */
function msBetween(a, b) {
  const da = toDate(a?.createdAt);
  const db_ = toDate(b?.createdAt);
  if (!da || !db_) return Infinity;
  return Math.abs(da.getTime() - db_.getTime());
}

/** Returns the ISO date string (YYYY-MM-DD) for a log entry */
function logDay(log) {
  const d = toDate(log?.createdAt);
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

const HIGH_CARB_MEAL_NAMES = ["rice", "yam", "fufu", "eba", "garri", "pounded yam", "amala", "akpu", "tuwo"];

function isHighCarbMeal(log) {
  if (log?.category !== "meal") return false;
  if (log?.carbs != null && Number(log.carbs) > 60) return true;
  const mealStr = `${log?.name ?? ""} ${log?.type ?? ""}`.toLowerCase();
  return HIGH_CARB_MEAL_NAMES.some((n) => mealStr.includes(n));
}

function isHydrationLog(log) {
  return log?.category === "water" || log?.category === "hydration";
}

/** Group logs by their calendar day */
function groupByDay(logs) {
  const map = {};
  for (const log of logs) {
    const day = logDay(log);
    if (!day) continue;
    if (!map[day]) map[day] = [];
    map[day].push(log);
  }
  return map;
}

// ─── Rule-Based Insight Engine ─────────────────────────────────────────────────

/**
 * Analyse a user's log array and return an array of structured insights.
 *
 * @param {Array} logs  Raw log objects from Firestore (most-recent first)
 * @returns {Array<{id, title, description, confidence, supportingDataCount, category}>}
 */
export function deriveRuleBasedInsights(logs) {
  const insights = [];
  if (!logs || logs.length === 0) return insights;

  const meals = logs.filter((l) => l?.category === "meal");
  const hydration = logs.filter(isHydrationLog);
  const checks = logs.filter((l) => l?.category === "body_check");
  const sleepLogs = logs.filter((l) => l?.category === "sleep");
  const glucoseLogs = logs.filter((l) => l?.category === "glucose");

  // ── 1. High-carb meal → lower energy in body check within 2-3 hrs ───────────
  const highCarbMeals = meals.filter(isHighCarbMeal);
  if (highCarbMeals.length >= 2 && checks.length >= 2) {
    const TWO_HRS = 2 * 60 * 60 * 1000;
    const THREE_HRS = 3 * 60 * 60 * 1000;
    let matches = 0;
    for (const meal of highCarbMeals) {
      const mealTime = toDate(meal.createdAt)?.getTime();
      if (!mealTime) continue;
      for (const check of checks) {
        const checkTime = toDate(check.createdAt)?.getTime();
        if (!checkTime) continue;
        const diff = checkTime - mealTime;
        if (diff >= TWO_HRS && diff <= THREE_HRS) {
          const energy = Number(check.energy ?? 5);
          if (energy <= 3) matches++;
        }
      }
    }
    if (matches >= 1) {
      insights.push({
        id: "high_carb_low_energy",
        title: "High-carb meals linked to energy dips",
        description: `Meals containing rice, yam, fufu, or eba were followed by low-energy body check-ins 2–3 hours later in ${matches} instance${matches !== 1 ? "s" : ""}. Consider adding a protein source to balance the impact.`,
        confidence: matches >= 3 ? "High" : "Moderate",
        supportingDataCount: matches,
        category: "meal",
      });
    }
  }

  // ── 2. 6+ glasses of water → higher average energy score ────────────────────
  if (hydration.length >= 4) {
    const byDay = groupByDay(logs);
    const wellHydratedDays = [];
    const poorHydratedDays = [];

    for (const [day, dayLogs] of Object.entries(byDay)) {
      const waterCount = dayLogs.filter(isHydrationLog).length;
      const dayChecks = dayLogs.filter((l) => l?.category === "body_check");
      if (dayChecks.length === 0) continue;
      const avgEnergy =
        dayChecks.reduce((sum, c) => sum + Number(c.energy ?? 5), 0) / dayChecks.length;
      if (waterCount >= 6) wellHydratedDays.push(avgEnergy);
      else poorHydratedDays.push(avgEnergy);
    }

    if (wellHydratedDays.length >= 1 && poorHydratedDays.length >= 1) {
      const avgWell = wellHydratedDays.reduce((a, b) => a + b, 0) / wellHydratedDays.length;
      const avgPoor = poorHydratedDays.reduce((a, b) => a + b, 0) / poorHydratedDays.length;
      if (avgWell > avgPoor + 0.5) {
        insights.push({
          id: "hydration_energy",
          title: "More water = more energy",
          description: `On days you logged 6+ glasses of water, your average energy score was ${avgWell.toFixed(1)} vs ${avgPoor.toFixed(1)} on less-hydrated days. Even 1–2 extra glasses can shift how you feel.`,
          confidence: wellHydratedDays.length >= 3 ? "High" : "Moderate",
          supportingDataCount: wellHydratedDays.length,
          category: "hydration",
        });
      }
    }
  }

  // ── 3. Sleep < 6hrs → Tired/Foggy symptoms next day ─────────────────────────
  if (sleepLogs.length >= 2 && checks.length >= 2) {
    let shortSleepFatigueMatches = 0;
    let shortSleepDays = 0;
    for (const sl of sleepLogs) {
      const duration = Number(sl?.duration ?? sl?.hours ?? 0);
      if (duration <= 0) continue;
      if (duration < 6) {
        shortSleepDays++;
        const sleepDate = toDate(sl.createdAt);
        if (!sleepDate) continue;
        const nextDayStr = new Date(sleepDate.getTime() + 86400000)
          .toISOString()
          .slice(0, 10);
        const nextDayChecks = checks.filter((c) => logDay(c) === nextDayStr);
        for (const c of nextDayChecks) {
          const symptoms = (c.symptoms ?? []).map((s) => s.toLowerCase());
          if (
            symptoms.includes("tired") ||
            symptoms.includes("foggy") ||
            symptoms.includes("fatigue") ||
            Number(c.energy ?? 5) <= 3
          ) {
            shortSleepFatigueMatches++;
            break;
          }
        }
      }
    }
    if (shortSleepDays >= 1 && shortSleepFatigueMatches >= 1) {
      insights.push({
        id: "sleep_fatigue",
        title: "Short sleep is showing in your mornings",
        description: `After ${shortSleepDays} night${shortSleepDays !== 1 ? "s" : ""} with less than 6 hours of sleep, you logged Tired or Foggy symptoms the next day ${shortSleepFatigueMatches} time${shortSleepFatigueMatches !== 1 ? "s" : ""}. Prioritising even 30 more minutes of sleep could help.`,
        confidence: shortSleepFatigueMatches >= 3 ? "High" : "Moderate",
        supportingDataCount: shortSleepFatigueMatches,
        category: "sleep",
      });
    }
  }

  // ── 4. Meal logging consistency in last 7 days ───────────────────────────────
  if (meals.length > 0) {
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const recentMeals = meals.filter(
      (m) => (toDate(m.createdAt)?.getTime() ?? 0) >= sevenDaysAgo
    );
    const uniqueDaysWithMeals = new Set(recentMeals.map(logDay).filter(Boolean)).size;
    insights.push({
      id: "meal_consistency",
      title: "Your meal logging this week",
      description:
        uniqueDaysWithMeals >= 5
          ? `You logged meals on ${uniqueDaysWithMeals} of the last 7 days — excellent consistency. Reversia can now surface stronger patterns.`
          : uniqueDaysWithMeals >= 3
          ? `You logged meals on ${uniqueDaysWithMeals} of the last 7 days. Logging on more days will help Reversia detect clearer patterns.`
          : `You've logged meals on ${uniqueDaysWithMeals} day${uniqueDaysWithMeals !== 1 ? "s" : ""} this week. Try logging every meal this week to unlock richer insights.`,
      confidence: uniqueDaysWithMeals >= 5 ? "High" : "Low",
      supportingDataCount: recentMeals.length,
      category: "meal",
    });
  }

  // ── 5. Glucose trend — rising / falling / stable ─────────────────────────────
  if (glucoseLogs.length >= 3) {
    const sorted = [...glucoseLogs]
      .sort((a, b) => (toDate(a.createdAt)?.getTime() ?? 0) - (toDate(b.createdAt)?.getTime() ?? 0));
    const values = sorted.map((g) => Number(g.value ?? g.glucose ?? 0)).filter((v) => v > 0);
    if (values.length >= 3) {
      const first = values[0];
      const last = values[values.length - 1];
      const diff = last - first;
      let trend = "stable";
      let description = "";
      if (diff > 15) {
        trend = "rising";
        description = `Your glucose readings have been trending upward (+${diff.toFixed(0)} mg/dL across ${values.length} readings). Consider reviewing recent meal choices with your care team.`;
      } else if (diff < -15) {
        trend = "falling";
        description = `Your glucose readings have been trending downward (${diff.toFixed(0)} mg/dL across ${values.length} readings). Keep up the good work — log meals consistently to understand what's helping.`;
      } else {
        description = `Your glucose readings have been relatively stable across ${values.length} readings. Consistent logging is key to maintaining this.`;
      }
      insights.push({
        id: "glucose_trend",
        title: `Glucose trend: ${trend}`,
        description,
        confidence: values.length >= 5 ? "High" : "Moderate",
        supportingDataCount: values.length,
        category: "glucose",
      });
    }
  }

  return insights;
}

// ─── Gemini-Powered Insight ────────────────────────────────────────────────────

/**
 * Build a summary of the last 30 days of logs suitable for a Gemini prompt.
 * @param {Array} logs
 * @returns {string}
 */
function buildLogSummary(logs) {
  const meals = logs.filter((l) => l?.category === "meal");
  const hydration = logs.filter(isHydrationLog);
  const checks = logs.filter((l) => l?.category === "body_check");
  const sleepLogs = logs.filter((l) => l?.category === "sleep");
  const glucoseLogs = logs.filter((l) => l?.category === "glucose");

  const mealSummary = meals
    .slice(0, 10)
    .map((m) => `${m.name ?? m.type ?? "meal"} (${logDay(m) ?? "unknown date"})`)
    .join(", ");

  const checkSummary = checks
    .slice(0, 10)
    .map(
      (c) =>
        `energy=${c.energy ?? "?"}, mood=${c.mood ?? "?"}, symptoms=[${(c.symptoms ?? []).join(",")}] on ${logDay(c) ?? "?"}`
    )
    .join("; ");

  return [
    `Recent meals (last 10): ${mealSummary || "none"}`,
    `Body check-ins (last 10): ${checkSummary || "none"}`,
    `Hydration logs: ${hydration.length} entries`,
    `Sleep logs: ${sleepLogs.length} entries`,
    `Glucose logs: ${glucoseLogs.length} entries`,
  ].join("\n");
}

import { generateHealthInsights } from "../../track/services/aiService";

/**
 * Call the Gemini API via aiService to generate 1-3 personalised correlations from the user's logs.
 * Falls back to rule-based insights if no API key or if API call fails.
 *
 * @param {Array} logs     Raw log objects
 * @returns {Promise<{ready: boolean, insights: string[], source: "ai"|"rule"|"empty"}>}
 */
export async function generateAIInsight(logs) {
  if (!logs || logs.length === 0) {
    return { ready: false, insights: [], source: "empty" };
  }

  try {
    const aiResult = await generateHealthInsights(logs);
    if (!aiResult.error && aiResult.insights && aiResult.insights.length > 0) {
      return {
        ready: true,
        insights: aiResult.insights,
        source: "ai",
      };
    }
  } catch (_) {
    // Fall back to rule-based
  }

  const ruleInsights = deriveRuleBasedInsights(logs);
  if (ruleInsights.length > 0) {
    return {
      ready: true,
      insights: ruleInsights.map((i) => i.description || i.title),
      source: "rule",
    };
  }

  return {
    ready: logs.length >= 3,
    insights: [],
    source: "empty",
  };
}
