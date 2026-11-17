import {
  parseMacro,
  normalizeMealForFirestore,
  normalizeMealFromFirestore,
} from "../utils/mealNormalizer";

describe("mealNormalizer", () => {
  describe("parseMacro", () => {
    it("parses strings ending with 'g'", () => {
      expect(parseMacro("13g")).toBe(13);
      expect(parseMacro("0g")).toBe(0);
      expect(parseMacro("24.4g")).toBe(24);
    });

    it("rounds numbers properly", () => {
      expect(parseMacro(13.7)).toBe(14);
      expect(parseMacro(13.2)).toBe(13);
      expect(parseMacro(0)).toBe(0);
    });

    it("handles null, undefined and invalid strings", () => {
      expect(parseMacro(null)).toBeNull();
      expect(parseMacro(undefined)).toBeNull();
      expect(parseMacro("abc")).toBeNull();
      expect(parseMacro("")).toBeNull();
    });

    it("parses numeric strings without 'g'", () => {
      expect(parseMacro("45")).toBe(45);
      expect(parseMacro(" 60 ")).toBe(60);
    });
  });

  describe("normalizeMealForFirestore", () => {
    it("normalizes a full meal object", () => {
      const raw = {
        name: "Jollof Rice",
        mealType: "dinner",
        cal: 340,
        protein: "7g",
        carbs: "62g",
        fat: "7g",
        notes: "Delicious",
        source: "search",
      };
      const normalized = normalizeMealForFirestore(raw);
      expect(normalized.name).toBe("Jollof Rice");
      expect(normalized.mealType).toBe("dinner");
      expect(normalized.calories).toBe(340);
      expect(normalized.protein).toBe(7);
      expect(normalized.carbs).toBe(62);
      expect(normalized.fat).toBe(7);
      expect(normalized.notes).toBe("Delicious");
      expect(normalized.source).toBe("search");
      expect(normalized.date).toBeDefined();
    });

    it("handles empty object with sensible defaults", () => {
      const normalized = normalizeMealForFirestore({});
      expect(normalized.name).toBe("Unknown meal");
      expect(normalized.mealType).toBe("meal");
      expect(normalized.calories).toBeNull();
      expect(normalized.protein).toBeNull();
      expect(normalized.carbs).toBeNull();
      expect(normalized.fat).toBeNull();
      expect(normalized.notes).toBe("");
      expect(normalized.source).toBe("manual");
    });

    it("maps legacy 'type' and 'totalCal' fields", () => {
      const raw = {
        name: "Akara",
        type: "breakfast",
        totalCal: 220,
      };
      const normalized = normalizeMealForFirestore(raw);
      expect(normalized.mealType).toBe("breakfast");
      expect(normalized.calories).toBe(220);
    });
  });

  describe("normalizeMealFromFirestore", () => {
    it("preserves Firestore doc metadata and adds backward-compat aliases", () => {
      const doc = {
        id: "doc-123",
        name: "Pounded Yam",
        mealType: "lunch",
        protein: "4g",
        uid: "user-456",
        createdAt: "2026-11-17T20:00:00.000Z",
      };
      const normalized = normalizeMealFromFirestore(doc);
      expect(normalized.id).toBe("doc-123");
      expect(normalized.uid).toBe("user-456");
      expect(normalized.createdAt).toBe("2026-11-17T20:00:00.000Z");
      expect(normalized.category).toBe("meal");
      expect(normalized.mealType).toBe("lunch");
      expect(normalized.type).toBe("lunch"); // alias
      expect(normalized.protein).toBe(4);
    });
  });
});
