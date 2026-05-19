import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Vibration,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  BG: "#F2F0E8",
  CARD: "#FFFFFF",
  PRIMARY: "#22422F",
  PRIMARY_LIGHT: "rgba(34,66,47,0.09)",
  AMBER: "#ECA143",
  MUTED: "#7A8F82",
  TEXT: "#1A2E22",
  BORDER: "#E8E4D8",
  WHITE: "#FFFFFF",
  GREEN: "#10B981",
  YELLOW: "#F59E0B",
  RED: "#EF4444",
};

// ─── Glucose status helper ────────────────────────────────────────────────────
const getStatus = (val) => {
  if (!val || isNaN(val))
    return { label: "Enter a value", color: T.MUTED, emoji: "💉", tip: null };
  const n = parseFloat(val);
  if (n < 54)
    return {
      label: "Critically Low",
      color: "#DC2626",
      emoji: "🚨",
      tip: "Seek immediate medical attention.",
    };
  if (n < 70)
    return {
      label: "Low (Hypoglycaemia)",
      color: T.RED,
      emoji: "⬇️",
      tip: "Have 15g fast-acting carbs (juice, glucose tabs) and recheck in 15 min.",
    };
  if (n <= 100)
    return {
      label: "Optimal — Fasting",
      color: T.GREEN,
      emoji: "✅",
      tip: "Great fasting level. Keep up your current habits.",
    };
  if (n <= 140)
    return {
      label: "Normal — Post-meal",
      color: T.GREEN,
      emoji: "✅",
      tip: "Good post-meal response. Your insulin sensitivity is working well.",
    };
  if (n <= 180)
    return {
      label: "Elevated",
      color: T.YELLOW,
      emoji: "⚠️",
      tip: "Slightly high. A short walk after meals can lower this quickly.",
    };
  if (n <= 250)
    return {
      label: "High (Hyperglycaemia)",
      color: T.RED,
      emoji: "🔺",
      tip: "Try water, light movement, and check again in 1 hour.",
    };
  return {
    label: "Very High — Act Now",
    color: "#DC2626",
    emoji: "🚨",
    tip: "Very elevated. Contact your care team if this persists.",
  };
};

// ─── Range gauge segments ─────────────────────────────────────────────────────
const GAUGE_SEGMENTS = [
  { label: "Low", range: "<70", color: T.RED, maxVal: 69 },
  { label: "Good", range: "70–140", color: T.GREEN, maxVal: 140 },
  { label: "High", range: "141–180", color: T.YELLOW, maxVal: 180 },
  { label: "Very High", range: ">180", color: "#EF4444", maxVal: 400 },
];

const getTiming = (period) => {
  const map = {
    Fasting: {
      icon: "weather-sunset-up",
      color: "#7C3AED",
      bg: "rgba(124,58,237,0.1)",
      desc: "8+ hrs no food",
    },
    "Pre-Meal": {
      icon: "food-off",
      color: T.AMBER,
      bg: "rgba(236,161,67,0.1)",
      desc: "Before eating",
    },
    "Post-Meal": {
      icon: "food",
      color: T.GREEN,
      bg: "rgba(16,185,129,0.1)",
      desc: "2 hrs after meal",
    },
    Bedtime: {
      icon: "weather-night",
      color: "#0284C7",
      bg: "rgba(2,132,199,0.1)",
      desc: "Before sleep",
    },
    Random: {
      icon: "clock-outline",
      color: T.MUTED,
      bg: "rgba(122,143,130,0.1)",
      desc: "Any time",
    },
  };
  return map[period] || map.Random;
};

// ─── Custom numpad ────────────────────────────────────────────────────────────
const NUMPAD_KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "⌫"],
];

const NumPad = ({ value, onChange }) => {
  const press = (key) => {
    if (key === "⌫") {
      onChange(value.slice(0, -1) || "");
      return;
    }
    if (key === "." && value.includes(".")) return;
    if (value.length >= 5) return;
    onChange(value + key);
  };

  return (
    <View style={numpadStyles.grid}>
      {NUMPAD_KEYS.map((row, ri) => (
        <View key={ri} style={numpadStyles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => press(key)}
              activeOpacity={0.65}
              style={[numpadStyles.key, key === "⌫" && numpadStyles.keyDelete]}
            >
              {key === "⌫" ? (
                <Ionicons name="backspace-outline" size={22} color={T.TEXT} />
              ) : (
                <Text style={numpadStyles.keyText}>{key}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const numpadStyles = StyleSheet.create({
  grid: { gap: 10 },
  row: { flexDirection: "row", gap: 10, justifyContent: "center" },
  key: {
    width: 90,
    height: 54,
    borderRadius: 18,
    backgroundColor: T.CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  keyDelete: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.2)",
  },
  keyText: { fontSize: 22, fontWeight: "700", color: T.TEXT },
});

// ─── Animated status pill ─────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [status.label, scale]);

  return (
    <Animated.View
      style={[
        pillStyles.pill,
        { backgroundColor: status.color + "18", transform: [{ scale }] },
      ]}
    >
      <Text style={pillStyles.emoji}>{status.emoji}</Text>
      <Text style={[pillStyles.label, { color: status.color }]}>
        {" "}
        {status.label}{" "}
      </Text>
    </Animated.View>
  );
};

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 10,
  },
  emoji: { fontSize: 16 },
  label: { fontSize: 14, fontWeight: "800" },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function GlucoseEntryScreen({ navigation }) {
  const [glucose, setGlucose] = useState("");
  const [period, setPeriod] = useState("Fasting");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const status = getStatus(glucose);
  const numVal = parseFloat(glucose) || 0;

  // Gauge fill — normalise 0–300 to 0–100%
  const gaugePct = Math.min(100, (numVal / 300) * 100);

  const handleGlucoseChange = (val) => {
    setError(null);
    setGlucose(val);
  };

  const handleSave = async () => {
    setError(null);
    const val = parseFloat(glucose);
    if (!glucose || isNaN(val) || val <= 0) {
      setError("Please enter a valid glucose reading.");
      return;
    }
    if (val > 600) {
      setError("Value seems too high. Double-check your meter reading.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "users", user.uid, "logs"), {
          type: "glucose",
          value: val,
          unit: "mg/dL",
          period,
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString(),
        });
        setSaved(true);
        if (Platform.OS !== "web") Vibration.vibrate(80);
        setTimeout(() => navigation.goBack(), 900);
      }
    } catch (err) {
      console.error("Save Error:", err);
      setError("Failed to save. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const periods = ["Fasting", "Pre-Meal", "Post-Meal", "Bedtime", "Random"];

  return (
    <SafeAreaView style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Ionicons name="chevron-down" size={22} color={T.TEXT} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaterialCommunityIcons
            name="water-percent"
            size={18}
            color={T.PRIMARY}
          />
          <Text style={styles.headerTitle}>Log Glucose</Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || saved || !glucose}
          style={[
            styles.saveBtn,
            (!glucose || saved) && styles.saveBtnDisabled,
            saved && styles.saveBtnSaved,
          ]}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={T.WHITE} />
          ) : saved ? (
            <Ionicons name="checkmark" size={18} color={T.WHITE} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Big value display ── */}
        <View style={styles.displayCard}>
          {/* Gauge bar */}
          <View style={styles.gaugeWrap}>
            <View style={styles.gaugeTrack}>
              <View
                style={[
                  styles.gaugeFill,
                  { width: `${gaugePct}%`, backgroundColor: status.color },
                ]}
              />
            </View>
            <View style={styles.gaugeLabels}>
              <Text style={styles.gaugeLabel}>0</Text>
              <Text style={styles.gaugeLabel}>70</Text>
              <Text style={styles.gaugeLabel}>140</Text>
              <Text style={styles.gaugeLabel}>180</Text>
              <Text style={styles.gaugeLabel}>300+</Text>
            </View>
          </View>

          {/* Reading */}
          <View style={styles.valueRow}>
            <Text
              style={[
                styles.valueText,
                { color: glucose ? status.color : T.BORDER },
              ]}
            >
              {glucose || "---"}
            </Text>
            <Text style={styles.unitText}>mg/dL</Text>
          </View>

          <StatusPill status={status} />

          {/* Tip */}
          {status.tip && (
            <View style={styles.tipRow}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={T.MUTED}
              />
              <Text style={styles.tipText}>{status.tip}</Text>
            </View>
          )}
        </View>

        {/* ── Timing selector ── */}
        <Text style={styles.sectionLabel}>When was this reading?</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.timingScroll}
        >
          <View style={styles.timingRow}>
            {periods.map((p) => {
              const t = getTiming(p);
              const sel = period === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPeriod(p)}
                  activeOpacity={0.8}
                  style={[
                    styles.timingCard,
                    sel && styles.timingCardActive,
                    sel && { borderColor: t.color, backgroundColor: t.bg },
                  ]}
                >
                  <View
                    style={[
                      styles.timingIconWrap,
                      { backgroundColor: sel ? t.bg : T.BG },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={t.icon}
                      size={20}
                      color={sel ? t.color : T.MUTED}
                    />
                  </View>
                  <Text style={[styles.timingLabel, sel && { color: t.color }]}>
                    {p}
                  </Text>
                  <Text style={styles.timingDesc}>{t.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* ── Range reference ── */}
        <Text style={styles.sectionLabel}>Reference ranges</Text>
        <View style={styles.rangeRow}>
          {GAUGE_SEGMENTS.map((seg) => (
            <View
              key={seg.label}
              style={[
                styles.rangeChip,
                numVal > 0 &&
                  numVal <= seg.maxVal &&
                  (seg === GAUGE_SEGMENTS[0] ||
                    numVal >
                      (GAUGE_SEGMENTS[GAUGE_SEGMENTS.indexOf(seg) - 1]
                        ?.maxVal ?? 0)) &&
                  styles.rangeChipActive,
                numVal > 0 &&
                  numVal <= seg.maxVal &&
                  (seg === GAUGE_SEGMENTS[0] ||
                    numVal >
                      (GAUGE_SEGMENTS[GAUGE_SEGMENTS.indexOf(seg) - 1]
                        ?.maxVal ?? 0)) && {
                    borderColor: seg.color,
                    backgroundColor: seg.color + "12",
                  },
              ]}
            >
              <View style={[styles.rangeDot, { backgroundColor: seg.color }]} />
              <View>
                <Text style={styles.rangeLabel}>{seg.label}</Text>
                <Text style={styles.rangeVal}>{seg.range}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Error ── */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={T.RED} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Custom numpad ── */}
        <Text style={styles.sectionLabel}>Enter reading</Text>
        <View style={styles.numpadWrap}>
          <NumPad value={glucose} onChange={handleGlucoseChange} />
        </View>

        {/* ── Quick picks ── */}
        <Text style={styles.sectionLabel}>Quick picks</Text>
        <View style={styles.quickRow}>
          {["72", "98", "110", "126", "145", "180"].map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => handleGlucoseChange(v)}
              style={[
                styles.quickChip,
                glucose === v && { backgroundColor: T.PRIMARY },
              ]}
            >
              <Text
                style={[styles.quickText, glucose === v && { color: T.WHITE }]}
              >
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Save button (bottom) ── */}
        <TouchableOpacity
          style={[
            styles.bigSaveBtn,
            (!glucose || saved) && styles.bigSaveBtnDisabled,
            saved && styles.bigSaveBtnSaved,
          ]}
          onPress={handleSave}
          disabled={loading || saved || !glucose}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={T.WHITE} />
          ) : saved ? (
            <>
              <Ionicons name="checkmark-circle" size={22} color={T.WHITE} />
              <Text style={styles.bigSaveBtnText}>Saved!</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons
                name="content-save-outline"
                size={20}
                color={T.WHITE}
              />
              <Text style={styles.bigSaveBtnText}>Save Reading</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.BG },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.BORDER,
    backgroundColor: T.BG,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.CARD,
    borderWidth: 1,
    borderColor: T.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 16, fontWeight: "800", color: T.TEXT },
  saveBtn: {
    backgroundColor: T.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: T.WHITE, fontWeight: "800", fontSize: 14 },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnSaved: { backgroundColor: T.GREEN },

  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  // Display card
  displayCard: {
    backgroundColor: T.CARD,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: T.BORDER,
    marginBottom: 24,
    alignItems: "center",
  },
  gaugeWrap: { width: "100%", marginBottom: 16 },
  gaugeTrack: {
    height: 8,
    backgroundColor: T.BORDER,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  gaugeFill: { height: "100%", borderRadius: 4, minWidth: 8 },
  gaugeLabels: { flexDirection: "row", justifyContent: "space-between" },
  gaugeLabel: { fontSize: 10, color: T.MUTED, fontWeight: "600" },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 80,
    fontWeight: "900",
    letterSpacing: -3,
    lineHeight: 88,
  },
  unitText: {
    fontSize: 18,
    fontWeight: "700",
    color: T.MUTED,
    paddingBottom: 10,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 14,
    backgroundColor: T.BG,
    padding: 12,
    borderRadius: 14,
    width: "100%",
  },
  tipText: { flex: 1, fontSize: 12, color: T.MUTED, lineHeight: 18 },

  // Timing
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: T.MUTED,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  timingScroll: { marginBottom: 24 },
  timingRow: { flexDirection: "row", gap: 10, paddingRight: 4 },
  timingCard: {
    width: 100,
    backgroundColor: T.CARD,
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: T.BORDER,
  },
  timingCardActive: {
    borderWidth: 2,
  },
  timingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  timingLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: T.TEXT,
    textAlign: "center",
  },
  timingDesc: {
    fontSize: 10,
    color: T.MUTED,
    textAlign: "center",
    lineHeight: 13,
  },

  // Range chips
  rangeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  rangeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.CARD,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.BORDER,
    flex: 1,
    minWidth: "45%",
  },
  rangeChipActive: {
    borderWidth: 2,
  },
  rangeDot: { width: 10, height: 10, borderRadius: 5 },
  rangeLabel: { fontSize: 12, fontWeight: "700", color: T.TEXT },
  rangeVal: { fontSize: 10, color: T.MUTED, fontWeight: "600" },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.08)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  errorText: { color: T.RED, fontSize: 13, fontWeight: "600", flex: 1 },

  // Numpad
  numpadWrap: { marginBottom: 24, alignItems: "center" },

  // Quick picks
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  quickChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: T.CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  quickText: { fontSize: 15, fontWeight: "700", color: T.TEXT },

  // Big save button
  bigSaveBtn: {
    backgroundColor: T.PRIMARY,
    height: 58,
    borderRadius: 29,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  bigSaveBtnText: { color: T.WHITE, fontSize: 16, fontWeight: "800" },
  bigSaveBtnDisabled: { opacity: 0.4 },
  bigSaveBtnSaved: { backgroundColor: T.GREEN },
  footerSpacer: { height: 32 },
});
