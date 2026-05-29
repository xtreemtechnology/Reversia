/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import { useProfile } from "../hooks/useProfile";
import { showNotification } from "../../../components/Notification";
import { confirm } from "../../../utils/confirmService";

import ProfileHeader from "../components/ProfileHeader";
import ProfileHeroCard from "../components/ProfileHeroCard";
import ProfileStatsRow from "../components/ProfileStatsRow";
import ProfileInfoCard, { InfoRow } from "../components/ProfileInfoCard";
import ProfilePreferencesCard from "../components/ProfilePreferencesCard";
import ProfileEditModal from "../components/ProfileEditModal";

const getInitials = (first = "", last = "") =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "ME";

const formatDate = (value) => {
  if (!value) return "N/A";
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

const diabetesLabel = (type) => {
  const map = {
    type2: "Type 2 Diabetic",
    prediabetes: "Pre-Diabetic",
    prevention: "Prevention Mode",
  };
  return map[type] || "Not specified";
};

export default function ProfileScreen({ navigation }) {
  const { colors, theme: currentTheme, setTheme } = useTheme();
  const userId = auth?.currentUser?.uid;
  const { profile, isLoading, error, updateProfile, loadProfile } = useProfile(userId);

  const [authChecked, setAuthChecked] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sendingVerification, setSendingVerification] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStaples, setEditStaples] = useState([]);
  const [editSweetDrinkFrequency, setEditSweetDrinkFrequency] = useState("rarely");
  const [editDietaryRestrictions, setEditDietaryRestrictions] = useState([]);
  const [editPrimaryGoal, setEditPrimaryGoal] = useState(null);
  const [editSecondaryGoals, setEditSecondaryGoals] = useState([]);
  const [editSleepHours, setEditSleepHours] = useState("6-7");
  const [editSleepQuality, setEditSleepQuality] = useState("fair");
  const [editOnMedication, setEditOnMedication] = useState(null);
  const [editActivityLevel, setEditActivityLevel] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editTargetGlucose, setEditTargetGlucose] = useState("");
  const [editEmergencyContactName, setEditEmergencyContactName] = useState("");
  const [editEmergencyContactPhone, setEditEmergencyContactPhone] = useState("");
  const [editPrimaryHba1c, setEditPrimaryHba1c] = useState(null);
  const [editFastingBloodSugar, setEditFastingBloodSugar] = useState(null);
  const [editFears, setEditFears] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setAuthChecked(true));
    return () => unsub();
  }, []);

  const openEdit = useCallback(() => {
    setEditFirst(profile?.firstName || "");
    setEditLast(profile?.lastName || "");
    setEditPhone(profile?.phone || "");
    setEditStaples(profile?.typicalStaples || []);
    setEditSweetDrinkFrequency(profile?.sweetDrinkFrequency || "rarely");
    setEditDietaryRestrictions(profile?.dietaryRestrictions || []);
    setEditPrimaryGoal(profile?.primaryGoal || null);
    setEditSecondaryGoals(profile?.secondaryGoals || []);
    setEditSleepHours(profile?.typicalSleepHours || "6-7");
    setEditSleepQuality(profile?.sleepQuality || "fair");
    setEditOnMedication(
      typeof profile?.onMedication === "boolean" ? profile.onMedication : null
    );
    setEditActivityLevel(profile?.activityLevel || "");
    setEditWeight(profile?.weight ? String(profile.weight) : "");
    setEditTargetGlucose(profile?.targetGlucose ? String(profile.targetGlucose) : "");
    setEditEmergencyContactName(profile?.emergencyContactName || "");
    setEditEmergencyContactPhone(profile?.emergencyContactPhone || "");
    setEditPrimaryHba1c(profile?.primaryHba1c || null);
    setEditFastingBloodSugar(profile?.fastingBloodSugar || null);
    setEditFears(profile?.healthFears || []);
    setEditVisible(true);
  }, [profile]);

  const saveEdit = useCallback(async () => {
    try {
      await updateProfile({
        firstName: editFirst.trim(),
        lastName: editLast.trim(),
        phone: editPhone.trim() || null,
        typicalStaples: editStaples,
        sweetDrinkFrequency: editSweetDrinkFrequency,
        dietaryRestrictions: editDietaryRestrictions,
        primaryGoal: editPrimaryGoal,
        secondaryGoals: editSecondaryGoals,
        typicalSleepHours: editSleepHours,
        sleepQuality: editSleepQuality,
        onMedication: editOnMedication,
        activityLevel: editActivityLevel.trim(),
        weight: editWeight.trim(),
        targetGlucose: editTargetGlucose.trim(),
        emergencyContactName: editEmergencyContactName.trim(),
        emergencyContactPhone: editEmergencyContactPhone.trim(),
        updatedAt: new Date().toISOString(),
        primaryHba1c: editPrimaryHba1c || null,
        fastingBloodSugar: editFastingBloodSugar || null,
        healthFears: editFears || [],
      });
      showNotification({ type: "success", title: "Saved", message: "Profile updated" });
      setEditVisible(false);
    } catch (err) {
      showNotification({ type: "error", title: "Error", message: err?.message || "Save failed" });
    }
  }, [
    editActivityLevel,
    editDietaryRestrictions,
    editEmergencyContactName,
    editEmergencyContactPhone,
    editFirst,
    editLast,
    editOnMedication,
    editPhone,
    editPrimaryGoal,
    editSecondaryGoals,
    editSleepHours,
    editSleepQuality,
    editStaples,
    editSweetDrinkFrequency,
    editTargetGlucose,
    editWeight,
    updateProfile,
  ]);

  const handleResendVerification = useCallback(async () => {
    try {
      setSendingVerification(true);
      await sendEmailVerification(auth.currentUser);
      showNotification({ type: "success", title: "Sent", message: "Check your inbox." });
    } catch (err) {
      showNotification({ type: "error", title: "Error", message: err?.message || "Failed to send" });
    } finally {
      setSendingVerification(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      const ok = await confirm({
        title: "Sign out",
        message: "Are you sure you want to sign out?",
        confirmText: "Sign out",
        cancelText: "Cancel",
      });
      if (ok) await auth.signOut();
    } catch (err) {
      showNotification({ type: "error", title: "Error", message: "Unable to sign out" });
    }
  }, []);

  const handleRetry = useCallback(async () => {
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      showNotification({ type: "error", title: "No user", message: "Not signed in" });
      return;
    }

    try {
      await loadProfile();
      showNotification({ type: "success", title: "Retrying", message: "Profile reload started" });
    } catch (err) {
      showNotification({ type: "error", title: "Error", message: err?.message || "Unable to retry" });
    }
  }, [loadProfile]);

  if (!authChecked || isLoading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.guardSub, { color: colors.mutedForeground }]}> 
          {!authChecked ? "Initializing…" : "Loading your profile…"}
        </Text>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}> 
        <Ionicons name="person-circle-outline" size={64} color={colors.mutedForeground} />
        <Text style={[styles.guardTitle, { color: colors.foreground }]}>Not signed in</Text>
        <Text style={[styles.guardSub, { color: colors.mutedForeground }]}>Please sign in to view your profile.</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}> 
        <Ionicons name="warning" size={64} color="#E07A5F" />
        <Text style={[styles.guardTitle, { color: colors.foreground }]}>Something went wrong</Text>
        <Text style={[styles.guardSub, { color: colors.mutedForeground }]}>{error}</Text>
        <Text style={[styles.guardSub, { color: colors.mutedForeground, marginTop: 8 }]}>Signed-in UID: {auth?.currentUser?.uid || "none"}</Text>
        <TouchableOpacity onPress={handleRetry} style={[styles.retryBtn, { backgroundColor: colors.primary }]} activeOpacity={0.85}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const firstName = profile?.firstName || "";
  const lastName = profile?.lastName || "";
  const authDisplayName = auth?.currentUser?.displayName || "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    authDisplayName ||
    (auth?.currentUser?.email?.split("@")[0] ?? "Your Name");
  const email = auth?.currentUser?.email || profile?.email || "No email";
  const initials = getInitials(
    firstName || authDisplayName.split(" ")[0] || "",
    lastName || authDisplayName.split(" ")[1] || ""
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ProfileHeader onBack={() => navigation.goBack()} onEdit={openEdit} />

        <ProfileEditModal
          visible={editVisible}
          onClose={() => setEditVisible(false)}
          onSave={saveEdit}
          editFirst={editFirst}
          setEditFirst={setEditFirst}
          editLast={editLast}
          setEditLast={setEditLast}
          editPhone={editPhone}
          setEditPhone={setEditPhone}
          editStaples={editStaples}
          setEditStaples={setEditStaples}
          editSweetDrinkFrequency={editSweetDrinkFrequency}
          setEditSweetDrinkFrequency={setEditSweetDrinkFrequency}
          editDietaryRestrictions={editDietaryRestrictions}
          setEditDietaryRestrictions={setEditDietaryRestrictions}
          editPrimaryGoal={editPrimaryGoal}
          setEditPrimaryGoal={setEditPrimaryGoal}
          editSecondaryGoals={editSecondaryGoals}
          setEditSecondaryGoals={setEditSecondaryGoals}
          editSleepHours={editSleepHours}
          setEditSleepHours={setEditSleepHours}
          editSleepQuality={editSleepQuality}
          setEditSleepQuality={setEditSleepQuality}
          editOnMedication={editOnMedication}
          setEditOnMedication={setEditOnMedication}
          editActivityLevel={editActivityLevel}
          setEditActivityLevel={setEditActivityLevel}
          editWeight={editWeight}
          setEditWeight={setEditWeight}
          editTargetGlucose={editTargetGlucose}
          setEditTargetGlucose={setEditTargetGlucose}
          editEmergencyContactName={editEmergencyContactName}
          setEditEmergencyContactName={setEditEmergencyContactName}
          editEmergencyContactPhone={editEmergencyContactPhone}
          setEditEmergencyContactPhone={setEditEmergencyContactPhone}
          editPrimaryHba1c={editPrimaryHba1c}
          setEditPrimaryHba1c={setEditPrimaryHba1c}
          editFastingBloodSugar={editFastingBloodSugar}
          setEditFastingBloodSugar={setEditFastingBloodSugar}
          editFears={editFears}
          setEditFears={setEditFears}
        />

        <ProfileHeroCard
          initials={initials}
          fullName={fullName}
          email={email}
          diabetesStatus={diabetesLabel(profile?.diabetesType)}
        />

        <ProfileStatsRow profile={profile} />

        <ProfileInfoCard title="Personal Info">
          <InfoRow iconName="person" iconColor="#6D28D9" label="Full Name" value={fullName} />
          <InfoRow iconName="mail" iconColor="#0284C7" label="Email" value={email} />
          <InfoRow iconName="call" iconColor="#059669" label="Phone" value={profile?.phone} />
          <InfoRow iconName="calendar" iconColor="#D97706" label="Date of Birth" value={profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : null} />
          <InfoRow iconName="location" iconColor="#DC2626" label="Location" value={profile?.location} />
        </ProfileInfoCard>

        <ProfileInfoCard title="Health Info">
          <InfoRow
            iconName="medical"
            iconColor={colors.primary}
            label="Medication Status"
            value={
              profile?.onMedication === true
                ? "On Medication"
                : profile?.onMedication === false
                ? "No Medication"
                : profile?.onMedication
            }
          />
          <InfoRow iconName="stats-chart" iconColor="#8B5CF6" label="HBA1c" value={profile?.primaryHba1c ? `${profile.primaryHba1c}` : null} action="Edit" onAction={openEdit} />
          <InfoRow iconName="moon" iconColor="#F59E0B" label="Fasting (mg/dL)" value={profile?.fastingBloodSugar ? `${profile.fastingBloodSugar} mg/dL` : null} action="Edit" onAction={openEdit} />
          <InfoRow iconName="fitness" iconColor="#0369A1" label="Activity Level" value={profile?.activityLevel} />
          <InfoRow iconName="barbell" iconColor="#065F46" label="Weight" value={profile?.weight ? `${profile.weight} kg` : null} />
          <InfoRow iconName="trending-up" iconColor="#B45309" label="Target Glucose" value={profile?.targetGlucose ? `${profile.targetGlucose} mg/dL` : null} />
        </ProfileInfoCard>

        <ProfileInfoCard title="Emergency Contact">
          <InfoRow iconName="people" iconColor="#DC2626" label="Name" value={profile?.emergencyContactName} />
          <InfoRow iconName="call" iconColor="#DC2626" label="Phone" value={profile?.emergencyContactPhone} />
        </ProfileInfoCard>

        <ProfileInfoCard title="Account">
          <InfoRow
            iconName="shield-checkmark"
            iconColor={profile?.emailVerified ? "#10B981" : "#F59E0B"}
            label="Email Verified"
            value={profile?.emailVerified ? "Verified ✓" : "Not Verified"}
            action={!profile?.emailVerified ? (sendingVerification ? "Sending…" : "Resend") : undefined}
            onAction={!profile?.emailVerified ? handleResendVerification : undefined}
          />
          <InfoRow iconName="finger-print" iconColor={colors.mutedForeground} label="User ID" value={profile?.id ? `…${profile.id.slice(-8)}` : null} />
          <InfoRow iconName="time" iconColor={colors.mutedForeground} label="Member Since" value={formatDate(profile?.createdAt)} />
          <InfoRow iconName="refresh" iconColor={colors.mutedForeground} label="Last Updated" value={formatDate(profile?.updatedAt)} />
        </ProfileInfoCard>

        <ProfilePreferencesCard
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
          isDarkMode={currentTheme === "dark"}
          onToggleDarkMode={async (val) => {
            try {
              await setTheme(val ? "dark" : "light");
            } catch (err) {
              showNotification({ type: "error", title: "Error", message: err?.message || "Failed" });
            }
          }}
        />

        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.8}
          style={[styles.signOutBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>GlycoRev v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  guardTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  guardSub: {
    fontSize: 14,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 999,
    height: 56,
  },
  signOutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "700",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
});
