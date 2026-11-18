// src/features/reversal/services/reversalService.js
//
// Firestore access for the 12-week Reversal Plan, following the
// profileService.js pattern. Pure date/phase helpers are exported too and
// do not touch Firebase, so they can be tested without a network.
//
// Data model (all under the signed-in user):
//   users/{uid}/reversal/plan        — one document, the active plan
//   users/{uid}/reversalCheckins     — one document per weekly check-in

import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { PHASES, PLAN_LENGTH_WEEKS, MILESTONES } from "../data/planData";

const USERS_COLLECTION = "users";

// ── Pure helpers (no Firebase) ───────────────────────────────────────────────

/**
 * Which week of the plan a date falls in, 1-12.
 * Returns 0 when there is no start date, or when `now` is before the start.
 */
export function getCurrentWeek(startDate, now = new Date()) {
  if (!startDate) {
    return 0;
  }
  const start = new Date(startDate);
  const current = new Date(now);
  if (Number.isNaN(start.getTime()) || Number.isNaN(current.getTime())) {
    return 0;
  }
  if (current < start) {
    return 0;
  }
  const diffDays = Math.floor((current - start) / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(Math.max(week, 1), PLAN_LENGTH_WEEKS);
}

/** Phase for a plan week (1-12). Returns null outside that range. */
export function getPhaseForWeek(week) {
  if (typeof week !== "number" || week < 1 || week > PLAN_LENGTH_WEEKS) {
    return null;
  }
  return PHASES.find((phase) => phase.weeks.includes(week)) || null;
}

/** Progress summary for a plan started on `startDate`. */
export function calculateProgress(startDate, now = new Date()) {
  const week = getCurrentWeek(startDate, now);
  return {
    week,
    totalWeeks: PLAN_LENGTH_WEEKS,
    percent:
      week === 0 ? 0 : Math.min(100, Math.round((week / PLAN_LENGTH_WEEKS) * 100)),
    phase: getPhaseForWeek(week),
  };
}

/** The next milestone after the given week, or null when the plan is done. */
export function getNextMilestone(week) {
  if (typeof week !== "number" || week < 0) {
    return null;
  }
  return MILESTONES.find((milestone) => milestone.week > week) || null;
}

// ── Firestore helpers ────────────────────────────────────────────────────────

function normalizePlan(snapshotData = {}) {
  const startDate = snapshotData.startDate;
  return {
    ...snapshotData,
    baselineHba1c: snapshotData.baselineHba1c || null,
    baselineFasting: snapshotData.baselineFasting || null,
    primaryGoal: snapshotData.primaryGoal || null,
    status: snapshotData.status || "active",
    completedGoals:
      snapshotData.completedGoals && typeof snapshotData.completedGoals === "object"
        ? snapshotData.completedGoals
        : {},
    // Firestore Timestamps become ISO strings; plain strings pass through.
    startDate:
      startDate && typeof startDate.toDate === "function"
        ? startDate.toDate().toISOString()
        : startDate || null,
  };
}

function normalizeCheckIn(id, snapshotData = {}) {
  const createdAt = snapshotData.createdAt;
  return {
    id,
    ...snapshotData,
    createdAt:
      createdAt && typeof createdAt.toDate === "function"
        ? createdAt.toDate().toISOString()
        : createdAt || null,
  };
}

export async function getReversalPlan(userId) {
  if (!userId) {
    throw new Error("Missing userId");
  }
  const snapshot = await getDoc(
    doc(db, USERS_COLLECTION, userId, "reversal", "plan")
  );
  if (!snapshot.exists()) {
    return null;
  }
  return normalizePlan(snapshot.data());
}

export async function startReversalPlan(
  userId,
  { baselineHba1c, baselineFasting, primaryGoal, startDate } = {}
) {
  if (!userId) {
    throw new Error("Missing userId");
  }
  const planRef = doc(db, USERS_COLLECTION, userId, "reversal", "plan");
  await setDoc(
    planRef,
    {
      baselineHba1c: baselineHba1c || null,
      baselineFasting: baselineFasting || null,
      primaryGoal: primaryGoal || null,
      startDate: startDate || new Date().toISOString(),
      status: "active",
      completedGoals: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return getReversalPlan(userId);
}

export async function saveWeeklyCheckIn(userId, checkIn = {}) {
  if (!userId) {
    throw new Error("Missing userId");
  }
  const ref = await addDoc(
    collection(db, USERS_COLLECTION, userId, "reversalCheckins"),
    {
      ...checkIn,
      createdAt: serverTimestamp(),
    }
  );
  return ref.id;
}

export async function listWeeklyCheckIns(userId) {
  if (!userId) {
    throw new Error("Missing userId");
  }
  const snapshot = await getDocs(
    query(
      collection(db, USERS_COLLECTION, userId, "reversalCheckins"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  );
  return snapshot.docs.map((docSnapshot) =>
    normalizeCheckIn(docSnapshot.id, docSnapshot.data())
  );
}

export async function updatePlanGoals(userId, completedGoals) {
  if (!userId) {
    throw new Error("Missing userId");
  }
  const planRef = doc(db, USERS_COLLECTION, userId, "reversal", "plan");
  await setDoc(
    planRef,
    {
      completedGoals: completedGoals || {},
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return getReversalPlan(userId);
}

export default {
  getCurrentWeek,
  getPhaseForWeek,
  calculateProgress,
  getNextMilestone,
  getReversalPlan,
  startReversalPlan,
  saveWeeklyCheckIn,
  listWeeklyCheckIns,
  updatePlanGoals,
};
