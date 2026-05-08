// src/features/meals/index.js
/**
 * Meals Feature - Barrel exports
 * Use: import { MealPlanScreen, MealEntryScreen } from 'src/features/meals'
 */

// Screens
export { default as MealPlanScreen } from './screens/MealPlanScreen';
export { default as MealEntryScreen } from './screens/MealEntryScreen';
export { default as MealAnalyser } from './screens/MealAnalyser';

// Components
export { MealCard } from './components/MealCard';
export { WaterTracker } from './components/WaterTracker';
export { DaySummary } from './components/DaySummary';
export { TipCard } from './components/TipCard';
export { WalkReminder } from './components/WalkReminder';

// Hooks
export { useMealHistory } from './hooks/useMealHistory';

// Services
export { logMealEntry, logAIAnalyzedMeal } from './services/mealsService';
export { analyseWithClaude } from './services/mealAnalysisService';

// Utils
export { MEAL_WINDOWS, detectMeal, MEAL_LABELS } from './utils/mealUtils';
