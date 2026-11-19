import { FOOD_GUIDE } from "../features/food-guide/data/foodGuideData";
import { getFoodById } from "../features/food-guide/services/foodGuideService";
import {
  MEAL_PLAN,
  MEAL_SLOTS,
} from "../features/meal-plan/data/mealPlanData";
import {
  getAllMeals,
  getMealById,
  getDayPlan,
  getMealsForSlot,
  getWeekShoppingList,
} from "../features/meal-plan/services/mealPlanService";

describe("mealPlan data", () => {
  it("has 7 days with breakfast, lunch and dinner every day", () => {
    expect(MEAL_PLAN.length).toBe(7);
    MEAL_PLAN.forEach((dayPlan, index) => {
      expect(dayPlan.day).toBe(index + 1);
      expect(typeof dayPlan.title).toBe("string");
      expect(dayPlan.title.length).toBeGreaterThan(0);
      const slots = dayPlan.meals.map((meal) => meal.slot);
      expect(slots).toContain("breakfast");
      expect(slots).toContain("lunch");
      expect(slots).toContain("dinner");
      expect(slots.filter((slot) => slot === "breakfast").length).toBe(1);
      expect(slots.filter((slot) => slot === "lunch").length).toBe(1);
      expect(slots.filter((slot) => slot === "dinner").length).toBe(1);
      dayPlan.meals.forEach((meal) => {
        expect(meal.day).toBe(dayPlan.day);
        expect(MEAL_SLOTS).toContain(meal.slot);
      });
    });
  });

  it("has snacks only on Days 1, 3 and 5", () => {
    expect(getMealsForSlot("snack").map((meal) => meal.day)).toEqual([
      1, 3, 5,
    ]);
    expect(getAllMeals().length).toBe(24);
  });

  it("has unique meal ids and unique meal titles", () => {
    const ids = new Set();
    const titles = new Set();
    getAllMeals().forEach((meal) => {
      expect(ids.has(meal.id)).toBe(false);
      ids.add(meal.id);
      expect(titles.has(meal.title.toLowerCase())).toBe(false);
      titles.add(meal.title.toLowerCase());
    });
  });

  it("every meal has ingredients, 3-6 steps, a prep time and a carb note", () => {
    getAllMeals().forEach((meal) => {
      expect(typeof meal.title).toBe("string");
      expect(meal.title.length).toBeGreaterThan(0);
      expect(typeof meal.description).toBe("string");
      expect(meal.description.length).toBeGreaterThan(0);
      expect(Array.isArray(meal.ingredients)).toBe(true);
      expect(meal.ingredients.length).toBeGreaterThanOrEqual(1);
      meal.ingredients.forEach((ingredient) => {
        expect(typeof ingredient).toBe("string");
        expect(ingredient.length).toBeGreaterThan(0);
      });
      expect(Array.isArray(meal.steps)).toBe(true);
      expect(meal.steps.length).toBeGreaterThanOrEqual(3);
      expect(meal.steps.length).toBeLessThanOrEqual(6);
      expect(typeof meal.prepTime).toBe("number");
      expect(meal.prepTime).toBeGreaterThan(0);
      expect(["low", "medium"]).toContain(meal.carbNote);
      expect(typeof meal.tip).toBe("string");
      expect(meal.tip.length).toBeGreaterThan(0);
      expect(Array.isArray(meal.foodIds)).toBe(true);
      expect(meal.foodIds.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("every foodId exists in the Food Guide and none is avoid-rated", () => {
    const guideIds = new Set(FOOD_GUIDE.map((food) => food.id));
    getAllMeals().forEach((meal) => {
      meal.foodIds.forEach((foodId) => {
        expect(guideIds.has(foodId)).toBe(true);
        const food = getFoodById(foodId);
        expect(food).not.toBeNull();
        expect(food.rating).not.toBe("avoid");
      });
    });
  });

  it("carb note is low only when every food in the meal is low-load", () => {
    getAllMeals().forEach((meal) => {
      const loads = meal.foodIds.map((foodId) => getFoodById(foodId).load);
      if (meal.carbNote === "low") {
        expect(loads.every((load) => load === "low")).toBe(true);
      } else {
        expect(loads.some((load) => load !== "low")).toBe(true);
      }
    });
  });
});

describe("mealPlan service", () => {
  it("getDayPlan returns each day in slot order and null outside 1-7", () => {
    for (let day = 1; day <= 7; day += 1) {
      const plan = getDayPlan(day);
      expect(plan).not.toBeNull();
      expect(plan.day).toBe(day);
      expect(plan.meals.length).toBeGreaterThanOrEqual(3);
      const order = plan.meals.map((meal) => MEAL_SLOTS.indexOf(meal.slot));
      expect(order).toEqual([...order].sort((a, b) => a - b));
    }
    expect(getDayPlan(0)).toBeNull();
    expect(getDayPlan(8)).toBeNull();
    expect(getDayPlan("1")).toBeNull();
  });

  it("getMealById finds a meal and returns null for unknown ids", () => {
    const meal = getMealById("d1-breakfast");
    expect(meal).not.toBeNull();
    expect(meal.title).toBe("Oats & Boiled Eggs");
    expect(meal.day).toBe(1);
    expect(meal.slot).toBe("breakfast");
    expect(getMealById("d7-dinner").title).toBe("Oha Soup & Semovita (small)");
    expect(getMealById("not-a-meal")).toBeNull();
    expect(getMealById("")).toBeNull();
  });

  it("getMealsForSlot lists every meal in a slot in day order", () => {
    expect(getMealsForSlot("breakfast").length).toBe(7);
    expect(getMealsForSlot("lunch").length).toBe(7);
    expect(getMealsForSlot("dinner").length).toBe(7);
    expect(getMealsForSlot("snack").length).toBe(3);
    expect(getMealsForSlot("breakfast").map((meal) => meal.day)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(getMealsForSlot("brunch")).toEqual([]);
    expect(getMealsForSlot("")).toEqual([]);
  });

  it("getWeekShoppingList groups ingredients with counts, most-used first", () => {
    const list = getWeekShoppingList();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    list.forEach((item) => {
      expect(typeof item.ingredient).toBe("string");
      expect(item.ingredient.length).toBeGreaterThan(0);
      expect(typeof item.count).toBe("number");
      expect(item.count).toBeGreaterThan(0);
    });
    const counts = list.map((item) => item.count);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    const total = list.reduce((sum, item) => sum + item.count, 0);
    const expectedTotal = getAllMeals().reduce(
      (sum, meal) => sum + meal.ingredients.length,
      0
    );
    expect(total).toBe(expectedTotal);
    const water = list.find((item) => item.ingredient === "Water (1 glass)");
    expect(water).toBeDefined();
    expect(water.count).toBe(23);
    expect(list[0].ingredient).toBe("Water (1 glass)");
    const oats = list.find((item) => item.ingredient === "Oats (1 cup)");
    expect(oats.count).toBe(2);
  });
});
