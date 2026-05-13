import { auth, db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Log an activity/exercise entry for the current user
 * @param {{ activity?: string, value?: number, duration?: number, note?: string }} data
 */
export const logActivity = async (data = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  return addDoc(collection(db, "users", user.uid, "logs"), {
    type: "exercise",
    activity: data.activity || data.type || "Exercise",
    value: Number(data.value) || Number(data.duration) || 0,
    note: data.note || null,
    period: data.period || null,
    timestamp: serverTimestamp(),
    createdAt: new Date().toISOString(),
  });
};
