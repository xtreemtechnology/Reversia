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

export default function BodyCheckScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState(null);
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
      navigation?.goBack();
    } catch (error) {
      Alert.alert("Could not save", "Please try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

  const canSave = selectedMood !== null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#211613" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#F4EAE4" />
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
              <Ionicons name="happy-outline" size={18} color="#6A816A" />
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
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
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
              <Ionicons name="flash-outline" size={18} color="#D88939" />
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
              <Ionicons name="moon-outline" size={18} color="#E3B372" />
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
    backgroundColor: "#211613",
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
    backgroundColor: "#2D201C",
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
    color: "#F4EAE4",
  },
  headerSub: {
    fontSize: 12,
    color: "#9A8478",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#2D201C",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
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
    backgroundColor: "rgba(106,129,106,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  energyBadge: {
    backgroundColor: "rgba(216,137,57,0.15)",
  },
  sleepBadge: {
    backgroundColor: "rgba(227,179,114,0.15)",
  },
  symptomBadge: {
    backgroundColor: "rgba(206,108,96,0.15)",
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F4EAE4",
    flex: 1,
  },
  cardOptional: {
    fontSize: 11,
    color: "#9A8478",
    fontWeight: "500",
  },
  cardValueBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D88939",
    backgroundColor: "rgba(216,137,57,0.15)",
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
    backgroundColor: "#3A2A25",
    marginHorizontal: 3,
  },
  moodItemActive: {
    borderColor: "#6A816A",
    backgroundColor: "rgba(106,129,106,0.15)",
  },
  moodEmoji: {
    fontSize: 22,
  },
  moodLabel: {
    fontSize: 10,
    color: "#9A8478",
    marginTop: 4,
    fontWeight: "500",
  },
  moodLabelActive: {
    color: "#6A816A",
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
    backgroundColor: "#3A2A25",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  flexScaleBtn: {
    flex: 1,
  },
  scaleBtnActive: {
    backgroundColor: "rgba(216,137,57,0.15)",
    borderColor: "#D88939",
  },
  scaleBtnText: {
    fontSize: 12,
    color: "#9A8478",
    fontWeight: "600",
  },
  scaleBtnTextActive: {
    color: "#D88939",
    fontWeight: "700",
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  scaleLabelText: {
    fontSize: 11,
    color: "#9A8478",
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
    backgroundColor: "#3A2A25",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "rgba(206,108,96,0.15)",
    borderColor: "#CE6C60",
  },
  chipText: {
    fontSize: 13,
    color: "#9A8478",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#CE6C60",
    fontWeight: "700",
  },
  saveBtn: {
    backgroundColor: "#D88939",
    borderRadius: 20,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#3A2A25",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#211613",
  },
});
