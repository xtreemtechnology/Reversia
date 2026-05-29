import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useTheme } from "../theme/ThemeProvider";

function formatRelativeTime(value) {
  if (!value) return "Just now";
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function getAccent(type, colors) {
  switch (type) {
    case "success":
      return "#10B981";
    case "warning":
      return "#F59E0B";
    case "error":
      return "#EF4444";
    default:
      return colors.primary;
  }
}

export default function NotificationsModal({ visible, onClose }) {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const uid = auth.currentUser?.uid || null;

  useEffect(() => {
    if (!visible || !uid) {
      setNotifications([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const notificationsRef = collection(db, "users", uid, "notifications");
    const notificationsQuery = query(
      notificationsRef,
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        setNotifications(
          snapshot.docs.map((notificationDoc) => ({
            id: notificationDoc.id,
            ...notificationDoc.data(),
          }))
        );
        setLoading(false);
      },
      () => {
        setNotifications([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [visible, uid]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const markAsRead = useCallback(
    async (item) => {
      if (!uid || !item?.id || item.read) return;
      try {
        await updateDoc(doc(db, "users", uid, "notifications", item.id), {
          read: true,
          readAt: serverTimestamp(),
        });
      } catch {
        // ignore write failures
      }
    },
    [uid]
  );

  const renderItem = useCallback(
    ({ item }) => {
      const accent = getAccent(item.type, colors);

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => markAsRead(item)}
          style={[
            styles.item,
            {
              backgroundColor: colors.card,
              borderColor: item.read ? colors.border : accent,
            },
          ]}
        >
          <View style={[styles.badge, { backgroundColor: accent }]} />
          <View style={styles.itemBody}>
            <View style={styles.rowTop}>
              <Text style={[styles.itemTitle, { color: colors.foreground }]}>
                {item.title || "Notification"}
              </Text>
              {!item.read ? (
                <View style={[styles.unreadDot, { backgroundColor: accent }]} />
              ) : null}
            </View>
            {item.message ? (
              <Text
                style={[styles.itemMessage, { color: colors.mutedForeground }]}
              >
                {item.message}
              </Text>
            ) : null}
            <Text style={[styles.itemTime, { color: colors.mutedForeground }]}>
              {formatRelativeTime(item.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, markAsRead]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Notifications
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.mutedForeground }]}
              >
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`
                  : "You're all caught up"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.primary }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.primary} />
              <Text
                style={[styles.loadingText, { color: colors.mutedForeground }]}
              >
                Loading notifications...
              </Text>
            </View>
          ) : notifications.length > 0 ? (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No notifications yet
              </Text>
              <Text
                style={[styles.emptyText, { color: colors.mutedForeground }]}
              >
                Updates, reminders, and insights will appear here.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    maxHeight: "78%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 8,
    gap: 12,
  },
  item: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  badge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  itemBody: {
    flex: 1,
    gap: 6,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemMessage: {
    fontSize: 13,
    lineHeight: 19,
  },
  itemTime: {
    fontSize: 12,
  },
  loadingState: {
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 260,
  },
});
