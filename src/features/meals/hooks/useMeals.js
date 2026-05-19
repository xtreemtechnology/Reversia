import { useState, useCallback, useEffect } from "react";
import * as mealsService from "../services/mealsService";
import * as mealAnalysisService from "../services/mealAnalysisService";

/**
 * useMeals - Main meals feature hook
 *
 * Manages meal history, meal logging, and meal analysis
 *
 * Usage:
 *   const { meals, isLoading, error, logMeal, analyzeMeal } = useMeals(userId);
 */
export function useMeals(userId) {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAddedMeal, setLastAddedMeal] = useState(null);

  const loadMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement actual meal history loading
      // const data = await mealsService.getMealHistory(userId);
      // setMeals(data);
    } catch (err) {
      setError(err.message || "Failed to load meals");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadMeals();
    }
  }, [userId, loadMeals]);

  const logMeal = useCallback(async (mealData) => {
    try {
      const logged = await mealsService.logMealEntry(mealData);
      setMeals((prev) => [logged, ...prev]);
      setLastAddedMeal(logged);
      return logged;
    } catch (err) {
      setError(err.message || "Failed to log meal");
      throw err;
    }
  }, []);

  const analyzeMeal = useCallback(async (imageUrl) => {
    try {
      const analysis = await mealAnalysisService.analyseWithClaude(imageUrl);
      return analysis;
    } catch (err) {
      setError(err.message || "Failed to analyze meal");
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    meals,
    isLoading,
    error,
    lastAddedMeal,
    loadMeals,
    logMeal,
    analyzeMeal,
    clearError,
  };
}

export default useMeals;
