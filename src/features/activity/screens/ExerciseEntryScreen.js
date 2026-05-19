/**
 * ExerciseEntryScreen.js — fully self-contained redesign
 * Removes: AnimatedScreen, useTheme dependencies (inlined design tokens)
 * Keeps: Firebase save, Vibration, limits constants, navigation
 */

/* eslint-disable react-native/no-inline-styles */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { limits } from "../../../constants/index";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Vibration,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { auth, db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  BG: "#F2F0E8",
  CARD: "#FFFFFF",
  PRIMARY: "#22422F",
  PRIMARY_LIGHT: "rgba(34,66,47,0.08)",
  AMBER: "#ECA143",
  AMBER_LIGHT: "rgba(236,161,67,0.10)",
  MUTED: "#7A8F82",
  TEXT: "#1A2E22",
  BORDER: "#E8E4D8",
  SAGE: "#DCE8DF",
  WHITE: "#FFFFFF",
  GREEN: "#10B981",
  RED: "#EF4444",
  BLUE: "#0284C7",
  PURPLE: "#7C3AED",
};

// ─── Activity catalogue ───────────────────────────────────────────────────────
const ACTIVITIES = [
  {
    name: "Walking",
    icon: "walk",
    color: "#059669",
    bg: "rgba(5,150,105,0.10)",
    cal: 5,
    guide:
      "A brisk 10-min walk after meals lowers post-meal glucose spikes by up to 30%.",
  },
  {
    name: "HIIT",
    icon: "lightning-bolt",
    color: T.AMBER,
    bg: T.AMBER_LIGHT,
    cal: 12,
    guide:
      "Alternate 20s max effort with 10s rest. Keeps metabolism elevated for hours after.",
  },
  {
    name: "Cycling",
    icon: "bike",
    color: T.BLUE,
    bg: "rgba(2,132,199,0.10)",
    cal: 9,
    guide:
      "Low-impact and great for sustained fat burning. Works large muscle groups safely.",
  },
  {
    name: "Squats",
    icon: "human-handsup",
    color: "#DC2626",
    bg: "rgba(220,38,38,0.10)",
    cal: 8,
    guide:
      "Feet shoulder-width, lower until thighs are parallel. Leg muscles are your largest glucose sinks.",
  },
  {
    name: "Yoga",
    icon: "yoga",
    color: T.PURPLE,
    bg: "rgba(124,58,237,0.10)",
    cal: 4,
    guide:
      "Focus on deep breathing between poses. Reduces cortisol, which directly stabilises blood sugar.",
  },
  {
    name: "Pushups",
    icon: "arm-flex",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.10)",
    cal: 7,
    guide:
      "Keep a straight line from head to heel. Building upper-body muscle mass stores more glucose.",
  },
  {
    name: "Plank",
    icon: "human-handsdown",
    color: T.BLUE,
    bg: "rgba(2,132,199,0.10)",
    cal: 4,
    guide:
      "Keep hips level, core tight, breathe steadily. Core stability improves insulin sensitivity.",
  },
  {
    name: "Stretching",
    icon: "human-stretching",
    color: T.GREEN,
    bg: "rgba(16,185,129,0.10)",
    cal: 3,
    guide:
      "Hold each stretch 20–30 seconds. Perfect for cooling down after a meal.",
  },
];

// ─── Quick-select duration presets ───────────────────────────────────────────
const DURATION_PRESETS = [5, 10, 15, 20, 30, 45];

// ─── Format seconds → MM:SS ──────────────────────────────────────────────────
const fmt = (secs) => {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// ─── Circular timer ring ──────────────────────────────────────────────────────
const TimerRing = ({ elapsed, target, size = 220 }) => {
  const STROKE = 12;
  const R = (size - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const pct = Math.min(elapsed / target, 1);
  const dash = pct * CIRC;
  const ringColor = pct < 0.6 ? T.GREEN : pct < 1 ? T.AMBER : T.RED;

  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={ringColor} stopOpacity="1" />
          <Stop offset="1" stopColor={ringColor} stopOpacity="0.6" />
        </LinearGradient>
      </Defs>
      {/* Track */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={R}
        stroke={T.BORDER}
        strokeWidth={STROKE}
        fill="none"
      />
      {/* Fill */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={R}
        stroke="url(#ringGrad)"
        strokeWidth={STROKE}
        fill="none"
        strokeDasharray={`${dash} ${CIRC}`}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2},${size / 2}`}
      />
    </Svg>
  );
};

// ─── Pulsing record indicator ─────────────────────────────────────────────────
const PulsingDot = ({ color }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.4,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    return () => pulse.stopAnimation();
  }, [pulse]);
  return (
    <Animated.View
      style={[
        pulseStyles.dot,
        { backgroundColor: color, transform: [{ scale: pulse }] },
      ]}
    />
  );
};
const pulseStyles = StyleSheet.create({
  dot: { width: 10, height: 10, borderRadius: 5 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ExerciseEntryScreen({ navigation }) {
  const { width: sw } = useWindowDimensions();
  // 4-column on wide, 4-column on narrow (2 visible at once via wrapping)

  // ── State ──
  const [selectedName, setSelectedName] = useState("Walking");
  const [plannedMins, setPlannedMins] = useState(15);
  const [mode, setMode] = useState("setup"); // setup | active | paused | done
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const activity =
    ACTIVITIES.find((a) => a.name === selectedName) || ACTIVITIES[0];
  const targetSecs = plannedMins * 60;
  const estCalories = Math.round(activity.cal * (elapsed / 60));
  const overTarget = elapsed > targetSecs;
  const ringColor = overTarget
    ? T.RED
    : elapsed / targetSecs > 0.6
    ? T.AMBER
    : T.GREEN;

  // ── Timer controls ──
  const startTimer = useCallback(() => {
    setMode("active");
    setElapsed(0);
  }, []);
  const pauseTimer = useCallback(() => setMode("paused"), []);
  const resumeTimer = useCallback(() => setMode("active"), []);
  const stopTimer = useCallback(() => {
    setMode("done");
    clearInterval(intervalRef.current);
    Vibration.vibrate([0, 80, 60, 80]);
  }, []);
  const resetTimer = useCallback(() => {
    setMode("setup");
    setElapsed(0);
    setError(null);
    setSaved(false);
  }, []);

  useEffect(() => {
    if (mode === "active") {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 === targetSecs) Vibration.vibrate(200);
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [mode, targetSecs]);

  // ── Save ──
  const handleSave = async () => {
    const durationToSave =
      mode === "done" || mode === "active" || mode === "paused"
        ? Math.max(1, Math.round(elapsed / 60))
        : plannedMins;

    setError(null);
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Please log in first.");
        return;
      }
      await addDoc(collection(db, "users", user.uid, "logs"), {
        type: "exercise",
        value: durationToSave,
        activity: selectedName,
        period: `${durationToSave} min`,
        calories: Math.round(activity.cal * durationToSave),
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });
      setSaved(true);
      Vibration.vibrate(80);
      setTimeout(() => navigation.goBack(), 800);
    } catch (err) {
      console.error("Exercise Save Error:", err);
      setError("Could not save your workout. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SETUP VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  const renderSetup = () => (
    <>
      {/* ── Activity grid ── */}
      <Text style={styles.sectionLabel}>Choose Workout</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.activityScroll}
      >
        <View style={styles.activityRow}>
          {ACTIVITIES.map((item) => {
            const sel = selectedName === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => setSelectedName(item.name)}
                activeOpacity={0.8}
                style={[
                  styles.activityChip,
                  sel && {
                    backgroundColor: item.color,
                    borderColor: item.color,
                  },
                ]}
              >
                <View
                  style={[
                    styles.activityChipIcon,
                    {
                      backgroundColor: sel ? "rgba(255,255,255,0.22)" : item.bg,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={20}
                    color={sel ? T.WHITE : item.color}
                  />
                </View>
                <Text
                  style={[styles.activityChipLabel, sel && { color: T.WHITE }]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Selected activity hero ── */}
      <View style={[styles.activityHero, { borderLeftColor: activity.color }]}>
        <View
          style={[styles.activityHeroIcon, { backgroundColor: activity.bg }]}
        >
          <MaterialCommunityIcons
            name={activity.icon}
            size={32}
            color={activity.color}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.activityHeroName}>{activity.name}</Text>
          <Text style={styles.activityHeroGuide}>{activity.guide}</Text>
          <View style={styles.activityHeroMeta}>
            <MaterialCommunityIcons name="fire" size={13} color={T.AMBER} />
            <Text style={styles.activityHeroMetaText}>
              ~{activity.cal} kcal/min
            </Text>
          </View>
        </View>
      </View>

      {/* ── Duration ── */}
      <Text style={styles.sectionLabel}>Target Duration</Text>

      {/* Preset chips */}
      <View style={styles.presetRow}>
        {DURATION_PRESETS.map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setPlannedMins(d)}
            style={[
              styles.presetChip,
              plannedMins === d && {
                backgroundColor: T.PRIMARY,
                borderColor: T.PRIMARY,
              },
            ]}
          >
            <Text
              style={[
                styles.presetChipText,
                plannedMins === d && { color: T.WHITE },
              ]}
            >
              {d}m
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fine-tune adjuster */}
      <View style={styles.durationCard}>
        <TouchableOpacity
          style={styles.adjBtn}
          onPress={() =>
            setPlannedMins((p) =>
              Math.max(limits?.minExerciseDuration ?? 5, p - 1)
            )
          }
        >
          <Ionicons name="remove" size={22} color={T.TEXT} />
        </TouchableOpacity>
        <View style={styles.durationCenter}>
          <Text style={styles.durationBig}>{plannedMins}</Text>
          <Text style={styles.durationSub}>minutes</Text>
          <Text style={styles.durationEst}>
            ~{Math.round(activity.cal * plannedMins)} kcal est.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.adjBtn, styles.adjBtnPlus]}
          onPress={() =>
            setPlannedMins((p) =>
              Math.min(limits?.maxExerciseDuration ?? 120, p + 1)
            )
          }
        >
          <Ionicons name="add" size={22} color={T.WHITE} />
        </TouchableOpacity>
      </View>

      {/* ── Science tip ── */}
      <View style={styles.scienceCard}>
        <View style={styles.scienceIconWrap}>
          <MaterialCommunityIcons name="molecule" size={20} color={T.PRIMARY} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.scienceTitle}>Why it works</Text>
          <Text style={styles.scienceBody}>
            Engaging large muscle groups (walking, squats, cycling) is the
            fastest way to pull excess glucose from your bloodstream.
          </Text>
        </View>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color={T.RED} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ── Start timer ── */}
      <TouchableOpacity
        style={styles.startBtn}
        onPress={startTimer}
        activeOpacity={0.85}
      >
        <Ionicons name="play" size={20} color={T.WHITE} />
        <Text style={styles.startBtnText}>Start Timer</Text>
      </TouchableOpacity>

      {/* ── Quick save (no timer) ── */}
      <TouchableOpacity
        style={[styles.skipBtn, (loading || saved) && { opacity: 0.4 }]}
        onPress={handleSave}
        disabled={loading || saved}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={T.PRIMARY} />
        ) : saved ? (
          <>
            <Ionicons name="checkmark-circle" size={16} color={T.GREEN} />
            <Text style={[styles.skipBtnText, { color: T.GREEN }]}>Saved!</Text>
          </>
        ) : (
          <Text style={styles.skipBtnText}>
            Log {plannedMins} min without timer
          </Text>
        )}
      </TouchableOpacity>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TIMER VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  const renderTimer = () => {
    const ringSize = Math.min(sw - 80, 240);

    return (
      <View style={styles.timerSection}>
        {/* Activity badge */}
        <View
          style={[styles.timerActivityBadge, { backgroundColor: activity.bg }]}
        >
          <MaterialCommunityIcons
            name={activity.icon}
            size={16}
            color={activity.color}
          />
          <Text style={[styles.timerActivityLabel, { color: activity.color }]}>
            {activity.name}
          </Text>
          {mode === "active" && <PulsingDot color={activity.color} />}
        </View>

        {/* Ring */}
        <View style={[styles.ringWrap, { width: ringSize, height: ringSize }]}>
          <TimerRing elapsed={elapsed} target={targetSecs} size={ringSize} />
          <View style={styles.ringCenter}>
            <Text style={[styles.timerDigits, overTarget && { color: T.RED }]}>
              {fmt(elapsed)}
            </Text>
            <Text style={styles.timerSub}>
              {mode === "done"
                ? "Workout complete 🎉"
                : overTarget
                ? "Over target +"
                : `of ${fmt(targetSecs)}`}
            </Text>
            {mode === "active" && (
              <Text style={[styles.timerStatus, { color: ringColor }]}>
                {overTarget ? "Keep going!" : "In progress"}
              </Text>
            )}
          </View>
        </View>

        {/* Stat row */}
        <View style={styles.timerStats}>
          {[
            {
              icon: "fire",
              color: T.AMBER,
              val: `${estCalories}`,
              unit: "kcal",
            },
            {
              icon: "timer-outline",
              color: T.PRIMARY,
              val: `${Math.round(elapsed / 60)}`,
              unit: "min",
            },
            {
              icon: "heart-pulse",
              color: T.RED,
              val:
                mode === "active"
                  ? "Active"
                  : mode === "done"
                  ? "Done"
                  : "Paused",
              unit: "",
            },
          ].map((s, i) => (
            <View key={i} style={styles.timerStatPill}>
              <MaterialCommunityIcons name={s.icon} size={16} color={s.color} />
              <Text style={styles.timerStatVal}>{s.val}</Text>
              {s.unit ? (
                <Text style={styles.timerStatUnit}>{s.unit}</Text>
              ) : null}
            </View>
          ))}
        </View>

        {/* Controls */}
        <View style={styles.timerControls}>
          {mode === "active" && (
            <>
              <TouchableOpacity
                style={styles.ctrlSecondary}
                onPress={pauseTimer}
              >
                <Ionicons name="pause" size={22} color={T.TEXT} />
                <Text style={styles.ctrlSecondaryText}>Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ctrlPrimary, { backgroundColor: T.RED }]}
                onPress={stopTimer}
              >
                <Ionicons name="stop" size={22} color={T.WHITE} />
                <Text style={styles.ctrlPrimaryText}>Finish</Text>
              </TouchableOpacity>
            </>
          )}
          {mode === "paused" && (
            <>
              <TouchableOpacity
                style={styles.ctrlSecondary}
                onPress={resetTimer}
              >
                <Ionicons name="refresh" size={22} color={T.TEXT} />
                <Text style={styles.ctrlSecondaryText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ctrlPrimary, { backgroundColor: T.PRIMARY }]}
                onPress={resumeTimer}
              >
                <Ionicons name="play" size={22} color={T.WHITE} />
                <Text style={styles.ctrlPrimaryText}>Resume</Text>
              </TouchableOpacity>
            </>
          )}
          {mode === "done" && (
            <>
              <TouchableOpacity
                style={styles.ctrlSecondary}
                onPress={resetTimer}
              >
                <Ionicons name="refresh" size={22} color={T.TEXT} />
                <Text style={styles.ctrlSecondaryText}>Redo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ctrlPrimary,
                  { backgroundColor: saved ? T.GREEN : T.PRIMARY },
                  (loading || saved) && { opacity: saved ? 1 : 0.7 },
                ]}
                onPress={handleSave}
                disabled={loading || saved}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={T.WHITE} />
                ) : saved ? (
                  <Ionicons name="checkmark" size={22} color={T.WHITE} />
                ) : (
                  <Ionicons
                    name="content-save-outline"
                    size={22}
                    color={T.WHITE}
                  />
                )}
                <Text style={styles.ctrlPrimaryText}>
                  {loading ? "Saving…" : saved ? "Saved!" : "Save"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Workout summary card (done only) */}
        {mode === "done" && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Workout Summary</Text>
            <View style={styles.summaryRow}>
              {[
                { label: "Duration", val: `${Math.round(elapsed / 60)} min` },
                { label: "Est. Burn", val: `${estCalories} kcal` },
                { label: "Activity", val: selectedName },
              ].map((s) => (
                <View key={s.label} style={styles.summaryBox}>
                  <Text style={styles.summaryVal}>{s.val}</Text>
                  <Text style={styles.summaryLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={T.RED} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              if (mode === "active" || mode === "paused") stopTimer();
              else navigation.goBack();
            }}
          >
            <Ionicons
              name={
                mode === "active" || mode === "paused"
                  ? "stop-circle-outline"
                  : "chevron-down"
              }
              size={22}
              color={T.TEXT}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <MaterialCommunityIcons
              name={activity.icon}
              size={18}
              color={T.PRIMARY}
            />
            <Text style={styles.headerTitle}>
              {mode === "setup"
                ? "Log Workout"
                : mode === "done"
                ? "Workout Done 🎉"
                : `${selectedName}`}
            </Text>
          </View>

          {mode === "setup" || mode === "done" ? (
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (loading || saved) && { opacity: 0.5 },
                saved && { backgroundColor: T.GREEN },
              ]}
              onPress={handleSave}
              disabled={loading || saved}
            >
              {loading ? (
                <ActivityIndicator size="small" color={T.WHITE} />
              ) : saved ? (
                <Ionicons name="checkmark" size={16} color={T.WHITE} />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={{ width: 64 }} />
          )}
        </View>

        {/* ── Content ── */}
        {mode === "setup" ? renderSetup() : renderTimer()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.BG },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: T.WHITE, fontWeight: "800", fontSize: 14 },

  // Section label
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: T.MUTED,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  // Activity selector (horizontal scroll)
  activityScroll: { marginBottom: 16 },
  activityRow: { flexDirection: "row", gap: 10, paddingRight: 4 },
  activityChip: {
    alignItems: "center",
    gap: 8,
    backgroundColor: T.CARD,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: T.BORDER,
    minWidth: 80,
  },
  activityChipIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  activityChipLabel: { fontSize: 11, fontWeight: "800", color: T.TEXT },

  // Activity hero card
  activityHero: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: T.CARD,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: T.BORDER,
    borderLeftWidth: 4,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  activityHeroIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  activityHeroName: {
    fontSize: 16,
    fontWeight: "800",
    color: T.TEXT,
    marginBottom: 4,
  },
  activityHeroGuide: {
    fontSize: 13,
    color: T.MUTED,
    lineHeight: 19,
    marginBottom: 8,
  },
  activityHeroMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  activityHeroMetaText: { fontSize: 12, fontWeight: "700", color: T.AMBER },

  // Duration presets
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: T.CARD,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: T.BORDER,
  },
  presetChipText: { fontSize: 13, fontWeight: "800", color: T.TEXT },

  // Duration adjuster
  durationCard: {
    backgroundColor: T.CARD,
    borderRadius: 24,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  adjBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: T.BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  adjBtnPlus: { backgroundColor: T.PRIMARY, borderColor: T.PRIMARY },
  durationCenter: { alignItems: "center" },
  durationBig: {
    fontSize: 60,
    fontWeight: "900",
    color: T.TEXT,
    letterSpacing: -2,
    lineHeight: 64,
  },
  durationSub: {
    fontSize: 14,
    color: T.MUTED,
    fontWeight: "600",
    marginTop: -4,
  },
  durationEst: {
    fontSize: 12,
    color: T.AMBER,
    fontWeight: "700",
    marginTop: 4,
  },

  // Science card
  scienceCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: T.SAGE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  scienceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: T.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  scienceTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: T.PRIMARY,
    marginBottom: 4,
  },
  scienceBody: { fontSize: 13, color: T.MUTED, lineHeight: 19 },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  errorText: { color: T.RED, fontSize: 13, fontWeight: "600", flex: 1 },

  // Start / skip
  startBtn: {
    backgroundColor: T.PRIMARY,
    height: 58,
    borderRadius: 29,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  startBtnText: { color: T.WHITE, fontSize: 16, fontWeight: "800" },
  skipBtn: {
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: T.BORDER,
    backgroundColor: T.CARD,
  },
  skipBtnText: { color: T.PRIMARY, fontWeight: "700", fontSize: 14 },

  // ── Timer ──
  timerSection: { alignItems: "center", paddingTop: 8 },
  timerActivityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginBottom: 24,
    alignSelf: "center",
  },
  timerActivityLabel: { fontSize: 13, fontWeight: "800" },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    position: "relative",
    marginBottom: 28,
  },
  ringCenter: { alignItems: "center" },
  timerDigits: {
    fontSize: 58,
    fontWeight: "900",
    color: T.TEXT,
    letterSpacing: -2,
    textAlign: "center",
    lineHeight: 62,
  },
  timerSub: {
    fontSize: 14,
    color: T.MUTED,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  timerStatus: { fontSize: 12, fontWeight: "800", marginTop: 6 },
  timerStats: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
    justifyContent: "center",
  },
  timerStatPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.CARD,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  timerStatVal: { fontSize: 14, fontWeight: "800", color: T.TEXT },
  timerStatUnit: { fontSize: 11, color: T.MUTED, fontWeight: "600" },
  timerControls: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 20,
  },
  ctrlPrimary: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctrlPrimaryText: { color: T.WHITE, fontSize: 15, fontWeight: "800" },
  ctrlSecondary: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.CARD,
    borderWidth: 1.5,
    borderColor: T.BORDER,
  },
  ctrlSecondaryText: { fontSize: 15, fontWeight: "700", color: T.TEXT },

  // Summary card
  summaryCard: {
    backgroundColor: T.CARD,
    borderRadius: 22,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: T.BORDER,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: T.TEXT,
    marginBottom: 14,
    textAlign: "center",
  },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryBox: {
    flex: 1,
    backgroundColor: T.BG,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  summaryVal: {
    fontSize: 15,
    fontWeight: "800",
    color: T.TEXT,
    marginBottom: 4,
  },
  summaryLabel: { fontSize: 11, color: T.MUTED, fontWeight: "600" },
});
