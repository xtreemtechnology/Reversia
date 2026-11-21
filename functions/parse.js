// functions/parse.js
//
// Pure response-parsing helpers for the Cloud Functions (brief 0.3).
// Dependency-free, so they can be tested with plain `node --test`
// (see test/parse.test.js) without Firebase credentials.
//
// Shapes, from the current official docs (checked 2026-11-21):
// - Gemini generateContent (ai.google.dev/api/generate-content):
//   GenerateContentResponse.candidates[].content.parts[].text
// - OpenAI chat completions: choices[].message.content

/**
 * The standard generateContent text extraction. Returns null when the
 * response has no candidates (e.g. the prompt was blocked).
 */
function geminiText(json) {
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

/** The chat-completions text extraction. Returns null when no choice. */
function openaiText(json) {
  return json?.choices?.[0]?.message?.content || null;
}

/**
 * Check a parsed meal-analysis object has the shape the app needs.
 * Returns an error string when it does not, or null when it is fine.
 */
function validateMealAnalysis(parsed) {
  if (
    typeof parsed?.name !== "string" ||
    !Array.isArray(parsed?.items) ||
    typeof parsed?.totalCal !== "number"
  ) {
    return "Meal analysis is missing name, items, or totalCal.";
  }
  return null;
}

module.exports = { geminiText, openaiText, validateMealAnalysis };
