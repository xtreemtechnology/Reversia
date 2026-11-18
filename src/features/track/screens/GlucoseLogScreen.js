// screens/track/GlucoseLogScreen.js
// Glucose blood sugar logging screen for Reversia
// Matches the Reversia design system (same tokens/patterns as SleepEntryScreen, BodyCheckScreen)

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { enqueueFailedWrite } from "../../../utils/offlineQueue";

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

// Reference ranges in mg/dL
const RANGES_MGDL = [
  { label: "Normal fasting", range: "< 100 mg/dL", color: "#10B981" },
  { label: "Pre-diabetic (fasting)", range: "100–125 mg/dL", color: "#F59E0B" },
  { label: "Diabetic (fasting)", range: "≥ 126 mg/dL", color: "#EF4444" },
  { label: "Normal after meal (2hr)", range: "< 140 mg/dL", color: "#10B981" },
  { label: "Pre-diabetic after meal", range: "140–199 mg/dL", color: "#F59E0B" },
  { label: "Diabetic after meal", range: "≥ 200 mg/dL", color: "#EF4444" },
];

function mgdlToMmol(mgdl) {
  return (mgdl / 18.0182).toFixed(1);
}
function mmolToMgdl(mmol) {
  return Math.round(mmol * 18.0182);
}

/** Returns color and category based on value and context */
function classifyReading(value, unit, context) {
  const mgdl = unit === "mmol/L" ? mmolToMgdl(parseFloat(value)) : parseFloat(value);
  if (isNaN(mgdl)) return { color: "#756D84", label: "" };
  const isFasting = context === "fasting" || context === "before_meal";
  const isAfterMeal = context === "after_meal_1h" || context === "after_meal_2h";

  if (isFasting) {
    if (mgdl < 100) return { color: "#10B981", label: "Normal" };
    if (mgdl < 126) return { color: "#F59E0B", label: "Pre-diabetic range" };
    return { color: "#EF4444", label: "High — log and monitor" };
  }
  if (isAfterMeal) {
    if (mgdl < 140) return { color: "#10B981", label: "Normal" };
    if (mgdl < 200) return { color: "#F59E0B", label: "Pre-diabetic range" };
    return { color: "#EF4444", label: "High — log and monitor" };
  }
  // Bedtime / random
  if (mgdl < 100) return { color: "#10B981", label: "Normal" };
  if (mgdl < 180) return { color: "#F59E0B", label: "Moderate" };
  return { color: "#EF4444", label: "Elevated" };
}

// ── Animated entrance helper ─────────────────────────────────────────────────

function FadeSlideIn({ delay = 0, children }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(18);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 380, easing: Easing.out(Easing.quad) }));
  }, [delay, opacity, translateY]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function GlucoseLogScreen({ navigation }) {
  const { colors } = useTheme();
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("mg/dL"); // "mg/dL" or "mmol/L"
  const [context, setContext] = useState("fasting");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const classification = classifyReading(value, unit, context);

  const displayValue = value
    ? unit === "mmol/L"
      ? value
      : value
    : "";

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
      Alert.alert("Sign in required", "Please sign in before saving glucose readings.");
      return;
    }
    const numVal = parseFloat(value);
    if (!value || isNaN(numVal) || numVal <= 0) {
      Alert.alert("Enter a value", "Please enter a valid glucose reading before saving.");
      return;
    }

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
            <Text style={[s.headerTitle, { color: colors.foreground }]}>Log Glucose</Text>
            <Text style={[s.headerSub, { color: colors.mutedForeground }]}>Record a blood sugar reading</Text>
          </View>
          <View style={s.backBtn} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Value input card */}
          <FadeSlideIn delay={40}>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Unit toggle */}
              <View style={s.unitRow}>
                <TouchableOpacity
                  style={[s.unitBtn, unit === "mg/dL" && { backgroundColor: colors.primary }]}
                  onPress={() => unit !== "mg/dL" && handleUnitToggle()}
                  activeOpacity={0.8}
                >
                  <Text style={[s.unitBtnText, { color: unit === "mg/dL" ? "#fff" : colors.mutedForeground }]}>mg/dL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.unitBtn, unit === "mmol/L" && { backgroundColor: colors.primary }]}
                  onPress={() => unit !== "mmol/L" && handleUnitToggle()}
                  activeOpacity={0.8}
                >
                  <Text style={[s.unitBtnText, { color: unit === "mmol/L" ? "#fff" : colors.mutedForeground }]}>mmol/L</Text>
                </TouchableOpacity>
              </View>

              {/* Large input */}
              <View style={s.inputRow}>
                <TextInput
                  style={[s.glucoseInput, { color: classification.color || colors.foreground }]}
                  value={displayValue}
                  onChangeText={setValue}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                  maxLength={6}
                  autoFocus
                />
                <Text style={[s.unitLabel, { color: colors.mutedForeground }]}>{unit}</Text>
              </View>

              {/* Classification badge */}
              {value && classification.label ? (
                <View style={[s.classBadge, { backgroundColor: `${classification.color}20`, borderColor: `${classification.color}40` }]}>
                  <View style={[s.classDot, { backgroundColor: classification.color }]} />
                  <Text style={[s.classText, { color: classification.color }]}>{classification.label}</Text>
                </View>
              ) : null}
            </View>
          </FadeSlideIn>

          {/* Context selector */}
          <FadeSlideIn delay={100}>
            <Text style={[s.sectionTitle, { color: colors.mutedForeground }]}>When was this reading?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.contextRow}>
              {CONTEXTS.map((ctx) => {
                const active = context === ctx.key;
                return (
                  <TouchableOpacity
                    key={ctx.key}
                    style={[s.contextPill, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}
                    onPress={() => setContext(ctx.key)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={ctx.icon} size={15} color={active ? "#fff" : colors.mutedForeground} />
                    <Text style={[s.contextText, { color: active ? "#fff" : colors.foreground }]}>{ctx.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </FadeSlideIn>

          {/* Notes */}
          <FadeSlideIn delay={160}>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[s.sectionTitle, { color: colors.mutedForeground, marginBottom: 10 }]}>Notes (optional)</Text>
              <TextInput
                style={[s.notesInput, { color: colors.foreground, borderColor: colors.border }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. After jollof rice, felt slightly dizzy..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </FadeSlideIn>

          {/* Reference ranges */}
          <FadeSlideIn delay={220}>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[s.sectionTitle, { color: colors.mutedForeground, marginBottom: 12 }]}>Reference ranges</Text>
              {RANGES_MGDL.map((r, i) => (
                <View key={i} style={[s.rangeRow, i < RANGES_MGDL.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <View style={[s.rangeDot, { backgroundColor: r.color }]} />
                  <Text style={[s.rangeLabel, { color: colors.foreground }]}>{r.label}</Text>
                  <Text style={[s.rangeVal, { color: r.color }]}>{r.range}</Text>
                </View>
              ))}
            </View>
          </FadeSlideIn>

          {/* Save button */}
          <FadeSlideIn delay={280}>
            <TouchableOpacity
              style={[s.saveBtn, { backgroundColor: colors.primary }, saving && s.saveBtnDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              <Text style={s.saveBtnText}>{saving ? "Saving..." : "Save Reading"}</Text>
            </TouchableOpacity>
          </FadeSlideIn>
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
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 60, gap: 16 },
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
  },
  unitRow: { flexDirection: "row", alignSelf: "flex-end", gap: 6, marginBottom: 16 },
  unitBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  unitBtnText: { fontSize: 13, fontWeight: "700" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  glucoseInput: {
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
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
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
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
