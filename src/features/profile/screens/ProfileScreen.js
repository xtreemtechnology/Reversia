import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth } from "../../../config/firebase";
import { sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useProfile } from "../hooks/useProfile";
import { useTheme } from "../../../theme/ThemeProvider";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getInitials = (firstName = "", lastName = "") =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "ME";

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionTitle = ({ children, colors, styles }) => (
  <Text style={[styles.sectionTitle, { color: colors.text }]}>{children}</Text>
);

const InfoRow = ({
  icon,
  label,
  value,
  iconColor = "#6B7280",
  colors,
  styles,
}) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIconWrap, { backgroundColor: iconColor + "18" }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.infoLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>
        {value || "Not provided"}
      </Text>
    </View>
  </View>
);

const StatCard = ({ icon, label, value, color, colors, styles }) => (
  <View style={[styles.statCard, { backgroundColor: color + "14" }]}>
    <MaterialCommunityIcons name={icon} size={22} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
  </View>
);

const ToggleRow = ({
  icon,
  label,
  value,
  onValueChange,
  iconColor = "#825CFF",
  colors,
  styles,
}) => (
  <View style={styles.toggleRow}>
    <View style={[styles.infoIconWrap, { backgroundColor: iconColor + "18" }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
    <Switch
      value={!!value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor="#FFF"
    />
  </View>
);

// ─── Loading / Error States ──────────────────────────────────────────────────

const CenteredMessage = ({ children, colors, styles }) => (
  <SafeAreaView
    style={[styles.centeredScreen, { backgroundColor: colors.background }]}
  >
    {children}
  </SafeAreaView>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen({ navigation }) {
  const userId = auth?.currentUser?.uid;
  const { profile, isLoading, error, updateProfile } = useProfile(userId);
  const { colors, theme: currentTheme, setTheme } = useTheme();
  const styles = getStyles(colors);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  // Wait for auth to initialize before showing "Not signed in"
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // ── Guards ──
  if (!authChecked) {
    return (
      <CenteredMessage colors={colors} styles={styles}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.guardSub, { marginTop: 16, color: colors.muted }]}>
          Initializing…
        </Text>
      </CenteredMessage>
    );
  }

  if (!userId) {
    return (
      <CenteredMessage colors={colors} styles={styles}>
        <Ionicons name="person-circle-outline" size={64} color={colors.muted} />
        <Text style={[styles.guardTitle, { color: colors.text }]}>
          Not signed in
        </Text>
        <Text style={[styles.guardSub, { color: colors.muted }]}>
          Please sign in to view your profile.
        </Text>
      </CenteredMessage>
    );
  }

  if (isLoading) {
    return (
      <CenteredMessage colors={colors} styles={styles}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.guardSub, { marginTop: 16, color: colors.muted }]}>
          Loading your profile…
        </Text>
      </CenteredMessage>
    );
  }

  if (error) {
    return (
      <CenteredMessage colors={colors} styles={styles}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={[styles.guardTitle, { color: colors.text }]}>
          Something went wrong
        </Text>
        <Text style={styles.guardError}>{error}</Text>
      </CenteredMessage>
    );
  }

  // ── Derived data ──
  const firstName = profile?.firstName || "";
  const lastName = profile?.lastName || "";
  const authName = auth?.currentUser?.displayName || "";
  const detectedName =
    authName ||
    (auth?.currentUser?.email ? auth.currentUser.email.split("@")[0] : "");
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    detectedName ||
    "Your Name";
  const email = auth?.currentUser?.email || profile?.email || "No email";
  const initials = getInitials(
    firstName || authName.split(" ")[0] || "",
    lastName || authName.split(" ")[1] || ""
  );

  const diabetesStatus =
    profile?.diabetesType === "type2"
      ? "Type 2 Diabetic"
      : profile?.diabetesType === "prediabetes"
      ? "Pre-Diabetic"
      : profile?.diabetesType === "prevention"
      ? "Prevention Mode"
      : "Not specified";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.card }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: colors.text }]}>
            My Profile
          </Text>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: colors.text }]}
            onPress={() => {
              setEditFirst(profile?.firstName || "");
              setEditLast(profile?.lastName || "");
              setEditPhone(profile?.phone || "");
              setEditVisible(true);
            }}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Inline Edit Modal ── */}
        <Modal visible={editVisible} animationType="slide" transparent>
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Text style={styles.modalLabel}>First name</Text>
              <TextInput
                value={editFirst}
                onChangeText={setEditFirst}
                style={[
                  styles.editInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="First name"
                placeholderTextColor={colors.muted}
              />
              <Text style={styles.modalLabelSpaced}>Last name</Text>
              <TextInput
                value={editLast}
                onChangeText={setEditLast}
                style={[
                  styles.editInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Last name"
                placeholderTextColor={colors.muted}
              />
              <Text style={styles.modalLabelSpaced}>Phone</Text>
              <TextInput
                value={editPhone}
                onChangeText={setEditPhone}
                style={[
                  styles.editInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Phone"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setEditVisible(false)}
                  style={styles.modalCancelBtn}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const updates = {
                        firstName: editFirst.trim(),
                        lastName: editLast.trim(),
                        phone: editPhone.trim() || null,
                        updatedAt: new Date().toISOString(),
                      };
                      await updateProfile(updates);
                      Alert.alert("Saved", "Profile updated");
                      setEditVisible(false);
                    } catch (err) {
                      console.error("Inline save failed", err);
                      Alert.alert(
                        "Error",
                        err?.message || "Failed to save profile"
                      );
                    }
                  }}
                  style={styles.modalSaveBtn}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        {/* ── Avatar hero card ── */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarRing}>
            <View
              style={[styles.avatar, { backgroundColor: colors.background }]}
            >
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {initials}
              </Text>
            </View>
          </View>

          <Text style={styles.heroName}>{fullName}</Text>
          <Text style={styles.heroEmail}>{email}</Text>

          <View style={styles.statusBadge}>
            <MaterialCommunityIcons
              name="heart-pulse"
              size={14}
              color={colors.primary}
            />
            <Text style={[styles.statusText, { color: colors.primary }]}>
              {diabetesStatus}
            </Text>
          </View>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="fire"
            label="Day Streak"
            value={profile?.streak ?? "—"}
            color="#F59E0B"
            colors={colors}
          />
          <StatCard
            icon="check-circle"
            label="Goals Met"
            value={profile?.goalsMetTotal ?? "—"}
            color="#10B981"
            colors={colors}
          />
          <StatCard
            icon="trending-down"
            label="A1C Drop"
            value={profile?.a1cDrop ? `${profile.a1cDrop}%` : "—"}
            color="#825CFF"
            colors={colors}
          />
        </View>

        {/* ── Personal info ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SectionTitle colors={colors} styles={styles}>
            Personal Info
          </SectionTitle>

          <InfoRow
            icon="person-outline"
            label="Full Name"
            value={fullName}
            iconColor="#6D28D9"
            colors={colors}
            styles={styles}
          />
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={email}
            iconColor="#0284C7"
            colors={colors}
            styles={styles}
          />
          <InfoRow
            icon="call-outline"
            label="Phone"
            value={profile?.phone}
            iconColor="#059669"
            colors={colors}
            styles={styles}
          />
          <InfoRow
            icon="calendar-outline"
            label="Date of Birth"
            value={
              profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : null
            }
            iconColor="#D97706"
            colors={colors}
            styles={styles}
          />
          <InfoRow
            icon="location-outline"
            label="Location"
            value={profile?.location}
            iconColor="#DC2626"
            colors={colors}
            styles={styles}
          />
        </View>

        {/* ── Health info ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SectionTitle colors={colors} styles={styles}>
            Health Info
          </SectionTitle>

          <InfoRow
            icon="medical-outline"
            label="Medication Status"
            value={
              profile?.onMedication === true
                ? "On Medication"
                : profile?.onMedication === false
                ? "No Medication"
                : profile?.onMedication
            }
            iconColor={colors.primary}
            colors={colors}
            styles={styles}
          />
          <InfoRow
            icon="fitness-outline"
            label="Activity Level"
            value={profile?.activityLevel}
            iconColor="#0369A1"
            colors={colors}
            styles={styles}
          />
          <InfoRow
            icon="scale-outline"
            label="Weight"
            value={profile?.weight ? `${profile.weight} kg` : null}
            iconColor="#065F46"
            colors={colors}
            styles={styles}
          />
          <InfoRow
            icon="analytics-outline"
            label="Target Glucose"
            value={
              profile?.targetGlucose ? `${profile.targetGlucose} mg/dL` : null
            }
            iconColor="#B45309"
            colors={colors}
            styles={styles}
          />
        </View>

        {/* ── Emergency contact ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SectionTitle colors={colors} styles={styles}>
            Emergency Contact
          </SectionTitle>

          <InfoRow
            icon="people-outline"
            label="Name"
            value={profile?.emergencyContactName}
            iconColor="#DC2626"
            colors={colors}
            styles={styles}
          />
          <InfoRow
            icon="call-outline"
            label="Phone"
            value={profile?.emergencyContactPhone}
            iconColor="#DC2626"
            colors={colors}
            styles={styles}
          />
        </View>

        {/* ── Account info ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SectionTitle colors={colors} styles={styles}>
            Account
          </SectionTitle>

          <InfoRow
            icon="finger-print"
            label="User ID"
            value={profile?.id}
            iconColor={colors.muted}
            colors={colors}
            styles={styles}
          />

          <InfoRow
            icon="shield-checkmark-outline"
            label="Email Verified"
            value={profile?.emailVerified ? "Verified ✓" : "Not Verified"}
            iconColor={profile?.emailVerified ? "#10B981" : "#F59E0B"}
            colors={colors}
            styles={styles}
          />
          {!profile?.emailVerified && (
            <TouchableOpacity
              onPress={async () => {
                try {
                  setSendingVerification(true);
                  await sendEmailVerification(auth.currentUser);
                  Alert.alert(
                    "Verification sent",
                    "Check your inbox for the verification email."
                  );
                } catch (err) {
                  console.error("Resend verification failed", err);
                  Alert.alert(
                    "Error",
                    err?.message || "Unable to send verification email"
                  );
                } finally {
                  setSendingVerification(false);
                }
              }}
              style={styles.resendBtn}
            >
              {sendingVerification ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.resendText}>Resend verification</Text>
              )}
            </TouchableOpacity>
          )}
          <InfoRow
            icon="time-outline"
            label="Member Since"
            value={formatDate(profile?.createdAt)}
            iconColor={colors.muted}
            colors={colors}
            styles={styles}
          />
          <InfoRow
            icon="refresh-outline"
            label="Last Updated"
            value={formatDate(profile?.updatedAt)}
            iconColor={colors.muted}
            colors={colors}
            styles={styles}
          />
        </View>

        {/* ── Preferences ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SectionTitle colors={colors} styles={styles}>
            Preferences
          </SectionTitle>

          <ToggleRow
            icon="notifications-outline"
            label="Push Notifications"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            iconColor={colors.primary}
            colors={colors}
            styles={styles}
          />
          <ToggleRow
            icon="moon-outline"
            label="Dark Mode"
            value={currentTheme === "dark"}
            onValueChange={async (val) => {
              try {
                const theme = val ? "dark" : "light";
                await setTheme(theme);
              } catch (err) {
                console.error("Update appearance failed", err);
                Alert.alert(
                  "Error",
                  err?.message || "Unable to update appearance"
                );
              }
            }}
            iconColor={colors.text}
            colors={colors}
            styles={styles}
          />
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity
          style={[
            styles.signOutBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => auth.signOut()}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.signOutTextDanger}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.muted }]}>
          GlycoRev v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 60,
    },
    centeredScreen: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    guardTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginTop: 16,
    },
    guardSub: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 8,
      textAlign: "center",
    },
    guardSubSpaced: {
      marginTop: 16,
    },
    guardError: {
      color: "#EF4444",
      textAlign: "center",
      marginTop: 8,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.text,
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    topBarTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
    },
    editBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.text,
      borderRadius: 20,
    },
    editBtnText: {
      color: colors.background,
      fontWeight: "700",
      fontSize: 13,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.4)",
      padding: 20,
    },
    modalCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 12,
      color: colors.text,
    },
    modalLabel: {
      fontSize: 12,
      color: colors.muted,
      marginBottom: 6,
    },
    modalLabelSpaced: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 10,
      marginBottom: 6,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 14,
      gap: 10,
    },
    modalCancelBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    modalCancelText: {
      color: colors.muted,
      fontWeight: "700",
    },
    modalSaveBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
    },
    modalSaveText: {
      color: colors.background,
      fontWeight: "800",
    },
    heroCard: {
      backgroundColor: colors.primary,
      borderRadius: 30,
      paddingVertical: 32,
      paddingHorizontal: 20,
      alignItems: "center",
      marginBottom: 18,
    },
    avatarRing: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: "rgba(255,255,255,0.25)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 14,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      fontSize: 26,
      fontWeight: "900",
      color: colors.primary,
    },
    heroName: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.background,
    },
    heroEmail: {
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      marginTop: 4,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginTop: 16,
      gap: 6,
    },
    statusText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    statCard: {
      flex: 1,
      marginHorizontal: 4,
      borderRadius: 20,
      paddingVertical: 16,
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "900",
      marginTop: 6,
    },
    statLabel: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 2,
      fontWeight: "600",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 20,
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    infoIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    infoLabel: {
      fontSize: 11,
      color: colors.muted,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    infoValue: {
      fontSize: 15,
      color: colors.text,
      fontWeight: "600",
      marginTop: 2,
    },
    editInput: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 10,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    toggleLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    signOutBtn: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: "#FCA5A5",
      borderRadius: 28,
      height: 56,
      marginTop: 8,
      marginBottom: 16,
      gap: 10,
    },
    signOutText: {
      color: "#EF4444",
      fontWeight: "700",
      fontSize: 16,
    },
    signOutTextDanger: {
      color: "#EF4444",
      fontWeight: "700",
      fontSize: 16,
    },
    resendBtn: {
      marginTop: 10,
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    resendText: {
      color: colors.primary,
      fontWeight: "700",
    },
    versionText: {
      textAlign: "center",
      color: colors.muted,
      fontSize: 12,
      fontWeight: "600",
    },
  });
