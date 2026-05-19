import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";
import { auth } from "../../config/firebase";
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { confirm } from "../../components/Confirm";
import { showNotification } from "../../components/Notification";
import { deleteUserData } from "../../utils/accountDeletion";
/* eslint-disable react-native/no-inline-styles */

const PlaceholderScreen = ({ navigation, title }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="#111827" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 28 }} />
    </View>

    <View style={styles.content}>
      <View style={styles.placeholder}>
        <Ionicons name="construct" size={60} color="#D1D5DB" />
        <Text style={styles.placeholderText}>Coming Soon</Text>
        <Text style={styles.placeholderDesc}>
          This feature is being developed
        </Text>
      </View>
    </View>
  </SafeAreaView>
);

export const HealthGoals = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Health Goals" />
);
export const PrivacySettings = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Privacy Settings" />
);
export const DataSync = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Data Sync" />
);
export const ExportData = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Export Health Data" />
);
export const Appearance = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Appearance" />
);
export const About = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="About" />
);
export const Support = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Help & Support" />
);
export function DeleteAccount({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete account",
      message:
        "This will permanently delete your account and all associated data. This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!ok) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      // Best-effort: delete Firestore data first
      try {
        await deleteUserData(user.uid);
      } catch (e) {
        console.warn("Failed to delete user data before account deletion", e);
      }

      try {
        await deleteUser(user);
      } catch (err) {
        // If reauth required, prompt for credentials
        if (err?.code === "auth/requires-recent-login") {
          // show reauth modal
          setShowReauth(true);
          setLoading(false);
          return;
        }
        throw err;
      }

      showNotification({
        type: "success",
        title: "Account deleted",
        message: "Your account has been permanently deleted.",
      });
      try {
        await auth.signOut();
      } catch {}
    } catch (err) {
      console.error("Delete account failed", err);
      const msg = err?.message || "Unable to delete account";
      showNotification({ type: "error", title: "Error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const [showReauth, setShowReauth] = React.useState(false);
  const [reauthPassword, setReauthPassword] = React.useState("");

  const handleReauth = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, reauthPassword);
      await reauthenticateWithCredential(user, cred);
      // after reauth, attempt deletion again
      try {
        await deleteUserData(user.uid);
      } catch (e) {
        console.warn("Failed to delete user data after reauth", e);
      }
      await deleteUser(user);
      showNotification({
        type: "success",
        title: "Account deleted",
        message: "Your account has been permanently deleted.",
      });
      try {
        await auth.signOut();
      } catch {}
      setShowReauth(false);
    } catch (e) {
      console.error("Reauth failed", e);
      showNotification({
        type: "error",
        title: "Reauthentication failed",
        message: e?.message || "Unable to reauthenticate",
      });
    } finally {
      setLoading(false);
      setReauthPassword("");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Delete Account
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.placeholder,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="trash" size={60} color="#F87171" />
          <Text style={[styles.placeholderText, { color: colors.text }]}>
            Delete your account
          </Text>
          <Text
            style={[
              styles.placeholderDesc,
              { color: colors.muted, textAlign: "center" },
            ]}
          >
            This will permanently delete your account and all associated data.
            You may need to reauthenticate before deletion.
          </Text>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={loading}
            style={{
              marginTop: 18,
              backgroundColor: "#EF4444",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Delete account
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showReauth} transparent animationType="fade">
        <SafeAreaView
          style={[
            styles.container,
            { justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" },
          ]}
        >
          <View
            style={[
              styles.placeholder,
              {
                marginHorizontal: 20,
                padding: 18,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.placeholderText, { color: colors.text }]}>
              Re-enter password to continue
            </Text>
            <TextInput
              value={reauthPassword}
              onChangeText={setReauthPassword}
              placeholder="Password"
              secureTextEntry
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 10,
                borderRadius: 8,
                color: colors.text,
                backgroundColor: colors.background,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 14,
                gap: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowReauth(false)}
                style={{ paddingHorizontal: 12, paddingVertical: 10 }}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReauth}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: colors.background, fontWeight: "700" }}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
export const Notifications = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Notifications" />
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F8" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#111827" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: "#FBFBFD",
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7EAF0",
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 16,
  },
  placeholderDesc: { fontSize: 14, color: "#9CA3AF", marginTop: 8 },
});
