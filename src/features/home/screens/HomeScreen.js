import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import AIInsightModal from "../../../components/AIInsightModal";
import AnimatedScreen from "../../../components/AnimatedScreen";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useUserLogs } from "../../../hooks/useUserLogs";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  BG: "#F2F0E8", // warm cream
  CARD: "#FFFFFF",
  CARD_ALT: "#F2F0E8",
  BORDER: "#E8E4D8",
  TEXT: "#1A2E22", // deep forest
  MUTED: "#7A8F82",
  PRIMARY: "#22422F", // brand forest green
  AMBER: "#ECA143",
  GREEN: "#2A6B45",
  RED: "#EF4444",
  WHITE: "#FFFFFF",
  BLUE: "#0284C7",
  FOCUS_DONE_BG: "#FFF3E6",
  FOCUS_DONE_BORDER: "#ECA143",
  REMEDY_BG: "#DCE8DF", // muted sage
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
};

const getDateKey = (value) => {
  if (!value) return null;
  const d =
    typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
};

const todayKey = () => getDateKey(new Date());

const getHealthSummary = (vals) => {
  if (!vals.length)
    return { score: 0, label: "No data", inRangeText: "Add a glucose reading" };
  const inRange = vals.filter((v) => v >= 70 && v <= 180).length;
  const pct = Math.round((inRange / vals.length) * 100);
  const avg = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
  const bonus = avg >= 70 && avg <= 140 ? 30 : avg <= 180 ? 18 : 10;
  const score = Math.max(0, Math.min(100, Math.round(pct * 0.7 + bonus)));
  const label =
    score >= 80
      ? "Excellent"
      : score >= 60
      ? "Good"
      : score >= 40
      ? "Fair"
      : "Needs work";
  return { score, label, inRangeText: `${pct}% in range` };
};

const getLogStreak = (logs) => {
  const days = new Set(
    logs.map((l) => getDateKey(l.timestamp)).filter(Boolean)
  );
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  let streak = 0;
  while (days.has(cur.toISOString().split("T")[0])) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
};

// ─── Glucose ring ─────────────────────────────────────────────────────────────
const GlucoseRing = ({ score = 0 }) => {
  const SIZE = 56;
  const STROKE = 5;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  return (
    <Svg width={SIZE} height={SIZE}>
      <Circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        stroke="#E8E4D8"
        strokeWidth={STROKE}
        fill="none"
      />
      <Circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        stroke={C.AMBER}
        strokeWidth={STROKE}
        fill="none"
        strokeDasharray={`${(score / 100) * CIRC} ${CIRC}`}
        strokeLinecap="round"
        rotation="-90"
        origin={`${SIZE / 2},${SIZE / 2}`}
      />
    </Svg>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { userData } = useUserProfile();
  const { logs: rawLogs, refetch } = useUserLogs(60);

  const [showAI, setShowAI] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const logs = useMemo(
    () => (Array.isArray(rawLogs) ? rawLogs : []),
    [rawLogs]
  );
  const safeUser = useMemo(() => userData ?? {}, [userData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch?.();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Log slices
  const glucoseLogs = useMemo(
    () => logs.filter((l) => l?.type === "glucose").slice(0, 7),
    [logs]
  );
  const glucoseVals = useMemo(
    () =>
      [...glucoseLogs]
        .reverse()
        .map((l) => Number(l.value))
        .filter(isFinite),
    [glucoseLogs]
  );
  const latestGluc = glucoseLogs[0] ?? null;

  const logsForDay = useMemo(
    () =>
      logs.filter(
        (l) => l?.timestamp && getDateKey(l.timestamp) === todayKey()
      ),
    [logs]
  );
  const mealLogs = useMemo(
    () => logsForDay.filter((l) => l?.type === "meal"),
    [logsForDay]
  );
  const sleepLogs = useMemo(
    () => logs.filter((l) => l?.type === "sleep"),
    [logs]
  );
  const exerciseLogs = useMemo(
    () => logsForDay.filter((l) => l?.type === "exercise"),
    [logsForDay]
  );
  const lastSleepLog = sleepLogs[0] ?? null;

  const healthSummary = useMemo(
    () => getHealthSummary(glucoseVals),
    [glucoseVals]
  );
  const logStreak = useMemo(() => getLogStreak(logs), [logs]);

  const sleepMins = lastSleepLog?.value || 0;
  const sleepFormatted =
    sleepMins >= 60
      ? `${Math.floor(sleepMins / 60)}h ${sleepMins % 60}m`
      : sleepMins
      ? `${sleepMins}m`
      : "7h 15m";

  const totalSteps = exerciseLogs.reduce(
    (s, l) => s + (Number(l.steps) || Number(l.value) * 100 || 0),
    0
  );
  const displaySteps = totalSteps > 0 ? totalSteps.toLocaleString() : "4,200";

  const goalsDone = [
    glucoseLogs.some((l) => getDateKey(l.timestamp) === todayKey()),
    mealLogs.length > 0,
    exerciseLogs.length > 0,
    lastSleepLog != null,
  ].filter(Boolean).length;

  const glucoseValue = latestGluc ? Math.round(Number(latestGluc.value)) : 98;
  const glucoseStatus = latestGluc
    ? glucoseValue >= 70 && glucoseValue <= 140
      ? "In optimal range!"
      : glucoseValue > 140
      ? "Above range"
      : "Below range"
    : "In optimal range!";
  const glucoseStatusColor =
    glucoseValue >= 70 && glucoseValue <= 140 ? C.AMBER : C.RED;

  // Quick log items
  const quickLogItems = [
    {
      key: "blood_sugar",
      label: "Blood\nSugar",
      icon: "water-percent",
      bg: C.PRIMARY,
      color: C.WHITE,
      screen: "GlucoseEntry",
    },
    {
      key: "meal",
      label: "Meal",
      icon: "food-apple",
      bg: "#D4DDD6",
      color: C.PRIMARY,
      screen: "MealEntry",
    },
    {
      key: "activity",
      label: "Activity",
      icon: "heart-pulse",
      bg: "#D4DDD6",
      color: C.PRIMARY,
      screen: "ActivityTracker",
    },
    {
      key: "water",
      label: "Water",
      icon: "water",
      bg: "#D4DDD6",
      color: C.PRIMARY,
      screen: "WaterEntry",
    },
  ];

  // Focus items
  const focusItems = [
    {
      text: "Post-lunch Walk",
      sub: "15 minutes for optimal digestion",
      time: "2:00 PM",
      done: false,
    },
    {
      text: "Morning Supplements",
      sub: "Vitamin D3 & Cinnamon",
      time: "8:00 AM",
      done: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: C.BG }]}>
      <AnimatedScreen style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.PRIMARY}
            />
          }
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.name}>{safeUser.firstName || "Daniel"}</Text>
              <Text style={styles.tagline}>
                Your body is healing, step by step.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "Profile" })
              }
              style={styles.avatarCircle}
            >
              <Text style={styles.avatarText}>
                {(safeUser.firstName?.[0] || "D").toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Fasting Sugar card ── */}
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <View style={styles.heroLabelRow}>
                <View style={styles.heroDot} />
                <Text style={styles.heroEyebrow}>FASTING SUGAR</Text>
              </View>
              <View style={styles.heroValueRow}>
                <Text style={styles.heroValue}>{glucoseValue}</Text>
                <Text style={styles.heroUnit}> mg/dL</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: glucoseStatusColor + "22" },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: glucoseStatusColor }]}
                >
                  {glucoseStatus}
                </Text>
              </View>
            </View>
            <View style={styles.heroRight}>
              <TouchableOpacity
                onPress={() => navigation.navigate("GlucoseMonitor")}
                style={styles.ringWrap}
              >
                <GlucoseRing score={healthSummary.score} />
                <View style={styles.ringIcon}>
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={14}
                    color={C.AMBER}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Activity + Sleep row ── */}
          <View style={styles.miniRow}>
            <TouchableOpacity
              style={styles.miniCard}
              onPress={() => navigation.navigate("ActivityTracker")}
            >
              <View style={styles.miniIconRow}>
                <MaterialCommunityIcons name="walk" size={16} color={C.MUTED} />
                <Text style={styles.miniLabel}>ACTIVITY</Text>
              </View>
              <Text style={styles.miniValue}>{displaySteps}</Text>
              <Text style={styles.miniSub}>Steps today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miniCard}
              onPress={() => navigation.navigate("SleepInsights")}
            >
              <View style={styles.miniIconRow}>
                <Ionicons name="moon-outline" size={15} color={C.MUTED} />
                <Text style={styles.miniLabel}>SLEEP</Text>
              </View>
              <Text style={styles.miniValue}>{sleepFormatted}</Text>
              <Text style={styles.miniSub}>
                {lastSleepLog?.status || "Restful"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Quick Log ── */}
          <Text style={styles.sectionTitle}>Quick Log</Text>
          <View style={styles.quickLogRow}>
            {quickLogItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.quickLogItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View
                  style={[styles.quickLogIcon, { backgroundColor: item.bg }]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={item.color}
                  />
                </View>
                <Text style={styles.quickLogLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Today's Focus ── */}
          <Text style={styles.sectionTitle}>Today's Focus</Text>
          <View style={styles.focusContainer}>
            {focusItems.map((item, i) => (
              <View
                key={i}
                style={[styles.focusItem, item.done && styles.focusItemDone]}
              >
                <View
                  style={[
                    styles.focusCircle,
                    item.done && styles.focusCircleDone,
                  ]}
                >
                  {item.done && (
                    <Ionicons name="checkmark" size={12} color={C.WHITE} />
                  )}
                </View>
                <View style={styles.focusTextWrap}>
                  <Text
                    style={[
                      styles.focusText,
                      item.done && styles.focusTextDone,
                    ]}
                  >
                    {item.text}
                  </Text>
                  <Text style={styles.focusSub}>{item.sub}</Text>
                </View>
                <View
                  style={[
                    styles.focusTimeBadge,
                    item.done && styles.focusTimeBadgeDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.focusTime,
                      item.done && styles.focusTimeDone,
                    ]}
                  >
                    {item.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Academy card ── */}
          <View style={styles.remedyCard}>
            <View style={styles.remedyLeft}>
              <Text style={styles.remedyEyebrow}>ACADEMY</Text>
              <Text style={styles.remedyTitle}>
                Reversal Academy{"\n"}Daily Lesson
              </Text>
              <Text style={styles.remedyBody}>
                Learn one practical step today to{"\n"}support better glucose
                control.
              </Text>
              <TouchableOpacity
                style={styles.remedyBtn}
                onPress={() => navigation.navigate("Education")}
              >
                <Text style={styles.remedyBtnText}>Open Academy</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.remedyArt}>
              <MaterialCommunityIcons
                name="school"
                size={60}
                color={C.PRIMARY}
              />
            </View>
          </View>

          {/* ── Progress bar ── */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressStreak}>
                🔥 {logStreak || 1} Day Streak
              </Text>
            </View>
            <Text style={styles.progressPct}>
              {Math.round((goalsDone / 4) * 100)}% Complete
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round((goalsDone / 4) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressSub}>
              {goalsDone} of 4 goals logged today
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </AnimatedScreen>

      <AIInsightModal
        visible={showAI}
        onClose={() => setShowAI(false)}
        userData={safeUser}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontSize: 13,
    color: C.MUTED,
    fontWeight: "500",
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: C.TEXT,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: C.MUTED,
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    marginTop: 4,
  },
  avatarText: {
    color: C.WHITE,
    fontWeight: "800",
    fontSize: 17,
  },

  // Hero glucose card
  heroCard: {
    backgroundColor: C.CARD,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  heroLeft: { flex: 1 },
  heroLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.AMBER,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: C.MUTED,
    letterSpacing: 1.2,
  },
  heroValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  heroValue: {
    fontSize: 40,
    fontWeight: "800",
    color: C.TEXT,
    letterSpacing: -1,
  },
  heroUnit: {
    fontSize: 14,
    color: C.MUTED,
    fontWeight: "600",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroRight: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
  ringWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  ringIcon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  // Mini cards row
  miniRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  miniCard: {
    flex: 1,
    backgroundColor: C.CARD,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  miniIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 8,
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.MUTED,
    letterSpacing: 0.8,
  },
  miniValue: {
    fontSize: 22,
    fontWeight: "800",
    color: C.TEXT,
    letterSpacing: -0.5,
  },
  miniSub: {
    fontSize: 12,
    color: C.MUTED,
    marginTop: 2,
  },

  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.TEXT,
    marginBottom: 14,
    letterSpacing: -0.3,
  },

  // Quick log
  quickLogRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  quickLogItem: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  quickLogIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLogLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.TEXT,
    textAlign: "center",
    lineHeight: 14,
  },

  // Focus
  focusContainer: {
    gap: 10,
    marginBottom: 24,
  },
  focusItem: {
    backgroundColor: C.CARD,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  focusItemDone: {
    backgroundColor: C.FOCUS_DONE_BG,
    borderColor: C.FOCUS_DONE_BORDER + "40",
  },
  focusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.WHITE,
  },
  focusCircleDone: {
    backgroundColor: C.AMBER,
    borderColor: C.AMBER,
  },
  focusTextWrap: { flex: 1 },
  focusText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.TEXT,
  },
  focusTextDone: {
    textDecorationLine: "line-through",
    color: C.MUTED,
  },
  focusSub: {
    fontSize: 11,
    color: C.MUTED,
    marginTop: 2,
  },
  focusTimeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: C.BG,
  },
  focusTimeBadgeDone: {
    backgroundColor: C.AMBER + "22",
  },
  focusTime: {
    fontSize: 11,
    fontWeight: "700",
    color: C.MUTED,
  },
  focusTimeDone: {
    color: C.AMBER,
  },

  // Remedy card
  remedyCard: {
    backgroundColor: C.REMEDY_BG,
    borderRadius: 24,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  remedyLeft: { flex: 1 },
  remedyEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: C.PRIMARY,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  remedyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.TEXT,
    lineHeight: 24,
    marginBottom: 8,
  },
  remedyBody: {
    fontSize: 12,
    color: C.MUTED,
    lineHeight: 18,
    marginBottom: 14,
  },
  remedyBtn: {
    backgroundColor: C.PRIMARY,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  remedyBtnText: {
    color: C.WHITE,
    fontSize: 12,
    fontWeight: "800",
  },
  remedyArt: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  // Progress card
  progressCard: {
    backgroundColor: C.PRIMARY,
    borderRadius: 20,
    padding: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  progressStreak: {
    fontSize: 12,
    fontWeight: "700",
    color: C.AMBER,
  },
  progressPct: {
    fontSize: 26,
    fontWeight: "800",
    color: C.WHITE,
    marginBottom: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.WHITE,
  },
  progressSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
  bottomSpacer: {
    height: 120,
  },
});
