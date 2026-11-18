// src/features/food-guide/services/foodGuideService.js
//
// DRAFT — pure helpers only, no navigation, no Firestore, no imports
// from the rest of the app, so they are safe to use in Jest tests.
// Works over src/features/food-guide/data/foodGuideData.js.

import { FOOD_GUIDE, FOOD_GUIDE_RATINGS } from "../data/foodGuideData";

export function getFoodById(id) {
  if (!id) return null;
  return FOOD_GUIDE.find((food) => food.id === id) || null;
}

export function getSwapFor(foodOrId) {
  const food = typeof foodOrId === "string" ? getFoodById(foodOrId) : foodOrId;
  if (!food || !food.swapTo) return null;
  return getFoodById(food.swapTo);
}

export function listByRating(rating) {
  if (!FOOD_GUIDE_RATINGS.includes(rating)) return [];
  return FOOD_GUIDE.filter((food) => food.rating === rating);
}

export function listByCategory(category) {
  if (!category) return [];
  const wanted = category.trim().toLowerCase();
  return FOOD_GUIDE.filter((food) => food.category.toLowerCase() === wanted);
}

// Case-insensitive search across name and aliases. An empty query returns
// the whole guide; an optional rating filters the results.
export function searchFoodGuide(query, rating) {
  const q = (query || "").trim().toLowerCase();
  let results = FOOD_GUIDE;
  if (rating) {
    results = results.filter((food) => food.rating === rating);
  }
  if (!q) return results;
  return results.filter((food) => {
    const haystack = [food.name, ...(food.aliases || [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function countByRating() {
  const counts = { safe: 0, caution: 0, avoid: 0 };
  FOOD_GUIDE.forEach((food) => {
    if (counts[food.rating] !== undefined) counts[food.rating] += 1;
  });
  return counts;
}
