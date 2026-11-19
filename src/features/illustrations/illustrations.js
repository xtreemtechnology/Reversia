// src/features/illustrations/illustrations.js
//
// Original line-art illustrations for Reversia (thin dark-green linework
// with soft sage-green watercolour washes, in the fresh theme's palette).
// Every entry is a bundled asset (require), so nothing is fetched at
// runtime. They are original in-house artwork made for the app — no
// licence issue. See assets/images/illustrations/README.md.
//
// All five are tall portraits (1:2) with the subject in the lower half
// and generous empty wash at the top by design — display them with
// resizeMode="contain" and give them room to breathe.

const ILLUSTRATIONS = {
  "welcome-hero": require("../../../assets/images/illustrations/welcome-hero.png"),
  "empty-meals": require("../../../assets/images/illustrations/empty-meals.png"),
  "empty-readings": require("../../../assets/images/illustrations/empty-readings.png"),
  "milestone-plant": require("../../../assets/images/illustrations/milestone-plant.png"),
  "guide-sprout": require("../../../assets/images/illustrations/guide-sprout.png"),
};

export function getIllustration(key) {
  if (!key) return null;
  return ILLUSTRATIONS[key] || null;
}

export default ILLUSTRATIONS;
