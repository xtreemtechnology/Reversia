import React, { useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { enqueueFailedWrite } from "../../../utils/offlineQueue";
import MoodFace from "../../../components/MoodFace";

const MOODS = [
  { key: "great", emoji: "😄", label: "Great" },
  { key: "good", emoji: "🙂", label: "Good" },
  { key: "okay", emoji: "😐", label: "Okay" },
  { key: "low", emoji: "😔", label: "Low" },
  { key: "rough", emoji: "😣", label: "Rough" },
];

const SYMPTOMS = [
  "Bloated",
  "Headache",
  "Fatigue",
  "Nausea",
  "Brain Fog",
  "Cramps",
  "Heartburn",
  "Low Energy",
];

const ENERGY_LEVELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SLEEP_HOURS = ["4", "5", "6", "7", "8", "9", "10+"];

export default function BodyCheckScreen({ navigation, route }) {
  const [selectedMood, setSelectedMood] = useState(route?.params?.initialMood || null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [energyLevel, setEnergyLevel] = useState(null);
  const [sleepHours, setSleepHours] = useState(null);
  const [saving, setSaving] = useState(false);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom]
    );
  };

  const saveCheckIn = async () => {
    const uid = auth.currentUser?.uid;

    if (!uid || !selectedMood || saving) {
      if (!uid) {
        Alert.alert(
          "Sign in required",
          "Please sign in before saving a body check."
        );
      }
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "users", uid, "logs"), {
        category: "body_check",
        type: "body_check",
        mood: selectedMood,
        symptoms: selectedSymptoms,
        energyLevel,
        sleepHours,
        source: "manual",
        createdAt: serverTimestamp(),
      });

      // Mirror to SecureStorage for offline access
      try {
        const newEntry = {
          category: "body_check",
          type: "body_check",
          mood: selectedMood,
          symptoms: selectedSymptoms,
          energyLevel,
          sleepHours,
          source: "manual",
          createdAt: new Date().toISOString(),
        };
        const existing = await AsyncStorage.getItem("@reversia_offline_logs");
        const logs = existing ? JSON.parse(existing) : [];
        logs.push(newEntry);
        await AsyncStorage.setItem("@reversia_offline_logs", JSON.stringify(logs));
      } catch (_storageError) {
        // Don't block UI on offline mirror failure
      }

      navigation?.goBack();
    } catch (error) {
      try {
        await enqueueFailedWrite({
          path: `users/${uid}/logs`,
          data: {
            category: "body_check",
            type: "body_check",
            mood: selectedMood,
            symptoms: selectedSymptoms,
            energyLevel,
            sleepHours,
            source: "manual",
            date: new Date().toISOString().slice(0, 10),
          },
        });
        Alert.alert(
          "Saved Offline",
          "Your check-in was saved locally and will sync when you are back online."
        );
        navigation?.goBack();
      } catch (_) {
        Alert.alert("Could not save", "Please try again in a moment.");
      }
    } finally {
      setSaving(false);
    }
  };

  const canSave = selectedMood !== null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F1FF" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#242033" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Body Check</Text>
          <Text style={styles.headerSub}>How are you feeling today?</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <View style={styles.cardIconBadge}>
              <Ionicons name="happy-outline" size={18} color="#8B75C8" />
            </View>
            <Text style={styles.cardLabel}>Overall Mood</Text>
          </View>
          <View style={styles.moodRow}>
            {MOODS.map((mood) => {
              const active = selectedMood === mood.key;
              return (
                <TouchableOpacity
                  key={mood.key}
                  onPress={() => setSelectedMood(mood.key)}
                  activeOpacity={0.8}
                  style={[styles.moodItem, active && styles.moodItemActive]}
                >
                  <MoodFace mood={mood.key} size={42} selected={active} />
                  <Text
                    style={[styles.moodLabel, active && styles.moodLabelActive]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <View style={[styles.cardIconBadge, styles.energyBadge]}>
              <Ionicons name="flash-outline" size={18} color="#8055E8" />
            </View>
            <Text style={styles.cardLabel}>Energy Level</Text>
            {energyLevel ? (
              <Text style={styles.cardValueBadge}>{energyLevel}/10</Text>
            ) : null}
          </View>
          <View style={styles.scaleRow}>
            {ENERGY_LEVELS.map((level) => {
              const active = energyLevel === level;
              return (
                <TouchableOpacity
                  key={level}
                  onPress={() => setEnergyLevel(level)}
                  activeOpacity={0.8}
                  style={[styles.scaleBtn, active && styles.scaleBtnActive]}
                >
                  <Text
                    style={[
                      styles.scaleBtnText,
                      active && styles.scaleBtnTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabelText}>Low</Text>
            <Text style={styles.scaleLabelText}>High</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <View style={[styles.cardIconBadge, styles.sleepBadge]}>
              <Ionicons name="moon-outline" size={18} color="#A78BFA" />
            </View>
            <Text style={styles.cardLabel}>Sleep Last Night</Text>
            {sleepHours ? (
              <Text style={styles.cardValueBadge}>{sleepHours}h</Text>
            ) : null}
          </View>
          <View style={styles.scaleRow}>
            {SLEEP_HOURS.map((hours) => {
              const active = sleepHours === hours;
              return (
                <TouchableOpacity
                  key={hours}
                  onPress={() => setSleepHours(hours)}
                  activeOpacity={0.8}
                  style={[
                    styles.scaleBtn,
                    styles.flexScaleBtn,
                    active && styles.scaleBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.scaleBtnText,
                      active && styles.scaleBtnTextActive,
                    ]}
                  >
                    {hours}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabelText}>Less</Text>
            <Text style={styles.scaleLabelText}>More</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <View style={[styles.cardIconBadge, styles.symptomBadge]}>
              <Ionicons name="medical-outline" size={18} color="#CE6C60" />
            </View>
            <Text style={styles.cardLabel}>Any Symptoms?</Text>
            <Text style={styles.cardOptional}>Optional</Text>
          </View>
          <View style={styles.chipWrap}>
            {SYMPTOMS.map((symptom) => {
              const active = selectedSymptoms.includes(symptom);
              return (
                <TouchableOpacity
                  key={symptom}
                  onPress={() => toggleSymptom(symptom)}
                  activeOpacity={0.8}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {symptom}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          disabled={!canSave || saving}
          onPress={saveCheckIn}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving..." : "Save Check-in"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1FF",
  },
  scroll: {
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#242033",
  },
  headerSub: {
    fontSize: 12,
    color: "#756D84",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E1F5",
  },
  cardLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(128,85,232,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  energyBadge: {
    backgroundColor: "rgba(128,85,232,0.14)",
  },
  sleepBadge: {
    backgroundColor: "rgba(167,139,250,0.16)",
  },
  symptomBadge: {
    backgroundColor: "rgba(206,108,96,0.15)",
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#242033",
    flex: 1,
  },
  cardOptional: {
    fontSize: 11,
    color: "#756D84",
    fontWeight: "500",
  },
  cardValueBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8055E8",
    backgroundColor: "rgba(128,85,232,0.14)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: "#F0E9FF",
    marginHorizontal: 3,
  },
  moodItemActive: {
    borderColor: "#8B75C8",
    backgroundColor: "rgba(128,85,232,0.12)",
  },
  moodEmoji: {
    fontSize: 22,
  },
  moodLabel: {
    fontSize: 10,
    color: "#756D84",
    marginTop: 4,
    fontWeight: "500",
  },
  moodLabelActive: {
    color: "#8B75C8",
    fontWeight: "700",
  },
  scaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  scaleBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0E9FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  flexScaleBtn: {
    flex: 1,
  },
  scaleBtnActive: {
    backgroundColor: "rgba(128,85,232,0.14)",
    borderColor: "#8055E8",
  },
  scaleBtnText: {
    fontSize: 12,
    color: "#756D84",
    fontWeight: "600",
  },
  scaleBtnTextActive: {
    color: "#8055E8",
    fontWeight: "700",
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  scaleLabelText: {
    fontSize: 11,
    color: "#756D84",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0E9FF",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "rgba(206,108,96,0.15)",
    borderColor: "#CE6C60",
  },
  chipText: {
    fontSize: 13,
    color: "#756D84",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#CE6C60",
    fontWeight: "700",
  },
  saveBtn: {
    backgroundColor: "#8055E8",
    borderRadius: 20,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#F0E9FF",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F5F1FF",
  },
});
