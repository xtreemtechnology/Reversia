/**
 * LogScreen.js — fully self-contained redesign
 * Keeps: useUserLogs hook, navigation params, moment, getButtonAccessibility
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserLogs } from "../../../hooks/useUserLogs";
import moment from "moment";
import { getButtonAccessibility } from "../../../utils/accessibility";

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

// ─── Log type config ──────────────────────────────────────────────────────────
const LOG_CONFIG = {
  glucose: {
    label: "Glucose",
    icon: "water-percent",
    color: T.PRIMARY,
    bg: T.PRIMARY_LIGHT,
    unit: "mg/dL",
    screen: "GlucoseEntry",
  },
  meal: {
    label: "Meal",
    icon: "food-apple",
    color: T.GREEN,
    bg: "rgba(16,185,129,0.10)",
    unit: "",
    screen: "MealEntry",
  },
  water: {
    label: "Water",
    icon: "cup-water",
    color: T.BLUE,
    bg: "rgba(2,132,199,0.10)",
    unit: "glasses",
    screen: "WaterEntry",
  },
  exercise: {
    label: "Exercise",
    icon: "run",
    color: T.AMBER,
    bg: T.AMBER_LIGHT,
    unit: "min",
    screen: "ExerciseEntry",
  },
  sleep: {
    label: "Sleep",
    icon: "sleep",
    color: T.PURPLE,
    bg: "rgba(124,58,237,0.10)",
    unit: "hrs",
    screen: "SleepEntry",
  },
};

// Quick-log cards shown in the grid
const LOG_CARDS = [
  {
    type: "glucose",
    title: "Glucose",
    subtitle: "Blood sugar reading",
    emoji: "💉",
  },
  { type: "meal", title: "Meal", subtitle: "Food & carbs", emoji: "🥗" },
  { type: "water", title: "Water", subtitle: "Hydration tracker", emoji: "💧" },
  {
    type: "exercise",
    title: "Exercise",
    subtitle: "Activity log",
    emoji: "🏃",
  },
];

// ─── Animated log card ────────────────────────────────────────────────────────
const LogCard = ({ item, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = LOG_CONFIG[item.type] || LOG_CONFIG.glucose;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, logCardStyles.wrap]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        style={logCardStyles.card}
        {...getButtonAccessibility(`log${item.title}`)}
      >
        {/* Icon */}
        <View style={[logCardStyles.iconWrap, { backgroundColor: cfg.bg }]}>
          <MaterialCommunityIcons name={cfg.icon} size={26} color={cfg.color} />
        </View>

        {/* Text */}
        <Text style={logCardStyles.cardTitle}>{item.title}</Text>
        <Text style={logCardStyles.cardSub}>{item.subtitle}</Text>

        {/* Emoji badge */}
        <View style={logCardStyles.emojiBadge}>
          <Text style={{ fontSize: 14 }}>{item.emoji}</Text>
        </View>

        {/* Add icon */}
        <View style={[logCardStyles.addBtn, { backgroundColor: cfg.color }]}>
          <Ionicons name="add" size={14} color={T.WHITE} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const logCardStyles = StyleSheet.create({
  wrap: { width: "48%" },
  card: {
    backgroundColor: T.CARD,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: T.BORDER,
    minHeight: 148,
    position: "relative",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: T.TEXT,
    marginBottom: 4,
  },
  cardSub: { fontSize: 12, color: T.MUTED, lineHeight: 17 },
  emojiBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: T.BG,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── Recent log row ───────────────────────────────────────────────────────────
const RecentRow = ({ item, onPress }) => {
  const cfg = LOG_CONFIG[item.type] || LOG_CONFIG.glucose;
  const timeStr = item.timestamp
    ? moment(item.timestamp.toDate()).format("h:mm A")
    : "Just now";
  const dateStr = item.timestamp
    ? moment(item.timestamp.toDate()).format("MMM D")
    : "Today";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={recentStyles.row}
      {...getButtonAccessibility("expandButton", "deepLink")}
    >
      {/* Left accent bar */}
      <View style={[recentStyles.accentBar, { backgroundColor: cfg.color }]} />

      {/* Icon */}
      <View style={[recentStyles.iconWrap, { backgroundColor: cfg.bg }]}>
        <MaterialCommunityIcons name={cfg.icon} size={18} color={cfg.color} />
      </View>

      {/* Info */}
      <View style={recentStyles.info}>
        <Text style={recentStyles.label}>{cfg.label}</Text>
        <Text style={recentStyles.value} numberOfLines={1}>
          {item.value} {item.unit || cfg.unit}
          {item.period ? `  ·  ${item.period}` : ""}
          {item.meal ? `  ·  ${item.meal}` : ""}
        </Text>
      </View>

      {/* Time */}
      <View style={recentStyles.timeWrap}>
        <Text style={recentStyles.time}>{timeStr}</Text>
        <Text style={recentStyles.date}>{dateStr}</Text>
      </View>

      <Ionicons name="chevron-forward" size={14} color={T.BORDER} />
    </TouchableOpacity>
  );
};

const recentStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.CARD,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: T.BORDER,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  info: { flex: 1 },
  label: { fontSize: 13, fontWeight: "800", color: T.TEXT, marginBottom: 3 },
  value: { fontSize: 12, color: T.MUTED },
  timeWrap: { alignItems: "flex-end" },
  time: { fontSize: 12, fontWeight: "700", color: T.TEXT },
  date: { fontSize: 10, color: T.MUTED, marginTop: 2 },
});

// ─── Meal detail bottom sheet ─────────────────────────────────────────────────
const MealSheet = ({ log, onClose }) => (
  <Modal visible={!!log} animationType="slide" transparent>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={sheetStyles.backdrop}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={sheetStyles.sheet}>
            {/* Handle */}
            <View style={sheetStyles.handle} />

            {/* Header */}
            <View style={sheetStyles.header}>
              <View>
                <Text style={sheetStyles.eyebrow}>MEAL LOG</Text>
                <Text style={sheetStyles.title}>{log?.value || "Meal"}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={sheetStyles.closeBtn}>
                <Ionicons name="close" size={18} color={T.TEXT} />
              </TouchableOpacity>
            </View>

            {log && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {log.imageUri && (
                  <Image
                    source={{ uri: log.imageUri }}
                    style={sheetStyles.image}
                    resizeMode="cover"
                  />
                )}

                {/* Stats row */}
                <View style={sheetStyles.statsRow}>
                  {[
                    {
                      label: "Calories",
                      val: log.calories ? `${log.calories} kcal` : "—",
                    },
                    { label: "Serving", val: log.servingSize || "—" },
                    { label: "Period", val: log.meal || log.period || "—" },
                  ].map((s) => (
                    <View key={s.label} style={sheetStyles.statBox}>
                      <Text style={sheetStyles.statVal}>{s.val}</Text>
                      <Text style={sheetStyles.statLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Logged time */}
                <View style={sheetStyles.timeRow}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={15}
                    color={T.MUTED}
                  />
                  <Text style={sheetStyles.timeText}>
                    Logged{" "}
                    {log.timestamp
                      ? moment(log.timestamp.toDate()).format(
                          "MMM D [at] h:mm A"
                        )
                      : "just now"}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(26,46,34,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: T.CARD,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "75%",
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: T.BORDER,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: T.MUTED,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: T.TEXT,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  image: { width: "100%", height: 180, borderRadius: 20, marginBottom: 16 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: T.BG,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  statVal: { fontSize: 15, fontWeight: "800", color: T.TEXT, marginBottom: 4 },
  statLabel: { fontSize: 11, color: T.MUTED, fontWeight: "600" },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.BG,
    padding: 14,
    borderRadius: 14,
  },
  timeText: { fontSize: 13, color: T.MUTED, fontWeight: "600" },
});

// ─── Today's streak / summary strip ──────────────────────────────────────────
const TodaySummary = ({ logs }) => {
  const today = moment().format("YYYY-MM-DD");
  const todayLogs = logs.filter((l) =>
    l.timestamp
      ? moment(l.timestamp.toDate()).format("YYYY-MM-DD") === today
      : true
  );
  const types = [...new Set(todayLogs.map((l) => l.type))];

  const stats = [
    {
      label: "Logged today",
      val: String(todayLogs.length),
      icon: "clipboard-check-outline",
      color: T.PRIMARY,
    },
    {
      label: "Types tracked",
      val: `${types.length}/4`,
      icon: "view-grid-outline",
      color: T.AMBER,
    },
    {
      label: "Last log",
      val: todayLogs[0]?.timestamp
        ? moment(todayLogs[0].timestamp.toDate()).format("h:mm A")
        : "None",
      icon: "clock-outline",
      color: T.BLUE,
    },
  ];

  return (
    <View style={summaryStyles.card}>
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && <View style={summaryStyles.divider} />}
          <View style={summaryStyles.stat}>
            <MaterialCommunityIcons
              name={s.icon}
              size={18}
              color={s.color}
              style={{ marginBottom: 6 }}
            />
            <Text style={summaryStyles.val}>{s.val}</Text>
            <Text style={summaryStyles.label}>{s.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

const summaryStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: T.CARD,
    borderRadius: 22,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: T.BORDER,
    justifyContent: "space-around",
    alignItems: "center",
  },
  divider: { width: 1, height: 40, backgroundColor: T.BORDER },
  stat: { alignItems: "center", flex: 1 },
  val: { fontSize: 18, fontWeight: "800", color: T.TEXT, marginBottom: 2 },
  label: {
    fontSize: 10,
    color: T.MUTED,
    fontWeight: "700",
    textAlign: "center",
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function LogScreen({ navigation }) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const { logs, loading, error } = useUserLogs(15, refreshToken);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const handleLogPress = (type) => {
    const cfg = LOG_CONFIG[type];
    if (cfg?.screen) navigation.navigate(cfg.screen);
  };

  const openRecent = (item) => {
    if (item.type === "meal") {
      setSelectedLog(item);
      return;
    }
    const cfg = LOG_CONFIG[item.type];
    if (cfg?.screen) navigation.navigate(cfg.screen);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Quick logging</Text>
            <Text style={styles.title}>Log</Text>
            <Text style={styles.dateStr}>{dateStr}</Text>
          </View>
          <TouchableOpacity
            style={styles.calBtn}
            onPress={() => navigation.navigate("LogHistory")}
          >
            <Ionicons name="time-outline" size={20} color={T.PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* ── Today's summary strip ── */}
        {!loading && logs.length > 0 && <TodaySummary logs={logs} />}

        {/* ── Hero motivation card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={24}
                color={T.PRIMARY}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Track Your Reversal</Text>
              <Text style={styles.heroBody}>
                Consistent logging is the fastest way to master your insulin
                response.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => navigation.navigate("GlucoseEntry")}
          >
            <MaterialCommunityIcons
              name="water-percent"
              size={14}
              color={T.WHITE}
            />
            <Text style={styles.heroBtnText}>Log Glucose</Text>
          </TouchableOpacity>
        </View>

        {/* ── Log grid ── */}
        <Text style={styles.sectionLabel}>What do you want to log?</Text>
        <View style={styles.grid}>
          {LOG_CARDS.map((item) => (
            <LogCard
              key={item.type}
              item={item}
              onPress={() => handleLogPress(item.type)}
            />
          ))}
        </View>

        {/* ── Recent logs ── */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionLabel}>Recent Logs</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("LogHistory")}
            {...getButtonAccessibility("expandButton", "deepLink")}
          >
            {loading ? (
              <ActivityIndicator size="small" color={T.PRIMARY} />
            ) : (
              <Text style={styles.seeAll}>See All</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={T.RED} />
            <Text style={styles.errorText}>
              {error.message || "Could not load logs."}
            </Text>
            <TouchableOpacity
              onPress={() => setRefreshToken((v) => v + 1)}
              style={styles.retryBtn}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Log list */}
        <View style={styles.logList}>
          {loading ? (
            <View style={styles.emptyCard}>
              <ActivityIndicator size="large" color={T.PRIMARY} />
              <Text style={styles.emptyText}>Loading your recent logs…</Text>
            </View>
          ) : logs.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={32}
                  color={T.MUTED}
                />
              </View>
              <Text style={styles.emptyTitle}>Nothing logged yet</Text>
              <Text style={styles.emptyText}>
                Tap any card above to start tracking.
              </Text>
            </View>
          ) : (
            logs.map((item) => (
              <RecentRow
                key={item.id}
                item={item}
                onPress={() => openRecent(item)}
              />
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Meal detail sheet ── */}
      <MealSheet log={selectedLog} onClose={() => setSelectedLog(null)} />
    </SafeAreaView>
  );
}

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.BG },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 60 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: T.MUTED,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: T.TEXT,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  dateStr: { fontSize: 13, color: T.MUTED, fontWeight: "600", marginTop: 3 },
  calBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: T.CARD,
    borderWidth: 1,
    borderColor: T.BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  // Hero card
  heroCard: {
    backgroundColor: T.SAGE,
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: T.BORDER,
    gap: 12,
  },
  heroLeft: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: T.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: T.TEXT,
    marginBottom: 4,
  },
  heroBody: { fontSize: 13, color: T.MUTED, lineHeight: 19 },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.PRIMARY,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  heroBtnText: { color: T.WHITE, fontSize: 13, fontWeight: "800" },

  // Section label
  sectionLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: T.TEXT,
    marginBottom: 14,
  },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },

  // Recent header
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: { fontSize: 13, fontWeight: "700", color: T.PRIMARY },

  // Log list
  logList: { gap: 10 },

  // Empty state
  emptyCard: {
    backgroundColor: T.CARD,
    borderRadius: 22,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.BORDER,
    gap: 8,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: T.BG,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: T.TEXT },
  emptyText: {
    fontSize: 13,
    color: T.MUTED,
    textAlign: "center",
    lineHeight: 19,
  },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: T.RED, fontWeight: "600" },
  retryBtn: {
    backgroundColor: T.RED,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  retryText: { color: T.WHITE, fontSize: 12, fontWeight: "800" },
});
