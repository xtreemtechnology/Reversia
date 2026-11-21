import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config comes ONLY from environment variables (fix brief 0.2).
// The old checked-in fallback config was removed on purpose: a web API key
// that ships in the repo is a key anyone can reuse, and the fallback hid a
// missing .env. Set the seven EXPO_PUBLIC_FIREBASE_* variables in your
// local .env (see .env.example) or in the Expo dashboard (Project →
// Secrets) before the next build.
const REQUIRED_VARS = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
  "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID",
];

const missing = REQUIRED_VARS.filter((name) => !process.env[name]);

// Fail loudly in dev (and in production builds) when the config is
// missing. Jest (NODE_ENV=test) is exempt: the pure-module tests import
// this file only transitively and never use a Firebase service.
if (missing.length > 0 && process.env.NODE_ENV !== "test") {
  throw new Error(
    `Missing Firebase config: ${missing.join(", ")}. ` +
      "Add them to your .env (see .env.example) or to the Expo dashboard secrets."
  );
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// getAuth/getFirestore/getStorage throw when the apiKey is missing, so in
// the Jest environment (no .env) the services stay null. The app never
// reaches this line without a config — the throw above fires first — and
// no test uses a Firebase service, so null is safe there.
const hasConfig = missing.length === 0;
const auth = hasConfig ? getAuth(app) : null;
const db = hasConfig ? getFirestore(app) : null;
const storage = hasConfig ? getStorage(app) : null;

export { app, auth, db, storage };
