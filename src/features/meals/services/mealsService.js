// src/features/meals/services/mealsService.js
/**
 * Meals Service - Handles all Firestore operations for meal logging
 */

import { auth, db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { detectMeal } from "../utils/mealUtils";

/**
 * Log a manual meal entry
 */
export const logMealEntry = async (mealData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const logsRef = collection(db, "users", user.uid, "logs");

  return addDoc(logsRef, {
    type: "meal",
    value: mealData.value,
    period: mealData.period || "Regular",
    meal: mealData.meal || detectMeal(new Date()),
    timestamp: serverTimestamp(),
    createdAt: new Date().toISOString(),
  });
};

/**
 * Log an AI-analyzed meal
 */
export const logAIAnalyzedMeal = async (result, capturedUri = null) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  return addDoc(collection(db, "users", user.uid, "logs"), {
    userId: user.uid,
    type: "meal",
    value: result.foodName,
    foodName: result.foodName,
    servingSize: result.servingSize,
    calories: result.calories,
    protein: result.protein,
    carbs: result.carbs,
    fats: result.fats,
    fiber: result.fiber,
    sugar: result.sugar,
    glycemicIndex: result.glycemicIndex,
    insulinImpact: result.insulinImpact,
    healthScore: result.healthScore,
    diabetesSafe: result.diabetesSafe,
    imageUri: capturedUri || null,
    period: "AI Meal Scan",
    meal: detectMeal(new Date()),
    timestamp: serverTimestamp(),
  });
};
