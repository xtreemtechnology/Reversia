import { useState, useEffect } from "react";
import { db, auth } from "../../../config/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const useActivityLogs = (maxLimit = 50, refreshTrigger = 0) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (unsubscribe) {
          unsubscribe();
        }
        setLogs([]);
        setLoading(false);
        setError(null);
        return;
      }

      const q = query(
        collection(db, "users", user.uid, "logs"),
        orderBy("timestamp", "desc")
      );

      if (unsubscribe) {
        unsubscribe();
      }
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetched = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((entry) => entry.type === "exercise")
            .slice(0, maxLimit);

          setLogs(fetched);
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error("useActivityLogs error", err);
          setError(err);
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      authUnsub();
    };
  }, [maxLimit, refreshTrigger]);

  return { logs, loading, error };
};
