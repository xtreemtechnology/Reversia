// src/screens/GlucoseScreen.js - Theme-Integrated Version
import React, { useState, useMemo } from "react";
/* eslint-disable react-native/no-inline-styles */
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUserLogs } from "../../../hooks/useUserLogs";
import { useTheme } from "../../../theme/ThemeProvider";

// runtime width will be gathered with `useWindowDimensions()` inside the component

// ─── Semantic Medical Colors (Preserved for reference) ──────────────────────────
// These colors are semantic indicators and preserved as hex values:
// - Green #059669: Normal glucose (healthy range)
// - Red #DC2626: Too high (medical alert)
// - Orange #D97706: Pre-meal/elevated (warning)
// - Blue #0284C7: Too low (hypoglycemia alert)

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getGlucoseStatus = (value) => {
  if (value < 70) {
    return {
      label: "Too Low",
      color: "#0284C7",
      bg: "#E0F2FE",
      tip: "Eat fast-acting sugar immediately.",
    };
  }
  if (value <= 99) {
    return {
      label: "Normal",
      color: "#059669",
      bg: "#ECFDF5",
      tip: "Your blood sugar is in a healthy range.",
    };
  }
  if (value <= 139) {
    return {
      label: "Pre-meal OK",
      color: "#D97706",
      bg: "#FFFBEB",
      tip: "Acceptable before a meal. Monitor after eating.",
    };
  }
  if (value <= 199) {
    return {
      label: "Elevated",
      color: "#EA580C",
      bg: "#FFF7ED",
      tip: "Above target. Consider light activity or water.",
    };
  }
  return {
    label: "Too High",
    color: "#DC2626",
    bg: "#FEF2F2",
    tip: "Please consult your doctor if this persists.",
  };
};

// Data now comes from user's Firestore logs via hook

const MEALS = [
  "Fasting",
  "Before Breakfast",
  "After Breakfast",
  "Before Lunch",
  "After Lunch",
  "Before Dinner",
  "After Dinner",
  "Bedtime",
];

const TABS = ["Log", "History", "Reminders"];

// ─── Mini Bar Chart ────────────────────────────────────────────────────────────
const BarChart = ({ colors }) => {
  // Placeholder for WEEK data - would come from component context in real implementation
  const WEEK = [];
  if (!WEEK || WEEK.length === 0) return null;

  const max = Math.max(...WEEK.map((d) => d.val));
  const chartHeight = 80;
  const chartStyles = {
    wrap: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingHorizontal: 4,
      marginTop: 8,
    },
    col: {
      alignItems: "center",
      gap: 4,
    },
    barBg: {
      width: 28,
      height: 80,
      borderRadius: 8,
      backgroundColor: colors.border,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    bar: {
      width: "100%",
      borderRadius: 8,
    },
    dayLabel: {
      fontSize: 10,
      color: colors.muted,
      fontWeight: "600",
    },
    valLabel: {
      fontSize: 9,
      fontWeight: "700",
    },
  };

  return (
    <View style={chartStyles.wrap}>
      {WEEK.map((d, i) => {
        const st = getGlucoseStatus(d.val);
        const barH = (d.val / max) * chartHeight;
        return (
          <View key={i} style={chartStyles.col}>
            <View style={chartStyles.barBg}>
              <View
                style={[
                  chartStyles.bar,
                  { height: barH, backgroundColor: st.color },
                ]}
              />
            </View>
            <Text style={chartStyles.dayLabel}>{d.day}</Text>
            <Text style={[chartStyles.valLabel, { color: st.color }]}>
              {d.val}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// ─── Reminders Data ────────────────────────────────────────────────────────────
const REMINDERS = [
  {
    icon: "sunny-outline",
    label: "Morning Fasting",
    time: "7:00 AM",
    on: true,
  },
  {
    icon: "restaurant-outline",
    label: "After Breakfast",
    time: "9:30 AM",
    on: true,
  },
  {
    icon: "partly-sunny-outline",
    label: "After Lunch",
    time: "2:00 PM",
    on: false,
  },
  { icon: "moon-outline", label: "Before Bedtime", time: "9:00 PM", on: true },
];

// ─── Dynamic Styles Factory ────────────────────────────────────────────────────
const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 100,
      paddingTop: 8,
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },

    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20,
    },

    headerSub: {
      color: "rgba(255,255,255,0.5)",
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },

    headerTitle: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: -0.5,
      marginTop: 4,
    },

    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.1)",
      justifyContent: "center",
      alignItems: "center",
    },

    latestCard: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 20,
      padding: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },

    latestLabel: {
      color: "rgba(255,255,255,0.5)",
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 6,
    },

    latestValueRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 4,
      marginBottom: 10,
    },

    latestValue: {
      color: "#fff",
      fontSize: 52,
      fontWeight: "900",
      letterSpacing: -2,
      lineHeight: 52,
    },

    latestUnit: {
      color: "rgba(255,255,255,0.5)",
      fontSize: 16,
      fontWeight: "600",
      paddingBottom: 6,
    },

    latestBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },

    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    badgeText: {
      fontSize: 12,
      fontWeight: "700",
    },

    latestStats: {
      gap: 12,
      alignItems: "flex-end",
    },

    latestStat: {
      alignItems: "flex-end",
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    latestStatVal: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.5,
    },

    latestStatLabel: {
      color: "rgba(255,255,255,0.45)",
      fontSize: 10,
      fontWeight: "500",
      marginTop: 1,
    },

    tabBar: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 14,
      padding: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },

    tab: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 11,
      alignItems: "center",
    },

    tabText: {
      fontSize: 13,
      fontWeight: "600",
    },

    inputCard: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
    },

    inputLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.muted,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 16,
      textAlign: "center",
    },

    valueDisplay: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "center",
      gap: 8,
      marginBottom: 12,
    },

    bigValue: {
      fontSize: 88,
      fontWeight: "900",
      letterSpacing: -3,
      lineHeight: 88,
    },

    bigUnit: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.muted,
      paddingBottom: 10,
    },

    statusBadgeWrap: {
      alignItems: "center",
      marginBottom: 20,
    },

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    statusText: {
      fontSize: 13,
      fontWeight: "700",
    },

    controls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 18,
    },

    controlBtn: {
      flex: 1,
      backgroundColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: "center",
    },

    controlBtnLarge: {
      paddingVertical: 14,
    },

    controlBtnText: {
      fontSize: 18,
      color: colors.text,
      fontWeight: "800",
    },

    controlBtnTextLarge: {
      fontSize: 20,
    },

    tipBox: {
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    tipText: {
      flex: 1,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 18,
    },

    sectionCard: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 18,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
    },

    cardSectionLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      marginBottom: 14,
    },

    mealGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    mealPill: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: colors.background,
    },

    mealPillActive: {
      backgroundColor: colors.primary,
    },

    mealPillText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.muted,
    },

    mealPillTextActive: {
      color: "#fff",
      fontWeight: "700",
    },

    rangeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    rangeLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    rangeDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },

    rangeLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },

    rangeValue: {
      fontSize: 13,
      fontWeight: "700",
    },

    saveBtn: {
      marginHorizontal: 20,
      marginTop: 18,
      borderRadius: 18,
      overflow: "hidden",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 12,
      elevation: 4,
    },

    saveBtnSuccess: {
      shadowColor: "#059669",
      shadowOpacity: 0.18,
    },

    saveBtnGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 16,
    },

    saveBtnText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "800",
    },

    chartHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },

    chartLegend: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    legendText: {
      fontSize: 11,
      color: colors.muted,
      fontWeight: "600",
    },

    statRow: {
      marginHorizontal: 20,
      marginTop: 14,
      flexDirection: "row",
      gap: 10,
    },

    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },

    statValue: {
      fontSize: 24,
      fontWeight: "900",
      letterSpacing: -0.8,
    },

    statUnit: {
      fontSize: 11,
      color: colors.muted,
      fontWeight: "600",
      marginTop: 1,
    },

    statLabel: {
      fontSize: 11,
      color: colors.muted,
      fontWeight: "600",
      marginTop: 4,
    },

    historyGroup: {
      marginHorizontal: 20,
      marginTop: 18,
    },

    historyDate: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 10,
    },

    historyRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 5,
      elevation: 1,
    },

    historyValueBox: {
      width: 72,
      borderRadius: 14,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    historyValue: {
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: -0.5,
    },

    historyUnit: {
      fontSize: 10,
      fontWeight: "700",
      marginTop: 1,
    },

    historyInfo: {
      flex: 1,
    },

    historyMeal: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },

    historyTime: {
      fontSize: 12,
      color: colors.muted,
      fontWeight: "500",
      marginTop: 2,
    },

    historyBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },

    historyBadgeText: {
      fontSize: 11,
      fontWeight: "700",
    },

    masterToggleCard: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },

    masterToggleLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },

    masterToggleIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },

    masterToggleTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.text,
    },

    masterToggleSub: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
      maxWidth: 210,
    },

    toggle: {
      width: 52,
      height: 30,
      borderRadius: 999,
      padding: 3,
      justifyContent: "center",
    },

    toggleOn: {
      backgroundColor: colors.primary,
    },

    toggleOff: {
      backgroundColor: colors.border,
    },

    toggleThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.16,
      shadowRadius: 2,
      elevation: 1,
    },

    toggleThumbOn: {
      transform: [{ translateX: 22 }],
    },

    toggleThumbOff: {
      transform: [{ translateX: 0 }],
    },

    reminderCard: {
      marginHorizontal: 20,
      marginTop: 12,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 5,
      elevation: 1,
    },

    reminderCardDisabled: {
      opacity: 0.6,
    },

    reminderIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },

    reminderIconActive: {
      backgroundColor: colors.primary,
    },

    reminderInfo: {
      flex: 1,
    },

    reminderTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },

    reminderTime: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },

    smallToggle: {
      width: 46,
      height: 26,
      borderRadius: 999,
      padding: 3,
      justifyContent: "center",
    },

    smallToggleThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.16,
      shadowRadius: 2,
      elevation: 1,
    },

    smallThumbOn: {
      transform: [{ translateX: 18 }],
    },

    smallThumbOff: {
      transform: [{ translateX: 0 }],
    },

    addReminderBtn: {
      marginHorizontal: 20,
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },

    addReminderText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
    },

    reminderTip: {
      marginHorizontal: 20,
      marginTop: 14,
      marginBottom: 6,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 14,
    },

    reminderTipText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
      color: "#fff",
      fontWeight: "600",
    },
  });

export default function GlucoseScreen() {
  useWindowDimensions();
  const { colors, theme } = useTheme();
  const [activeTab, setActiveTab] = useState("Log");
  const { logs } = useUserLogs(100);
  const styles = getStyles(colors);

  // derive glucose logs
  const glucoseLogs = useMemo(
    () =>
      logs
        .filter((l) => l.type === "glucose")
        .sort((a, b) => {
          const ta = a.timestamp?.seconds || new Date(a.timestamp).getTime();
          const tb = b.timestamp?.seconds || new Date(b.timestamp).getTime();
          return tb - ta;
        }),
    [logs]
  );

  const latestGlucose = glucoseLogs[0] || null;
  const [glucoseValue, setGlucoseValue] = useState(
    latestGlucose ? Number(latestGlucose.value) : 112
  );
  const [selectedMeal, setSelectedMeal] = useState(
    latestGlucose?.meal || "Fasting"
  );
  const [saved, setSaved] = useState(false);
  const [reminders, setReminders] = useState(REMINDERS);
  const [remindersOn, setRemindersOn] = useState(true);

  const status = getGlucoseStatus(Number(glucoseValue));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleAdjust = (delta) => {
    setGlucoseValue((v) => Math.max(20, Math.min(500, v + delta)));
  };

  const toggleReminder = (i) => {
    setReminders((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, on: !r.on } : r))
    );
  };

  // Group history by date from logs
  const grouped = useMemo(() => {
    const map = {};
    glucoseLogs.forEach((r, idx) => {
      const ts =
        typeof r.timestamp?.toDate === "function"
          ? r.timestamp.toDate()
          : new Date(r.timestamp);
      const date = ts.toDateString();
      const time = ts.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const entry = {
        id: r.id || idx,
        date,
        time,
        value: Number(r.value),
        meal: r.meal || r.period || "",
      };
      (map[date] = map[date] || []).push(entry);
    });
    return map;
  }, [glucoseLogs]);

  const headerColors =
    theme === "dark"
      ? [colors.card, "#111827", "#0F172A"]
      : ["#0A0A23", "#1E1B4B", "#3730A3"];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={headerColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSub}>Monitoring</Text>
            <Text style={styles.headerTitle}>Blood Glucose</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="water" size={22} color={colors.primary} />
          </View>
        </View>

        <View style={styles.latestCard}>
          <View>
            <Text style={styles.latestLabel}>Latest Reading</Text>
            <View style={styles.latestValueRow}>
              <Text style={styles.latestValue}>
                {latestGlucose ? Math.round(Number(latestGlucose.value)) : "--"}
              </Text>
              <Text style={styles.latestUnit}>
                {latestGlucose?.unit || "mg/dL"}
              </Text>
            </View>
            <View
              style={[
                styles.latestBadge,
                {
                  backgroundColor:
                    (latestGlucose &&
                      getGlucoseStatus(Number(latestGlucose.value)).bg) ||
                    "rgba(16,185,129,0.08)",
                },
              ]}
            >
              <View
                style={[
                  styles.badgeDot,
                  {
                    backgroundColor: latestGlucose
                      ? getGlucoseStatus(Number(latestGlucose.value)).color
                      : "#10B981",
                  },
                ]}
              />
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: latestGlucose
                      ? getGlucoseStatus(Number(latestGlucose.value)).color ===
                        "#10B981"
                        ? "#6EE7B7"
                        : "#374151"
                      : "#6EE7B7",
                  },
                ]}
              >
                {latestGlucose
                  ? getGlucoseStatus(Number(latestGlucose.value)).label
                  : "No data"}
              </Text>
            </View>
          </View>
          <View style={styles.latestStats}>
            {[
              { l: "Low", v: "95" },
              { l: "High", v: "172" },
            ].map((s, i) => (
              <View key={i} style={styles.latestStat}>
                <Text style={styles.latestStatVal}>{s.v}</Text>
                <Text style={styles.latestStatLabel}>{s.l} today</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tab,
              activeTab === t && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab(t)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === t ? "#fff" : colors.muted },
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "Log" && (
          <>
            <View style={[styles.inputCard, { backgroundColor: colors.card }]}>
              <Text style={styles.inputLabel}>Enter Your Reading</Text>

              <View style={styles.valueDisplay}>
                <Text style={[styles.bigValue, { color: status.color }]}>
                  {glucoseValue}
                </Text>
                <Text style={styles.bigUnit}>mg/dL</Text>
              </View>

              <View style={styles.statusBadgeWrap}>
                <View
                  style={[styles.statusBadge, { backgroundColor: status.bg }]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: status.color },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: status.color }]}>
                    {status.label}
                  </Text>
                </View>
              </View>

              <View style={styles.controls}>
                {[
                  { label: "−10", delta: -10, large: true },
                  { label: "−1", delta: -1, large: false },
                  { label: "+1", delta: 1, large: false },
                  { label: "+10", delta: 10, large: true },
                ].map((btn) => (
                  <TouchableOpacity
                    key={btn.label}
                    onPress={() => handleAdjust(btn.delta)}
                    activeOpacity={0.75}
                    style={[
                      styles.controlBtn,
                      btn.large && styles.controlBtnLarge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.controlBtnText,
                        btn.large && styles.controlBtnTextLarge,
                      ]}
                    >
                      {btn.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.tipBox, { backgroundColor: status.bg }]}>
                <Ionicons name="bulb-outline" size={16} color={status.color} />
                <Text style={[styles.tipText, { color: status.color }]}>
                  {status.tip}
                </Text>
              </View>
            </View>

            <View
              style={[styles.sectionCard, { backgroundColor: colors.card }]}
            >
              <Text style={styles.cardSectionLabel}>
                When was this reading?
              </Text>
              <View style={styles.mealGrid}>
                {MEALS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setSelectedMeal(m)}
                    activeOpacity={0.8}
                    style={[
                      styles.mealPill,
                      selectedMeal === m && styles.mealPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.mealPillText,
                        selectedMeal === m && styles.mealPillTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View
              style={[styles.sectionCard, { backgroundColor: colors.card }]}
            >
              <Text style={styles.cardSectionLabel}>Target Ranges</Text>
              {[
                { label: "Too Low", range: "< 70", color: "#0284C7" },
                { label: "Normal", range: "70 – 99", color: "#059669" },
                { label: "Pre-meal", range: "100 – 139", color: "#D97706" },
                { label: "Elevated", range: "140 – 199", color: "#EA580C" },
                { label: "Too High", range: "≥ 200", color: "#DC2626" },
              ].map((r) => (
                <View key={r.label} style={styles.rangeRow}>
                  <View style={styles.rangeLeft}>
                    <View
                      style={[styles.rangeDot, { backgroundColor: r.color }]}
                    />
                    <Text style={styles.rangeLabel}>{r.label}</Text>
                  </View>
                  <Text style={[styles.rangeValue, { color: r.color }]}>
                    {r.range} mg/dL
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
            >
              <LinearGradient
                colors={
                  saved
                    ? ["#059669", "#047857"]
                    : [colors.primary, colors.primary]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                <Ionicons
                  name={saved ? "checkmark-circle" : "save-outline"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.saveBtnText}>
                  {saved ? "Reading Saved!" : "Save Reading"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {activeTab === "History" && (
          <>
            <View
              style={[styles.sectionCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.chartHeader}>
                <Text style={styles.cardSectionLabel}>7-Day Trend</Text>
                <View style={styles.chartLegend}>
                  {[
                    { color: "#059669", label: "Normal" },
                    { color: "#D97706", label: "Pre-high" },
                    { color: "#DC2626", label: "High" },
                  ].map((l) => (
                    <View key={l.label} style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: l.color }]}
                      />
                      <Text style={styles.legendText}>{l.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <BarChart colors={colors} />
            </View>

            <View style={styles.statRow}>
              {[
                {
                  label: "7d Average",
                  value: "119",
                  unit: "mg/dL",
                  color: colors.primary,
                },
                {
                  label: "Lowest",
                  value: "95",
                  unit: "mg/dL",
                  color: "#059669", // semantic: normal glucose
                },
                {
                  label: "Highest",
                  value: "172",
                  unit: "mg/dL",
                  color: "#DC2626", // semantic: elevated glucose
                },
              ].map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <Text style={[styles.statValue, { color: s.color }]}>
                    {s.value}
                  </Text>
                  <Text style={styles.statUnit}>{s.unit}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {Object.entries(grouped).map(([date, readings]) => (
              <View key={date} style={styles.historyGroup}>
                <Text style={styles.historyDate}>{date}</Text>
                {readings.map((r) => {
                  const st = getGlucoseStatus(r.value);
                  return (
                    <View key={r.id} style={styles.historyRow}>
                      <View
                        style={[
                          styles.historyValueBox,
                          { backgroundColor: st.bg },
                        ]}
                      >
                        <Text
                          style={[styles.historyValue, { color: st.color }]}
                        >
                          {r.value}
                        </Text>
                        <Text style={[styles.historyUnit, { color: st.color }]}>
                          mg/dL
                        </Text>
                      </View>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyMeal}>{r.meal}</Text>
                        <Text style={styles.historyTime}>{r.time}</Text>
                      </View>
                      <View
                        style={[
                          styles.historyBadge,
                          { backgroundColor: st.bg },
                        ]}
                      >
                        <Text
                          style={[styles.historyBadgeText, { color: st.color }]}
                        >
                          {st.label}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </>
        )}

        {activeTab === "Reminders" && (
          <>
            <View
              style={[
                styles.masterToggleCard,
                { backgroundColor: colors.card },
              ]}
            >
              <View style={styles.masterToggleLeft}>
                <View style={styles.masterToggleIcon}>
                  <Ionicons
                    name="notifications"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.masterToggleTitle}>
                    Glucose Reminders
                  </Text>
                  <Text style={styles.masterToggleSub}>
                    Get notified to check your blood sugar
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setRemindersOn((r) => !r)}
                activeOpacity={0.8}
                style={[
                  styles.toggle,
                  remindersOn ? styles.toggleOn : styles.toggleOff,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    remindersOn ? styles.toggleThumbOn : styles.toggleThumbOff,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {reminders.map((r, i) => (
              <View
                key={i}
                style={[
                  styles.reminderCard,
                  !remindersOn && styles.reminderCardDisabled,
                ]}
              >
                <View
                  style={[
                    styles.reminderIcon,
                    r.on && remindersOn && styles.reminderIconActive,
                  ]}
                >
                  <Ionicons
                    name={r.icon}
                    size={20}
                    color={r.on && remindersOn ? colors.primary : colors.muted}
                  />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{r.label}</Text>
                  <Text style={styles.reminderTime}>{r.time} · Every day</Text>
                </View>
                <TouchableOpacity
                  disabled={!remindersOn}
                  onPress={() => toggleReminder(i)}
                  activeOpacity={0.8}
                  style={[
                    styles.smallToggle,
                    r.on && remindersOn ? styles.toggleOn : styles.toggleOff,
                  ]}
                >
                  <View
                    style={[
                      styles.smallToggleThumb,
                      r.on && remindersOn
                        ? styles.smallThumbOn
                        : styles.smallThumbOff,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.addReminderBtn, { borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.addReminderText}>Add Custom Reminder</Text>
            </TouchableOpacity>

            <View
              style={[
                styles.reminderTip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.reminderTipText}>
                Checking at the same time daily helps you and your doctor spot
                patterns more easily.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
