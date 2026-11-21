# Deploying the Reversia Cloud Functions (fix brief 0.2)

The AI keys no longer live in the app. These functions are the only place
they exist (Secret Manager). Nothing here is automatic — each step needs a
human in the Firebase console or a terminal with Firebase access.

## 0. Before you start

- The Firebase project is **reversia-v1** (see `.firebaserc`).
- The app must be able to reach the functions: the user has to be **signed
  in** (the functions reject anonymous calls), and the app must send an
  **App Check token** (see step 4). Until step 4 is done, AI calls fail and
  the app falls back to its local/manual paths — the app still works, the AI
  features just stay local.

## 1. Upgrade the Firebase project to Blaze

2nd gen Cloud Functions need the pay-as-you-go (Blaze) plan. The free tier
still covers small use (2M function calls, 400k GB-seconds, and the Gemini /
OpenAI free tiers / usage are billed by Google / OpenAI separately).

Firebase console → reversia-v1 → **Upgrade** (bottom left) → Blaze → link a
card. This is the owner's decision and the owner's card — Muse cannot do it.

## 2. Set the provider secrets

```bash
cd functions
npm install
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set OPENAI_API_KEY
```

Paste the keys when prompted. **Use NEW keys if the old ones were ever in
a `.env` used for a build** — see step 6. Never put a key in a file.

## 3. Deploy

```bash
firebase deploy --only functions
```

Check the output lists all four: `transcribeAudio`, `analyzeMealImage`,
`generateHealthInsights`, `guideChat`. Region is `us-central1` (the
default); the app calls that region.

## 4. App Check (required — the functions enforce it)

The functions are deployed with `enforceAppCheck: true`, so they reject
calls without a valid App Check token.

1. Firebase console → Project Settings → **App Check** → register the
   Android app (Play Integrity) and the iOS app (App Attest).
2. Wire the App Check provider into the app (Play Integrity on Android,
   App Attest on iOS) and verify a call succeeds from a real build.
3. Only then, in the same App Check page, turn on **Enforce** for
   Cloud Functions — and, separately, for Firestore. **Do not enforce on
   Firestore until the app is verified working with App Check**, because
   every Firestore read/write (login, logs, profile) would be rejected
   without a token.

## 5. Restrict the Firebase web API key

The web API key is a public identifier, not a secret, but it must be
restricted so it cannot be used from anywhere else:

Google Cloud Console → reversia-v1 → APIs & Services → Credentials →
the **Web API Key** → Application restrictions → Android apps (add the
package name) and iOS apps (add the bundle ID). Save.

## 6. Rotate any key that was ever in a build `.env`

If the Gemini or OpenAI key was ever in a `.env` that went into an EAS
build (or was committed), treat it as exposed:

1. In Google AI Studio (Gemini) and platform.openai.com (OpenAI), create a
   **new** key.
2. Set the new key with `firebase functions:secrets:set` (step 2) and
   redeploy.
3. **Delete / revoke the old key** in AI Studio / OpenAI. Do not reuse it.

## 7. Give the app its Firebase config

`src/config/firebase.js` no longer has a checked-in fallback — it throws
in dev when the config is missing. Set the seven `EXPO_PUBLIC_FIREBASE_*`
variables in the Expo dashboard (Project → Secrets) or in `eas.json` env
before the next build, with the same values the old fallback had
(`.env.example` lists the names).

## 8. Verify end to end (brief 0.3)

From a real build, signed in, with App Check working:

- Record a voice log → a transcript appears (not the simulated one).
- Snap a meal photo → a real analysis appears.
- Open Learn → Insights → an AI insight appears (or a rule-based one if
  the function errors — check the console).
- Ask the Guide a question → an AI answer appears (source "openai").
- Firebase console → Firestore → `aiUsage/{uid}` shows today's counts;
  Functions → Logs shows the calls.

## What the limits are

Per user, per day, in `aiUsage/{uid}` (see `index.js` DAILY_LIMITS):
transcribe 20, photo analysis 20, insights 10, guide chat 50. Inputs are
capped at ~6 MB (audio/photo), 2000 characters (question), 20 KB (summary).
