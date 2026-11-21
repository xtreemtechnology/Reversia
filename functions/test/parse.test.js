// functions/test/parse.test.js
//
// Tests for the Cloud Functions' response parsing (brief 0.3).
// Run: cd functions && node --test test/
// No Firebase credentials or network needed — these are pure functions.

const test = require("node:test");
const assert = require("node:assert/strict");
const { geminiText, openaiText, validateMealAnalysis } = require("../parse");

test("geminiText extracts the model text from a generateContent response", () => {
  const response = {
    candidates: [
      {
        content: { parts: [{ text: "Jollof rice with chicken." }] },
        finishReason: "STOP",
      },
    ],
  };
  assert.equal(geminiText(response), "Jollof rice with chicken.");
});

test("geminiText returns null when the prompt was blocked (no candidates)", () => {
  assert.equal(geminiText({ promptFeedback: { blockReason: "SAFETY" } }), null);
  assert.equal(geminiText({}), null);
  assert.equal(geminiText(null), null);
});

test("openaiText extracts the chat completion content", () => {
  const response = {
    choices: [{ message: { role: "assistant", content: "Beans is safe." } }],
  };
  assert.equal(openaiText(response), "Beans is safe.");
});

test("openaiText returns null when there are no choices", () => {
  assert.equal(openaiText({ choices: [] }), null);
  assert.equal(openaiText({}), null);
});

test("validateMealAnalysis accepts a well-formed meal", () => {
  const meal = {
    name: "Jollof Rice with Fried Chicken",
    items: [
      {
        name: "Jollof Rice",
        amount: "1 cup",
        cal: 340,
        protein: "7g",
        carbs: "62g",
        fat: "7g",
      },
    ],
    totalCal: 340,
    confidence: 90,
  };
  assert.equal(validateMealAnalysis(meal), null);
});

test("validateMealAnalysis flags a meal missing name, items, or totalCal", () => {
  assert.ok(validateMealAnalysis({ items: [], totalCal: 100 }));
  assert.ok(validateMealAnalysis({ name: "X", totalCal: 100 }));
  assert.ok(validateMealAnalysis({ name: "X", items: [] }));
  assert.ok(validateMealAnalysis({ name: "X", items: [], totalCal: "340" }));
  assert.ok(validateMealAnalysis(null));
});
