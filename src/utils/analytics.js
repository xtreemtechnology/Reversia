import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export async function trackEvent(name, params = {}) {
  const uid = auth.currentUser?.uid;
  if (!uid || !name) return;

  try {
    await addDoc(collection(db, "users", uid, "events"), {
      name,
      params,
      createdAt: serverTimestamp(),
      uid,
    });
  } catch (error) {
    console.warn("trackEvent failed", name, error);
  }
}
