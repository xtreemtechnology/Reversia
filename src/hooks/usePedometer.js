import { useState, useEffect, useRef } from "react";
import { Pedometer } from "expo-sensors";
import { auth, db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/* eslint-disable react-hooks/exhaustive-deps */

// Simple pedometer hook (MVP)
// - reads today's steps using Pedometer.getStepCountAsync
// - subscribes to live updates via Pedometer.watchStepCount
// - derives distance (km) and calories (approx)

export default function usePedometer({
  autoPersist = false,
  persistThreshold = 2000,
} = {}) {
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState(null);
  const [baseSteps, setBaseSteps] = useState(0); // steps at subscription time (today)
  const [liveSteps, setLiveSteps] = useState(0); // incremental steps from watch
  const [lastPersistSteps, setLastPersistSteps] = useState(0);

  const subRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    Pedometer.isAvailableAsync()
      .then((avail) => {
        if (mounted) {
          setAvailable(!!avail);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
        }
      });

    // get accumulated steps today
    Pedometer.getStepCountAsync({ start: startOfDay, end: new Date() })
      .then((res) => {
        if (mounted) {
          setBaseSteps(res.steps || 0);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
        }
      });

    // subscribe
    try {
      subRef.current = Pedometer.watchStepCount((result) => {
        if (!mounted) {
          return;
        }
        setLiveSteps(result.steps || 0);
      });
    } catch (err) {
      if (mounted) {
        setError(err);
      }
    }

    return () => {
      mounted = false;
      if (subRef.current && subRef.current.remove) {
        subRef.current.remove();
      }
      if (subRef.current && typeof subRef.current === "function") {
        subRef.current();
      }
    };
  }, []);

  const steps = Math.max(0, (baseSteps || 0) + (liveSteps || 0));

  // Estimate stride: prefer user height if available via profile lookup (caller can pass it).
  // We'll expose a compute helper that callers can use with their user data.
  const computeWithProfile = ({
    weightKg = 70,
    heightCm = 170,
    strideOverrideM = null,
  } = {}) => {
    const stride_m =
      strideOverrideM != null
        ? strideOverrideM
        : heightCm
        ? (heightCm * 0.415) / 100
        : 0.78;
    const distance_km = (steps * stride_m) / 1000;
    // Simple kcal estimate: kcal = weight_kg * distance_km * 0.9
    const calories = Number((weightKg * distance_km * 0.9).toFixed(1));
    return { steps, distance_km, calories, stride_m };
  };

  const persistSnapshot = async ({
    weightKg = 70,
    heightCm = 170,
    note = "",
    source = "pedometer",
  } = {}) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Not authenticated");
      }
      const {
        steps: s,
        distance_km,
        calories,
      } = computeWithProfile({ weightKg, heightCm });

      // avoid frequent writes
      if (Math.abs(s - lastPersistSteps) < 1) {
        return null;
      }

      const docRef = await addDoc(collection(db, "users", user.uid, "steps"), {
        steps: s,
        distance_km,
        calories,
        source,
        note,
        timestamp: serverTimestamp(),
      });
      setLastPersistSteps(s);
      return docRef.id;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // optional autosave logic
  useEffect(() => {
    if (!autoPersist) {
      return;
    }
    if (steps - lastPersistSteps >= persistThreshold) {
      // best-effort: try to persist using current auth profile if present
      persistSnapshot().catch(() => {});
    }
  }, [steps, autoPersist, lastPersistSteps]);

  return {
    available,
    error,
    steps,
    computeWithProfile,
    persistSnapshot,
  };
}
