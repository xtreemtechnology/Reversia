import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../config/firebase";

const USERS_COLLECTION = "users";

const normalizeArray = (value, fallback = []) =>
  Array.isArray(value)
    ? value.filter(Boolean)
    : typeof value === "string" && value.trim()
      ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : fallback;

const normalizeProfile = (snapshotData = {}) => ({
  ...snapshotData,
  firstName: snapshotData.firstName || "",
  lastName: snapshotData.lastName || "",
  phone: snapshotData.phone || null,
  email: snapshotData.email || null,
  location: snapshotData.location || "",
  diabetesType: snapshotData.diabetesType || null,
  typicalStaples: normalizeArray(snapshotData.typicalStaples),
  primaryHba1c: snapshotData.primaryHba1c || null,
  fastingBloodSugar: snapshotData.fastingBloodSugar || null,
  healthFears: normalizeArray(snapshotData.healthFears),
  successGoals: normalizeArray(snapshotData.successGoals),
  sweetDrinkFrequency: snapshotData.sweetDrinkFrequency || "rarely",
  dietaryRestrictions: normalizeArray(snapshotData.dietaryRestrictions),
  primaryGoal: snapshotData.primaryGoal || null,
  secondaryGoals: normalizeArray(snapshotData.secondaryGoals),
  typicalSleepHours: snapshotData.typicalSleepHours || "6-7",
  sleepQuality: snapshotData.sleepQuality || "fair",
  onMedication:
    typeof snapshotData.onMedication === "boolean"
      ? snapshotData.onMedication
      : null,
  activityLevel: snapshotData.activityLevel || "",
  weight: snapshotData.weight || "",
  targetGlucose: snapshotData.targetGlucose || "",
  emergencyContactName: snapshotData.emergencyContactName || "",
  emergencyContactPhone: snapshotData.emergencyContactPhone || "",
});

export async function getUserProfile(userId) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  const snapshot = await getDoc(doc(db, USERS_COLLECTION, userId));
  if (!snapshot.exists()) {
    return null;
  }

  return normalizeProfile(snapshot.data());
}

export async function updateUserProfile(userId, updates) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  const profileRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(
    profileRef,
    {
      ...updates,
      updatedAt: updates?.updatedAt || serverTimestamp(),
    },
    { merge: true }
  );

  const snapshot = await getDoc(profileRef);
  return snapshot.exists() ? normalizeProfile(snapshot.data()) : null;
}

export async function updateUserProfileField(userId, field, value) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  const profileRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(profileRef, {
    [field]: value,
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(profileRef);
  return snapshot.exists() ? normalizeProfile(snapshot.data()) : null;
}

export default {
  getUserProfile,
  updateUserProfile,
  updateUserProfileField,
};
