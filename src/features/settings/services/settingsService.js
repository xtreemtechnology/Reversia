import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";

/**
 * Get user settings from Firestore
 */
export async function getSettings(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const settingsRef = doc(db, "userSettings", userId);
    const snapshot = await getDoc(settingsRef);
    return (
      snapshot.data() || {
        pushEnabled: true,
        emailNotifications: true,
        theme: "light",
        language: "en",
      }
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  userId,
  { pushEnabled, emailNotifications }
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const settingsRef = doc(db, "userSettings", userId);
    await setDoc(
      settingsRef,
      {
        pushEnabled,
        emailNotifications,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Update profile settings
 */
export async function updateProfileSettings(userId, { displayName, bio }) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const settingsRef = doc(db, "userSettings", userId);
    await setDoc(
      settingsRef,
      {
        displayName,
        bio,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Update appearance settings
 */
export async function updateAppearanceSettings(userId, { theme, language }) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const settingsRef = doc(db, "userSettings", userId);
    // Use setDoc with merge so the document is created if it does not exist
    await setDoc(
      settingsRef,
      {
        theme,
        language,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    throw error;
  }
}
