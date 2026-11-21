// screens/track/GlucoseLogScreen.js
// Glucose blood sugar logging screen for Reversia
// Matches the Reversia design system (same tokens/patterns as SleepEntryScreen, BodyCheckScreen)

import React, { useState, useCallback } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import { useUserProfile } from "../../../hooks/useUserProfile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { enqueueFailedWrite } from "../../../utils/offlineQueue";
import {
  classifyReading,
  toMgdl,
  mgdlToMmol,
  mmolToMgdl,
  isPlausibleMgdl,
  GLUCOSE_MIN_MGDL,
  GLUCOSE_MAX_MGDL,
} from "../../../utils/glucose";
import { T, FONTS } from "../../../theme/tokens";
import FadeIn from "../../home/components/FadeIn";

// ── Constants ─────────────────────────────────────────────────────────────────

const OFFLINE_LOGS_KEY = "@reversia_offline_logs";

const CONTEXTS = [
  { key: "fasting", label: "Fasting", icon: "moon-outline" },
  { key: "before_meal", label: "Before Meal", icon: "restaurant-outline" },
  { key: "after_meal_1h", label: "After Meal 1hr", icon: "timer-outline" },
  { key: "after_meal_2h", label: "After Meal 2hr", icon: "time-outline" },
  { key: "bedtime", label: "Bedtime", icon: "bed-outline" },
  { key: "random", label: "Random", icon: "help-circle-outline" },
];

// Reference ranges in mg/dL, for the active diagnosis branch.
// Screening (not diagnosed / pre-diabetes / prevention / unknown)
// keeps the screening labels, with "Diabetic" reworded; diagnosed
// users see their management targets instead (brief 0.1).
// Targets are proposed adult, non-pregnant defaults —
// CLINICAL REVIEW NEEDED.
function referenceRanges(diagnosis) {
  const low = [
    { label: "Dangerously low", range: "< 54 mg/dL", color: T.DANGER },
    { label: "Low", range: "54–69 mg/dL", color: T.WARNING },
  ];
  const veryHigh = {
    label: "Very high",
    range: "> 300 mg/dL",
    color: T.DANGER,
  };
  if (diagnosis === "type2") {
    return [
      ...low,
      {
        label: "Below target (fasting)",
        range: "70–79 mg/dL",
        color: T.WARNING,
      },
      { label: "In target (fasting)", range: "80–130 mg/dL", color: T.SUCCESS },
      {
        label: "In target (after meal)",
        range: "< 180 mg/dL",
        color: T.SUCCESS,
      },
      { label: "Above target", range: "≥ 180 mg/dL", color: T.WARNING },
      veryHigh,
    ];
  }
  return [
    ...low,
    { label: "Normal fasting", range: "70–99 mg/dL", color: T.SUCCESS },
    {
      label: "Pre-diabetic (fasting)",
      range: "100–125 mg/dL",
      color: T.WARNING,
    },
    {
      label: "In the diabetes range (fasting)",
      range: "≥ 126 mg/dL",
      color: T.DANGER,
    },
    {
      label: "Normal after meal (2hr)",
      range: "70–139 mg/dL",
      color: T.SUCCESS,
    },
    {
      label: "Pre-diabetic after meal",
      range: "140–199 mg/dL",
      color: T.WARNING,
    },
    {
      label: "In the diabetes range (after meal)",
      range: "≥ 200 mg/dL",
      color: T.DANGER,
    },
    veryHigh,
  ];
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function GlucoseLogScreen({ navigation }) {
  const { colors } = useTheme();
  const { userData: profile } = useUserProfile();
  // Diagnosis branch for classification: the profile's diabetesType
  // ("type2" | "prediabetes" | "prevention" | null). A missing value
  // defaults to the screening branch in classifyReading.
  const diagnosis = profile?.diabetesType ?? null;
  const emergencyContactName = profile?.emergencyContactName || "";
  const emergencyContactPhone = profile?.emergencyContactPhone || "";
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("mg/dL"); // "mg/dL" or "mmol/L"
  const [context, setContext] = useState("fasting");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const classification = classifyReading(toMgdl(value, unit), {
    context,
    diagnosis,
  });
  const ranges = referenceRanges(diagnosis);

  const displayValue = value ? (unit === "mmol/L" ? value : value) : "";

  const handleUnitToggle = useCallback(() => {
    setUnit((u) => {
      const next = u === "mg/dL" ? "mmol/L" : "mg/dL";
      // Convert current value
      if (value) {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          if (u === "mg/dL") {
            setValue(mgdlToMmol(num));
          } else {
            setValue(String(mmolToMgdl(num)));
          }
        }
      }
      return next;
    });
  }, [value]);

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert(
        "Sign in required",
        "Please sign in before saving glucose readings."
      );
      return;
    }
    const numVal = parseFloat(value);
    if (!value || isNaN(numVal)) {
      Alert.alert(
        "Enter a value",
        "Please enter a valid glucose reading before saving."
      );
      return;
    }
    // Plausibility bounds (brief 0.1): reject, never silently clamp.
    const mgdl = toMgdl(numVal, unit);
    if (mgdl === null || !isPlausibleMgdl(mgdl)) {
      Alert.alert(
        "That reading looks off",
        `Please re-check your entry. Readings should be between ${GLUCOSE_MIN_MGDL} and ${GLUCOSE_MAX_MGDL} mg/dL (about 1.1–33.3 mmol/L).`
      );
      return;
    }

    const result = classifyReading(mgdl, { context, diagnosis });

    // Urgent low: blocking alert; the reading is saved only after the
    // user acknowledges it. One-tap call to the saved emergency
    // contact, when there is one.
    if (result.level === "urgent_low") {
      const buttons = [];
      if (emergencyContactPhone) {
        buttons.push({
          text: `Call ${emergencyContactName || "emergency contact"}`,
          onPress: () => Linking.openURL(`tel:${emergencyContactPhone}`),
        });
      }
      buttons.push({
        text: "I treated it — save reading",
        onPress: () => saveReading(numVal),
      });
      buttons.push({ text: "Cancel", style: "cancel" });
      Alert.alert(
        "Dangerously low",
        "Treat now with fast-acting sugar, then recheck in 15 minutes. If you feel confused, faint, or can't swallow, get emergency help.",
        buttons
      );
      return;
    }

    // Low: same treat-and-recheck guidance, without the emergency copy.
    if (result.level === "low") {
      Alert.alert(
        "Low",
        "Treat now with fast-acting sugar, then recheck in 15 minutes.",
        [
          {
            text: "I treated it — save reading",
            onPress: () => saveReading(numVal),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    // Very high: clinician advice first; save on acknowledgement.
    // CLINICAL REVIEW NEEDED: the 300 mg/dL threshold (brief 0.1).
    if (result.level === "very_high") {
      Alert.alert(
        "Very high",
        "Contact your clinician today. Seek urgent care if you have vomiting, drowsiness, fast breathing, or fruity-smelling breath.",
        [
          { text: "OK — save reading", onPress: () => saveReading(numVal) },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    await saveReading(numVal);
  };

  const saveReading = async (numVal) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const docData = {
        category: "glucose",
        value: numVal,
        unit,
        context,
        notes: notes.trim(),
        readingTime: new Date().toISOString(),
        createdAt: serverTimestamp(),
        uid,
        date: today,
      };
      await addDoc(collection(db, "users", uid, "logs"), docData);

      // Mirror to offline cache
      try {
        const entry = { ...docData, createdAt: new Date().toISOString() };
        const existing = await AsyncStorage.getItem(OFFLINE_LOGS_KEY);
        const cached = existing ? JSON.parse(existing) : [];
        cached.push(entry);
        await AsyncStorage.setItem(OFFLINE_LOGS_KEY, JSON.stringify(cached));
      } catch (_) {}

      navigation?.goBack();
    } catch (error) {
      try {
        await enqueueFailedWrite({
          path: `users/${uid}/logs`,
          data: {
            category: "glucose",
            value: numVal,
            unit,
            context,
            notes: notes.trim(),
            readingTime: new Date().toISOString(),
            uid,
            date: new Date().toISOString().slice(0, 10),
          },
        });
        Alert.alert(
          "Saved Offline",
          "Your reading was saved on this device and will automatically sync once you are back online."
        );
        navigation?.goBack();
      } catch (_) {
        Alert.alert("Could not save", "Please try again in a moment.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={[s.backBtn, { backgroundColor: colors.card }]}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={[s.headerTitle, { color: colors.foreground }]}>
              Log Glucose
            </Text>
            <Text style={[s.headerSub, { color: colors.mutedForeground }]}>
              Record a blood sugar reading
            </Text>
          </View>
          <View style={s.backBtn} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Value input card */}
          <FadeIn delay={40}>
            <View
              style={[
                s.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {/* Unit toggle */}
              <View style={s.unitRow}>
                <TouchableOpacity
                  style={[
                    s.unitBtn,
                    unit === "mg/dL" && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => unit !== "mg/dL" && handleUnitToggle()}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      s.unitBtnText,
                      {
                        color:
                          unit === "mg/dL" ? "#fff" : colors.mutedForeground,
                      },
                    ]}
                  >
                    mg/dL
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    s.unitBtn,
                    unit === "mmol/L" && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => unit !== "mmol/L" && handleUnitToggle()}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      s.unitBtnText,
                      {
                        color:
                          unit === "mmol/L" ? "#fff" : colors.mutedForeground,
                      },
                    ]}
                  >
                    mmol/L
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Large input */}
              <View style={s.inputRow}>
                <TextInput
                  style={[
                    s.glucoseInput,
                    { color: classification.color || colors.foreground },
                  ]}
                  value={displayValue}
                  onChangeText={setValue}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                  maxLength={6}
                  autoFocus
                />
                <Text style={[s.unitLabel, { color: colors.mutedForeground }]}>
                  {unit}
                </Text>
              </View>

              {/* Classification badge */}
              {value && classification.label ? (
                <View
                  style={[
                    s.classBadge,
                    {
                      backgroundColor: `${classification.color}20`,
                      borderColor: `${classification.color}40`,
                    },
                  ]}
                >
                  <View
                    style={[
                      s.classDot,
                      { backgroundColor: classification.color },
                    ]}
                  />
                  <Text style={[s.classText, { color: classification.color }]}>
                    {classification.label}
                  </Text>
                </View>
              ) : null}
            </View>
          </FadeIn>

          {/* Context selector */}
          <FadeIn delay={100}>
            <Text style={[s.sectionTitle, { color: colors.mutedForeground }]}>
              When was this reading?
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.contextRow}
            >
              {CONTEXTS.map((ctx) => {
                const active = context === ctx.key;
                return (
                  <TouchableOpacity
                    key={ctx.key}
                    style={[
                      s.contextPill,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setContext(ctx.key)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={ctx.icon}
                      size={15}
                      color={active ? "#fff" : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        s.contextText,
                        { color: active ? "#fff" : colors.foreground },
                      ]}
                    >
                      {ctx.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </FadeIn>

          {/* Notes */}
          <FadeIn delay={160}>
            <View
              style={[
                s.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  s.sectionTitle,
                  { color: colors.mutedForeground, marginBottom: 10 },
                ]}
              >
                Notes (optional)
              </Text>
              <TextInput
                style={[
                  s.notesInput,
                  { color: colors.foreground, borderColor: colors.border },
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. After jollof rice, felt slightly dizzy..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </FadeIn>

          {/* Reference ranges */}
          <FadeIn delay={220}>
            <View
              style={[
                s.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  s.sectionTitle,
                  { color: colors.mutedForeground, marginBottom: 12 },
                ]}
              >
                {diagnosis === "type2" ? "Your targets" : "Reference ranges"}
              </Text>
              {ranges.map((r, i) => (
                <View
                  key={i}
                  style={[
                    s.rangeRow,
                    i < ranges.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={[s.rangeDot, { backgroundColor: r.color }]} />
                  <Text style={[s.rangeLabel, { color: colors.foreground }]}>
                    {r.label}
                  </Text>
                  <Text style={[s.rangeVal, { color: r.color }]}>
                    {r.range}
                  </Text>
                </View>
              ))}
            </View>
          </FadeIn>

          {/* Save button */}
          <FadeIn delay={280}>
            <TouchableOpacity
              style={[
                s.saveBtn,
                { backgroundColor: colors.primary },
                saving && s.saveBtnDisabled,
              ]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              <Text style={s.saveBtnText}>
                {saving ? "Saving..." : "Save Reading"}
              </Text>
            </TouchableOpacity>
          </FadeIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: FONTS.display, fontSize: 17, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 60, gap: 16 },
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
  },
  unitRow: {
    flexDirection: "row",
    alignSelf: "flex-end",
    gap: 6,
    marginBottom: 16,
  },
  unitBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  unitBtnText: { fontSize: 13, fontWeight: "700" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  glucoseInput: {
    fontFamily: FONTS.display,
    fontSize: 72,
    fontWeight: "800",
    lineHeight: 80,
    minWidth: 120,
  },
  unitLabel: { fontSize: 20, fontWeight: "600", marginBottom: 10 },
  classBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginTop: 16,
  },
  classDot: { width: 7, height: 7, borderRadius: 4 },
  classText: { fontSize: 13, fontWeight: "700" },
  sectionTitle: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  contextRow: { paddingVertical: 10, gap: 8 },
  contextPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  contextText: { fontSize: 13, fontWeight: "600" },
  notesInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 80,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  rangeDot: { width: 8, height: 8, borderRadius: 4 },
  rangeLabel: { flex: 1, fontSize: 13 },
  rangeVal: { fontSize: 12, fontWeight: "700" },
  saveBtn: {
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
