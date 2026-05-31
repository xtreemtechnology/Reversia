// screens/track/SleepEntryScreen.jsx
//
// Redesigned to match the full Reversia design system:
// — Same card/border/radius tokens as all other screens
// — PlusJakartaSans headings, DMSans body
// — Staggered entrance animations
// — Visual duration stepper + quality selector with icons
// — Consistent inputs, error banner, save button

import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
  withSpring,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import secureStorage from "../../../utils/secureStorage";
import { trackEvent } from "../../../utils/analytics";

// ── Quality options ────────────────────────────────────────────────────────────

const QUALITY_OPTIONS = [
  {
    id: "poor",
    label: "Poor",
    icon: "sad-outline",
    color: "#E28A82", // destructive
  },
  {
    id: "fair",
    label: "Fair",
    icon: "partly-sunny-outline",
    color: "#F2CC8F", // chart-4 amber
  },
  {
    id: "good",
    label: "Good",
    icon: "moon-outline",
    color: "#798C73", // secondary sage
  },
  {
    id: "excellent",
    label: "Excellent",
    icon: "star-outline",
    color: "#81B29A", // chart-5 teal
  },
];

// ── Duration stepper values ───────────────────────────────────────────────────

const HOUR_PRESETS = ["5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "10"];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatHoursLabel = (raw) => {
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return "—";
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// ── FadeSlide wrapper ─────────────────────────────────────────────────────────

function FadeSlide({ delay = 0, children }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    y.value = withDelay(
      delay,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, [delay, opacity, y]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children, colors }) {
  return (
    <Text style={[slSt.label, { color: colors.mutedForeground }]}>
      {children}
    </Text>
  );
}
const slSt = StyleSheet.create({
  label: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});

// ── Duration hero display ─────────────────────────────────────────────────────
// Large centered display of hours + stepper buttons

function DurationDisplay({ hours, onIncrement, onDecrement, colors }) {
  const scaleAnim = useSharedValue(1);

  const pulse = () => {
    scaleAnim.value = withSequence(
      withTiming(1.08, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
  };

  const handleIncrement = () => {
    pulse();
    onIncrement();
  };
  const handleDecrement = () => {
    pulse();
    onDecrement();
  };

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <View
      style={[
        ddSt.wrapper,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      {/* Decrement */}
      <TouchableOpacity
        onPress={handleDecrement}
        activeOpacity={0.7}
        style={[ddSt.stepBtn, { backgroundColor: colors.card }]}
      >
        <Ionicons name="remove" size={22} color={colors.foreground} />
      </TouchableOpacity>

      {/* Duration display */}
      <View style={ddSt.center}>
        <Animated.Text
          style={[ddSt.bigNumber, { color: colors.foreground }, textStyle]}
        >
          {hours || "—"}
        </Animated.Text>
        <Text style={[ddSt.bigUnit, { color: colors.mutedForeground }]}>
          {formatHoursLabel(hours)}
        </Text>
      </View>

      {/* Increment */}
      <TouchableOpacity
        onPress={handleIncrement}
        activeOpacity={0.7}
        style={[ddSt.stepBtn, { backgroundColor: colors.card }]}
      >
        <Ionicons name="add" size={22} color={colors.foreground} />
      </TouchableOpacity>
    </View>
  );
}

const ddSt = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  bigNumber: {
    fontSize: 52,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -2,
    lineHeight: 60,
  },
  bigUnit: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    letterSpacing: 0.2,
  },
});

// ── Preset hour chips ─────────────────────────────────────────────────────────

function HourChip({ preset, selected, onSelect, colors }) {
  const active = selected === preset;
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 70 }),
      withSpring(1, { damping: 10, stiffness: 220 })
    );
    onSelect(preset);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View key={preset} style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          hpSt.chip,
          {
            backgroundColor: active ? colors.secondary + "1A" : colors.card,
            borderColor: active ? colors.secondary : colors.border + "80",
            borderWidth: active ? 1.5 : 1,
          },
        ]}
      >
        <Text
          style={[
            hpSt.chipText,
            { color: active ? colors.secondary : colors.mutedForeground },
          ]}
        >
          {formatHoursLabel(preset)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function HourPresets({ selected, onSelect, colors }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={hpSt.row}
    >
      {HOUR_PRESETS.map((preset) => (
        <HourChip
          key={preset}
          preset={preset}
          selected={selected}
          onSelect={onSelect}
          colors={colors}
        />
      ))}
    </ScrollView>
  );
}

const hpSt = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    fontWeight: "500",
  },
});

// ── Quality selector ──────────────────────────────────────────────────────────

function QualityOption({ opt, selected, onSelect, colors }) {
  const active = selected === opt.id;
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.91, { duration: 70 }),
      withSpring(1, { damping: 10, stiffness: 220 })
    );
    onSelect(opt.id);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View key={opt.id} style={[{ flex: 1 }, animStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          qSt.card,
          {
            backgroundColor: active ? opt.color + "18" : colors.card,
            borderColor: active ? opt.color : colors.border + "80",
            borderWidth: active ? 1.5 : 1,
          },
        ]}
      >
        <View style={[qSt.iconWrap, { backgroundColor: opt.color + "22" }]}>
          <Ionicons name={opt.icon} size={18} color={opt.color} />
        </View>
        <Text
          style={[
            qSt.label,
            { color: active ? opt.color : colors.mutedForeground },
          ]}
        >
          {opt.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function QualitySelector({ selected, onSelect, colors }) {
  return (
    <View style={qSt.row}>
      {QUALITY_OPTIONS.map((opt) => (
        <QualityOption
          key={opt.id}
          opt={opt}
          selected={selected}
          onSelect={onSelect}
          colors={colors}
        />
      ))}
    </View>
  );
}

const qSt = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "capitalize",
  },
});

// ── Error banner ──────────────────────────────────────────────────────────────

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <View
      style={[
        ebSt.banner,
        { backgroundColor: "#E28A82" + "18", borderColor: "#E28A82" + "40" },
      ]}
    >
      <Ionicons name="warning-outline" size={16} color="#E28A82" />
      <Text style={ebSt.text}>{message}</Text>
    </View>
  );
}

const ebSt = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: "#E28A82",
    lineHeight: 19,
  },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SleepEntryScreen({ navigation }) {
  const { colors } = useTheme();

  const [hours, setHours] = useState("7.5");
  const [quality, setQuality] = useState("good");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const notesRef = useRef(null);

  // ── Duration stepper ────────────────────────────────────────────────────────

  const adjustHours = (delta) => {
    setHours((prev) => {
      const current = parseFloat(prev) || 0;
      const next = Math.max(
        0.5,
        Math.min(24, Math.round((current + delta) * 2) / 2)
      );
      return String(next);
    });
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const amount = parseFloat(hours);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid sleep duration.");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      setError("You need to be signed in to save sleep.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const payload = {
        category: "sleep",
        type: "sleep",
        value: amount * 60, // store as minutes for consistency
        hours: amount,
        quality,
        notes: notes.trim(),
        source: "manual",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", uid, "logs"), payload);

      // Mirror locally
      const localKey = "@reversia_guest_logs";
      const existing = await secureStorage.getItem(localKey);
      const parsed = existing ? JSON.parse(existing) : [];
      parsed.unshift({
        id: `local-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      });
      await secureStorage.setItem(
        localKey,
        JSON.stringify(parsed.slice(0, 100))
      );

      await trackEvent("sleep_logged", { userId: uid, hours: amount, quality });

      navigation.goBack();
    } catch (err) {
      setError(
        err?.message || "Could not save sleep right now. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <FadeSlide delay={0}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                style={[styles.backBtn, { backgroundColor: colors.card }]}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={colors.foreground}
                />
              </TouchableOpacity>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.preTitle, { color: colors.secondary }]}>
                  Log sleep
                </Text>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  How did{"\n"}you sleep?
                </Text>
              </View>
            </View>
          </FadeSlide>

          {/* ── Duration card ── */}
          <FadeSlide delay={80}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border + "80",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIconWrap,
                    { backgroundColor: colors.secondary + "22" },
                  ]}
                >
                  {/* solar:moon-sleep-bold-duotone → moon */}
                  <Ionicons name="moon" size={20} color={colors.secondary} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  Duration
                </Text>
              </View>

              {/* Big stepper display */}
              <DurationDisplay
                hours={hours}
                onIncrement={() => adjustHours(0.5)}
                onDecrement={() => adjustHours(-0.5)}
                colors={colors}
              />

              {/* Manual input row */}
              <View style={styles.manualRow}>
                <Text
                  style={[
                    styles.manualLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Or type exact hours
                </Text>
                <View
                  style={[
                    styles.manualInputWrap,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={hours}
                    onChangeText={(t) => {
                      setHours(t);
                      setError("");
                    }}
                    keyboardType="decimal-pad"
                    placeholder="7.5"
                    placeholderTextColor={colors.mutedForeground + "80"}
                    style={[styles.manualInput, { color: colors.foreground }]}
                    returnKeyType="done"
                  />
                  <Text
                    style={[
                      styles.manualUnit,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    hrs
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.border + "60" },
                ]}
              />

              {/* Presets */}
              <View style={{ gap: 10 }}>
                <SectionLabel colors={colors}>Quick select</SectionLabel>
                <HourPresets
                  selected={hours}
                  onSelect={(val) => {
                    setHours(val);
                    setError("");
                  }}
                  colors={colors}
                />
              </View>
            </View>
          </FadeSlide>

          {/* ── Quality card ── */}
          <FadeSlide delay={160}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border + "80",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIconWrap,
                    { backgroundColor: "#F2CC8F" + "22" },
                  ]}
                >
                  {/* solar:star-bold → star */}
                  <Ionicons name="star" size={20} color="#F2CC8F" />
                </View>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  Sleep quality
                </Text>
              </View>

              <QualitySelector
                selected={quality}
                onSelect={setQuality}
                colors={colors}
              />
            </View>
          </FadeSlide>

          {/* ── Notes card ── */}
          <FadeSlide delay={240}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border + "80",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIconWrap,
                    { backgroundColor: colors.mutedForeground + "22" },
                  ]}
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={colors.mutedForeground}
                  />
                </View>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  Notes
                  <Text
                    style={[
                      styles.optionalTag,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {" "}
                    — optional
                  </Text>
                </Text>
              </View>

              <View
                style={[
                  styles.textAreaWrap,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <TextInput
                  ref={notesRef}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Woke up during the night, felt rested, vivid dreams…"
                  placeholderTextColor={colors.mutedForeground + "80"}
                  multiline
                  textAlignVertical="top"
                  style={[styles.textArea, { color: colors.foreground }]}
                />
              </View>
            </View>
          </FadeSlide>

          {/* ── Error ── */}
          {error ? (
            <FadeSlide delay={0}>
              <ErrorBanner message={error} />
            </FadeSlide>
          ) : null}

          {/* ── Save button ── */}
          <FadeSlide delay={300}>
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
              style={[
                styles.saveBtn,
                {
                  backgroundColor: colors.secondary,
                  opacity: saving ? 0.75 : 1,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save sleep</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Duration summary beneath button */}
            {Number.isFinite(parseFloat(hours)) && parseFloat(hours) > 0 && (
              <Text
                style={[styles.summaryText, { color: colors.mutedForeground }]}
              >
                Saving {formatHoursLabel(hours)} of {quality} sleep
              </Text>
            )}
          </FadeSlide>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 52,
    gap: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    flexShrink: 0,
  },
  preTitle: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 36,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -1,
    lineHeight: 44,
  },

  // Card
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  optionalTag: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    fontWeight: "400",
  },

  // Manual input row
  manualRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  manualLabel: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
  manualInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  manualInput: {
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
    fontWeight: "500",
    width: 48,
    textAlign: "center",
  },
  manualUnit: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: 2,
  },

  // Notes
  textAreaWrap: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 110,
  },
  textArea: {
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
    lineHeight: 23,
    minHeight: 86,
  },

  // Save
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    height: 56,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  summaryText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    marginTop: 10,
  },
});
