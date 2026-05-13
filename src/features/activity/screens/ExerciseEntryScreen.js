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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import AnimatedScreen from "../../../components/AnimatedScreen";
import { useTheme } from "../../../theme/ThemeProvider";
import { auth, db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// ─── Constants ────────────────────────────────────────────────────────────────
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#F3E8FF";
const PURPLE_MID = "#EDE9FE";
const GREEN = "#10B981";
const AMBER = "#F59E0B";
const RED = "#EF4444";

// ─── Activity definitions ─────────────────────────────────────────────────────
const ACTIVITIES = [
  {
    name: "HIIT",
    icon: "lightning-bolt",
    color: "#F59E0B",
    bg: "#FEF3C7",
    guide:
      "Alternate 20s max effort with 10s rest. High intensity keeps your metabolism elevated for hours after.",
    calories: 12, // kcal per min estimate
  },
  {
    name: "Stretching",
    icon: "human-stretching",
    color: "#10B981",
    bg: "#D1FAE5",
    guide:
      "Hold each stretch 20–30 seconds. Perfect for flexibility and cooling down after a meal.",
    calories: 3,
  },
  {
    name: "Plank",
    icon: "human-handsdown",
    color: "#0284C7",
    bg: "#E0F2FE",
    guide:
      "Keep hips level, core tight, breathe steadily. Core stability directly improves insulin sensitivity.",
    calories: 4,
  },
  {
    name: "Pushups",
    icon: "arm-flex",
    color: "#7C3AED",
    bg: "#EDE9FE",
    guide:
      "Keep a straight line from head to heel. Building upper-body muscle mass stores more glucose.",
    calories: 7,
  },
  {
    name: "Squats",
    icon: "human-handsup",
    color: "#DC2626",
    bg: "#FEE2E2",
    guide:
      "Feet shoulder-width, lower until thighs are parallel. Leg muscles are your largest glucose sinks.",
    calories: 8,
  },
  {
    name: "Yoga",
    icon: "yoga",
    color: "#7C3AED",
    bg: "#F3E8FF",
    guide:
      "Focus on deep breathing between poses. Reduces cortisol, which directly stabilises blood sugar.",
    calories: 4,
  },
  {
    name: "Walking",
    icon: "walk",
    color: "#059669",
    bg: "#D1FAE5",
    guide:
      "A brisk 10-min walk after meals lowers post-meal glucose spikes by up to 30%.",
    calories: 5,
  },
  {
    name: "Cycling",
    icon: "bike",
    color: "#0369A1",
    bg: "#E0F2FE",
    guide:
      "Low-impact and great for sustained fat burning. Keeps joints safe while working large muscle groups.",
    calories: 9,
  },
];

// ─── Animated ring for timer ──────────────────────────────────────────────────
const TimerRing = ({ elapsed, target, size = 200, trackColor = "#E5E7EB" }) => {
  const STROKE = 10;
  const R = (size - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const pct = Math.min(elapsed / target, 1);
  const dash = pct * CIRC;

  // colour shifts from green → amber → red as you exceed target
  const ringColor = pct < 0.75 ? GREEN : pct < 1 ? AMBER : RED;

  return (
    <Svg width={size} height={size} style={timerRingStyles.ringSvg}>
      {/* Track */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={R}
        stroke={trackColor}
        strokeWidth={STROKE}
        fill="none"
      />
      {/* Progress */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={R}
        stroke={ringColor}
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

const timerRingStyles = StyleSheet.create({
  ringSvg: { position: "absolute" },
});

// ─── Format seconds → MM:SS ──────────────────────────────────────────────────
const fmt = (secs) => {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ExerciseEntryScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const styles = getStyles(colors, isDark);
  const BGX = colors.background;
  const CARDX = colors.card;
  const BORDERX = colors.border;
  const TEXTX = colors.text;
  const MUTEDX = colors.muted;
  const PRIMARYX = colors.primary;
  const SCI_BG = isDark ? "rgba(139,92,246,0.18)" : PURPLE_LIGHT;
  const SCI_ICON_BG = isDark ? "rgba(139,92,246,0.28)" : PURPLE_MID;
  const { width: sw } = useWindowDimensions();
  const isNarrow = sw < 430;
  const pad = 20;
  const cardW = isNarrow
    ? Math.floor((sw - pad * 2 - 10) / 2)
    : Math.floor((sw - pad * 2 - 20) / 4);

  // ── Selection state ──
  const [selectedName, setSelectedName] = useState("HIIT");
  const [plannedMins, setPlannedMins] = useState(15);
  const activity = ACTIVITIES.find((a) => a.name === selectedName);

  // ── Timer state ──
  // mode: 'setup' | 'active' | 'paused' | 'done'
  const [mode, setMode] = useState("setup");
  const [elapsed, setElapsed] = useState(0); // seconds elapsed
  const intervalRef = useRef(null);

  // ── Save state ──
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Derived
  const targetSecs = plannedMins * 60;
  const estCalories = Math.round((activity?.calories ?? 6) * (elapsed / 60));
  const overTarget = elapsed > targetSecs;

  // ── Timer controls ──
  const startTimer = useCallback(() => {
    setMode("active");
    setElapsed(0);
  }, []);

  const pauseTimer = useCallback(() => {
    setMode("paused");
  }, []);

  const resumeTimer = useCallback(() => {
    setMode("active");
  }, []);

  const stopTimer = useCallback(() => {
    setMode("done");
    clearInterval(intervalRef.current);
    Vibration.vibrate([0, 80, 60, 80]);
  }, []);

  const resetTimer = useCallback(() => {
    setMode("setup");
    setElapsed(0);
    setMessage(null);
  }, []);

  useEffect(() => {
    if (mode === "active") {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          // gentle vibration at target
          if (prev + 1 === targetSecs) {
            Vibration.vibrate(200);
          }
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

    setMessage(null);
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("Please log in first.");
        return;
      }

      await addDoc(collection(db, "users", user.uid, "logs"), {
        type: "exercise",
        value: durationToSave, // numeric minutes for HomeScreen stats
        activity: selectedName,
        period: `${durationToSave} min`,
        calories: Math.round((activity?.calories ?? 6) * durationToSave),
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });

      navigation.goBack();
    } catch (err) {
      console.error("Exercise Save Error:", err);
      setMessage("Could not save your workout. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Timer view ─────────────────────────────────────────────────────────────
  const renderTimer = () => {
    const ringSize = Math.min(sw - 80, 220);
    return (
      <View style={styles.timerSection}>
        {/* Ring + digits */}
        <View style={[styles.ringWrap, { width: ringSize, height: ringSize }]}>
          <TimerRing
            elapsed={elapsed}
            target={targetSecs}
            size={ringSize}
            trackColor={BORDERX}
          />
          <View style={styles.centerColumn}>
            <Text
              style={[
                styles.timerDigits,
                { color: TEXTX },
                overTarget && { color: RED },
              ]}
            >
              {fmt(elapsed)}
            </Text>
            <Text style={[styles.timerSub, { color: MUTEDX }]}>
              {mode === "done"
                ? "Workout complete 🎉"
                : overTarget
                ? "Over target"
                : `of ${fmt(targetSecs)}`}
            </Text>
          </View>
        </View>

        {/* Stat pills */}
        <View style={styles.statRow}>
          <View
            style={[
              styles.statPill,
              { backgroundColor: CARDX, borderColor: BORDERX },
            ]}
          >
            <MaterialCommunityIcons name="fire" size={16} color={AMBER} />
            <Text style={[styles.statValue, { color: TEXTX }]}>
              {estCalories}
            </Text>
            <Text style={[styles.statLabel, { color: MUTEDX }]}>kcal</Text>
          </View>
          <View
            style={[
              styles.statPill,
              { backgroundColor: activity?.bg || PURPLE_MID },
            ]}
          >
            <MaterialCommunityIcons
              name={activity?.icon || "lightning-bolt"}
              size={16}
              color={activity?.color || PURPLE}
            />
            <Text
              style={[styles.statValue, { color: activity?.color || PURPLE }]}
            >
              {selectedName}
            </Text>
          </View>
          <View
            style={[
              styles.statPill,
              { backgroundColor: CARDX, borderColor: BORDERX },
            ]}
          >
            <Ionicons name="time-outline" size={16} color={BLUE} />
            <Text style={[styles.statValue, { color: TEXTX }]}>
              {Math.round(elapsed / 60)}
            </Text>
            <Text style={[styles.statLabel, { color: MUTEDX }]}>min</Text>
          </View>
        </View>

        {/* Timer controls */}
        <View style={styles.timerControls}>
          {mode === "active" && (
            <>
              <TouchableOpacity
                style={[
                  styles.ctrlBtnSecondary,
                  { backgroundColor: CARDX, borderColor: BORDERX },
                ]}
                onPress={pauseTimer}
              >
                <Ionicons name="pause" size={22} color={TEXTX} />
                <Text style={[styles.ctrlLabel, { color: TEXTX }]}>Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ctrlBtnPrimary, { backgroundColor: RED }]}
                onPress={stopTimer}
              >
                <Ionicons name="stop" size={22} color="#FFF" />
                <Text style={styles.ctrlLabelLight}>Stop</Text>
              </TouchableOpacity>
            </>
          )}
          {mode === "paused" && (
            <>
              <TouchableOpacity
                style={[
                  styles.ctrlBtnSecondary,
                  { backgroundColor: CARDX, borderColor: BORDERX },
                ]}
                onPress={resetTimer}
              >
                <Ionicons name="refresh" size={22} color={TEXTX} />
                <Text style={[styles.ctrlLabel, { color: TEXTX }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ctrlBtnPrimary,
                  { backgroundColor: PRIMARYX, shadowColor: PRIMARYX },
                ]}
                onPress={resumeTimer}
              >
                <Ionicons name="play" size={22} color="#FFF" />
                <Text style={styles.ctrlLabelLight}>Resume</Text>
              </TouchableOpacity>
            </>
          )}
          {mode === "done" && (
            <>
              <TouchableOpacity
                style={[
                  styles.ctrlBtnSecondary,
                  { backgroundColor: CARDX, borderColor: BORDERX },
                ]}
                onPress={resetTimer}
              >
                <Ionicons name="refresh" size={22} color={TEXTX} />
                <Text style={[styles.ctrlLabel, { color: TEXTX }]}>Redo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ctrlBtnPrimary,
                  { backgroundColor: PRIMARYX, shadowColor: PRIMARYX },
                  loading && styles.dimHeavy,
                ]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="checkmark" size={22} color="#FFF" />
                )}
                <Text style={styles.ctrlLabelLight}>
                  {loading ? "Saving…" : "Save"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {message && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
      </View>
    );
  };

  // ─── Setup view (before timer starts) ───────────────────────────────────────
  const renderSetup = () => (
    <>
      {/* Activity grid */}
      <Text style={[styles.sectionLabel, { color: MUTEDX }]}>
        Choose Workout
      </Text>
      <View style={styles.activityGrid}>
        {ACTIVITIES.map((item) => {
          const active = selectedName === item.name;
          const cardStyle = {
            width: cardW,
            borderColor: active ? item.color : BORDERX,
            backgroundColor: active ? item.color : CARDX,
          };
          const iconWrapStyle = {
            backgroundColor: active ? "rgba(255,255,255,0.22)" : item.bg,
          };
          const nameTextStyle = { color: active ? "#FFF" : TEXTX };
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.activityCard, cardStyle, active && cardStyle]}
              onPress={() => setSelectedName(item.name)}
              activeOpacity={0.75}
            >
              <View style={[styles.activityIconWrap, iconWrapStyle]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={24}
                  color={active ? "#FFF" : item.color}
                />
              </View>
              <Text style={[styles.activityName, nameTextStyle]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Duration picker */}
      <Text style={[styles.sectionLabel, { color: MUTEDX }]}>
        Target Duration
      </Text>
      <View
        style={[
          styles.durationCard,
          { backgroundColor: CARDX, borderColor: BORDERX },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.adjustBtn,
            { backgroundColor: BGX, borderColor: BORDERX },
          ]}
          onPress={() =>
            setPlannedMins((p) =>
              Math.max(limits?.minExerciseDuration ?? 5, p - 5)
            )
          }
        >
          <Ionicons name="remove" size={22} color={TEXTX} />
        </TouchableOpacity>
        <View style={styles.centerColumn}>
          <Text style={[styles.durationBig, { color: TEXTX }]}>
            {plannedMins}
          </Text>
          <Text style={[styles.durationSub, { color: MUTEDX }]}>minutes</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.adjustBtn,
            { backgroundColor: BGX, borderColor: BORDERX },
          ]}
          onPress={() =>
            setPlannedMins((p) =>
              Math.min(p + 5, limits?.maxExerciseDuration ?? 120)
            )
          }
        >
          <Ionicons name="add" size={22} color={TEXTX} />
        </TouchableOpacity>
      </View>

      {/* Guide card */}
      <Text style={[styles.sectionLabel, { color: MUTEDX }]}>How To Do It</Text>
      <View
        style={[
          styles.guideCard,
          {
            borderLeftColor: activity?.color || PURPLE,
            backgroundColor: CARDX,
            borderColor: BORDERX,
          },
        ]}
      >
        <View style={styles.guideHeaderRow}>
          <View
            style={[
              styles.guideIconWrap,
              { backgroundColor: activity?.bg || PURPLE_MID },
            ]}
          >
            <MaterialCommunityIcons
              name={activity?.icon || "lightning-bolt"}
              size={18}
              color={activity?.color || PURPLE}
            />
          </View>
          <Text style={[styles.guideTitle, { color: TEXTX }]}>
            {selectedName} Tips
          </Text>
        </View>
        <Text style={[styles.guideText, { color: MUTEDX }]}>
          {activity?.guide}
        </Text>
      </View>

      {/* Science tip */}
      <View style={[styles.scienceCard, { backgroundColor: SCI_BG }]}>
        <View style={[styles.scienceIcon, { backgroundColor: SCI_ICON_BG }]}>
          <Ionicons name="flash" size={18} color={PRIMARYX} />
        </View>
        <Text style={styles.scienceText}>
          Engaging large muscle groups like squats or cycling is the fastest way
          to pull excess glucose from your bloodstream.
        </Text>
      </View>

      {/* Start button */}
      <TouchableOpacity
        style={[
          styles.startBtn,
          { backgroundColor: PRIMARYX, shadowColor: PRIMARYX },
        ]}
        onPress={startTimer}
        activeOpacity={0.85}
      >
        <Ionicons name="play" size={20} color="#FFF" />
        <Text style={styles.startBtnText}>Start Workout Timer</Text>
      </TouchableOpacity>

      {/* Quick-save without timer */}
      <TouchableOpacity
        style={[
          styles.skipBtn,
          { backgroundColor: CARDX, borderColor: BORDERX },
          loading && styles.dim,
        ]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={PRIMARYX} />
        ) : (
          <Text style={[styles.skipBtnText, { color: PRIMARYX }]}>
            Log {plannedMins} min without timer
          </Text>
        )}
      </TouchableOpacity>

      {message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BGX }]}>
      <AnimatedScreen style={styles.screenFill}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.headerBackBtn,
                { backgroundColor: CARDX, borderColor: BORDERX },
              ]}
              onPress={() => {
                if (mode === "active" || mode === "paused") {
                  stopTimer();
                } else {
                  navigation.goBack();
                }
              }}
            >
              <Ionicons
                name={
                  mode === "active" || mode === "paused"
                    ? "stop-circle-outline"
                    : "close"
                }
                size={26}
                color={TEXTX}
              />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: TEXTX }]}>
              {mode === "setup"
                ? "Log Workout"
                : mode === "done"
                ? "Workout Done"
                : `${selectedName} Timer`}
            </Text>

            {/* Header save — only visible in setup or done */}
            {mode === "setup" || mode === "done" ? (
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: PRIMARYX },
                  loading && styles.dim,
                ]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.headerSpacer} />
            )}
          </View>

          {/* ── Mode-dependent content ── */}
          {mode === "setup" ? renderSetup() : renderTimer()}
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    screenFill: { flex: 1 },
    content: { padding: 20, paddingBottom: 60 },

    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 26,
    },
    headerBackBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
    saveBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 20,
    },
    saveBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
    dim: { opacity: 0.6 },
    dimHeavy: { opacity: 0.7 },

    // Section label
    sectionLabel: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 12,
    },

    // Activity grid
    activityGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 24,
    },
    activityCard: {
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 10,
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1.5,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    activityIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    activityName: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },

    // Duration picker
    ringSvg: { position: "absolute" },
    ringWrap: {
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    centerColumn: { alignItems: "center" },
    guideHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    headerSpacer: { width: 56 },
    durationCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
    },
    adjustBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    durationBig: { fontSize: 42, fontWeight: "900", color: colors.text },
    durationSub: {
      fontSize: 13,
      color: colors.muted,
      fontWeight: "600",
      marginTop: -4,
    },

    // Guide card
    guideCard: {
      backgroundColor: colors.card,
      padding: 18,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      marginBottom: 14,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    guideIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    guideTitle: { fontSize: 15, fontWeight: "800", color: colors.text },
    guideText: { fontSize: 13, color: colors.muted, lineHeight: 20 },

    // Science tip
    scienceCard: {
      flexDirection: "row",
      backgroundColor: PURPLE_LIGHT,
      borderRadius: 18,
      padding: 16,
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 24,
    },
    scienceIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: PURPLE_MID,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    scienceText: {
      flex: 1,
      fontSize: 13,
      color: isDark ? "#C4B5FD" : "#5B21B6",
      lineHeight: 18,
      fontWeight: "500",
    },

    // Start / skip buttons
    startBtn: {
      backgroundColor: colors.primary,
      height: 56,
      borderRadius: 28,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
      shadowColor: colors.primary,
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 4,
    },
    startBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
    skipBtn: {
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    skipBtnText: { color: colors.primary, fontWeight: "700", fontSize: 14 },

    // ── Timer section ──
    timerSection: { paddingTop: 8 },

    timerDigits: {
      fontSize: 52,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -2,
      textAlign: "center",
    },
    timerSub: {
      fontSize: 13,
      color: colors.muted,
      fontWeight: "600",
      marginTop: 2,
      textAlign: "center",
    },

    statRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
      marginTop: 24,
      marginBottom: 28,
    },
    statPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    statValue: { fontSize: 15, fontWeight: "800", color: colors.text },
    statLabel: { fontSize: 11, color: colors.muted, fontWeight: "600" },

    timerControls: {
      flexDirection: "row",
      gap: 12,
      justifyContent: "center",
    },
    ctrlBtnPrimary: {
      flex: 1,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 3,
    },
    ctrlBtnSecondary: {
      flex: 1,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    ctrlLabel: { fontSize: 15, fontWeight: "700", color: colors.text },
    ctrlLabelLight: { fontSize: 15, fontWeight: "700", color: "#FFF" },

    // Message
    messageBox: {
      backgroundColor: "#FEE2E2",
      padding: 12,
      borderRadius: 14,
      marginTop: 16,
    },
    messageText: { color: "#B91C1C", textAlign: "center", fontWeight: "600" },
  });

const BLUE = "#0284C7";
