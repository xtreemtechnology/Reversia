import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { db } from "../../../config/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function NotificationsScreen({ navigation }) {
  const { userData } = useUserProfile();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const uid = userData?.uid;
    if (!uid) return undefined;

    const q = query(
      collection(db, "users", uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      const unreadIds = [];
      snap.forEach((d) => {
        const data = { id: d.id, ...d.data() };
        arr.push(data);
        if (!data.read) unreadIds.push(d.id);
      });
      setItems(arr);

      // Auto-mark unread notifications as read when viewing the list
      if (unreadIds.length && uid) {
        try {
          const batch = writeBatch(db);
          unreadIds.forEach((id) => {
            const ref = doc(db, "users", uid, "notifications", id);
            batch.update(ref, { read: true });
          });
          batch.commit().catch(() => {});
        } catch (e) {
          // ignore
        }
      }
    });

    return () => unsub && unsub();
  }, [userData]);

  const markAllRead = async () => {
    const uid = userData?.uid;
    if (!uid || !items.length) return;
    try {
      const batch = writeBatch(db);
      items.forEach((it) => {
        if (!it.read) {
          const ref = doc(db, "users", uid, "notifications", it.id);
          batch.update(ref, { read: true });
        }
      });
      await batch.commit();
    } catch (e) {
      // ignore
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, item.read ? styles.read : styles.unread]}
      onPress={async () => {
        try {
          const uid = userData?.uid;
          if (uid && !item.read) {
            const ref = doc(db, "users", uid, "notifications", item.id);
            await updateDoc(ref, { read: true });
          }
        } catch (e) {
          // ignore
        }
      }}
    >
      <View style={styles.itemBody}>
        <Text style={styles.title}>{item.title || "Notification"}</Text>
        {item.message ? (
          <Text style={styles.message}>{item.message}</Text>
        ) : null}
      </View>
      <View style={styles.meta}>
        <Text style={styles.time}>
          {item.createdAt?.toDate
            ? item.createdAt.toDate().toLocaleString()
            : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  markAllBtn: { padding: 8 },
  markAllText: { color: "#2563EB", fontWeight: "700" },
  item: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  unread: { borderLeftWidth: 4, borderLeftColor: "#EF4444" },
  read: { opacity: 0.7 },
  itemBody: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700", color: "#111827" },
  message: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  meta: { marginLeft: 8 },
  time: { fontSize: 11, color: "#9CA3AF" },
  empty: { textAlign: "center", marginTop: 40, color: "#6B7280" },
});
