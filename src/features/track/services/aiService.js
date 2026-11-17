// src/features/track/services/aiService.js
// Service for communicating with Gemini API for multimodal features (Voice, Photo, Health Insights)

import * as FileSystem from "expo-file-system";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Helper to get the API key from environment variables
 */
function getApiKey() {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
}

/**
 * Helper to map file extensions to correct MIME types for Gemini
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
 * Transcribe an audio file using Gemini 1.5 Flash
 * @param {string} audioUri Local URI of the recorded audio file
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeAudio(audioUri) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not configured in .env");
  }

  try {
    // Read the recorded audio file as base64
    const base64Data = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const mimeType = getMimeType(audioUri);

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: "You are the speech transcription system for Reversia, a health app. Transcribe this audio recording of a user describing what they ate or drank. Do not add any conversational filler, explanations, or corrections. Just output the exact transcribed text.",
            },
          ],
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Could not extract transcription from Gemini response.");
    }

    return text.trim();
  } catch (error) {
    console.error("Error transcribing audio with Gemini:", error);
    throw error;
  }
}

/**
 * Analyze a food image and return structured nutritional analysis
 * @param {string} imageUri Local URI of the image
 * @param {string} [base64Data] Optional base64 representation of the image
 * @returns {Promise<Object>} Structured meal details matching MOCK_ANALYSIS format
 */
export async function analyzeMealImage(imageUri, base64Data) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not configured in .env");
  }

  try {
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

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: finalBase64,
              },
            },
            {
              text: `Analyze this image of a meal with high precision. Be extremely thorough in identifying all visual food elements, sides, proteins, starches, vegetables, and condiments.
              
              Guidelines for analysis:
              1. Carefully identify the cultural/regional cuisine (highly prioritize West African/Nigerian dishes such as Jollof Rice, pounded yam, egusi soup, akara, moi moi, plantains/dodo, suya, pepper soup, or tomato stews; as well as western, asian, or other cuisines) and name the items accordingly.
              2. Estimate portion sizes realistic to the plate/serving size visible in the image.
              3. Calculate the calorie count and macronutrients (Protein, Carbs, Fat) for each identified item. Ensure 'totalCal' is the correct sum of the individual item calories.
              
              You must return a raw JSON object matching the following schema:
              {
                "name": "Descriptive name of the overall meal (e.g., Jollof Rice with Fried Plantain & Chicken)",
                "items": [
                  {
                    "name": "Food item name",
                    "amount": "Estimated portion, e.g. 1 cup, 3 slices, or 1 piece",
                    "cal": number, // Calories as a number
                    "protein": "grams of protein, e.g. 24g or 2g",
                    "carbs": "grams of carbs, e.g. 45g or 0g",
                    "fat": "grams of fat, e.g. 12g or 1g"
                  }
                ],
                "totalCal": number, // Total calories as a number (sum of items' calories)
                "confidence": number // Confidence score between 1 and 100 based on image clarity
              }
              
              Return ONLY the raw JSON object. Do not include markdown formatting, backticks, or other text.`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Could not extract meal analysis from Gemini response.");
    }

    // Parse the JSON returned by Gemini
    const parsedData = JSON.parse(text.trim());
    return parsedData;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw error;
  }
}

/**
 * Build a compact 30-day log summary for the Gemini health insights prompt.
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
      ? (fastingGlucose.reduce((a, b) => a + b, 0) / fastingGlucose.length).toFixed(1)
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
  const mostCommonMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
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
  const wellHydratedDays = Object.values(hydrationByDay).filter((c) => c >= 6).length;

  // Sleep: average duration
  const sleepDurations = sleepLogs
    .map((s) => Number(s?.duration ?? s?.hours ?? 0))
    .filter((v) => v > 0);
  const avgSleep =
    sleepDurations.length > 0
      ? (sleepDurations.reduce((a, b) => a + b, 0) / sleepDurations.length).toFixed(1)
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

const HEALTH_INSIGHTS_SYSTEM_PROMPT = `You are a health pattern analyst for Reversia, a diabetes management app for Nigerian users.
Given this 30-day activity summary for one user, identify 2-3 specific, actionable, and honest observations about their health patterns.

Rules:
- Only state what the data actually supports. Never fabricate.
- Each insight must be 1-2 sentences max.
- Focus on correlations (e.g. "On days with high-carb meals, energy scores were lower").
- If data is insufficient for a pattern, say so honestly ("You need more data to...").
- Format: Return a JSON array of strings. Example: ["Your fasting glucose averages 118 mg/dL this week — pre-diabetic range. Try logging a 10-min walk after dinner.", "You logged water on only 3 of 7 days. Hydration correlates with better energy scores in your logs."]
- Max 3 items. Return ONLY the JSON array.`;

/**
 * Generate AI-powered health insights from a user's logs using Gemini.
 * @param {Array} logs  Raw log objects from Firestore
 * @returns {Promise<{ insights: string[], error: string|null }>}
 */
export async function generateHealthInsights(logs) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { insights: [], error: "no_key" };
  }

  try {
    const summary = buildHealthSummary(logs || []);

    const requestBody = {
      system_instruction: {
        parts: [{ text: HEALTH_INSIGHTS_SYSTEM_PROMPT }],
      },
      contents: [
        {
          parts: [
            {
              text: `Here is the user's 30-day health activity summary:\n${summary}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 400,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { insights: [], error: `Gemini API error (${response.status}): ${errText}` };
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Extract the JSON array from the response (strip any markdown fences)
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      return { insights: [], error: "Could not parse insights from Gemini response." };
    }

    const parsed = JSON.parse(arrayMatch[0]);
    if (!Array.isArray(parsed)) {
      return { insights: [], error: "Gemini response was not a JSON array." };
    }

    const insights = parsed.filter((item) => typeof item === "string");
    return { insights, error: null };
  } catch (error) {
    console.error("Error generating health insights with Gemini:", error);
    return { insights: [], error: error?.message ?? "Unknown error" };
  }
}
