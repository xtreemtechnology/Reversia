// Lightweight notification service: subscribe to notifications and show via host
import { db, auth } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const subscribers = new Set();

export function subscribeNotifications(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export function notify(notification) {
  for (const cb of Array.from(subscribers)) {
    try {
      cb(notification);
    } catch (e) {
      // swallow subscriber errors
    }
  }
}

export function showNotification({ type = "info", title = "", message = "", duration = 4000, action, persistToServer = true, targetUserId } = {}) {
  const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
  const payload = { id, type, title, message, duration, action };

  // Broadcast locally immediately
  notify(payload);

  // Persist to Firestore for server-backed notifications and unread counts
  if (persistToServer) {
    try {
      const uid = targetUserId || (auth && auth.currentUser && auth.currentUser.uid);
      if (uid) {
        // write but don't await (fire-and-forget)
        addDoc(collection(db, "users", uid, "notifications"), {
          type,
          title: title || null,
          message: message || null,
          read: false,
          createdAt: serverTimestamp(),
          meta: { source: "client" },
        }).catch(() => {
          // ignore write errors
        });
      }
    } catch (e) {
      // ignore any runtime errors here
    }
  }

  return id;
}

export default {
  subscribeNotifications,
  showNotification,
};
