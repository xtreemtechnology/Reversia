import { auth, db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const addWaterEntry = async ({ ml, note } = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  return addDoc(collection(db, "users", user.uid, "logs"), {
    type: "water",
    ml: Number(ml),
    note: note || null,
    timestamp: serverTimestamp(),
    createdAt: new Date().toISOString(),
  });
};
