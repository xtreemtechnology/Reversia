# Lottie celebration animations

Three small, free Lottie animations from LottieFiles, used for one-off
celebration moments in the app (a meal logged, a weekly check-in saved, a
plan milestone reached). All three are free to use under the
[Lottie Simple License](https://lottiefiles.com/page/license).

The JSON files were extracted unchanged from each animation's published
dotLottie bundle on LottieFiles (a dotLottie file is a zip containing the
same animation JSON). No animation was hand-written or modified.

## Files

- **success-check.json** (~6 KB, 688x688, 30fps)
  "Checkmark Approve" by Oyinloluwa.
  Source: https://lottiefiles.com/free-animation/checkmark-approve-kaKIjy2M7u
  Bundle: https://assets-v2.lottiefiles.com/a/70f36d3a-a2fb-11ef-a7a8-c71b25a79d94/95RztsuW1o.lottie
  The checkmark draws in during the first ~0.7s and then holds a static
  frame, so `LottieMoment` plays only the first 40 frames for this one.

- **confetti.json** (~18 KB, 512x512, 24fps, ~3s)
  "Confetti" by Ziaulika Zaen.
  Source: https://lottiefiles.com/free-animation/confetti-IXOdIm0ywO
  Bundle: https://assets-v2.lottiefiles.com/a/1f261fb4-1177-11ee-922a-fbb4d399049c/m1zxQ99n2X.lottie

- **goal-achieved.json** (~68 KB, 720x600, 60fps, ~2.5s)
  "Trophy Winner" (trophy with confetti and stars) by Ronit Paul.
  Source: https://lottiefiles.com/free-animation/trophy-winner-sqy7EcFolv
  Bundle: https://assets-v2.lottiefiles.com/a/749c30c2-116e-11ee-bbfa-37e6863f8252/ioIGPJ8dvM.lottie

## Where they play

- `success-check` — meal logged (MealEntryScreen, LogMealScreen)
- `confetti` — weekly check-in saved (WeeklyCheckInScreen)
- `goal-achieved` — plan milestone reached (ReversalPlanScreen)

See `src/components/LottieMoment.jsx` and
`workspace/reversia-lottie/LOTTIE.md`.
