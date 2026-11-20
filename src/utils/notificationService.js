// Lightweight notification service: subscribe to notifications and show via host
import { db, auth } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// expo-notifications imports wrapped in try/catch to avoid crashing on web/simulators
let Notifications = null;
let Platform = null;
try {
  Notifications = require("expo-notifications");
  Platform = require("react-native").Platform;
} catch (_) {
  // expo-notifications not available — push features will be silently disabled
}

// Configure how notifications are handled when the app is in the foreground
try {
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (_) {}

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

export function showNotification({
  type = "info",
  title = "",
  message = "",
  duration = 4000,
  action,
  persistToServer = true,
  targetUserId,
} = {}) {
  const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
  const payload = { id, type, title, message, duration, action };

  // Broadcast locally immediately
  notify(payload);

  // Persist to Firestore for server-backed notifications and unread counts
  if (persistToServer) {
    try {
      const uid =
        targetUserId || (auth && auth.currentUser && auth.currentUser.uid);
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

// ─── Push / Scheduled Notification Helpers ───────────────────────────────────

const WATER_IDS_KEY = "@reversia_water_notif_ids";
const MEAL_IDS_KEY = "@reversia_meal_notif_ids";

/** Request OS permission for push notifications. Returns true if granted. */
export async function requestNotificationPermissions() {
  try {
    if (!Notifications) return false;

    // Create Android notification channel
    if (Platform && Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (_) {
    return false;
  }
}

/** Cancel all scheduled water reminder notifications and clear stored IDs. */
export async function cancelWaterReminders() {
  try {
    if (!Notifications) return;
    const raw = await AsyncStorage.getItem(WATER_IDS_KEY);
    if (raw) {
      const ids = JSON.parse(raw);
      for (const id of ids) {
        try {
          await Notifications.cancelScheduledNotificationAsync(id);
        } catch (_) {}
      }
    }
    await AsyncStorage.removeItem(WATER_IDS_KEY);
  } catch (_) {}
}

/** Schedule four daily water-hydration reminders. */
export async function scheduleWaterReminders() {
  try {
    if (!Notifications) return;
    await cancelWaterReminders();

    const reminders = [
      {
        hour: 10,
        minute: 0,
        title: "Time to drink water 💧",
        body: "Stay hydrated — your body will thank you.",
      },
      {
        hour: 12,
        minute: 30,
        title: "Midday hydration check",
        body: "Have you had 4 glasses yet?",
      },
      {
        hour: 15,
        minute: 0,
        title: "Afternoon reminder 💧",
        body: "Drink a glass of water before your next meal.",
      },
      {
        hour: 18,
        minute: 0,
        title: "Evening hydration",
        body: "Don't forget water with dinner.",
      },
    ];

    const ids = [];
    for (const r of reminders) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title: r.title, body: r.body, sound: true },
          trigger: { hour: r.hour, minute: r.minute, repeats: true },
        });
        ids.push(id);
      } catch (_) {}
    }

    await AsyncStorage.setItem(WATER_IDS_KEY, JSON.stringify(ids));
  } catch (_) {}
}

/** Cancel all scheduled meal reminder notifications and clear stored IDs. */
export async function cancelMealReminders() {
  try {
    if (!Notifications) return;
    const raw = await AsyncStorage.getItem(MEAL_IDS_KEY);
    if (raw) {
      const ids = JSON.parse(raw);
      for (const id of ids) {
        try {
          await Notifications.cancelScheduledNotificationAsync(id);
        } catch (_) {}
      }
    }
    await AsyncStorage.removeItem(MEAL_IDS_KEY);
  } catch (_) {}
}

/** Schedule three daily meal-logging reminders. */
export async function scheduleMealReminders() {
  try {
    if (!Notifications) return;
    await cancelMealReminders();

    const reminders = [
      {
        hour: 7,
        minute: 30,
        title: "Good morning 🌅",
        body: "Don't skip breakfast — log it in Reversia.",
      },
      {
        hour: 13,
        minute: 0,
        title: "Lunch time 🍽",
        body: "Log your lunch to keep your story complete.",
      },
      {
        hour: 19,
        minute: 30,
        title: "Dinner check-in",
        body: "Log dinner and do a quick body check.",
      },
    ];

    const ids = [];
    for (const r of reminders) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title: r.title, body: r.body, sound: true },
          trigger: { hour: r.hour, minute: r.minute, repeats: true },
        });
        ids.push(id);
      } catch (_) {}
    }

    await AsyncStorage.setItem(MEAL_IDS_KEY, JSON.stringify(ids));
  } catch (_) {}
}

/** Whether the OS notification module is available on this platform (it is not on web, where reminders cannot be scheduled). */
export function isReminderSchedulingSupported() {
  return !!Notifications;
}

/**
 * Request permissions then schedule all reminders (water + meal).
 * Returns true if permissions were granted and scheduling was attempted.
 */
export async function scheduleAllReminders() {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return false;
    await scheduleWaterReminders();
    await scheduleMealReminders();
    return true;
  } catch (_) {
    return false;
  }
}

/** Cancel all water and meal reminders. */
export async function cancelAllReminders() {
  try {
    await cancelWaterReminders();
    await cancelMealReminders();
  } catch (_) {}
}
