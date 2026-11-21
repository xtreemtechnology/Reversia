// functions/index.js
//
// Reversia Cloud Functions (fix brief 0.2 + 0.3).
//
// The provider API keys (Gemini, OpenAI) live ONLY here, in Secret Manager —
// never in the app bundle, never behind an EXPO_PUBLIC_ variable. The app
// calls these four callable functions; the prompts and the keys stay
// server-side.
//
// Deploy: see functions/DEPLOY.md. Needs the Blaze plan (2nd gen functions
// are pay-as-you-go) and the secrets set before the first deploy:
//   firebase functions:secrets:set GEMINI_API_KEY
//   firebase functions:secrets:set OPENAI_API_KEY

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// ── Model (brief 0.3) ──────────────────────────────────────────────────────
// gemini-1.5-flash is RETIRED (shut down on the Gemini API 2026-09-29).
// Current model, from Google's official docs (ai.google.dev/gemini-api/docs
// /models and /deprecations, checked 2026-11-21): gemini-4-hydrogen — the
// current generation's efficiency model (text, image, audio, video, PDF,
// 1M context), free tier available. It is set in this ONE place; the
// generateContent response shape it returns is the standard one:
//   candidates[0].content.parts[0].text
const GEMINI_MODEL = "gemini-4-hydrogen";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// OpenAI model for the Guide (unchanged from the client code it replaces).
const OPENAI_MODEL = "gpt-4o-mini";

// Provider keys, from Secret Manager. defineSecret() makes the value
// available at runtime via .value() and never writes it into source.
const geminiKey = defineSecret("GEMINI_API_KEY");
const openaiKey = defineSecret("OPENAI_API_KEY");

// ── Per-user daily rate limits (brief 0.2) ────────────────────────────────
// Stored in Firestore at aiUsage/{uid}: { date: "YYYY-MM-DD", <fn>: count }.
// The doc resets when the date changes, so one small doc per user.
// Caps are a judgment call (no abuse has been seen); raise them in one
// place here if real use hits them.
const DAILY_LIMITS = {
  transcribeAudio: 20,
  analyzeMealImage: 20,
  generateHealthInsights: 10,
  guideChat: 50,
};

// Input size caps (brief 0.2: validate input size/type).
const MAX_BASE64_CHARS = 8_000_000; // ~6 MB decoded — a few minutes of audio or one photo
const MAX_QUESTION_CHARS = 2_000;
const MAX_SUMMARY_CHARS = 20_000;

const ALLOWED_AUDIO_MIME = new Set([
  "audio/m4a",
  "audio/mp4",
  "audio/wav",
  "audio/3gp",
  "audio/x-caf",
  "audio/mpeg",
]);
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

// ── Helpers ───────────────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

/** Require a signed-in user; callable functions get auth from the SDK. */
function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in to use Reversia AI.");
  }
  return request.auth.uid;
}

/**
 * Enforce the per-user daily cap for one function, in a transaction so two
 * simultaneous calls cannot both slip under the limit.
 */
async function checkRateLimit(uid, fnName) {
  const ref = db.collection("aiUsage").doc(uid);
  const limit = DAILY_LIMITS[fnName];
  const today = todayString();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : {};
    const counts = data.date === today ? data : { date: today };
    const used = Number(counts[fnName] || 0);
    if (used >= limit) {
      throw new HttpsError(
        "resource-exhausted",
        `Daily limit reached for ${fnName} (${limit}/day). Try again tomorrow.`
      );
    }
    tx.set(ref, { ...counts, [fnName]: used + 1 }, { merge: true });
  });
}

function requireBase64(value, field, allowedMime, mimeType) {
  if (typeof value !== "string" || value.length === 0) {
    throw new HttpsError("invalid-argument", `${field} is required.`);
  }
  if (value.length > MAX_BASE64_CHARS) {
    throw new HttpsError(
      "invalid-argument",
      `${field} is too large (max ~6 MB).`
    );
  }
  if (!allowedMime.has(mimeType)) {
    throw new HttpsError("invalid-argument", `Unsupported file type: ${mimeType}.`);
  }
}

/** The standard generateContent text extraction (brief 0.3). */
function geminiText(json) {
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

async function callGemini(body) {
  const res = await fetch(`${GEMINI_API_URL}?key=${geminiKey.value()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new HttpsError(
      "internal",
      `Gemini error (${res.status}): ${text.slice(0, 200)}`
    );
  }
  return res.json();
}

// ── Prompts (moved server-side from the app, brief 0.2) ───────────────────
// TODO (brief Phase 2, item 5): add the AI medical guardrails here — never
// change medication/insulin, never diagnose, urge care for lows — before
// any prompt that gives health guidance. The transcription and image prompts
// below are descriptive only and were moved verbatim.

const TRANSCRIBE_PROMPT =
  "You are the speech transcription system for Reversia, a health app. Transcribe this audio recording of a user describing what they ate or drank. Do not add any conversational filler, explanations, or corrections. Just output the exact transcribed text.";

const MEAL_ANALYSIS_PROMPT = `Analyze this image of a meal with high precision. Be extremely thorough in identifying all visual food elements, sides, proteins, starches, vegetables, and condiments.

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

Return ONLY the raw JSON object. Do not include markdown formatting, backticks, or other text.`;

const HEALTH_INSIGHTS_SYSTEM_PROMPT = `You are a health pattern analyst for Reversia, a diabetes management app for Nigerian users.
Given this 30-day activity summary for one user, identify 2-3 specific, actionable, and honest observations about their health patterns.

Rules:
- Only state what the data actually supports. Never fabricate.
- Each insight must be 1-2 sentences max.
- Focus on correlations (e.g. "On days with high-carb meals, energy scores were lower").
- If data is insufficient for a pattern, say so honestly ("You need more data to...").
- Format: Return a JSON array of strings. Example: ["Your fasting glucose averages 118 mg/dL this week — pre-diabetic range. Try logging a 10-min walk after dinner.", "You logged water on only 3 of 7 days. Hydration correlates with better energy scores in your logs."]
- Max 3 items. Return ONLY the JSON array.`;

const GUIDE_SYSTEM_PROMPT =
  "You are Reversia: provide concise, culturally-aware meal guidance for Nigerian foods. Keep answers short and actionable.";

// ── Callable functions ────────────────────────────────────────────────────
// enforceAppCheck: true — the functions only accept calls from the real
// app (Play Integrity on Android, App Attest on iOS). App Check must be
// enabled for the project in the Firebase console AND wired into the app
// before these accept calls; until then calls fail and the app uses its
// local/manual fallbacks (see DEPLOY.md).

const CALL_OPTIONS = { enforceAppCheck: true };

/**
 * Transcribe a voice log. Input: { audioBase64, mimeType }.
 * Returns { text } — same shape the app's transcribeAudio() returned.
 */
exports.transcribeAudio = onCall(
  { ...CALL_OPTIONS, secrets: [geminiKey] },
  async (request) => {
    const uid = requireAuth(request);
    await checkRateLimit(uid, "transcribeAudio");
    const { audioBase64, mimeType } = request.data || {};
    requireBase64(audioBase64, "audioBase64", ALLOWED_AUDIO_MIME, mimeType);
    const json = await callGemini({
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: audioBase64 } },
            { text: TRANSCRIBE_PROMPT },
          ],
        },
      ],
    });
    const text = geminiText(json);
    if (!text) {
      throw new HttpsError("internal", "Could not extract transcription from Gemini response.");
    }
    return { text: text.trim() };
  }
);

/**
 * Analyse a meal photo. Input: { imageBase64, mimeType }.
 * Returns the meal object { name, items, totalCal, confidence } — same
 * shape the app's analyzeMealImage() returned.
 */
exports.analyzeMealImage = onCall(
  { ...CALL_OPTIONS, secrets: [geminiKey] },
  async (request) => {
    const uid = requireAuth(request);
    await checkRateLimit(uid, "analyzeMealImage");
    const { imageBase64, mimeType } = request.data || {};
    requireBase64(imageBase64, "imageBase64", ALLOWED_IMAGE_MIME, mimeType);
    const json = await callGemini({
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: MEAL_ANALYSIS_PROMPT },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });
    const text = geminiText(json);
    if (!text) {
      throw new HttpsError("internal", "Could not extract meal analysis from Gemini response.");
    }
    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch (_) {
      throw new HttpsError("internal", "Gemini did not return valid meal JSON.");
    }
    if (
      typeof parsed?.name !== "string" ||
      !Array.isArray(parsed?.items) ||
      typeof parsed?.totalCal !== "number"
    ) {
      throw new HttpsError("internal", "Gemini meal JSON is missing name, items, or totalCal.");
    }
    return parsed;
  }
);

/**
 * Generate health insights. Input: { summary } — the compact 30-day JSON
 * summary the app builds from the user's logs (same builder as before).
 * Returns { insights, error } — same shape as before.
 */
exports.generateHealthInsights = onCall(
  { ...CALL_OPTIONS, secrets: [geminiKey] },
  async (request) => {
    const uid = requireAuth(request);
    await checkRateLimit(uid, "generateHealthInsights");
    const { summary } = request.data || {};
    if (typeof summary !== "string" || summary.length === 0) {
      throw new HttpsError("invalid-argument", "summary is required.");
    }
    if (summary.length > MAX_SUMMARY_CHARS) {
      throw new HttpsError("invalid-argument", "summary is too large.");
    }
    let json;
    try {
      json = await callGemini({
        system_instruction: { parts: [{ text: HEALTH_INSIGHTS_SYSTEM_PROMPT }] },
        contents: [
          { parts: [{ text: `Here is the user's 30-day health activity summary:\n${summary}` }] },
        ],
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
      });
    } catch (err) {
      return { insights: [], error: err?.message ?? "Unknown error" };
    }
    const text = geminiText(json) ?? "";
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      return { insights: [], error: "Could not parse insights from Gemini response." };
    }
    let parsed;
    try {
      parsed = JSON.parse(arrayMatch[0]);
    } catch (_) {
      return { insights: [], error: "Could not parse insights from Gemini response." };
    }
    if (!Array.isArray(parsed)) {
      return { insights: [], error: "Gemini response was not a JSON array." };
    }
    return { insights: parsed.filter((item) => typeof item === "string"), error: null };
  }
);

/**
 * Guide chat. Input: { question }.
 * Returns { text } — the model's reply (or null). The app appends its
 * safety line and falls back to local answers when this fails.
 */
exports.guideChat = onCall(
  { ...CALL_OPTIONS, secrets: [openaiKey] },
  async (request) => {
    const uid = requireAuth(request);
    await checkRateLimit(uid, "guideChat");
    const { question } = request.data || {};
    if (typeof question !== "string" || question.trim().length === 0) {
      throw new HttpsError("invalid-argument", "question is required.");
    }
    if (question.length > MAX_QUESTION_CHARS) {
      throw new HttpsError("invalid-argument", "question is too long (max 2000 characters).");
    }
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey.value()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: GUIDE_SYSTEM_PROMPT },
          { role: "user", content: question },
        ],
        max_tokens: 250,
        temperature: 0.6,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new HttpsError("internal", `OpenAI error (${res.status}): ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    return { text: json?.choices?.[0]?.message?.content || null };
  }
);
