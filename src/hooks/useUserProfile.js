import { useState, useEffect, useRef } from "react";
import { auth, db } from "../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const useUserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const unsubscribeRef = useRef(null);

  useEffect(() => {
    let timeoutId = null;

    const stopDocListener = () => {
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (e) {}
        unsubscribeRef.current = null;
      }
    };

    // Listen for auth state changes so we respond when auth initializes later
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      stopDocListener();
      setError(null);

      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      // safety timeout in case Firestore doesn't respond
      timeoutId = setTimeout(() => {
        setError(new Error("Profile data fetch timeout"));
        setLoading(false);
      }, 10000);

      unsubscribeRef.current = onSnapshot(
        doc(db, "users", user.uid),
        (snapshot) => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          if (snapshot.exists()) {
            setUserData(snapshot.data());
          } else {
            setUserData(null);
          }
          setError(null);
          setLoading(false);
        },
        (err) => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          console.error("useUserProfile error:", err);
          setError(err);
          setLoading(false);
        }
      );
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      stopDocListener();
      try {
        unsubAuth();
      } catch (e) {}
    };
  }, []);

  return { userData, loading, error };
};
