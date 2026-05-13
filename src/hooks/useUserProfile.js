import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const useUserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Set a timeout to prevent infinite waiting
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError(new Error('Profile data fetch timeout'));
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    // onSnapshot creates a real-time listener
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        clearTimeout(timeoutId);
        if (doc.exists()) {
          setUserData(doc.data());
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        clearTimeout(timeoutId);
        console.error('useUserProfile error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return { userData, loading, error };
};