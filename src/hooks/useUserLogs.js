import { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const _cache = {
  uid: null,
  logs: null,
  set(uid, logs) {
    this.uid = uid;
    this.logs = logs;
  },
  get(uid) {
    return this.uid === uid ? this.logs : null;
  },
  clear() {
    this.uid = null;
    this.logs = null;
  },
};

export const useUserLogs = (maxLimit = 50, refreshTrigger = 0) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribeFromLogs = null;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (unsubscribeFromLogs) {
          unsubscribeFromLogs();
          unsubscribeFromLogs = null;
        }
        _cache.clear();
        setLogs([]);
        setError(null);
        setLoading(false);
        return;
      }

      const cachedLogs = _cache.get(user.uid);
      if (cachedLogs) {
        setLogs(cachedLogs);
        setError(null);
        setLoading(false);
      } else {
        setLoading(true);
      }

      const q = query(
        collection(db, "users", user.uid, "logs"),
        orderBy("createdAt", "desc"),
        limit(maxLimit)
      );

      if (unsubscribeFromLogs) {
        unsubscribeFromLogs();
      }
      unsubscribeFromLogs = onSnapshot(
        q,
        (snapshot) => {
          const fetchedLogs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          _cache.set(user.uid, fetchedLogs);
          setLogs(fetchedLogs);
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error("useUserLogs snapshot error", err);
          setError(err);
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubscribeFromLogs) {
        unsubscribeFromLogs();
      }
      authUnsub();
    };
  }, [maxLimit, refreshTrigger]);

  return { logs, loading, error };
};
