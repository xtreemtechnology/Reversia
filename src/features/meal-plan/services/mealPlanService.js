// src/features/meal-plan/services/mealPlanService.js
//
// Pure helpers only, no navigation, no Firestore, no imports from the
// rest of the app, so they are safe to use in Jest tests. Works over
// src/features/meal-plan/data/mealPlanData.js.

import { MEAL_PLAN, MEAL_SLOTS } from "../data/mealPlanData";

/** All meals in the plan, day by day, in slot order. */
export function getAllMeals() {
  return MEAL_PLAN.flatMap((dayPlan) => dayPlan.meals);
}

/** One meal by id, or null when it is not in the plan. */
export function getMealById(id) {
  if (!id) return null;
  return getAllMeals().find((meal) => meal.id === id) || null;
}

/**
 * The plan for one day (1-7): { day, title, meals } with meals in
 * slot order (breakfast, lunch, dinner, snack). Returns null outside
 * that range.
 */
export function getDayPlan(day) {
  if (typeof day !== "number" || day < 1 || day > MEAL_PLAN.length) {
    return null;
  }
  const dayPlan = MEAL_PLAN.find((entry) => entry.day === day) || null;
  if (!dayPlan) return null;
  const order = MEAL_SLOTS.reduce((map, slot, index) => {
    map[slot] = index;
    return map;
  }, {});
  return {
    ...dayPlan,
    meals: [...dayPlan.meals].sort(
      (a, b) => order[a.slot] - order[b.slot]
    ),
  };
}

/** Every meal in one slot across the week, in day order. */
export function getMealsForSlot(slot) {
  if (!MEAL_SLOTS.includes(slot)) return [];
  return getAllMeals().filter((meal) => meal.slot === slot);
}

/**
 * Weekly shopping list: each ingredient string with how many meals
 * use it, most-used first, then alphabetical. Ingredients are written
 * with consistent wording in the data so the same item groups together.
 */
export function getWeekShoppingList() {
  const counts = new Map();
  getAllMeals().forEach((meal) => {
    (meal.ingredients || []).forEach((ingredient) => {
      counts.set(ingredient, (counts.get(ingredient) || 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .map(([ingredient, count]) => ({ ingredient, count }))
    .sort((a, b) => b.count - a.count || a.ingredient.localeCompare(b.ingredient));
}

export default {
  getAllMeals,
  getMealById,
  getDayPlan,
  getMealsForSlot,
  getWeekShoppingList,
};
