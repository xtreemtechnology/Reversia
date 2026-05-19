// src/screens/HealthIntegration.js
import React, { useState, useRef, useEffect } from "react";
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Switch,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Path,
  Line,
  Rect,
} from "react-native-svg";
import { useTheme } from "../../../theme/ThemeProvider";

// removed module-level Dimensions; components will read width via useWindowDimensions

// ─── Mock synced data ─────────────────────────────────────────────────────────
const SYNCED_DATA = {
  steps: 8_432,
  stepsGoal: 10_000,
  heartRate: 72,
  hrMin: 58,
  hrMax: 104,
  calories: 1_820,
  caloriesGoal: 2_600,
  distance: 5.4, // km
  activeMin: 38,
  activeGoal: 60,
  lastSync: "2 minutes ago",
};

const WEEK_STEPS = [
  { day: "Mon", val: 9200 },
  { day: "Tue", val: 7800 },
  { day: "Wed", val: 11200 },
  { day: "Thu", val: 6500 },
  { day: "Fri", val: 8900 },
  { day: "Sat", val: 5300 },
  { day: "Sun", val: 8432 },
];

const DATA_TYPES = [
  {
    key: "steps",
    label: "Steps & Distance",
    icon: "walk",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    enabled: true,
  },
  {
    key: "heart_rate",
    label: "Heart Rate",
    icon: "heart-pulse",
    iconColor: "#EF4444",
    iconBg: "#FEE2E2",
    enabled: true,
  },
  {
    key: "sleep",
    label: "Sleep Data",
    icon: "sleep",
    iconColor: "#6D28D9",
    iconBg: "#EDE9FE",
    enabled: true,
  },
  {
    key: "calories",
    label: "Calories Burned",
    icon: "fire",
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
    enabled: true,
  },
  {
    key: "weight",
    label: "Weight & BMI",
    icon: "scale-bathroom",
    iconColor: "#0284C7",
    iconBg: "#E0F2FE",
    enabled: false,
  },
  {
    key: "blood_glucose",
    label: "Blood Glucose",
    icon: "diabetes",
    iconColor: "#825CFF",
    iconBg: "#EDE9FE",
    enabled: false,
  },
  {
    key: "nutrition",
    label: "Nutrition",
    icon: "food-apple",
    iconColor: "#D97706",
    iconBg: "#FEF3C7",
    enabled: false,
  },
  {
    key: "workouts",
    label: "Workouts",
    icon: "dumbbell",
    iconColor: "#059669",
    iconBg: "#D1FAE5",
    enabled: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pct = (val, goal) => Math.min((val / goal) * 100, 100);

// ─── Animated Ring ────────────────────────────────────────────────────────────
const AnimatedRing = ({
  value,
  goal,
  color,
  size = 70,
  strokeW = 8,
  label,
  sublabel,
}) => {
  const { colors } = useTheme();
  const styles = getRingStyles(colors);
  const progress = pct(value, goal);
  const R = (size - strokeW) / 2;
  const CIRC = 2 * Math.PI * R;
  const filled = (progress / 100) * CIRC;

  return (
    <View style={styles.container}>
      <View style={[styles.ringWrap, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id={`rg_${label}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity="1" />
              <Stop offset="1" stopColor={color} stopOpacity="0.6" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            stroke={colors.border}
            strokeWidth={strokeW}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            stroke={`url(#rg_${label})`}
            strokeWidth={strokeW}
            fill="none"
            strokeDasharray={`${filled} ${CIRC}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.ringTextWrap}>
          <Text style={styles.percentText}>{Math.round(progress)}%</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sub}>{sublabel}</Text>
    </View>
  );
};

const getRingStyles = (colors) =>
  StyleSheet.create({
    container: { alignItems: "center" },
    ringWrap: {
      alignItems: "center",
      justifyContent: "center",
    },
    ringTextWrap: { position: "absolute", alignItems: "center" },
    percentText: { fontSize: 13, fontWeight: "800", color: colors.text },
    label: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.text,
      marginTop: 6,
    },
    sub: { fontSize: 10, color: colors.muted, marginTop: 1 },
  });

// ─── Stat Tile ────────────────────────────────────────────────────────────────
const StatTile = ({
  icon,
  iconColor,
  iconBg,
  title,
  value,
  unit,
  sub,
  subColor,
  style,
}) => (
  <StatTileContent
    icon={icon}
    iconColor={iconColor}
    iconBg={iconBg}
    title={title}
    value={value}
    unit={unit}
    sub={sub}
    subColor={subColor}
    style={style}
  />
);

const StatTileContent = ({
  icon,
  iconColor,
  iconBg,
  title,
  value,
  unit,
  sub,
  subColor,
  style,
}) => {
  const { colors } = useTheme();
  const styles = getTileStyles(colors);

  return (
    <View style={[styles.tile, style]}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>
        {value}
        <Text style={styles.unit}> {unit}</Text>
      </Text>
      {sub && (
        <Text style={[styles.sub, subColor && { color: subColor }]}>{sub}</Text>
      )}
    </View>
  );
};

const getTileStyles = (colors) =>
  StyleSheet.create({
    tile: {
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 16,
      marginBottom: 12,
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    title: {
      fontSize: 11,
      color: colors.muted,
      fontWeight: "600",
      marginBottom: 4,
    },
    value: { fontSize: 22, fontWeight: "800", color: colors.text },
    unit: { fontSize: 12, color: colors.muted },
    sub: { fontSize: 11, color: colors.muted, marginTop: 4 },
  });

// ─── Steps Bar Chart ──────────────────────────────────────────────────────────
const CHART_H = 90;
const MAX_STEPS = 12000;

const StepsChart = ({ data }) => {
  const { colors } = useTheme();
  const styles = getChartStyles(colors);
  const { width: screenWidth } = useWindowDimensions();
  const CHART_W = Math.max(screenWidth - 80, 160);
  const BAR_W = Math.max(Math.floor(CHART_W / data.length) - 6, 6);

  return (
    <View style={styles.container}>
      <Svg width={CHART_W} height={CHART_H + 4}>
        <Defs>
          <LinearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#10B981" stopOpacity="1" />
            <Stop offset="1" stopColor="#10B981" stopOpacity="0.5" />
          </LinearGradient>
        </Defs>
        {/* Goal line */}
        <Line
          x1="0"
          y1={CHART_H - (10000 / MAX_STEPS) * CHART_H}
          x2={CHART_W}
          y2={CHART_H - (10000 / MAX_STEPS) * CHART_H}
          stroke={colors.border}
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        {data.map((d, i) => {
          const barH = (d.val / MAX_STEPS) * CHART_H;
          const x =
            i * (CHART_W / data.length) + (CHART_W / data.length - BAR_W) / 2;
          const y = CHART_H - barH;
          const isToday = i === data.length - 1;
          return (
            <Rect
              key={d.day}
              x={x}
              y={y}
              width={BAR_W}
              height={barH}
              fill={isToday ? "url(#stepGrad)" : "#E5E7EB"}
              rx="6"
            />
          );
        })}
      </Svg>
      {/* X labels */}
      <View style={styles.labelsRow}>
        {data.map((d, i) => (
          <Text
            key={d.day}
            style={[
              styles.dayLabel,
              i === data.length - 1 && styles.dayLabelActive,
            ]}
          >
            {d.day}
          </Text>
        ))}
      </View>
    </View>
  );
};

const getChartStyles = (colors) =>
  StyleSheet.create({
    container: { marginTop: 10 },
    labelsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 4,
    },
    dayLabel: { fontSize: 10, color: colors.muted, fontWeight: "600" },
    dayLabelActive: { color: "#10B981", fontWeight: "800" },
  });

// ─── Heart Rate Sparkline ─────────────────────────────────────────────────────
const HRSparkline = ({ min, current, max }) => {
  const { colors } = useTheme();
  const styles = getHrStyles(colors);
  // Simple 12-point mock HR data
  const hrData = [68, 72, 75, 71, 69, 74, 78, 80, 73, 70, 72, 72];
  const { width: screenWidth } = useWindowDimensions();
  const W = Math.max(screenWidth - 80, 200);
  const H = 50;
  const toX = (i) => (i / (hrData.length - 1)) * W;
  const toY = (v) => H - ((v - 60) / 30) * H;

  const pathD = hrData
    .map((v, i) => {
      const x = toX(i),
        y = toY(v);
      if (i === 0) {
        return `M${x},${y}`;
      }
      const px = toX(i - 1),
        py = toY(hrData[i - 1]);
      return `C${(px + x) / 2},${py} ${(px + x) / 2},${y} ${x},${y}`;
    })
    .join(" ");

  return (
    <View>
      <Svg width={W} height={H + 4}>
        <Defs>
          <LinearGradient id="hrGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#EF4444" stopOpacity="0.6" />
            <Stop offset="1" stopColor="#EF4444" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path
          d={pathD}
          stroke="url(#hrGrad)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Current dot */}
        <Circle
          cx={toX(hrData.length - 1)}
          cy={toY(hrData[hrData.length - 1])}
          r="5"
          fill="#EF4444"
        />
      </Svg>
      <View style={styles.stats}>
        <Text style={styles.stat}>
          ↓ {min} <Text style={styles.statLabel}>min</Text>
        </Text>
        <Text style={[styles.stat, { color: "#EF4444", fontSize: 18 }]}>
          {current} <Text style={styles.statUnit}>bpm</Text>
        </Text>
        <Text style={styles.stat}>
          ↑ {max} <Text style={styles.statLabel}>max</Text>
        </Text>
      </View>
    </View>
  );
};

const getHrStyles = (colors) =>
  StyleSheet.create({
    stats: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    stat: { fontSize: 14, fontWeight: "700", color: colors.text },
    statLabel: { fontSize: 11, color: colors.muted, fontWeight: "400" },
    statUnit: { fontSize: 12, color: colors.muted },
  });

// ─── Data Type Toggle Row ─────────────────────────────────────────────────────
const DataTypeRow = ({ item, onToggle }) => (
  <DataTypeRowContent item={item} onToggle={onToggle} />
);

const DataTypeRowContent = ({ item, onToggle }) => {
  const { colors } = useTheme();
  const styles = getDtStyles(colors);

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
        <MaterialCommunityIcons
          name={item.icon}
          size={18}
          color={item.iconColor}
        />
      </View>
      <Text style={styles.label}>{item.label}</Text>
      <Switch
        value={item.enabled}
        onValueChange={() => onToggle(item.key)}
        trackColor={{ false: colors.border, true: colors.text }}
        thumbColor="#FFF"
      />
    </View>
  );
};

const getDtStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    label: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
  });

// ─── Connection Card ──────────────────────────────────────────────────────────
const ConnectionCard = ({ connected, onConnect, onDisconnect, lastSync }) => {
  const { colors } = useTheme();
  const styles = getConnStyles(colors);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (connected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [connected, pulseAnim]);

  return (
    <View style={styles.card}>
      {/* Logos */}
      <View style={styles.logosRow}>
        {/* Google Fit logo placeholder */}
        <View style={styles.logo}>
          <MaterialCommunityIcons name="google-fit" size={28} color="#4285F4" />
        </View>
        {/* Connection line */}
        <View style={styles.lineWrap}>
          <View style={[styles.line, connected && styles.lineConnected]} />
          {connected && (
            <Animated.View
              style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]}
            />
          )}
        </View>
        {/* Reversia logo placeholder */}
        <View style={[styles.logo, styles.reversiaLogo]}>
          <MaterialCommunityIcons
            name="heart-pulse"
            size={28}
            color="#825CFF"
          />
        </View>
      </View>

      {/* Status */}
      <View
        style={[
          styles.statusRow,
          { backgroundColor: connected ? "#D1FAE5" : "#FEE2E2" },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            { backgroundColor: connected ? "#10B981" : "#EF4444" },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: connected ? "#065F46" : "#991B1B" },
          ]}
        >
          {connected ? `Connected · Synced ${lastSync}` : "Not Connected"}
        </Text>
      </View>

      {/* Data icons */}
      <View style={styles.dataIcons}>
        {[
          { icon: "food-apple", color: "#F59E0B" },
          { icon: "sleep", color: "#6D28D9" },
          { icon: "arm-flex", color: "#10B981" },
          { icon: "diabetes", color: "#825CFF" },
        ].map((d, i) => (
          <View key={i} style={styles.dataIcon}>
            <MaterialCommunityIcons name={d.icon} size={22} color={d.color} />
          </View>
        ))}
      </View>

      <Text style={styles.desc}>
        {connected
          ? "Reversia is syncing steps, sleep, heart rate, and activity from Google Fit."
          : "Connect Google Fit to automatically sync your health data with Reversia."}
      </Text>

      <TouchableOpacity
        style={[styles.btn, connected && styles.btnDisconnect]}
        onPress={connected ? onDisconnect : onConnect}
      >
        <MaterialCommunityIcons
          name={connected ? "link-off" : "link"}
          size={18}
          color={connected ? "#EF4444" : "#FFF"}
        />
        <Text style={[styles.btnText, connected && styles.btnTextDisconnect]}>
          {connected ? "Disconnect Google Fit" : "Connect Google Fit"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getConnStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 14,
    },
    logosRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      gap: 12,
    },
    logo: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    reversiaLogo: { backgroundColor: colors.card, borderColor: colors.border },
    lineWrap: {
      flex: 1,
      height: 2,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    line: {
      width: "100%",
      height: 2,
      backgroundColor: colors.border,
      borderRadius: 1,
    },
    lineConnected: { backgroundColor: "#10B981" },
    pulse: {
      position: "absolute",
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#10B981",
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      marginBottom: 14,
      alignSelf: "center",
    },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusText: { fontSize: 12, fontWeight: "700" },
    dataIcons: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 16,
      marginBottom: 14,
    },
    dataIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    desc: {
      fontSize: 13,
      color: colors.muted,
      textAlign: "center",
      lineHeight: 19,
      marginBottom: 18,
    },
    btn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.text,
      borderRadius: 20,
      height: 50,
    },
    btnDisconnect: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: "#FEE2E2",
    },
    btnText: { color: colors.background, fontWeight: "700", fontSize: 14 },
    btnTextDisconnect: { color: "#EF4444" },
  });

// ─── Insight Card ─────────────────────────────────────────────────────────────
const InsightCard = ({ icon, iconColor, iconBg, title, text }) => (
  <InsightCardContent
    icon={icon}
    iconColor={iconColor}
    iconBg={iconBg}
    title={title}
    text={text}
  />
);

const InsightCardContent = ({ icon, iconColor, iconBg, title, text }) => {
  const { colors } = useTheme();
  const styles = getInsightStyles(colors);

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.body}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
};

const getInsightStyles = (colors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 11,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      flexShrink: 0,
    },
    body: { flex: 1 },
    title: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 3,
    },
    text: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },
  });

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HealthIntegration({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const [connected, setConnected] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dataTypes, setDataTypes] = useState(DATA_TYPES);
  const [message, setMessage] = useState(null);
  const d = SYNCED_DATA;

  const { width: screenWidth } = useWindowDimensions();
  const isNarrow = screenWidth < 430;
  const contentPadding = 16;
  const contentWidth = Math.max(screenWidth - contentPadding * 2, 320);
  const cardWidth = isNarrow ? "100%" : (contentWidth - 12) / 2;

  const toggleDataType = (key) => {
    setDataTypes((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleConnect = () => {
    setConnected(true);
    setMessage("Google Fit connected.");
  };

  const handleDisconnect = () => {
    setConnected(false);
    setMessage("Google Fit disconnected.");
  };

  const styles = getStyles(colors, isDark);
  const workoutStyles = getWorkoutStyles(colors);
  const freqStyles = getFreqStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Integration</Text>
        {connected && (
          <TouchableOpacity
            style={styles.syncBtn}
            onPress={() => setMessage("Data refreshed from Google Fit.")}
          >
            <MaterialCommunityIcons name="sync" size={20} color="#10B981" />
          </TouchableOpacity>
        )}
        {!connected && <View style={{ width: 38 }} />}
      </View>

      {message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Connection Card ── */}
        <ConnectionCard
          connected={connected}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          lastSync={d.lastSync}
        />

        {connected && (
          <>
            {/* ── Tab Switch ── */}
            <View style={styles.tabs}>
              {["overview", "activity", "settings"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.tabTextActive,
                    ]}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ─── OVERVIEW TAB ─── */}
            {activeTab === "overview" && (
              <>
                {/* Rings row */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Today's Progress</Text>
                  <Text style={[styles.cardSub, { marginBottom: 20 }]}>
                    Synced from Google Fit
                  </Text>
                  <View style={styles.ringsRow}>
                    <AnimatedRing
                      value={d.steps}
                      goal={d.stepsGoal}
                      color="#10B981"
                      size={76}
                      strokeW={8}
                      label="Steps"
                      sublabel={`${d.steps.toLocaleString()}`}
                    />
                    <AnimatedRing
                      value={d.activeMin}
                      goal={d.activeGoal}
                      color="#825CFF"
                      size={76}
                      strokeW={8}
                      label="Active"
                      sublabel={`${d.activeMin} min`}
                    />
                    <AnimatedRing
                      value={d.calories}
                      goal={d.caloriesGoal}
                      color="#F59E0B"
                      size={76}
                      strokeW={8}
                      label="Calories"
                      sublabel={`${d.calories} kcal`}
                    />
                  </View>
                </View>

                {/* Stat tiles */}
                <Text style={styles.sectionTitle}>Health Metrics</Text>
                <View style={styles.grid}>
                  <StatTile
                    icon="walk"
                    iconColor="#10B981"
                    iconBg="#D1FAE5"
                    title="Steps Today"
                    value={d.steps.toLocaleString()}
                    unit="steps"
                    sub={`${d.stepsGoal.toLocaleString()} goal`}
                    style={{ width: cardWidth }}
                  />
                  <StatTile
                    icon="heart-pulse"
                    iconColor="#EF4444"
                    iconBg="#FEE2E2"
                    title="Heart Rate"
                    value={d.heartRate}
                    unit="bpm"
                    sub="Resting — Normal"
                    subColor="#10B981"
                    style={{ width: cardWidth }}
                  />
                  <StatTile
                    icon="map-marker-distance"
                    iconColor="#0284C7"
                    iconBg="#E0F2FE"
                    title="Distance"
                    value={d.distance}
                    unit="km"
                    sub="Today's movement"
                    style={{ width: cardWidth }}
                  />
                  <StatTile
                    icon="timer-outline"
                    iconColor="#825CFF"
                    iconBg="#EDE9FE"
                    title="Active Minutes"
                    value={d.activeMin}
                    unit="min"
                    sub={`of ${d.activeGoal} min goal`}
                    subColor={
                      d.activeMin >= d.activeGoal ? "#10B981" : "#F59E0B"
                    }
                    style={{ width: cardWidth }}
                  />
                </View>

                {/* Heart Rate card */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>Heart Rate</Text>
                      <Text style={styles.cardSub}>Today's readings</Text>
                    </View>
                    <View style={styles.hrBadge}>
                      <View style={styles.hrDot} />
                      <Text style={styles.hrBadgeText}>Live</Text>
                    </View>
                  </View>
                  <HRSparkline
                    min={d.hrMin}
                    current={d.heartRate}
                    max={d.hrMax}
                  />
                </View>

                {/* Insights */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Activity Insights</Text>
                  <Text style={[styles.cardSub, { marginBottom: 14 }]}>
                    Based on your Google Fit data
                  </Text>
                  <InsightCard
                    icon="walk"
                    iconColor="#10B981"
                    iconBg="#D1FAE5"
                    title="Steps progress"
                    text="You're at 84% of your daily step goal. A 10-minute walk after dinner will help you hit 10,000 and improve glucose uptake."
                  />
                  <InsightCard
                    icon="heart-pulse"
                    iconColor="#EF4444"
                    iconBg="#FEE2E2"
                    title="Heart rate"
                    text="Your resting heart rate of 72 bpm is in the normal range. Consistent aerobic exercise can lower this and improve insulin sensitivity."
                  />
                  <InsightCard
                    icon="timer-outline"
                    iconColor="#825CFF"
                    iconBg="#EDE9FE"
                    title="Active minutes"
                    text="You have 22 minutes left to hit your active goal. Breaking this into 2 short walks is just as effective as one longer session."
                  />
                </View>
              </>
            )}

            {/* ─── ACTIVITY TAB ─── */}
            {activeTab === "activity" && (
              <>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>Weekly Steps</Text>
                      <Text style={styles.cardSub}>This week's step count</Text>
                    </View>
                    <View style={styles.goalChip}>
                      <Text style={styles.goalChipText}>Goal: 10k</Text>
                    </View>
                  </View>
                  <StepsChart data={WEEK_STEPS} />

                  {/* Weekly stats */}
                  <View style={styles.weekStats}>
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatVal}>
                        {Math.round(
                          WEEK_STEPS.reduce((s, entry) => s + entry.val, 0) /
                            WEEK_STEPS.length
                        ).toLocaleString()}
                      </Text>
                      <Text style={styles.weekStatLabel}>Daily avg</Text>
                    </View>
                    <View style={styles.weekStatDivider} />
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatVal}>
                        {
                          WEEK_STEPS.filter((entry) => entry.val >= 10000)
                            .length
                        }{" "}
                        / 7
                      </Text>
                      <Text style={styles.weekStatLabel}>Goal days</Text>
                    </View>
                    <View style={styles.weekStatDivider} />
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatVal}>
                        {(
                          WEEK_STEPS.reduce((s, entry) => s + entry.val, 0) *
                          0.00065
                        ).toFixed(1)}{" "}
                        km
                      </Text>
                      <Text style={styles.weekStatLabel}>Total dist.</Text>
                    </View>
                  </View>
                </View>

                {/* Workout log */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Recent Workouts</Text>
                  <Text style={[styles.cardSub, { marginBottom: 14 }]}>
                    Synced from Google Fit
                  </Text>
                  {[
                    {
                      type: "Walking",
                      dur: "28 min",
                      kcal: 142,
                      date: "Today",
                      icon: "walk",
                      color: "#10B981",
                      bg: "#D1FAE5",
                    },
                    {
                      type: "Cycling",
                      dur: "45 min",
                      kcal: 310,
                      date: "Yesterday",
                      icon: "bike",
                      color: "#0284C7",
                      bg: "#E0F2FE",
                    },
                    {
                      type: "Walking",
                      dur: "15 min",
                      kcal: 76,
                      date: "Fri",
                      icon: "walk",
                      color: "#10B981",
                      bg: "#D1FAE5",
                    },
                    {
                      type: "Yoga",
                      dur: "30 min",
                      kcal: 95,
                      date: "Thu",
                      icon: "yoga",
                      color: "#825CFF",
                      bg: "#EDE9FE",
                    },
                  ].map((w, i, arr) => (
                    <View
                      key={i}
                      style={[
                        workoutStyles.row,
                        i < arr.length - 1 && workoutStyles.rowBorder,
                      ]}
                    >
                      <View
                        style={[workoutStyles.icon, { backgroundColor: w.bg }]}
                      >
                        <MaterialCommunityIcons
                          name={w.icon}
                          size={18}
                          color={w.color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={workoutStyles.type}>{w.type}</Text>
                        <Text style={workoutStyles.dur}>
                          {w.dur} · {w.date}
                        </Text>
                      </View>
                      <Text style={workoutStyles.kcal}>{w.kcal} kcal</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* ─── SETTINGS TAB ─── */}
            {activeTab === "settings" && (
              <>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Sync Settings</Text>
                  <Text style={[styles.cardSub, { marginBottom: 4 }]}>
                    Choose which data types to sync
                  </Text>
                  {dataTypes.map((item, i) => (
                    <DataTypeRow
                      key={item.key}
                      item={item}
                      onToggle={toggleDataType}
                    />
                  ))}
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Sync Frequency</Text>
                  <Text style={[styles.cardSub, { marginBottom: 14 }]}>
                    How often Reversia pulls your data
                  </Text>
                  {[
                    "Every 15 min",
                    "Every 30 min",
                    "Every hour",
                    "Manual only",
                  ].map((opt, i) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        freqStyles.option,
                        i === 1 && freqStyles.optionActive,
                        i < 3 && freqStyles.optionBorder,
                      ]}
                    >
                      <Text
                        style={[
                          freqStyles.optionText,
                          i === 1 && freqStyles.optionTextActive,
                        ]}
                      >
                        {opt}
                      </Text>
                      {i === 1 && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#111827"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.dangerBtn}
                  onPress={handleDisconnect}
                >
                  <MaterialCommunityIcons
                    name="link-off"
                    size={18}
                    color="#EF4444"
                  />
                  <Text style={styles.dangerBtnText}>
                    Disconnect Google Fit
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {/* ── Not connected CTA ── */}
        {!connected && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What you'll get</Text>
            <Text style={[styles.cardSub, { marginBottom: 16 }]}>
              After connecting Google Fit
            </Text>
            {[
              {
                icon: "walk",
                color: "#10B981",
                bg: "#D1FAE5",
                text: "Automatic step and distance tracking throughout the day",
              },
              {
                icon: "sleep",
                color: "#6D28D9",
                bg: "#EDE9FE",
                text: "Sleep stage data pulled directly into your Sleep Insights",
              },
              {
                icon: "heart-pulse",
                color: "#EF4444",
                bg: "#FEE2E2",
                text: "Continuous heart rate monitoring with trend analysis",
              },
              {
                icon: "fire",
                color: "#F59E0B",
                bg: "#FEF3C7",
                text: "Calories burned factored into your daily nutrition goals",
              },
              {
                icon: "diabetes",
                color: "#825CFF",
                bg: "#EDE9FE",
                text: "Activity data correlated with your glucose readings for deeper insights",
              },
            ].map((item, i) => (
              <InsightCard
                key={i}
                icon={item.icon}
                iconColor={item.color}
                iconBg={item.bg}
                text={item.text}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Workout row styles ───────────────────────────────────────────────────────
const getWorkoutStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      gap: 12,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    type: { fontSize: 14, fontWeight: "700", color: colors.text },
    dur: { fontSize: 12, color: colors.muted, marginTop: 2 },
    kcal: { fontSize: 14, fontWeight: "700", color: colors.text },
  });

// ─── Frequency styles ─────────────────────────────────────────────────────────
const getFreqStyles = (colors) =>
  StyleSheet.create({
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
    },
    optionBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    optionActive: {},
    optionText: { fontSize: 14, fontWeight: "600", color: colors.muted },
    optionTextActive: { color: colors.text, fontWeight: "700" },
  });

// ─── Shared Styles ────────────────────────────────────────────────────────────
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    messageBox: {
      backgroundColor: "#FEE2E2",
      padding: 12,
      borderRadius: 12,
      marginHorizontal: 16,
      marginTop: 10,
    },
    messageText: { color: "#B91C1C", textAlign: "center" },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    syncBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "#D1FAE5",
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text },

    content: { padding: 16, paddingBottom: 40 },

    tabs: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 4,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 11,
      alignItems: "center",
    },
    tabActive: {
      backgroundColor: colors.background,
      shadowColor: colors.text,
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: { fontSize: 13, fontWeight: "600", color: colors.muted },
    tabTextActive: { color: colors.text },

    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 14,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
    cardSub: { fontSize: 12, color: colors.muted, marginTop: 2 },

    ringsRow: { flexDirection: "row", justifyContent: "space-around" },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 12,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },

    hrBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "#FEE2E2",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    hrDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#EF4444" },
    hrBadgeText: { fontSize: 11, fontWeight: "800", color: "#991B1B" },

    goalChip: {
      backgroundColor: "#D1FAE5",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    goalChipText: { fontSize: 11, fontWeight: "700", color: "#065F46" },

    weekStats: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 16,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    weekStat: { alignItems: "center" },
    weekStatVal: { fontSize: 17, fontWeight: "800", color: colors.text },
    weekStatLabel: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 3,
      fontWeight: "600",
    },
    weekStatDivider: { width: 1, backgroundColor: colors.border },

    dangerBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.card,
      borderRadius: 20,
      height: 50,
      borderWidth: 1.5,
      borderColor: "#FEE2E2",
      marginTop: 4,
    },
    dangerBtnText: { color: "#EF4444", fontWeight: "700", fontSize: 14 },
  });
