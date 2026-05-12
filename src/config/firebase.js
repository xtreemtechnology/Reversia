import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Prefer Expo environment variables, but fall back to the known project config
// so local development and the current workspace keep working.
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyD4mbIOR6t6mUftEAWvkzrJ6S3p-Dau634",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "reversia-v1.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "reversia-v1",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "reversia-v1.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "28477379994",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:28477379994:web:4b7f86926706416e31d623",
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-2RNHYYKD22",
};

if (!process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
  console.warn(
    "Firebase environment variables are missing. Using the checked-in fallback config."
  );
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
