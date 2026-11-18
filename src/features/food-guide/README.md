# Natural Food Guide

Step 2 of the Reversal Plan follow-ups, after the 12-week Reversal Plan
(PR #3, merged 2026-11-18). Daniel approved the guide data as-is on
2026-11-18, and the guide screen is built and wired in. **Local only —
not committed, not pushed.**

## What is here

- `data/foodGuideData.js` — 44 foods: all 43 foods from the app's own
  `NIGERIAN_FOODS` list in
  `src/features/track/screens/LogMealScreen.js`, with their exact
  calories/protein/carbs/fat copied over, plus Water (0 kcal, 0g carbs)
  from the same screen's drink helper. Each food has a rating
  (`safe` / `caution` / `avoid`), a rough carb-load band (`low` /
  `medium` / `high`), a category, search aliases, a `swapTo` link to a
  better everyday alternative already in the guide (or `null` when the
  honest advice is portion/pairing, not a different food), and a short tip.
- `services/foodGuideService.js` — pure helpers: `searchFoodGuide`,
  `getFoodById`, `getSwapFor`, `listByRating`, `listByCategory`,
  `countByRating`. No navigation, no Firestore.
- `src/__tests__/foodGuide.test.js` — checks every entry has a valid
  rating/category/load, every `swapTo` points at a real food, search finds
  foods by name and alias, and the counts add up.
- `screens/FoodGuideScreen.js` — guide home: search (by name and alias),
  rating filter chips All / Safe / Caution / Avoid with counts, and food
  cards in the LogMealScreen card style (name, rating badge, carb-load
  band, category, carbs/protein per serving). Tapping a food opens its
  detail. The full safety disclaimer is at the bottom.
- `screens/FoodDetailScreen.js` — one food: rating badge and what it
  means, carb-load band, nutrition per serving from the app's own food
  list, the tip, and the swap suggestion (tappable to open the swap
  food's detail; when `swapTo` is null it shows portion/pairing advice
  instead). Back button via `navigation.goBack()`, disclaimer at the
  bottom.
- `FoodGuideNavigator.jsx` — stack navigator (GuideHome / FoodDetail,
  headerShown false), following ReversalNavigator.
- `index.js` — re-exports the screens, navigator, data and service
  helpers.
- Wired like the Plan tab: a **Foods** tab in `MainTabNavigator.js`
  (between Plan and Track, `FoodsWrapper` with `FocusAnimatedScreen`)
  and a Foods item in `BottomNav.jsx` (Ionicons restaurant /
  restaurant-outline, between Plan and Track). That makes 6 bottom-nav
  items; each tab is `flex: 1` in a `space-around` row with 10px labels,
  so they fit on a normal phone width but sit a little tighter than
  with 5 items — not visually verified on a device yet.

## Counts

- Safe: 20 (soups, beans, moi moi, eggs, grilled chicken, suya, oats, water)
- Caution: 20 (rice, swallows, boiled yam/plantain, fried plantain, akara,
  zobo, kunu, palm wine, banana)
- Avoid: 4 (malt, chapman, Fanta, Coke — the sugary drinks week 1 cuts)

## Deliberate limits

- No new nutrition numbers were invented. Ratings and load bands are a
  simple guide from the app's own carbs/protein figures and preparation
  (boiled/grilled vs fried, sugary drink vs water), following the swaps
  already in `src/features/reversal/data/planData.js`. They are **not**
  measured glycaemic index values, and the file header and disclaimer
  say so.
- The logged Zobo has 10g carbs a glass, so it is rated "caution" with a
  tip that the plan means *unsweetened* zobo — the guide does not pretend
  the logged version is sugar-free.
- No screen yet. The next step, once Daniel approves, is a guide screen
  (search + rating filter + food detail with its swap) wired like the
  Plan tab, reusing the LogMealScreen card style. — DONE 2026-11-18:
  the screen, detail, navigator and Foods tab are built (see above);
  only the branch + PR remain, needing Daniel's approval.

## How to verify

- `node --check` on the plain-JS files (data, service, index).
- Jest: `npx jest src/__tests__/foodGuide.test.js` and
  `npx jest src/__tests__/reversalPlan.test.js` (8 + 21 tests).
- ESLint: `npx eslint` on the new/changed files — report, do not
  auto-fix; formatting is a separate open decision.
- Full Expo lint/build was not run here.
