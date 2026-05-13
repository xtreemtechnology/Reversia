import { auth, db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const addWeightEntry = async ({ weightKg, note } = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  return addDoc(collection(db, "users", user.uid, "logs"), {
    type: "weight",
    weight: Number(weightKg),
    note: note || null,
    timestamp: serverTimestamp(),
    createdAt: new Date().toISOString(),
  });
};
