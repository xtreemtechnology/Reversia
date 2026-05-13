// src/features/meals/index.js
/**
 * Meals Feature - Barrel exports
 * Use: import { MealPlanScreen, MealEntryScreen, useMeals } from 'src/features/meals'
 */

export { default as MealsStack } from "./navigation";
export * from "./hooks";
export * from "./screens";
export * from "./components";
export * from "./services";
export { MEAL_WINDOWS, detectMeal, MEAL_LABELS } from "./utils/mealUtils";
