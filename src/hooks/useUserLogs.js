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
        setLogs([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const q = query(
        collection(db, "users", user.uid, "logs"),
        orderBy("timestamp", "desc"),
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
