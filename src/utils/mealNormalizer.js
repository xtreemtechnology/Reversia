/**
 * mealNormalizer.js
 *
 * Canonical meal document shape written to Firestore:
 * {
 *   category: "meal",
 *   name: string,          // human-readable meal name (required)
 *   mealType: string,      // "breakfast" | "lunch" | "dinner" | "snack"
 *   calories: number|null, // kcal (null if unknown)
 *   protein: number|null,  // grams (null if unknown)
 *   carbs: number|null,    // grams (null if unknown)
 *   fat: number|null,      // grams (null if unknown)
 *   photoURL: string|null, // Firebase Storage URL or null
 *   notes: string,         // empty string if none
 *   source: "manual"|"voice"|"photo"|"repeat"|"search",
 *   createdAt: serverTimestamp(),
 *   date: "YYYY-MM-DD",
 *   uid: string
 * }
 */

/**
 * Parse a macro value that might be "13g", 13, "13", or null → number|null
 */
export function parseMacro(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return Math.round(val);
  if (typeof val === "string") {
    const trimmed = val.trim();
    const numeric = trimmed.endsWith("g")
      ? parseFloat(trimmed.slice(0, -1))
      : parseFloat(trimmed);
    return isNaN(numeric) ? null : Math.round(numeric);
  }
  return null;
}

/**
 * Normalize a raw meal object for writing to Firestore.
 * Accepts any of the old shapes and returns the canonical shape.
 * Does NOT include createdAt or uid — caller adds those.
 */
export function normalizeMealForFirestore(raw) {
  return {
    name: raw.name || raw.type || "Unknown meal",
    mealType: raw.mealType || raw.type || raw.meal_type || "meal",
    calories: parseMacro(raw.calories ?? raw.cal ?? raw.totalCal),
    protein: parseMacro(raw.protein),
    carbs: parseMacro(raw.carbs),
    fat: parseMacro(raw.fat),
    photoURL: raw.photoURL || raw.photo_url || null,
    notes: raw.notes || "",
    source: raw.source || "manual",
    date: raw.date || new Date().toISOString().slice(0, 10),
  };
}

/**
 * Normalize a meal document read FROM Firestore (handles old + new shapes).
 * Returns a consistent object safe to use in the app.
 * Keeps `type` as an alias for mealType for backward compatibility.
 */
export function normalizeMealFromFirestore(doc) {
  const normalized = normalizeMealForFirestore(doc);
  return {
    ...normalized,
    // backward-compat alias
    type: normalized.mealType,
    // preserve Firestore metadata
    id: doc.id,
    createdAt: doc.createdAt,
    uid: doc.uid,
    category: "meal",
  };
}
