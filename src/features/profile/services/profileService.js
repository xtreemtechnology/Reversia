import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";

/**
 * getUserProfile - Fetch user profile from Firestore
 */
export async function getUserProfile(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

/**
 * updateUserProfile - Update user profile in Firestore
 */
export async function updateUserProfile(userId, updates) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
    const updated = await getUserProfile(userId);
    return updated;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}
