/**
 * useUserProfile.js — redesigned hook
 *
 * Improvements over original:
 *  - Exponential-backoff retry on Firestore errors (up to 3 attempts)
 *  - In-memory profile cache so the last-known data is returned instantly on
 *    re-mount (no flash of empty state while Firestore reconnects)
 *  - `refetch()` method to manually trigger a fresh snapshot
 *  - `isStale` flag — true when cached data is being shown while a fresh
 *    fetch is in progress (lets the UI show a subtle refresh indicator)
 *  - Granular error codes so the UI can show actionable messages
 *  - All timeouts and listeners cleaned up safely on unmount
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { auth, db } from "../config/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// ─── Module-level cache (survives hook unmount / remount) ─────────────────────
const _cache = {
  uid: null,
  data: null,
  set(uid, data) {
    this.uid = uid;
    this.data = data;
  },
  get(uid) {
    return this.uid === uid ? this.data : null;
  },
  clear() {
    this.uid = null;
    this.data = null;
  },
};

// ─── Error codes ──────────────────────────────────────────────────────────────
export const PROFILE_ERROR = {
  TIMEOUT: "PROFILE_TIMEOUT",
  FIRESTORE: "PROFILE_FIRESTORE",
  UNAUTHENTICATED: "PROFILE_UNAUTHENTICATED",
  NOT_FOUND: "PROFILE_NOT_FOUND",
};

// ─── Config ───────────────────────────────────────────────────────────────────
const FETCH_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1_500; // ms — doubles each attempt

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useUserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState(null);

  // internal refs — survive re-renders without triggering them
  const unsubDocRef = useRef(null);
  const unsubAuthRef = useRef(null);
  const timeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef(null);
  const currentUidRef = useRef(null);
  const mountedRef = useRef(true);

  // ── Safe setState wrappers ─────────────────────────────────────────────────
  const safeSet = useCallback(
    (setter) =>
      (...args) => {
        if (mountedRef.current) setter(...args);
      },
    []
  );

  const setUserDataSafe = safeSet(setUserData);
  const setLoadingSafe = safeSet(setLoading);
  const setIsstaleSafe = safeSet(setIsStale);
  const setErrorSafe = safeSet(setError);

  // ── Cleanup helpers ────────────────────────────────────────────────────────
  const clearDocListener = useCallback(() => {
    if (unsubDocRef.current) {
      try {
        unsubDocRef.current();
      } catch (_) {}
      unsubDocRef.current = null;
    }
  }, []);

  const clearTimeout_ = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  // ── Attach Firestore snapshot listener for a given uid ────────────────────
  const attachListener = useCallback(
    (uid) => {
      clearDocListener();
      clearTimeout_();

      currentUidRef.current = uid;
      retryCountRef.current = 0;

      // Show cached data immediately (no loading flash on re-mount)
      const cached = _cache.get(uid);
      if (cached) {
        setUserDataSafe(cached);
        setIsstaleSafe(true); // signal that a fresh fetch is underway
        setLoadingSafe(false);
      } else {
        setLoadingSafe(true);
      }

      setErrorSafe(null);

      // Safety timeout
      timeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        clearDocListener();
        setErrorSafe({
          code: PROFILE_ERROR.TIMEOUT,
          message: "Profile data timed out. Check your connection.",
        });
        setLoadingSafe(false);
        setIsstaleSafe(false);
      }, FETCH_TIMEOUT_MS);

      unsubDocRef.current = onSnapshot(
        doc(db, "users", uid),

        // ── Success ──
        (snapshot) => {
          clearTimeout_();
          retryCountRef.current = 0;
          setIsstaleSafe(false);

          if (snapshot.exists()) {
            const data = snapshot.data();
            _cache.set(uid, data);
            setUserDataSafe(data);
            setErrorSafe(null);
          } else {
            _cache.clear();
            setUserDataSafe(null);
            setErrorSafe({
              code: PROFILE_ERROR.NOT_FOUND,
              message: "Profile document not found. Complete your onboarding.",
            });
          }
          setLoadingSafe(false);
        },

        // ── Error — retry with backoff ──
        (err) => {
          clearTimeout_();

          console.error("[useUserProfile] Firestore error:", err);

          const attempt = retryCountRef.current;
          if (attempt < MAX_RETRIES) {
            const delay = RETRY_BASE_DELAY * 2 ** attempt;
            retryCountRef.current += 1;
            // eslint-disable-next-line no-console
            console.info(
              `[useUserProfile] Retrying in ${delay}ms (attempt ${
                attempt + 1
              }/${MAX_RETRIES})`
            );

            retryTimerRef.current = setTimeout(() => {
              if (mountedRef.current && currentUidRef.current === uid) {
                attachListener(uid); // re-attach
              }
            }, delay);
          } else {
            // All retries exhausted — surface the error
            setErrorSafe({
              code: PROFILE_ERROR.FIRESTORE,
              message:
                "Could not load your profile. Pull to refresh or check your connection.",
              raw: err,
            });
            setLoadingSafe(false);
            setIsstaleSafe(false);
          }
        }
      );
    },
    [
      clearDocListener,
      clearTimeout_,
      setUserDataSafe,
      setIsstaleSafe,
      setLoadingSafe,
      setErrorSafe,
    ]
  );

  // ── Auth state listener ────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    unsubAuthRef.current = onAuthStateChanged(auth, (user) => {
      if (!user) {
        clearDocListener();
        clearTimeout_();
        clearRetryTimer();
        currentUidRef.current = null;
        _cache.clear();
        setUserDataSafe(null);
        setErrorSafe({
          code: PROFILE_ERROR.UNAUTHENTICATED,
          message: "Not signed in.",
        });
        setLoadingSafe(false);
        setIsstaleSafe(false);
        return;
      }

      // Only re-attach if the uid actually changed (avoids double-listen on
      // token refreshes that fire a new auth event for the same user)
      if (user.uid !== currentUidRef.current) {
        attachListener(user.uid);
      }
    });

    return () => {
      mountedRef.current = false;
      clearDocListener();
      clearTimeout_();
      clearRetryTimer();
      try {
        unsubAuthRef.current?.();
      } catch (_) {}
    };
  }, [
    attachListener,
    clearDocListener,
    clearTimeout_,
    clearRetryTimer,
    setUserDataSafe,
    setErrorSafe,
    setLoadingSafe,
    setIsstaleSafe,
  ]);

  // ── Manual refetch ─────────────────────────────────────────────────────────
  const refetch = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoadingSafe(true);
    setErrorSafe(null);

    try {
      // One-shot getDoc so the caller gets fresh data immediately
      const snapshot = await getDoc(doc(db, "users", user.uid));
      if (!mountedRef.current) return;

      if (snapshot.exists()) {
        const data = snapshot.data();
        _cache.set(user.uid, data);
        setUserDataSafe(data);
        setErrorSafe(null);
      } else {
        _cache.clear();
        setUserDataSafe(null);
        setErrorSafe({
          code: PROFILE_ERROR.NOT_FOUND,
          message: "Profile not found.",
        });
      }
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("[useUserProfile] refetch error:", err);
      setErrorSafe({
        code: PROFILE_ERROR.FIRESTORE,
        message: "Refresh failed. Try again.",
        raw: err,
      });
    } finally {
      if (mountedRef.current) setLoadingSafe(false);
    }

    // Re-attach the real-time listener so subsequent changes still stream in
    attachListener(user.uid);
  }, [attachListener, setUserDataSafe, setErrorSafe, setLoadingSafe]);

  // ── Derived helpers consumed by screens ───────────────────────────────────
  const isAuthenticated = !!auth.currentUser;
  const hasProfile = !!userData;
  const displayName = userData
    ? `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() || "User"
    : "";

  return {
    // Core data
    userData,
    loading,
    error,

    // Extra signals
    isStale, // true = showing cached data, fresh fetch in progress
    isAuthenticated,
    hasProfile,
    displayName, // convenience: "Daniel N" or "User"

    // Actions
    refetch,
  };
};
