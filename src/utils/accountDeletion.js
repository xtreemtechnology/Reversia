import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";

// Best-effort client-side deletion of user data.
// Deletes documents in common subcollections under `users/{uid}`.
export async function deleteUserData(uid, options = {}) {
  if (!uid) throw new Error("Missing uid");
  // List of known subcollections to clean up
  const subcollections = options.subcollections || [
    "logs",
    "glucose_logs",
    "steps",
  ];

  for (const sub of subcollections) {
    try {
      const colRef = collection(db, "users", uid, sub);
      const snap = await getDocs(colRef);
      const deletes = snap.docs.map((d) => deleteDoc(doc(db, "users", uid, sub, d.id)));
      await Promise.allSettled(deletes);
    } catch (e) {
      // swallow per-subcollection errors but continue
      console.warn(`Failed to clear subcollection ${sub}:`, e);
    }
  }

  // Attempt to delete the main user document
  try {
    await deleteDoc(doc(db, "users", uid));
  } catch (e) {
    console.warn("Failed to delete user document:", e);
  }

  return true;
}

export default { deleteUserData };
