import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD4mbIOR6t6mUftEAWvkzrJ6S3p-Dau634",
  authDomain: "reversia-v1.firebaseapp.com",
  projectId: "reversia-v1",
  storageBucket: "reversia-v1.firebasestorage.app",
  messagingSenderId: "28477379994",
  appId: "1:28477379994:web:4b7f86926706416e31d623",
  measurementId: "G-2RNHYYKD22"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };