import { db, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const saveGlucoseLog = async (value, context) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    const logRef = collection(db, 'users', user.uid, 'glucose_logs');
    
    await addDoc(logRef, {
      value: parseFloat(value),
      context: context || "General",
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving log: ", error);
    return { success: false, error };
  }
};