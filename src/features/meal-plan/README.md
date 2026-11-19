# 7-Day Meal Plan

Step 3 of the Reversal Plan follow-ups, after the 12-week Reversal Plan
(PR #3, merged 2026-11-18) and the Natural Food Guide (PR #4, merged
2026-11-18). **Local only — not committed, not pushed.**

## What is here

- `data/mealPlanData.js` — a fixed 7-day plan. Each day has breakfast,
  lunch and dinner, plus a snack on Days 1, 3 and 5. Every meal has an
  id, day, slot, title, `foodIds` into the Food Guide, a short
  description, ingredients with rough quantities, 3-6 simple steps, a
  prep time in minutes, a carb note (`low` / `medium`) and a tip.
  No meal repeats on another day.
- `services/mealPlanService.js` — pure helpers: `getDayPlan`,
  `getMealById`, `getAllMeals`, `getMealsForSlot`,
  `getWeekShoppingList` (ingredients grouped with counts, most-used
  first). No navigation, no Firestore.
- `screens/MealPlanScreen.js` — one card per day with its meals
  (slot, title, prep time, carb note), tapping a meal opens its
  recipe, and the grouped weekly shopping list at the bottom.
- `screens/MealDetailScreen.js` — one meal: description, ingredients,
  numbered steps, tip, and its foods with their Food Guide ratings.
  Tapping a food opens it in the Food Guide (Foods tab); where a
  caution food has a swap, the swap is shown as a tappable link too.
  Unknown meal ids show a "Meal not found" state with a back button.
- `MealPlanNavigator.jsx` — stack navigator (MealPlanHome /
  MealDetail, headerShown false), following FoodGuideNavigator.
- `index.js` — re-exports the screens, navigator, data and service
  helpers.
- Wired into the Plan flow, not as a new bottom tab: a "7-day meal
  plan" card on `ReversalPlanScreen` (visible with or without a
  started plan) opens the meal plan, and `ReversalNavigator` registers
  the nested `MealPlanNavigator` as the `MealPlan` screen. The tab bar
  stays at 6 items.

## The week

- Day 1 — Start with beans & soup: Oats & Boiled Eggs; Beans Porridge
  & Chicken Stew; Pepper Soup; snack Banana & Water.
- Day 2 — Boiled, not fried: Moi Moi & Boiled Egg; Boiled Yam & Egusi
  Soup; Grilled Chicken & Tomato Stew.
- Day 3 — Small rice, more beans: Boiled Eggs & Tomato Stew; Ofada
  Rice & Beans; Bitter Leaf Soup & Wheat Wrap; snack Unsweetened Zobo.
- Day 4 — Soup & a small wrap: Boiled Plantain & Eggs; Yam Porridge &
  Chicken Stew; Edikang Ikong & Wheat Wrap.
- Day 5 — A little jollof, lots of beans: Boiled Eggs & Suya; Jollof
  Rice & Beans; Okra Soup & Wheat Wrap; snack Small Moi Moi.
- Day 6 — Small portions, big flavour: Small Akara & Boiled Egg;
  Basmati Rice & Chicken Stew; Afang Soup & Pounded Yam (small).
- Day 7 — Finish the week steady: Oatmeal & Banana; Fried Rice &
  Grilled Chicken; Oha Soup & Semovita (small).

## Deliberate limits

- Every meal is built only from the 44 foods in the Natural Food
  Guide. Safe foods are the base; caution foods appear only in a
  modest portion or paired with a safe food; no avoid food (malt,
  Chapman, Fanta, Coke) is used anywhere.
- Carb notes follow the foods used: "low" only when every food in the
  meal is low carb-load in the guide, "medium" when any food is
  medium or high load. They are a simple guide from the food data,
  **not** measured glycaemic index values, and the file header and
  disclaimer say so.
- The plan is a fixed starter week, not personalised to the user's
  staples or allergies, and it does not track which meals were eaten.
  The safety disclaimer from the Plan and the Food Guide is shown at
  the bottom of both screens.

## How to verify

- `node --check` on the plain-JS files (data, service, index).
- Jest: `npx jest src/__tests__/mealPlan.test.js` (plus the existing
  `foodGuide` and `reversalPlan` suites for regressions).
- ESLint: `npx eslint` on the new/changed files — report, do not
  auto-fix; formatting is a separate open decision.
- Full Expo lint/build was not run here.
