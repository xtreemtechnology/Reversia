import { useState, useEffect } from "react";
import { db, auth } from "../../../config/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const useWeightLogs = (max = 50) => {
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
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((i) => i.type === "weight")
            .slice(0, max);
          setLogs(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
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
  }, [max]);

  return { logs, loading, error };
};
