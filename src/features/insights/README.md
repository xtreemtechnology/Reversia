# Food-to-Sugar Insights

After a user logs a meal and then logs a glucose reading, show how that
meal lined up with the reading: which foods and meals were followed by
steady readings and which came with a sharper rise. It is an observation
tool built on the logs that already exist, not a diagnosis.

## Where it lives

- `services/foodSugarService.js` — pure helpers, no Firestore, no network.
- `screens/FoodSugarInsightsScreen.js` — summary: paired counts, per-food
  and per-meal patterns, recent pairs.
- `screens/FoodSugarDetailScreen.js` — one food or one meal: every paired
  reading for it, newest first, with the Food Guide rating, tip and swap
  for a food.
- Wired into the Learn tab: two routes in `src/features/learn/
  LearnNavigator.jsx` (`FoodSugarInsights`, `FoodSugarDetail`) and one
  card in the Recommended Reads on `LearnScreen`. No new bottom tab.

## Data sources (read-only)

Meals and glucose readings both live in `users/{uid}/logs`, read through
the app's existing `useUserLogs` hook. Nothing here writes logs or changes
how meals or glucose are logged.

- Meal: `{ category: "meal", name: "Jollof Rice, Chicken Stew",
  mealType: "Lunch", calories, protein, carbs, fat,
  createdAt: serverTimestamp, date: "YYYY-MM-DD" }`. The per-food `foods`
  array on the raw document is dropped by the hook's normaliser, so foods
  are matched from the comma-joined `name` against the Food Guide names
  and aliases (exact match only, never substrings, so "Chicken" never
  claims "Chicken Stew"). There is no health score, GI or diabetesSafe
  field stored on meal logs anywhere in the app.
- Glucose: `{ category: "glucose", value, unit: "mg/dL" | "mmol/L",
  context, readingTime: ISO string, createdAt: serverTimestamp }`.
  Values are normalised to mg/dL before any comparison (mmol/L × 18.0182).
  No meal link is stored on a reading today.

## Pairing rule

A glucose reading counts as "after a meal" only when it was logged within
2 hours after that meal. It pairs with the most recent meal in that
window; a reading with no meal in the window is unpaired, never
force-matched. A meal can pair with more than one reading (for example a
1-hour and a 2-hour reading are two separate pairs).

## Rise and classes

Rise = after-meal reading minus the baseline. The baseline is the most
recent reading logged before the meal; where no earlier reading exists,
it falls back to the median of the user's fasting readings in the loaded
logs (their typical fasting level). Where neither exists, the pair has no
baseline and its rise is not classified — the screen says so instead of
guessing.

Classes (a simple guide, NOT a medical standard):

- steady — rise of 30 mg/dL or less (including a fall)
- moderate — rise of 31–70 mg/dL
- sharp — rise over 70 mg/dL

A food or meal only gets a verdict (usually steady / often a moderate
rise / often a sharp rise) once it has at least 2 paired readings with a
baseline. With fewer, the screen says "not enough readings yet" instead
of a verdict. Ties in the most common class go to the more cautious one.

## Safety

Every screen states plainly that these are observations from the user's
own logged data, that the classes are a simple guide and not a medical
standard, and that they should talk to a doctor about patterns that
worry them or before changing food or medication. The feature never
promises reversal, remission, or that a food is safe for any individual.
Empty states say there are no readings or meals yet — no values are ever
invented.
