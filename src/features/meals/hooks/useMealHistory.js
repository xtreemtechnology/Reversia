// src/features/meals/hooks/useMealHistory.js
/**
 * Custom hook for managing meal history state
 */

import { useState, useCallback } from "react";

export const useMealHistory = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addMeal = useCallback((meal) => {
    setMeals((prev) => [meal, ...prev]);
  }, []);

  const removeMeal = useCallback((mealId) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  }, []);

  const updateMeal = useCallback((mealId, updates) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, ...updates } : m))
    );
  }, []);

  const clearHistory = useCallback(() => {
    setMeals([]);
  }, []);

  return {
    meals,
    loading,
    error,
    addMeal,
    removeMeal,
    updateMeal,
    clearHistory,
    setLoading,
    setError,
  };
};
