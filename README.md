# Reversia

A diabetes companion app (Expo React Native, Firebase) that helps reverse
high blood sugar by eating mostly natural foods.

## Setup

```bash
npm install
cp .env.example .env   # fill in your Firebase config
npx expo start
```

## AI features

Voice transcription, meal-photo analysis, health insights, and the Guide
run through Firebase Cloud Functions (`functions/`). The provider keys
(Gemini, OpenAI) live only in Secret Manager for those functions.

**No provider key may ever use the `EXPO_PUBLIC_` prefix** — anything with
that prefix is embedded in the app bundle, where anyone can read it. See
`functions/DEPLOY.md` for the deploy, App Check, and key-rotation steps.

## Tests

```bash
npm test
npx eslint .
```
