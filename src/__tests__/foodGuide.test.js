import {
  FOOD_GUIDE,
  FOOD_GUIDE_RATINGS,
  FOOD_GUIDE_CATEGORIES,
} from "../features/food-guide/data/foodGuideData";
import {
  getFoodById,
  getSwapFor,
  listByRating,
  listByCategory,
  searchFoodGuide,
  countByRating,
} from "../features/food-guide/services/foodGuideService";

describe("foodGuide data", () => {
  it("has 44 foods, all with a valid rating, category and load band", () => {
    expect(FOOD_GUIDE.length).toBe(44);
    const ids = new Set();
    FOOD_GUIDE.forEach((food) => {
      expect(FOOD_GUIDE_RATINGS).toContain(food.rating);
      expect(FOOD_GUIDE_CATEGORIES).toContain(food.category);
      expect(["low", "medium", "high"]).toContain(food.load);
      expect(typeof food.name).toBe("string");
      expect(food.name.length).toBeGreaterThan(0);
      expect(typeof food.tip).toBe("string");
      expect(food.tip.length).toBeGreaterThan(0);
      expect(ids.has(food.id)).toBe(false);
      ids.add(food.id);
    });
  });

  it("has unique names and every swapTo points at a real food", () => {
    const names = new Set();
    FOOD_GUIDE.forEach((food) => {
      expect(names.has(food.name.toLowerCase())).toBe(false);
      names.add(food.name.toLowerCase());
      if (food.swapTo) {
        const target = getFoodById(food.swapTo);
        expect(target).not.toBeNull();
        expect(target.id).not.toBe(food.id);
      }
    });
  });

  it("keeps the plan's swaps: dodo -> boiled plantain, eba -> wheat, sugary drinks -> water", () => {
    expect(getSwapFor("fried-plantain").id).toBe("boiled-plantain");
    expect(getSwapFor("eba-garri").id).toBe("wheat-meal");
    expect(getSwapFor("coke").id).toBe("water");
    expect(getSwapFor("fanta").id).toBe("water");
    expect(getSwapFor("jollof-rice").id).toBe("beans-ewa");
  });

  it("rates beans safe and sugary drinks avoid", () => {
    expect(getFoodById("beans-ewa").rating).toBe("safe");
    expect(getFoodById("moi-moi").rating).toBe("safe");
    expect(getFoodById("coke").rating).toBe("avoid");
    expect(getFoodById("fanta").rating).toBe("avoid");
    expect(getFoodById("malt-drink").rating).toBe("avoid");
    expect(getFoodById("chapman").rating).toBe("avoid");
  });

  it("counts add up to the full guide", () => {
    const counts = countByRating();
    expect(counts.safe).toBe(20);
    expect(counts.caution).toBe(20);
    expect(counts.avoid).toBe(4);
    expect(counts.safe + counts.caution + counts.avoid).toBe(FOOD_GUIDE.length);
    expect(listByRating("safe").length).toBe(20);
    expect(listByRating("bogus").length).toBe(0);
  });

  it("searches by name and by alias", () => {
    expect(searchFoodGuide("beans").map((f) => f.id)).toContain("beans-ewa");
    expect(searchFoodGuide("dodo").map((f) => f.id)).toContain(
      "fried-plantain"
    );
    expect(searchFoodGuide("EBA").map((f) => f.id)).toContain("eba-garri");
    expect(searchFoodGuide("").length).toBe(FOOD_GUIDE.length);
    expect(searchFoodGuide("zzz-no-such-food").length).toBe(0);
    expect(searchFoodGuide("", "avoid").length).toBe(4);
  });

  it("lists by category", () => {
    expect(listByCategory("Soups").length).toBeGreaterThan(0);
    expect(listByCategory("Soups").every((f) => f.category === "Soups")).toBe(
      true
    );
    expect(listByCategory("Nope").length).toBe(0);
  });

  it("returns null for unknown ids", () => {
    expect(getFoodById("not-a-food")).toBeNull();
    expect(getSwapFor("beans-ewa")).toBeNull();
    expect(getSwapFor("not-a-food")).toBeNull();
  });
});
