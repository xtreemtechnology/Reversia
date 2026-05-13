import { auth, db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const addGlucoseEntry = async ({ mgdl, note } = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  return addDoc(collection(db, "users", user.uid, "logs"), {
    type: "glucose",
    mgdl: Number(mgdl),
    note: note || null,
    timestamp: serverTimestamp(),
    createdAt: new Date().toISOString(),
  });
};
