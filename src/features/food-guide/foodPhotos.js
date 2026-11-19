// src/features/food-guide/foodPhotos.js
//
// Local photos for the foods in the Natural Food Guide. Every entry is a
// bundled asset (require), so nothing is fetched at runtime. Only foods
// with a real photo of that dish are listed — garden egg has no photo and
// is deliberately left out rather than given a wrong image. Grilled fish,
// avocado and pawpaw have photos in assets/images/foods/ but are not in
// the Food Guide, so they have no rating and are not listed here. See
// assets/images/foods/README.md for sources and licences.

const FOOD_PHOTOS = {
  "beans-ewa": require("../../../assets/images/foods/food-beans.jpg"),
  "moi-moi": require("../../../assets/images/foods/food-moi-moi.jpg"),
  // One photo of green leafy vegetable soup stands for both soups — the
  // photo's own caption is "Edikang Ikong / Afang (leafy vegetable soup)".
  "afang-soup": require("../../../assets/images/foods/food-vegetable-soup.jpg"),
  "edikang-ikong": require("../../../assets/images/foods/food-vegetable-soup.jpg"),
  "okra-soup": require("../../../assets/images/foods/food-okra-soup.jpg"),
  "jollof-rice": require("../../../assets/images/foods/food-jollof-rice.jpg"),
  banana: require("../../../assets/images/foods/food-banana.jpg"),
};

// Foods shown in the Home screen's "From the Food Guide" photo strip, in
// display order. All of them are in the guide and have a photo.
export const FOOD_PHOTO_STRIP_IDS = [
  "beans-ewa",
  "moi-moi",
  "edikang-ikong",
  "okra-soup",
  "jollof-rice",
  "banana",
];

export function getFoodPhoto(foodId) {
  if (!foodId) return null;
  return FOOD_PHOTOS[foodId] || null;
}

export default FOOD_PHOTOS;
