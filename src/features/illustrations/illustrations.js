// src/features/illustrations/illustrations.js
//
// Original flat-vector illustrations for Reversia (bold solid shapes,
// smooth detailed curves, in the fresh theme's palette). Every entry is
// a bundled asset (require), so nothing is fetched at runtime. They are
// original in-house artwork made for the app — no licence issue. See
// assets/images/illustrations/README.md.
//
// All eight are landscape with the subject filling the frame edge to
// edge — display them with resizeMode="contain" in their wired spots.
// Backgrounds are matched to their containers: white for the white-card
// spots, sage for the sage-screen spots (see the README).

const ILLUSTRATIONS = {
  "welcome-hero": require("../../../assets/images/illustrations/welcome-hero.png"),
  "empty-meals": require("../../../assets/images/illustrations/empty-meals.png"),
  "empty-readings": require("../../../assets/images/illustrations/empty-readings.png"),
  "milestone-plant": require("../../../assets/images/illustrations/milestone-plant.png"),
  "guide-sprout": require("../../../assets/images/illustrations/guide-sprout.png"),
  "onboard-understand": require("../../../assets/images/illustrations/onboard-understand.png"),
  "onboard-local": require("../../../assets/images/illustrations/onboard-local.png"),
  "onboard-reverse": require("../../../assets/images/illustrations/onboard-reverse.png"),
};

export function getIllustration(key) {
  if (!key) return null;
  return ILLUSTRATIONS[key] || null;
}

export default ILLUSTRATIONS;
