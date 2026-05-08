// src/features/onboarding/services/onboardingService.js
/**
 * Onboarding Service - Handles all Firestore operations for user setup
 */

import { auth, db } from '../../../config/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Save user's name to Firestore
 */
export const saveName = async (name) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  return setDoc(doc(db, "users", user.uid), {
    displayName: name.trim(),
    onboardingStep: 1,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

/**
 * Save user's gender
 */
export const saveGender = async (gender) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, "users", user.uid);
  return updateDoc(userRef, {
    gender: gender,
    onboardingStep: 2,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Save user's age
 */
export const saveAge = async (age) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, "users", user.uid);
  return updateDoc(userRef, {
    age: age,
    onboardingStep: 3,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Save user's weight
 */
export const saveWeight = async (weight, unit = 'kg') => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, "users", user.uid);
  return updateDoc(userRef, {
    weight: weight,
    weightUnit: unit,
    onboardingStep: 4,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Save user's height
 */
export const saveHeight = async (height, unit = 'cm') => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, "users", user.uid);
  return updateDoc(userRef, {
    height: height,
    heightUnit: unit,
    onboardingStep: 5,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Save user's health goal
 */
export const saveHealthGoal = async (goal) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, "users", user.uid);
  return updateDoc(userRef, {
    healthGoal: goal,
    onboardingStep: 6,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Save user's health status
 */
export const saveHealthStatus = async (status) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, "users", user.uid);
  return updateDoc(userRef, {
    healthStatus: status,
    onboardingStep: 7,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Save user's readiness
 */
export const saveReadiness = async (readiness) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, "users", user.uid);
  return updateDoc(userRef, {
    readiness: readiness,
    onboardingStep: 8,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Save user's readiness level (alias for saveReadiness)
 */
export const saveReadinessLevel = async (readinessLevel) => {
  return saveReadiness(readinessLevel);
};

/**
 * Mark onboarding as complete
 */
export const completeOnboarding = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, "users", user.uid);
  return updateDoc(userRef, {
    onboardingComplete: true,
    onboardingCompletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};
