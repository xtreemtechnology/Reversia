import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  PanResponder,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import AIInsightModal from "../../../components/AIInsightModal";
import AnimatedScreen from "../../../components/AnimatedScreen";
import PressableScale from "../../../components/PressableScale";
import { useTheme } from "../../../theme/ThemeProvider";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useUserLogs } from "../../../hooks/useUserLogs";

// ─── Theme colours ─────────────────────────────────────────────────────────────
//
// `C` remains the screen-local token map used throughout the component tree,
// but its base palette now comes from the shared theme colors object.

const buildColours = (colors, isDark) => ({
  BG: colors.background,
  CARD: colors.card,
  CARD_ALT: isDark ? CARD_ALT_DARK : CARD_ALT_LIGHT,
  BORDER: colors.border,
  TEXT: colors.text,
  MUTED: colors.muted,
  PURPLE: colors.primary,
  PURPLE_LIGHT: isDark ? "rgba(167,139,250,0.18)" : PURPLE_LIGHT_BG,
  PURPLE_MID: isDark ? "rgba(167,139,250,0.12)" : PURPLE_MID_BG,
  GREEN: "#10B981",
  AMBER: "#F59E0B",
  BLUE: "#0284C7",
  RED: "#EF4444",
  ICON_SLEEP: isDark ? "rgba(167,139,250,0.22)" : PURPLE_MID_BG,
  ICON_FOOD: isDark ? "rgba(217,119,6,0.22)" : "#FEF3C7",
  ICON_RUN: isDark ? "rgba(2,132,199,0.22)" : "#E0F2FE",
  ICON_BMI: isDark ? "rgba(5,150,105,0.22)" : "#D1FAE5",
  PROGRESS_FILL: isDark ? "#A78BFA" : colors.primary,
  WHITE: "#FFFFFF",
  ACCENT_BLUE: isDark ? "#60A5FA" : "#60A5FA",
  ACCENT_LIME: isDark ? "#86EFAC" : "#86EFAC",
  ACCENT_VIOLET: isDark ? "#818CF8" : "#818CF8",
  ACCENT_PURPLE2: isDark ? "#8B5CF6" : "#8B5CF6",
  ACCENT_ORANGE: isDark ? "#C2410C" : "#C2410C",
  ACCENT_GREEN2: isDark ? "#059669" : "#059669",
  ACCENT_GREEN_DARK: isDark ? "#166534" : "#166534",
  ACCENT_BLUE2: isDark ? "#1D4ED8" : "#1D4ED8",
  ACCENT_DEEP_PURPLE: isDark ? "#6D28D9" : "#6D28D9",
  ACCENT_AMBER: isDark ? "#D97706" : "#D97706",
});

// Dark-safe icon backgrounds for the Quick Access grid
const gridIconBg = (key, isDark) => {
  const map = {
    academy: isDark ? "rgba(139, 92,246,0.20)" : PURPLE_LIGHTER_BG,
    mealScan: isDark ? "rgba(194, 65, 12,0.20)" : AMBER_LIGHT_BG,
    glucose: isDark ? "rgba(124, 58,237,0.20)" : PURPLE_MID_BG,
    bodyComp: isDark ? "rgba(  5,150,105,0.20)" : GREEN_LIGHT_BG,
    healthSync: isDark ? "rgba(  2,132,199,0.20)" : BLUE_LIGHT_BG,
    meals: isDark ? "rgba( 22,101, 52,0.20)" : GREEN_PALE_BG,
    exercise: isDark ? "rgba( 29, 78,216,0.20)" : BLUE_PALE_BG,
  };
  return map[key] || (isDark ? "rgba(255,255,255,0.08)" : NEUTRAL_LIGHT_BG);
};

const MACRO_TARGETS = { protein: 120, carbs: 275, fats: 80 };

const CARD_ALT_DARK = "#263248";
const CARD_ALT_LIGHT = "#F8FAFC";
const PURPLE_LIGHT_BG = "#F3E8FF";
const PURPLE_MID_BG = "#EDE9FE";
const PURPLE_LIGHTER_BG = "#FEF3FF";
const AMBER_LIGHT_BG = "#FEF3C7";
const BLUE_LIGHT_BG = "#E0F2FE";
const GREEN_LIGHT_BG = "#D1FAE5";
const GREEN_PALE_BG = "#F0FDF4";
const BLUE_PALE_BG = "#EFF6FF";
const NEUTRAL_LIGHT_BG = "#F3F4F6";

const SKELETON_STYLES = {
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tabRow: { flexDirection: "row", marginBottom: 16, gap: 8 },
  heroRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 24, marginTop: 16 },
  miniRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
  },
  planItemRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  progressItem: { marginRight: 12 },
  dateNav: { marginBottom: 16 },
  sectionLabel: { marginBottom: 12 },
  cardBottom: { marginBottom: 16 },
  planTitle: { marginBottom: 18 },
  content: (insetTop, padH) => ({
    paddingTop: insetTop + 18,
    paddingHorizontal: padH,
    paddingBottom: 92,
  }),
};

const UI_STYLES = {
  ringWrap: {
    width: 116,
    height: 116,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ringScore: { fontSize: 22, fontWeight: "800" },
  ringLabel: { fontSize: 10, fontWeight: "700", marginTop: -2 },
  macroRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  macroLabel: { width: 92, fontSize: 12, fontWeight: "600" },
  macroTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 8,
  },
  macroFill: { height: 6, borderRadius: 3 },
  macroPct: { width: 34, fontSize: 12, fontWeight: "700", textAlign: "right" },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
  },
  tabText: { fontSize: 12, fontWeight: "600" },
  navRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  navCenter: {
    flex: 1,
    marginHorizontal: 10,
    height: 42,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  navDisabled: { opacity: 0.3 },
  cardMini: {
    borderRadius: 22,
    padding: 16,
    marginRight: 10,
    borderWidth: 1,
  },
  cardMiniIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardMiniTitle: { fontSize: 11, fontWeight: "600", marginBottom: 3 },
  cardMiniValue: { fontSize: 18, fontWeight: "800" },
  cardMiniSub: { fontSize: 10, marginTop: 3 },
  cardAction: {
    width: "48%",
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  cardActionTitle: { fontSize: 15, fontWeight: "700" },
  cardActionDesc: { fontSize: 12, marginTop: 2 },
  cardActionChev: { position: "absolute", top: 15, right: 15 },
  navLabel: { fontSize: 13, fontWeight: "600" },
  miniCard: {
    width: "48%",
    borderRadius: 22,
    padding: 16,
    marginRight: 10,
    borderWidth: 1,
  },
  miniIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  miniTitle: { fontSize: 11, fontWeight: "600", marginBottom: 3 },
  miniValue: { fontSize: 18, fontWeight: "800" },
  miniSub: { fontSize: 10, marginTop: 3 },
  actionCard: {
    width: "48%",
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  actionIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  actionTitle: { fontSize: 15, fontWeight: "700" },
  actionDesc: { fontSize: 12, marginTop: 2 },
  actionChevron: { position: "absolute", top: 15, right: 15 },
  planRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  planBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  planText: { flex: 1, fontSize: 14 },
  emptyTrend: {
    flex: 1,
    minHeight: 76,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 18,
    padding: 14,
  },
  emptyTrendText: { fontSize: 12, textAlign: "center", lineHeight: 17 },
  notificationBtn: { marginRight: 12 },
  notificationBadge: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  panelCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  tabStrip: { marginBottom: 16 },
  tabContainer: { paddingHorizontal: 4 },
  screen: { flex: 1 },
  actionRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionRowTopCompact: { flexDirection: "column" },
  largeBtn: {
    width: "48%",
    height: 54,
    borderRadius: 27,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  largeBtnCompactFull: { width: "100%", marginBottom: 10 },
  aiCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    alignItems: "center",
  },
  progressCard: { borderRadius: 30, padding: 22, marginBottom: 18 },
  planCardWrap: { borderRadius: 30, padding: 22, marginBottom: 24 },
  quickAccessWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
};

// Additional shared text & container styles
UI_STYLES.headerGreeting = {
  fontSize: 12,
  fontWeight: "700",
  letterSpacing: 0.8,
  textTransform: "uppercase",
};
UI_STYLES.headerName = {
  fontSize: 30,
  fontWeight: "800",
  marginTop: 3,
  lineHeight: 34,
};
UI_STYLES.largeBtn = {
  width: "48%",
  height: 54,
  borderRadius: 27,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
};
UI_STYLES.largeBtnFull = { width: "100%", marginBottom: 10 };
UI_STYLES.largeBtnText = { fontSize: 15, fontWeight: "700" };
UI_STYLES.sectionTitle = { fontSize: 19, fontWeight: "800", marginBottom: 14 };
UI_STYLES.sectionSubtitle = { fontSize: 13, lineHeight: 20, marginTop: 4 };
UI_STYLES.aiIcon = {
  width: 48,
  height: 48,
  borderRadius: 16,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 14,
};
UI_STYLES.progressTitle = {
  fontSize: 12,
  fontWeight: "700",
  letterSpacing: 0.8,
  textTransform: "uppercase",
};
UI_STYLES.progressPct = { fontSize: 28, fontWeight: "800", marginTop: 4 };
UI_STYLES.progressSub = { marginTop: 4, fontSize: 13 };
UI_STYLES.progressBar = { height: 7, borderRadius: 3.5, marginTop: 14 };
UI_STYLES.planTitle = { fontSize: 19, fontWeight: "800", marginBottom: 14 };

// More generic text styles
UI_STYLES.h1 = { fontSize: 28, fontWeight: "800" };
UI_STYLES.h2 = { fontSize: 22, fontWeight: "800" };
UI_STYLES.h3 = { fontSize: 18, fontWeight: "800" };
UI_STYLES.h4 = { fontSize: 15, fontWeight: "800" };
UI_STYLES.body = { fontSize: 13 };
UI_STYLES.small = { fontSize: 11 };
UI_STYLES.tiny = { fontSize: 9 };
UI_STYLES.rowCenterGap = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 14,
};
UI_STYLES.rowCenter = { flexDirection: "row", alignItems: "center" };
UI_STYLES.rowBetween = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 14,
};
UI_STYLES.rowAround = { flexDirection: "row", justifyContent: "space-around" };
UI_STYLES.statValue = { fontSize: 16, fontWeight: "800" };
UI_STYLES.statValueSmall = { fontSize: 13, fontWeight: "800" };
UI_STYLES.statLabel = { fontSize: 11, marginTop: 2 };
UI_STYLES.dividerThin = { width: 1, height: 36 };
UI_STYLES.chevRight = { marginLeft: "auto" };
UI_STYLES.sleepBar = {
  flexDirection: "row",
  height: 16,
  borderRadius: 8,
  overflow: "hidden",
  marginBottom: 10,
};
UI_STYLES.rowBaseline = {
  flexDirection: "row",
  alignItems: "baseline",
  gap: 4,
};
UI_STYLES.btnPill = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
};
UI_STYLES.segSpacer = { marginRight: 2 };
UI_STYLES.flex1 = { flex: 1 };
UI_STYLES.centerAlign = { alignItems: "center" };

const CATEGORIES = [
  { key: "overview", icon: "view-dashboard", label: "Overview" },
  { key: "glucose", icon: "diabetes", label: "Glucose" },
  { key: "nutrition", icon: "food-apple", label: "Nutrition" },
  { key: "sleep", icon: "sleep", label: "Sleep" },
  { key: "activity", icon: "run", label: "Activity" },
  { key: "bmi", icon: "scale-bathroom", label: "BMI" },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) {
    return "Good morning 👋";
  }
  if (h < 17) {
    return "Good afternoon 👋";
  }
  return "Good evening 👋";
};

const getDateKey = (value) => {
  if (!value) {
    return null;
  }
  const d =
    typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
};

const todayKey = () => getDateKey(new Date());

const buildTrendPath = (values, w, h) => {
  if (!values.length) {
    return null;
  }
  if (values.length === 1) {
    return `M0,${h / 2} L${w},${h / 2}`;
  }
  const min = Math.min(...values),
    max = Math.max(...values);
  const spread = Math.max(max - min, 1);
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - ((v - min) / spread) * (h - 12) - 6,
  }));
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
};

const getHealthSummary = (vals) => {
  if (!vals.length) {
    return { score: 0, label: "No data", inRangeText: "Add a glucose reading" };
  }
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

const getBMI = (kg, cm) => {
  if (!kg || !cm) {
    return null;
  }
  const hm = cm / 100;
  return (kg / (hm * hm)).toFixed(1);
};

const getBMILabel = (bmi) => {
  if (!bmi) {
    return "Not set";
  }
  const n = Number(bmi);
  if (n < 18.5) {
    return "Underweight";
  }
  if (n < 25) {
    return "Healthy";
  }
  if (n < 30) {
    return "Overweight";
  }
  return "Obese";
};

const getCalorieTarget = (u = {}) => {
  const l = String(u.level || "").toLowerCase();
  if (l.includes("very active")) {
    return 2900;
  }
  if (l.includes("moderately active")) {
    return 2600;
  }
  if (l.includes("lightly active")) {
    return 2350;
  }
  return 2100;
};

const getInsightMessage = (u = {}, latest = null) => {
  const cond = String(u.diabetesType || "").toLowerCase();
  const act = String(u.level || "").toLowerCase();
  const gv = Number(latest?.value);
  if (!isFinite(gv)) {
    return cond.includes("type 2") || cond.includes("prediabetes")
      ? "Log a glucose reading to unlock meal and movement advice tailored to your profile."
      : "Log a glucose reading to get personalised insights.";
  }
  if (gv >= 180) {
    return "Your reading is elevated. A short walk and water break can help bring the trend down.";
  }
  if (gv >= 70 && gv <= 140) {
    return act.includes("sedentary")
      ? "Your glucose is in a good range. Use this window for a short walk or easy stretch."
      : "Your glucose is in range. Keep momentum with your next planned meal or movement block.";
  }
  return "Keep following your plan. Small consistent actions keep your day steady.";
};

const getDailyPlan = (u = {}, hasGlucose = false) => {
  const cond = String(u.diabetesType || "").toLowerCase();
  const act = String(u.level || "").toLowerCase();
  const freq = String(u.checkFrequency || "").toLowerCase();
  const ready = String(u.readinessLevel || "").toLowerCase();
  const items = [];

  if (!hasGlucose) {
    items.push("Log your first glucose reading");
  }
  if (cond.includes("type 2")) {
    items.push("Keep carbs balanced at every meal");
  } else if (cond.includes("prediabetes")) {
    items.push("Swap one refined carb for a fibre-rich option");
  } else {
    items.push("Log your next meal to keep your plan accurate");
  }

  if (act.includes("sedentary")) {
    items.push("Take a 10-min walk after your biggest meal");
  } else if (act.includes("lightly active")) {
    items.push("Add one extra movement break today");
  } else {
    items.push("Use your activity window for a post-meal check-in");
  }

  items.push(
    freq ? `Set a ${freq} glucose reminder` : "Set a glucose reminder for today"
  );

  if (ready.includes("starting")) {
    items.push("Focus on one small win before dinner");
  } else if (ready.includes("momentum")) {
    items.push("Keep your streak alive with one more log");
  } else {
    items.push("Review your progress and plan tomorrow");
  }

  return items.slice(0, 4);
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const SkeletonBlock = ({ w, h, r = 10, C, style }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, [anim]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.65],
  });

  return (
    <Animated.View
      style={[
        {
          width: w,
          height: h,
          borderRadius: r,
          backgroundColor: C.BORDER,
          opacity,
        },
        style,
      ]}
    />
  );
};

const HomeScreenSkeleton = ({ C, insetTop, padH }) => (
  <ScrollView
    contentContainerStyle={SKELETON_STYLES.content(insetTop, padH)}
    showsVerticalScrollIndicator={false}
  >
    {/* Header */}
    <View style={SKELETON_STYLES.headerRow}>
      <View>
        <SkeletonBlock
          w={96}
          h={12}
          r={6}
          C={C}
          style={SKELETON_STYLES.progressItem}
        />
        <SkeletonBlock w={160} h={24} r={8} C={C} />
      </View>
      <SkeletonBlock w={44} h={44} r={22} C={C} />
    </View>

    {/* Date nav */}
    <SkeletonBlock
      w="100%"
      h={40}
      r={20}
      C={C}
      style={SKELETON_STYLES.dateNav}
    />

    {/* Tab strip */}
    <View style={SKELETON_STYLES.tabRow}>
      {[80, 70, 90, 62, 74, 60].map((w, i) => (
        <SkeletonBlock key={i} w={w} h={34} r={17} C={C} />
      ))}
    </View>

    {/* Hero panel */}
    <View style={SKELETON_STYLES.heroRow}>
      <SkeletonBlock w="48%" h={176} r={24} C={C} />
      <SkeletonBlock w="48%" h={176} r={24} C={C} />
    </View>

    {/* Action buttons */}
    <View style={SKELETON_STYLES.actionRow}>
      <SkeletonBlock w="48%" h={52} r={26} C={C} />
      <SkeletonBlock w="48%" h={52} r={26} C={C} />
    </View>

    {/* Section label */}
    <SkeletonBlock
      w={120}
      h={14}
      r={6}
      C={C}
      style={SKELETON_STYLES.sectionLabel}
    />

    {/* Mini stat cards */}
    <View style={SKELETON_STYLES.miniRow}>
      {[0, 1, 2].map((i) => (
        <SkeletonBlock key={i} w={110} h={100} r={20} C={C} />
      ))}
    </View>

    {/* Insight card */}
    <SkeletonBlock
      w="100%"
      h={80}
      r={22}
      C={C}
      style={SKELETON_STYLES.cardBottom}
    />

    {/* Progress card */}
    <SkeletonBlock
      w="100%"
      h={130}
      r={28}
      C={C}
      style={SKELETON_STYLES.cardBottom}
    />

    {/* Plan card */}
    <View
      style={[
        SKELETON_STYLES.planCard,
        { backgroundColor: C.CARD, borderColor: C.BORDER },
      ]}
    >
      <SkeletonBlock
        w={140}
        h={14}
        r={6}
        C={C}
        style={SKELETON_STYLES.planTitle}
      />
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={SKELETON_STYLES.planItemRow}>
          <SkeletonBlock
            w={22}
            h={22}
            r={11}
            C={C}
            style={SKELETON_STYLES.progressItem}
          />
          <SkeletonBlock w={`${58 + i * 9}%`} h={12} r={6} C={C} />
        </View>
      ))}
    </View>
  </ScrollView>
);

// ─── Health ring ──────────────────────────────────────────────────────────────

const HealthRing = ({ score = 0, label = "No data", C }) => {
  const SIZE = 108,
    STROKE = 10,
    R = (SIZE - STROKE) / 2,
    CIRC = 2 * Math.PI * R;
  return (
    <View style={UI_STYLES.ringWrap}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={C.GREEN} />
            <Stop offset="1" stopColor={C.GREEN} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={C.BORDER}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="url(#ring)"
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${(score / 100) * CIRC} ${CIRC}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2},${SIZE / 2}`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={UI_STYLES.ringCenter}>
          <Text style={[UI_STYLES.ringScore, { color: C.TEXT }]}>{score}</Text>
          {/* Fixed: GREEN instead of colors.primary — was near-invisible on dark rings */}
          <Text style={[UI_STYLES.ringLabel, { color: C.GREEN }]}>{label}</Text>
        </View>
      </View>
    </View>
  );
};

// ─── Macro bar ────────────────────────────────────────────────────────────────

const MacroBar = ({ label, value, target, color, C }) => {
  const pct = Math.min(
    100,
    target > 0 ? Math.round((value / target) * 100) : 0
  );
  return (
    <View style={UI_STYLES.macroRow}>
      <Text style={[UI_STYLES.macroLabel, { color: C.MUTED }]}>{label}</Text>
      <View style={[UI_STYLES.macroTrack, { backgroundColor: C.BORDER }]}>
        {(() => {
          const fillStyle = { width: `${pct}%`, backgroundColor: color };
          return <View style={fillStyle} />;
        })()}
      </View>
      <Text style={[UI_STYLES.macroPct, { color: C.TEXT }]}>{pct}%</Text>
    </View>
  );
};

// ─── Category tabs ────────────────────────────────────────────────────────────

const CategoryTabs = ({ active, onSelect, C }) => {
  const ref = useRef(null);
  const [contW, setContW] = useState(0);
  const layouts = useRef({});

  useEffect(() => {
    const lay = layouts.current[active];
    if (!lay || !ref.current || !contW) {
      return;
    }
    ref.current.scrollTo({
      x: Math.max(0, lay.x - (contW - lay.width) / 2),
      animated: true,
    });
  }, [active, contW]);

  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={UI_STYLES.tabStrip}
      contentContainerStyle={UI_STYLES.tabContainer}
      onLayout={(e) => setContW(e.nativeEvent.layout.width)}
    >
      {CATEGORIES.map(({ key, icon, label }) => {
        const on = key === active;
        return (
          <TouchableOpacity
            key={key}
            onLayout={(e) => {
              layouts.current[key] = e.nativeEvent.layout;
            }}
            onPress={() => onSelect(key)}
            style={[
              UI_STYLES.tabPill,
              {
                backgroundColor: on ? C.PURPLE : C.CARD,
                borderColor: on ? C.PURPLE : C.BORDER,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={icon}
              size={17}
              color={on ? C.WHITE : C.MUTED}
            />
            <Text
              style={[UI_STYLES.tabText, { color: on ? C.WHITE : C.MUTED }]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// ─── Date navigator ───────────────────────────────────────────────────────────

const DateNavigator = ({ selectedDate, onDateChange, C }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sel = new Date(selectedDate);
  sel.setHours(0, 0, 0, 0);
  const diff = Math.round((today - sel) / 86400000);
  const label =
    diff === 0
      ? `Today, ${today.getDate()} ${today.toLocaleDateString("en-US", {
          month: "short",
        })}`
      : diff === 1
      ? "Yesterday"
      : sel.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  const canFwd = sel < today;
  const shift = (n) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + n);
    onDateChange(d.toISOString().split("T")[0]);
  };

  // use UI_STYLES.navBtn and pass color/border dynamically

  return (
    <View style={UI_STYLES.navRow}>
      <TouchableOpacity
        onPress={() => shift(-1)}
        style={[
          UI_STYLES.navBtn,
          { backgroundColor: C.CARD, borderColor: C.BORDER },
        ]}
      >
        <Ionicons name="chevron-back" size={16} color={C.MUTED} />
      </TouchableOpacity>
      <View
        style={[
          UI_STYLES.navCenter,
          { backgroundColor: C.CARD, borderColor: C.BORDER },
        ]}
      >
        <Ionicons name="calendar-outline" size={14} color={C.MUTED} />
        <Text style={[UI_STYLES.navLabel, { color: C.TEXT }]}>{label}</Text>
      </View>
      <TouchableOpacity
        onPress={() => canFwd && shift(1)}
        style={[
          UI_STYLES.navBtn,
          { backgroundColor: C.CARD, borderColor: C.BORDER },
          !canFwd && UI_STYLES.navDisabled,
        ]}
      >
        <Ionicons name="chevron-forward" size={16} color={C.MUTED} />
      </TouchableOpacity>
    </View>
  );
};

// ─── Mini stat card ───────────────────────────────────────────────────────────

const MiniStatCard = ({
  icon,
  iconColor,
  iconBg,
  title,
  value,
  sub,
  onPress,
  cardW,
  C,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      UI_STYLES.miniCard,
      { width: cardW, backgroundColor: C.CARD, borderColor: C.BORDER },
    ]}
  >
    <View style={[UI_STYLES.miniIconWrap, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
    </View>
    <Text style={[UI_STYLES.miniTitle, { color: C.MUTED }]}>{title}</Text>
    <Text style={[UI_STYLES.miniValue, { color: C.TEXT }]}>{value}</Text>
    <Text style={[UI_STYLES.miniSub, { color: C.MUTED }]}>{sub}</Text>
  </TouchableOpacity>
);

// ─── Action card ──────────────────────────────────────────────────────────────

const ActionCard = ({ title, desc, icon, iconBg, iconColor, onPress, C }) => (
  <PressableScale
    onPress={onPress}
    style={[
      UI_STYLES.actionCard,
      { backgroundColor: C.CARD, borderColor: C.BORDER },
    ]}
  >
    <View style={[UI_STYLES.actionIconWrap, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={icon} size={26} color={iconColor} />
    </View>
    <Text style={[UI_STYLES.actionTitle, { color: C.TEXT }]}>{title}</Text>
    <Text style={[UI_STYLES.actionDesc, { color: C.MUTED }]}>{desc}</Text>
    <Ionicons
      name="chevron-forward-circle"
      size={20}
      color={C.BORDER}
      style={UI_STYLES.actionChevron}
    />
  </PressableScale>
);

// ─── Plan item ────────────────────────────────────────────────────────────────

const PlanItem = ({ text, done, C }) => (
  <View style={UI_STYLES.planRow}>
    <View
      style={[
        UI_STYLES.planBullet,
        done
          ? { backgroundColor: C.GREEN }
          : { borderWidth: 2, borderColor: C.BORDER },
      ]}
    >
      {done && <Ionicons name="checkmark" size={12} color={C.WHITE} />}
    </View>
    <Text
      style={[
        UI_STYLES.planText,
        {
          color: done ? C.MUTED : C.TEXT,
          textDecorationLine: done ? "line-through" : "none",
        },
      ]}
    >
      {text}
    </Text>
  </View>
);

// ─── Empty trend placeholder ──────────────────────────────────────────────────

const EmptyTrend = ({ message, C }) => (
  <View style={[UI_STYLES.emptyTrend, { backgroundColor: C.PURPLE_MID }]}>
    <MaterialCommunityIcons name="chart-line" size={24} color={C.PURPLE} />
    <Text style={[UI_STYLES.emptyTrendText, { color: C.MUTED }]}>
      {message}
    </Text>
  </View>
);

// ─── Category panel ───────────────────────────────────────────────────────────

const CategoryPanel = ({
  category,
  chartW,
  chartH,
  healthSummary,
  trendPath,
  latestGlucose,
  mealTotals,
  calorieTarget,
  lastSleepLog,
  sleepFormatted,
  exerciseLogs,
  bmi,
  userData,
  navigation,
  isLoading,
  C,
}) => {
  const card = {
    ...UI_STYLES.panelCard,
    backgroundColor: C.CARD,
    borderColor: C.BORDER,
  };

  // utility card styles
  UI_STYLES.cardCenter = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  };
  UI_STYLES.mutedBold = { fontSize: 12, fontWeight: "700" };
  UI_STYLES.smallCenter = { fontSize: 11, textAlign: "center" };
  UI_STYLES.rowBaselineTop = {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 12,
  };
  UI_STYLES.emoji = { fontSize: 18, marginRight: 6 };
  UI_STYLES.streak = { fontWeight: "700" };

  if (category === "overview") {
    return (
      <View style={SKELETON_STYLES.heroRow}>
        {/* Health score */}
        <View style={[card, UI_STYLES.cardCenter]}>
          <Text
            style={[UI_STYLES.mutedBold, { color: C.MUTED, marginBottom: 10 }]}
          >
            Health Score
          </Text>
          <HealthRing
            score={healthSummary.score}
            label={healthSummary.label}
            C={C}
          />
          <Text
            style={[UI_STYLES.smallCenter, { color: C.MUTED, marginTop: 10 }]}
          >
            {isLoading ? "Syncing…" : healthSummary.inRangeText}
          </Text>
        </View>
        {/* Trend */}
        <TouchableOpacity
          style={[card, UI_STYLES.flex1]}
          onPress={() => navigation.navigate("GlucoseMonitor")}
        >
          <Text
            style={[UI_STYLES.mutedBold, { color: C.MUTED, marginBottom: 4 }]}
          >
            Metabolic Trend
          </Text>
          <Text style={[UI_STYLES.small, { color: C.MUTED, marginBottom: 6 }]}>
            {isLoading ? "Loading…" : healthSummary.inRangeText}
          </Text>
          <View style={[UI_STYLES.flex1, { marginVertical: 4 }]}>
            {trendPath ? (
              <Svg width={chartW * 0.46} height={chartH * 0.75}>
                <Defs>
                  <LinearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={C.PURPLE} stopOpacity="0.3" />
                    <Stop offset="1" stopColor={C.PURPLE} stopOpacity="0.02" />
                  </LinearGradient>
                </Defs>
                <Path
                  d={trendPath}
                  stroke={C.PURPLE}
                  strokeWidth="3"
                  fill="none"
                />
                <Path
                  d={`${trendPath} L${chartW * 0.46},${chartH * 0.75} L0,${
                    chartH * 0.75
                  } Z`}
                  fill="url(#trend)"
                />
                <Circle cx={chartW * 0.46} cy="28" r="5" fill={C.PURPLE} />
              </Svg>
            ) : (
              <EmptyTrend
                message={
                  isLoading
                    ? "Loading glucose records…"
                    : "Add a glucose reading to see your trend."
                }
                C={C}
              />
            )}
          </View>
          <View style={UI_STYLES.rowBaseline}>
            <Text style={[UI_STYLES.h2, { color: C.PURPLE }]}>
              {latestGlucose ? Math.round(Number(latestGlucose.value)) : "--"}
            </Text>
            <Text style={[UI_STYLES.small, { color: C.MUTED }]}>
              {latestGlucose?.unit || "mg/dL"}
            </Text>
          </View>
          <Text style={[UI_STYLES.small, { color: C.MUTED, marginTop: 2 }]}>
            {latestGlucose
              ? `Last • ${latestGlucose.period || "Logged"}`
              : "No readings yet"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (category === "glucose") {
    return (
      <TouchableOpacity
        style={card}
        onPress={() => navigation.navigate("GlucoseMonitor")}
      >
        <Text style={[UI_STYLES.h4, { color: C.TEXT }]}>Glucose Monitor</Text>
        <Text
          style={[
            UI_STYLES.small,
            { color: C.MUTED, marginTop: 2, marginBottom: 12 },
          ]}
        >
          Tap to view full history and trends
        </Text>
        {trendPath ? (
          <Svg width={chartW * 0.88} height={chartH}>
            <Defs>
              <LinearGradient id="gFade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={C.PURPLE} stopOpacity="0.28" />
                <Stop offset="1" stopColor={C.PURPLE} stopOpacity="0.02" />
              </LinearGradient>
            </Defs>
            <Path d={trendPath} stroke={C.PURPLE} strokeWidth="3" fill="none" />
            <Path
              d={`${trendPath} L${chartW * 0.88},${chartH} L0,${chartH} Z`}
              fill="url(#gFade)"
            />
          </Svg>
        ) : (
          <EmptyTrend
            message="Add a glucose reading to see your trend."
            C={C}
          />
        )}
        <View style={UI_STYLES.rowBaselineTop}>
          <Text style={[UI_STYLES.h1, { color: C.PURPLE }]}>
            {latestGlucose ? Math.round(Number(latestGlucose.value)) : "--"}
          </Text>
          <Text style={[UI_STYLES.body, { color: C.MUTED }]}>
            {latestGlucose?.unit || "mg/dL"}
          </Text>
        </View>
        <Text style={[UI_STYLES.small, { color: C.MUTED, marginTop: 2 }]}>
          {latestGlucose
            ? `Last reading • ${latestGlucose.period || "Logged"}`
            : "No glucose readings yet"}
        </Text>
      </TouchableOpacity>
    );
  }

  if (category === "nutrition") {
    const kcalLeft = Math.max(calorieTarget - (mealTotals.calories || 0), 0);
    return (
      <View style={card}>
        <View style={[UI_STYLES.rowBetween, { alignItems: "flex-start" }]}>
          <View>
            <Text style={[UI_STYLES.h4, { color: C.TEXT }]}>Nutrition</Text>
            <Text style={[UI_STYLES.small, { color: C.MUTED, marginTop: 2 }]}>
              {mealTotals.calories
                ? `${kcalLeft} kcal remaining`
                : "Log a meal to start tracking"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("MealEntry")}
            style={[UI_STYLES.btnPill, { backgroundColor: C.PURPLE }]}
          >
            <MaterialCommunityIcons name="plus" size={14} color={C.WHITE} />
            <Text style={[UI_STYLES.largeBtnText, { color: C.WHITE }]}>
              Log Food
            </Text>
          </TouchableOpacity>
        </View>
        <View style={UI_STYLES.rowCenterGap}>
          <MaterialCommunityIcons name="fire" size={18} color={C.AMBER} />
          <Text style={[UI_STYLES.h3, { color: C.TEXT }]}>
            {mealTotals.calories || "--"}
          </Text>
          <Text style={[UI_STYLES.body, { color: C.MUTED }]}>
            {mealTotals.calories
              ? ` of ${calorieTarget} kcal eaten`
              : " Log meals to see calories"}
          </Text>
        </View>
        <MacroBar
          label="Protein"
          value={mealTotals.protein}
          target={MACRO_TARGETS.protein}
          color={C.GREEN}
          C={C}
        />
        <MacroBar
          label="Carbs"
          value={mealTotals.carbs}
          target={MACRO_TARGETS.carbs}
          color={C.AMBER}
          C={C}
        />
        <MacroBar
          label="Fats"
          value={mealTotals.fats}
          target={MACRO_TARGETS.fats}
          color={C.BLUE}
          C={C}
        />
      </View>
    );
  }

  if (category === "sleep") {
    const eff = lastSleepLog?.efficiency ?? null;
    const status = lastSleepLog?.status ?? null;
    return (
      <TouchableOpacity
        style={card}
        onPress={() => navigation.navigate("SleepInsights")}
      >
        <View style={UI_STYLES.rowCenterGap}>
          <MaterialCommunityIcons name="sleep" size={20} color={C.PURPLE} />
          <Text style={[UI_STYLES.h4, { color: C.TEXT }]}>Sleep Insights</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={C.MUTED}
            style={UI_STYLES.chevRight}
          />
        </View>
        <View style={UI_STYLES.sleepBar}>
          {lastSleepLog?.lightPercent ? (
            <>
              <View
                style={[
                  {
                    flex: lastSleepLog.lightPercent,
                    backgroundColor: C.ACCENT_BLUE,
                  },
                  UI_STYLES.segSpacer,
                ]}
              />
              <View
                style={[
                  {
                    flex: lastSleepLog.deepPercent || 45,
                    backgroundColor: C.ACCENT_LIME,
                  },
                  UI_STYLES.segSpacer,
                ]}
              />
              <View
                style={[
                  {
                    flex: lastSleepLog.remPercent || 25,
                    backgroundColor: C.ACCENT_VIOLET,
                  },
                ]}
              />
            </>
          ) : (
            <View style={[UI_STYLES.flex1, { backgroundColor: C.BORDER }]} />
          )}
        </View>
        <View style={UI_STYLES.rowBetween}>
          <Text
            style={[UI_STYLES.small, { color: C.MUTED, fontWeight: "600" }]}
          >
            🛏 {lastSleepLog?.bedTime || "--:-- --"}
          </Text>
          <Text
            style={[UI_STYLES.small, { color: C.MUTED, fontWeight: "600" }]}
          >
            ☀️ {lastSleepLog?.wakeTime || "--:-- --"}
          </Text>
        </View>
        <View style={UI_STYLES.rowAround}>
          {[
            {
              label: "Total Sleep",
              value: lastSleepLog ? sleepFormatted : "--",
            },
            { label: "Efficiency", value: eff != null ? `${eff}%` : "--" },
            {
              label: "Status",
              value: status || "No data",
              color: lastSleepLog ? C.GREEN : C.MUTED,
            },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && (
                <View
                  style={[UI_STYLES.dividerThin, { backgroundColor: C.BORDER }]}
                />
              )}
              <View style={UI_STYLES.centerAlign}>
                <Text
                  style={[UI_STYLES.statValue, { color: stat.color || C.TEXT }]}
                >
                  {stat.value}
                </Text>
                <Text style={[UI_STYLES.statLabel, { color: C.MUTED }]}>
                  {stat.label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </TouchableOpacity>
    );
  }

  if (category === "activity") {
    const totalMins = exerciseLogs.reduce(
      (s, l) => s + (Number(l.value) || 0),
      0
    );
    return (
      <TouchableOpacity
        style={card}
        onPress={() => navigation.navigate("ActivityTracker")}
      >
        <View style={UI_STYLES.rowCenterGap}>
          <MaterialCommunityIcons name="run" size={20} color={C.BLUE} />
          <Text style={[UI_STYLES.h4, { color: C.TEXT }]}>
            Activity Tracker
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={C.MUTED}
            style={UI_STYLES.chevRight}
          />
        </View>
        <View style={UI_STYLES.rowAround}>
          {[
            { label: "Activities", value: String(exerciseLogs.length || 0) },
            { label: "Minutes", value: String(totalMins || 0) },
            {
              label: "Est. Steps",
              value:
                totalMins > 0 ? `~${(totalMins * 100).toLocaleString()}` : "0",
              note: "walking pace",
            },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && (
                <View
                  style={[UI_STYLES.dividerThin, { backgroundColor: C.BORDER }]}
                />
              )}
              <View style={UI_STYLES.centerAlign}>
                <Text style={[UI_STYLES.statValue, { color: C.TEXT }]}>
                  {stat.value}
                </Text>
                <Text style={[UI_STYLES.statLabel, { color: C.MUTED }]}>
                  {stat.label}
                </Text>
                {stat.note && (
                  <Text style={[UI_STYLES.tiny, { color: C.MUTED }]}>
                    {stat.note}
                  </Text>
                )}
              </View>
            </React.Fragment>
          ))}
        </View>
      </TouchableOpacity>
    );
  }

  if (category === "bmi") {
    return (
      <TouchableOpacity
        style={card}
        onPress={() => navigation.navigate("BodyComposition")}
      >
        <View style={UI_STYLES.rowCenterGap}>
          <MaterialCommunityIcons
            name="scale-bathroom"
            size={20}
            color={C.GREEN}
          />
          <Text style={[UI_STYLES.h4, { color: C.TEXT }]}>
            Body Composition
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={C.MUTED}
            style={UI_STYLES.chevRight}
          />
        </View>
        <View style={UI_STYLES.rowAround}>
          {[
            { label: "BMI", value: bmi ?? "--" },
            {
              label: "Weight",
              value: userData?.currentWeight
                ? `${userData.currentWeight} kg`
                : "--",
            },
            { label: "Status", value: getBMILabel(bmi) },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && (
                <View
                  style={[UI_STYLES.dividerThin, { backgroundColor: C.BORDER }]}
                />
              )}
              <View style={UI_STYLES.centerAlign}>
                <Text
                  style={[
                    stat.label === "Status"
                      ? UI_STYLES.statValueSmall
                      : UI_STYLES.statValue,
                    { color: C.TEXT },
                  ]}
                >
                  {stat.value}
                </Text>
                <Text style={[UI_STYLES.statLabel, { color: C.MUTED }]}>
                  {stat.label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </TouchableOpacity>
    );
  }

  return null;
};

// ─── Swipe wrapper ────────────────────────────────────────────────────────────

const CategorySwitcher = ({ activeCategory, onSwipe, children }) => {
  const { width: sw } = useWindowDimensions();
  const dragX = useRef(new Animated.Value(0)).current;
  const scale = dragX.interpolate({
    inputRange: [-sw, 0, sw],
    outputRange: [0.96, 1, 0.96],
    extrapolate: "clamp",
  });
  const opacity = dragX.interpolate({
    inputRange: [-sw * 0.6, 0, sw * 0.6],
    outputRange: [0.88, 1, 0.88],
    extrapolate: "clamp",
  });
  const catRef = useRef(activeCategory);
  useEffect(() => {
    catRef.current = activeCategory;
  }, [activeCategory]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => dragX.setValue(0),
      onPanResponderMove: Animated.event([null, { dx: dragX }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        const keys = CATEGORIES.map((c) => c.key);
        const ci = keys.indexOf(catRef.current);
        if (g.dx < -40 && ci < keys.length - 1) {
          Animated.timing(dragX, {
            toValue: -sw,
            duration: 140,
            useNativeDriver: false,
          }).start(() => {
            onSwipe("next");
            dragX.setValue(0);
          });
        } else if (g.dx > 40 && ci > 0) {
          Animated.timing(dragX, {
            toValue: sw,
            duration: 140,
            useNativeDriver: false,
          }).start(() => {
            onSwipe("prev");
            dragX.setValue(0);
          });
        } else {
          Animated.spring(dragX, {
            toValue: 0,
            friction: 6,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const animStyle = { transform: [{ translateX: dragX }, { scale }], opacity };
  return (
    <Animated.View style={animStyle} {...pan.panHandlers}>
      {children}
    </Animated.View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const { userData } = useUserProfile();
  const { logs: rawLogs, loading, refetch } = useUserLogs(60);
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const C = useMemo(() => buildColours(colors, isDark), [colors, isDark]);

  const [showAI, setShowAI] = useState(false);
  const [activeCategory, setActiveCategory] = useState("overview");
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();
  const { width: sw } = useWindowDimensions();
  const isCompact = sw < 390;

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

  const chartW = sw - (isCompact ? 72 : 88);
  const chartH = 100;

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
        (l) => l?.timestamp && getDateKey(l.timestamp) === selectedDate
      ),
    [logs, selectedDate]
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

  // Computed
  const healthSummary = useMemo(
    () => getHealthSummary(glucoseVals),
    [glucoseVals]
  );
  const trendPath = useMemo(
    () => buildTrendPath(glucoseVals, chartW * 0.46, chartH * 0.75),
    [glucoseVals, chartW]
  );
  const logStreak = useMemo(() => getLogStreak(logs), [logs]);
  const bmi = useMemo(
    () => getBMI(safeUser.currentWeight, safeUser.height),
    [safeUser]
  );
  const calorieTarget = useMemo(() => getCalorieTarget(safeUser), [safeUser]);
  const dailyPlan = useMemo(
    () => getDailyPlan(safeUser, glucoseVals.length > 0),
    [safeUser, glucoseVals.length]
  );
  const insightMsg = useMemo(
    () => getInsightMessage(safeUser, latestGluc),
    [safeUser, latestGluc]
  );

  const mealTotals = useMemo(
    () =>
      mealLogs.reduce(
        (t, l) => ({
          calories: t.calories + (Number(l.calories) || 0),
          protein: t.protein + (Number(l.protein) || 0),
          carbs: t.carbs + (Number(l.carbs) || 0),
          fats: t.fats + (Number(l.fats) || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      ),
    [mealLogs]
  );

  const sleepMins = lastSleepLog?.value || 0;
  const sleepFormatted =
    sleepMins >= 60
      ? `${Math.floor(sleepMins / 60)}h ${sleepMins % 60}m`
      : `${sleepMins}m`;

  const goalsDone = [
    glucoseLogs.some((l) => getDateKey(l.timestamp) === selectedDate),
    mealLogs.length > 0,
    exerciseLogs.length > 0,
    lastSleepLog != null,
  ].filter(Boolean).length;
  const progressPct = Math.round((goalsDone / 4) * 100);

  const handleSwipe = useCallback((dir) => {
    setActiveCategory((prev) => {
      const keys = CATEGORIES.map((c) => c.key);
      const ci = keys.indexOf(prev);
      const ni =
        dir === "next"
          ? Math.min(ci + 1, keys.length - 1)
          : Math.max(ci - 1, 0);
      return keys[ni] ?? prev;
    });
  }, []);

  const miniCardW = isCompact ? (sw - 48) / 2 : (sw - 56) / 3;

  // small shared inline style objects (extracted to remove JSX inline literals)
  const miniScrollStyle = { marginBottom: 24 };
  const miniScrollContent = { paddingRight: 4 };
  const progFillStyle = {
    width: `${progressPct}%`,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.PROGRESS_FILL,
  };

  // ── Skeleton ──
  if (loading && !logs.length && !safeUser.firstName) {
    return (
      <SafeAreaView style={[UI_STYLES.screen, { backgroundColor: C.BG }]}>
        <HomeScreenSkeleton
          C={C}
          insetTop={insets.top}
          padH={isCompact ? 16 : 20}
        />
      </SafeAreaView>
    );
  }

  const actionCards = [
    {
      key: "academy",
      title: "Academy",
      desc: "Reversal lessons",
      icon: "school",
      iconColor: C.ACCENT_PURPLE2,
      screen: "Education",
    },
    {
      key: "mealScan",
      title: "AI Meal Scan",
      desc: "Snap & analyse",
      icon: "camera",
      iconColor: C.ACCENT_ORANGE,
      screen: "MealAnalyser",
    },
    {
      key: "glucose",
      title: "Glucose",
      desc: "View full chart",
      icon: "chart-line",
      iconColor: C.PURPLE,
      screen: "GlucoseMonitor",
    },
    {
      key: "bodyComp",
      title: "Body Comp",
      desc: "Weight & BMI",
      icon: "scale-bathroom",
      iconColor: C.ACCENT_GREEN2,
      screen: "BodyComposition",
    },
    {
      key: "healthSync",
      title: "Health Sync",
      desc: "Google Fit",
      icon: "sync",
      iconColor: C.BLUE,
      screen: "HealthIntegration",
    },
    {
      key: "meals",
      title: "Smart Meals",
      desc: "Log & track",
      icon: "food-apple",
      iconColor: C.ACCENT_GREEN_DARK,
      screen: "MealEntry",
    },
    {
      key: "exercise",
      title: "Exercise",
      desc: "Log a workout",
      icon: "run",
      iconColor: C.ACCENT_BLUE2,
      screen: "ExerciseEntry",
    },
  ];

  return (
    <SafeAreaView style={[UI_STYLES.screen, { backgroundColor: C.BG }]}>
      <AnimatedScreen style={UI_STYLES.screen}>
        <ScrollView
          contentContainerStyle={SKELETON_STYLES.content(
            insets.top,
            isCompact ? 16 : 20
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.PURPLE}
            />
          }
        >
          {/* ── Header ── */}
          <View style={SKELETON_STYLES.headerRow}>
            <View>
              <Text style={[UI_STYLES.headerGreeting, { color: C.MUTED }]}>
                {getGreeting()}
              </Text>
              <Text style={[UI_STYLES.headerName, { color: C.TEXT }]}>
                {safeUser.firstName || "Daniel"}
              </Text>
            </View>
            <View style={UI_STYLES.rowCenter}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Notifications")}
                style={UI_STYLES.notificationBtn}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={C.TEXT}
                />
                <View
                  style={[
                    UI_STYLES.notificationBadge,
                    { backgroundColor: C.RED },
                  ]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("MainTabs", { screen: "Profile" })
                }
              >
                <View
                  style={[
                    UI_STYLES.avatarWrap,
                    {
                      backgroundColor: C.CARD,
                      borderWidth: 1,
                      borderColor: C.BORDER,
                    },
                  ]}
                >
                  <Text style={[{ fontWeight: "800", color: C.PURPLE }]}>
                    {(safeUser.firstName?.[0] || "D").toUpperCase()}
                    {(safeUser.lastName?.[0] || "N").toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <DateNavigator
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            C={C}
          />
          <CategoryTabs
            active={activeCategory}
            onSelect={setActiveCategory}
            C={C}
          />

          <CategorySwitcher
            activeCategory={activeCategory}
            onSwipe={handleSwipe}
          >
            <CategoryPanel
              category={activeCategory}
              chartW={chartW}
              chartH={chartH}
              healthSummary={healthSummary}
              trendPath={trendPath}
              latestGlucose={latestGluc}
              mealTotals={mealTotals}
              calorieTarget={calorieTarget}
              lastSleepLog={lastSleepLog}
              sleepFormatted={sleepFormatted}
              exerciseLogs={exerciseLogs}
              bmi={bmi}
              userData={safeUser}
              navigation={navigation}
              isLoading={loading}
              C={C}
            />
          </CategorySwitcher>

          {/* ── Action buttons ── */}
          <View
            style={[
              UI_STYLES.actionRowTop,
              isCompact && UI_STYLES.actionRowTopCompact,
            ]}
          >
            <TouchableOpacity
              style={[
                UI_STYLES.largeBtn,
                { backgroundColor: C.PURPLE },
                isCompact && UI_STYLES.largeBtnFull,
              ]}
              onPress={() => navigation.navigate("GlucoseEntry")}
            >
              <MaterialCommunityIcons
                name="diabetes"
                size={20}
                color={C.WHITE}
              />
              <Text style={[UI_STYLES.largeBtnText, { color: C.WHITE }]}>
                Log Glucose
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                UI_STYLES.largeBtn,
                {
                  backgroundColor: C.PURPLE_LIGHT,
                  borderWidth: 1.5,
                  borderColor: C.BORDER,
                },
                isCompact && UI_STYLES.largeBtnFull,
              ]}
              onPress={() => setShowAI(true)}
            >
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={18}
                color={C.PURPLE}
              />
              <Text style={[UI_STYLES.largeBtnText, { color: C.PURPLE }]}>
                AI Insight
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Today's Stats ── */}
          <Text
            style={[UI_STYLES.sectionTitle, { color: C.TEXT, marginTop: 26 }]}
          >
            Today's Stats
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={miniScrollStyle}
            contentContainerStyle={miniScrollContent}
          >
            <MiniStatCard
              icon="sleep"
              iconColor={C.ACCENT_DEEP_PURPLE}
              iconBg={C.ICON_SLEEP}
              title="Sleep"
              cardW={miniCardW}
              C={C}
              value={lastSleepLog ? sleepFormatted : "--"}
              sub={
                lastSleepLog
                  ? `${lastSleepLog.efficiency ?? "?"}% efficiency`
                  : "Log sleep data"
              }
              onPress={() => navigation.navigate("SleepInsights")}
            />
            <MiniStatCard
              icon="food-apple"
              iconColor={C.ACCENT_AMBER}
              iconBg={C.ICON_FOOD}
              title="Calories"
              cardW={miniCardW}
              C={C}
              value={mealTotals.calories || "--"}
              sub={
                mealTotals.calories ? `of ${calorieTarget} kcal` : "Log meals"
              }
              onPress={() => navigation.navigate("NutritionInsights")}
            />
            <MiniStatCard
              icon="run"
              iconColor={C.BLUE}
              iconBg={C.ICON_RUN}
              title="Activity"
              cardW={miniCardW}
              C={C}
              value={`${exerciseLogs.reduce(
                (s, l) => s + (Number(l.value) || 0),
                0
              )} min`}
              sub="active today"
              onPress={() => navigation.navigate("ActivityTracker")}
            />
            <MiniStatCard
              icon="scale-bathroom"
              iconColor={C.ACCENT_GREEN2}
              iconBg={C.ICON_BMI}
              title="BMI"
              cardW={miniCardW}
              C={C}
              value={bmi ?? "--"}
              sub={getBMILabel(bmi)}
              onPress={() => navigation.navigate("BodyComposition")}
            />
          </ScrollView>

          {/* ── AI Insight ── */}
          <View
            style={[
              UI_STYLES.panelCard,
              {
                backgroundColor: C.CARD,
                borderColor: C.BORDER,
                marginBottom: 16,
              },
            ]}
          >
            <View
              style={[UI_STYLES.aiIcon, { backgroundColor: C.PURPLE_LIGHT }]}
            >
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={22}
                color={C.PURPLE}
              />
            </View>
            <View style={UI_STYLES.flex1}>
              <Text style={[UI_STYLES.largeBtnText, { color: C.TEXT }]}>
                Optimal Window
              </Text>
              <Text style={[UI_STYLES.sectionSubtitle, { color: C.MUTED }]}>
                {insightMsg}
              </Text>
            </View>
          </View>

          {/* ── Progress ── */}
          <View style={[UI_STYLES.progressCard, { backgroundColor: C.PURPLE }]}>
            <Text
              style={[
                UI_STYLES.progressTitle,
                { color: "rgba(255,255,255,0.65)" },
              ]}
            >
              Today's Progress
            </Text>
            <Text style={[UI_STYLES.progressPct, { color: C.WHITE }]}>
              {progressPct}% Complete
            </Text>
            <Text
              style={[
                UI_STYLES.progressSub,
                { color: "rgba(255,255,255,0.75)" },
              ]}
            >
              {goalsDone} of 4 goals logged today
            </Text>
            <View
              style={[
                UI_STYLES.progressBar,
                { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            >
              <View style={progFillStyle} />
            </View>
            <View style={UI_STYLES.rowCenterTop}>
              <Text style={UI_STYLES.emoji}>🔥</Text>
              <Text style={[UI_STYLES.streak, { color: C.AMBER }]}>
                {logStreak} Day Streak
              </Text>
            </View>
          </View>

          {/* ── Daily Plan ── */}
          {/* Fixed: was missing backgroundColor — transparent on dark mode */}
          <View
            style={[
              UI_STYLES.panelCard,
              {
                backgroundColor: C.CARD,
                borderColor: C.BORDER,
                marginBottom: 24,
              },
            ]}
          >
            <Text style={[UI_STYLES.planTitle, { color: C.TEXT }]}>
              Your Plan Today
            </Text>
            {dailyPlan.map((text, i) => (
              <PlanItem
                key={text}
                text={text}
                done={i === 0 && goalsDone > 0}
                C={C}
              />
            ))}
          </View>

          {/* ── Quick Access grid ── */}
          {activeCategory === "overview" && (
            <>
              <Text style={[UI_STYLES.sectionTitle, { color: C.TEXT }]}>
                Quick Access
              </Text>
              <View style={UI_STYLES.quickAccessWrap}>
                {actionCards.map((card) => (
                  <ActionCard
                    key={card.key}
                    title={card.title}
                    desc={card.desc}
                    icon={card.icon}
                    iconBg={gridIconBg(card.key, isDark)}
                    iconColor={card.iconColor}
                    onPress={() => navigation.navigate(card.screen)}
                    C={C}
                  />
                ))}
              </View>
            </>
          )}
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
