// src/features/track/services/aiService.js
// Client side of the Reversia AI features (fix brief 0.2).
//
// The provider keys and prompts now live ONLY in the Cloud Functions
// (functions/index.js). This file keeps the same exported functions and the
// same return shapes, but each one calls a callable function instead of
// talking to Gemini directly. No EXPO_PUBLIC_* provider key is read here.
//
// When the function is unavailable (not deployed yet, offline, App Check
// not wired, rate limit hit) transcribeAudio / analyzeMealImage throw —
// their screens catch that and offer the manual path — and
// generateHealthInsights returns { insights: [], error } so the caller
// falls back to rule-based insights.

import * as FileSystem from "expo-file-system";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../../config/firebase";

let functionsInstance = null;
function getFunctionsInstance() {
  if (!functionsInstance) functionsInstance = getFunctions(app);
  return functionsInstance;
}

async function callAiFunction(name, data) {
  const fn = httpsCallable(getFunctionsInstance(), name);
  const result = await fn(data);
  return result.data;
}

/**
 * Helper to map file extensions to correct MIME types for the function.
 */
function getMimeType(uri) {
  const ext = uri.split(".").pop().toLowerCase();
  switch (ext) {
    case "m4a":
      return "audio/m4a";
    case "mp4":
      return "audio/mp4";
    case "wav":
      return "audio/wav";
    case "3gp":
      return "audio/3gp";
    case "caf":
      return "audio/x-caf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    default:
      if (uri.startsWith("data:image/")) {
        return uri.split(";")[0].split(":")[1];
      }
      return "application/octet-stream";
  }
}

/**
 * Transcribe an audio file using the transcribeAudio Cloud Function.
 * @param {string} audioUri Local URI of the recorded audio file
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeAudio(audioUri) {
  const base64Data = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const mimeType = getMimeType(audioUri);
  const data = await callAiFunction("transcribeAudio", {
    audioBase64: base64Data,
    mimeType,
  });
  const text = data?.text;
  if (!text) {
    throw new Error("Could not extract transcription from the AI response.");
  }
  return text.trim();
}

/**
 * Analyze a food image and return structured nutritional analysis.
 * @param {string} imageUri Local URI of the image
 * @param {string} [base64Data] Optional base64 representation of the image
 * @returns {Promise<Object>} Structured meal details { name, items, totalCal, confidence }
 */
export async function analyzeMealImage(imageUri, base64Data) {
  let finalBase64 = base64Data;
  if (!finalBase64) {
    finalBase64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  let mimeType = getMimeType(imageUri);
  if (mimeType === "application/octet-stream") {
    mimeType = "image/jpeg"; // Default to jpeg for meal recognition
  }

  const data = await callAiFunction("analyzeMealImage", {
    imageBase64: finalBase64,
    mimeType,
  });
  if (
    typeof data?.name !== "string" ||
    !Array.isArray(data?.items) ||
    typeof data?.totalCal !== "number"
  ) {
    throw new Error("Could not extract meal analysis from the AI response.");
  }
  return data;
}

/**
 * Build a compact 30-day log summary for the health insights prompt.
 * @param {Array} logs  Raw log objects from Firestore
 * @returns {string}    JSON summary string
 */
function buildHealthSummary(logs) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  function toDate(ts) {
    if (!ts) return null;
    if (ts?.toDate) return ts.toDate();
    if (ts instanceof Date) return ts;
    return new Date(ts);
  }

  const recent = logs.filter((l) => {
    const d = toDate(l?.createdAt);
    return d && d.getTime() >= thirtyDaysAgo;
  });

  const meals = recent.filter((l) => l?.category === "meal");
  const glucoseLogs = recent.filter((l) => l?.category === "glucose");
  const checks = recent.filter((l) => l?.category === "body_check");
  const hydration = recent.filter(
    (l) => l?.category === "water" || l?.category === "hydration"
  );
  const sleepLogs = recent.filter((l) => l?.category === "sleep");

  // Top 5 most frequent meal names
  const mealNameCount = {};
  for (const m of meals) {
    const name = m?.name || m?.type || "unknown";
    mealNameCount[name] = (mealNameCount[name] || 0) + 1;
  }
  const topMeals = Object.entries(mealNameCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Glucose stats
  const glucoseValues = glucoseLogs
    .map((g) => Number(g?.value ?? g?.glucose ?? 0))
    .filter((v) => v > 0);
  const fastingGlucose = glucoseLogs
    .filter((g) => g?.type === "fasting" || g?.isFasting)
    .map((g) => Number(g?.value ?? g?.glucose ?? 0))
    .filter((v) => v > 0);
  const avgFasting =
    fastingGlucose.length > 0
      ? (
          fastingGlucose.reduce((a, b) => a + b, 0) / fastingGlucose.length
        ).toFixed(1)
      : null;

  // Body check-ins: most common mood and symptoms
  const moodCount = {};
  const symptomCount = {};
  for (const c of checks) {
    if (c?.mood) moodCount[c.mood] = (moodCount[c.mood] || 0) + 1;
    for (const s of c?.symptoms ?? []) {
      symptomCount[s] = (symptomCount[s] || 0) + 1;
    }
  }
  const mostCommonMood =
    Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topSymptoms = Object.entries(symptomCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);

  // Hydration: days with 6+ glasses
  function logDay(log) {
    const d = toDate(log?.createdAt);
    if (!d) return null;
    return d.toISOString().slice(0, 10);
  }
  const hydrationByDay = {};
  for (const h of hydration) {
    const day = logDay(h);
    if (!day) continue;
    hydrationByDay[day] = (hydrationByDay[day] || 0) + 1;
  }
  const wellHydratedDays = Object.values(hydrationByDay).filter(
    (c) => c >= 6
  ).length;

  // Sleep: average duration
  const sleepDurations = sleepLogs
    .map((s) => Number(s?.duration ?? s?.hours ?? 0))
    .filter((v) => v > 0);
  const avgSleep =
    sleepDurations.length > 0
      ? (
          sleepDurations.reduce((a, b) => a + b, 0) / sleepDurations.length
        ).toFixed(1)
      : null;

  const summary = {
    periodDays: 30,
    meals: {
      total: meals.length,
      topFrequent: topMeals,
    },
    glucose: {
      totalReadings: glucoseValues.length,
      avgFastingMgDl: avgFasting ? Number(avgFasting) : null,
    },
    bodyCheckIns: {
      total: checks.length,
      mostCommonMood,
      topSymptoms,
    },
    hydration: {
      daysWithSixPlusGlasses: wellHydratedDays,
      totalLogs: hydration.length,
    },
    sleep: {
      totalLogs: sleepLogs.length,
      avgDurationHours: avgSleep ? Number(avgSleep) : null,
    },
  };

  return JSON.stringify(summary);
}

/**
 * Generate AI-powered health insights from a user's logs using the
 * generateHealthInsights Cloud Function.
 * @param {Array} logs  Raw log objects from Firestore
 * @returns {Promise<{ insights: string[], error: string|null }>}
 */
export async function generateHealthInsights(logs) {
  try {
    const summary = buildHealthSummary(logs || []);
    const data = await callAiFunction("generateHealthInsights", { summary });
    if (data?.error) {
      return { insights: [], error: data.error };
    }
    const insights = Array.isArray(data?.insights)
      ? data.insights.filter((item) => typeof item === "string")
      : [];
    return { insights, error: null };
  } catch (error) {
    console.error("Error generating health insights:", error);
    return { insights: [], error: error?.message ?? "Unknown error" };
  }
}
