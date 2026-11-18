# Reversal Plan

A 12-week guided plan for people with high blood sugar, built around eating
mostly whole, natural foods. The app already logged glucose and meals — the
plan adds the missing guide: where to start, what to change each week, and
how to see progress.

## Structure

- `data/planData.js` — all static content, no imports. 12 weekly goals, 4
  phases (Reset weeks 1–3, Rebuild 4–6, Steady 7–9, Sustain 10–12),
  milestones at weeks 3, 6, 9 and 12, baseline option lists that reuse the
  exact values and labels from post-onboarding, and the safety strings.
- `services/reversalService.js` — pure helpers (`getCurrentWeek`,
  `getPhaseForWeek`, `calculateProgress`, `getNextMilestone`) plus Firestore
  access following the `profileService.js` pattern.
- `screens/ReversalPlanScreen.js` — plan home: baseline card, Week X of 12
  with progress bar, current phase, this week's 3 goals with toggles,
  milestones, check-in summary, safety disclaimer.
- `screens/ReversalSetupScreen.js` — first-run form: HbA1c range, fasting
  sugar range, primary goal. Requires at least one baseline before saving.
- `screens/WeeklyCheckInScreen.js` — week worked out from the plan start
  date; fasting sugar, optional HbA1c, natural meals 0–21, walks after meals
  0–21, energy 1–5, notes. Shows the change since the last check-in.
- `ReversalNavigator.jsx` — stack navigator (PlanHome, PlanSetup,
  WeeklyCheckIn), following the `LearnNavigator.jsx` pattern.
- `index.js` — re-exports screens, navigator, plan data and service helpers.
- Wired into the app as a fifth tab, **Plan**, between Home and Track
  (`src/navigation/MainTabNavigator.js`,
  `src/features/home/components/BottomNav.jsx` with Ionicons `map` /
  `map-outline`, which the existing BottomNav already renders for any
  non-Home/Learn/Profile route).

## Data model (Firestore)

All paths sit under the signed-in user, so the existing `firestore.rules`
already allow them — the rule `match /{document=**}` under
`users/{uid}` covers every subcollection. No rules change was needed.

- `users/{uid}/reversal/plan` — one document: `baselineHba1c`,
  `baselineFasting`, `primaryGoal`, `startDate` (ISO string), `status`
  (`"active"`), `completedGoals` (map of `"week-index"` to boolean),
  `createdAt`, `updatedAt`.
- `users/{uid}/reversalCheckins` — one document per check-in: `week`,
  `fastingSugar`, `hba1c`, `naturalMeals`, `walksAfterMeals`, `energy`,
  `notes`, `createdAt`.

Weekly goal toggles are also cached locally in AsyncStorage under
`@reversia_reversal_goals` so they survive an offline moment; Firestore
remains the source of truth when it syncs.

## Safety

This is general wellness guidance, NOT medical advice. The plan never
promises a cure or guaranteed remission. Every screen that talks about
reversal carries the disclaimer that Reversia supports, and does not
replace, medical care, and that the user should talk to their doctor before
changing medication or diet — especially on insulin or other
glucose-lowering medicine. HbA1c below 5.7% and fasting below 100 mg/dL are
presented only as goals to discuss with a clinician.

## How to test

- Unit tests: `npx jest src/__tests__/reversalPlan.test.js` — pure
  helpers and plan content only, no network.
- Syntax: `node --check src/features/reversal/data/planData.js` and
  `node --check src/features/reversal/services/reversalService.js`.
- In the app: sign in, open the Plan tab, set up a plan, tick a weekly
  goal, save a check-in in week 1, and confirm the plan, goals and
  check-in appear in Firestore under the paths above.

Note: a full Expo lint/build was not run here — `node_modules` is not
installed in this workspace and `npm ci` timed out in this environment
before (see `REDESIGN_NOTES.md`). Run `npm ci`, then `npm run lint` and
`npx expo start` locally before shipping.
