import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import LogWeightModal from "../components/LogWeightModal";
import { shadowStyle } from "../../../utils/shadows";
import { useTheme } from "../../../theme/ThemeProvider";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Path,
} from "react-native-svg";

const USER_DATA = {
  weight: 82.4,
  targetWeight: 78.0,
  height: 175,
  bmi: 26.9,
  bmr: 1820,
  bodyFat: 28.4,
  subcutFat: 24.2,
  visceralFat: 12.0,
  musclePct: 63.2,
  waterPct: 52.1,
  boneMass: 3.2,
  metabolicAge: 34,
};

const WEEK_WEIGHTS = [
  { day: "Mon", val: 83.2 },
  { day: "Tue", val: 83.0 },
  { day: "Wed", val: 82.8 },
  { day: "Thu", val: 83.1 },
  { day: "Fri", val: 82.6 },
  { day: "Sat", val: 82.5 },
  { day: "Sun", val: 82.4 },
];

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: "Underweight", color: "#60A5FA" };
  if (bmi < 25) return { label: "Healthy", color: "#10B981" };
  if (bmi < 30) return { label: "Overweight", color: "#F59E0B" };
  return { label: "Obese", color: "#EF4444" };
};

const getTrend = (current, previous) => {
  const diff = (current - previous).toFixed(1);
  if (diff < 0)
    return { icon: "trending-down", color: "#10B981", label: `${diff} kg` };
  if (diff > 0)
    return { icon: "trending-up", color: "#EF4444", label: `+${diff} kg` };
  return { icon: "trending-neutral", color: "#9CA3AF", label: "0 kg" };
};

const getGaugeStyles = (colors) =>
  StyleSheet.create({
    wrapper: { marginVertical: 14, alignItems: "center" },
    track: {
      flexDirection: "row",
      height: 14,
      borderRadius: 7,
      overflow: "visible",
      position: "relative",
    },
    seg: { height: "100%", marginHorizontal: 1 },
    needle: {
      position: "absolute",
      top: -4,
      width: 12,
      height: 22,
      borderRadius: 6,
      backgroundColor: colors.text,
      borderWidth: 2,
      borderColor: colors.background,
      elevation: 4,
    },
    labels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
      alignSelf: "center",
    },
    rangeLabel: { fontSize: 10, color: colors.muted, fontWeight: "600" },
    valueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 10,
    },
    bmiValue: { fontSize: 32, fontWeight: "800", color: colors.text },
    catBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
    catText: { fontSize: 13, fontWeight: "800" },
  });

const getBscStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 16,
      marginBottom: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    top: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    trendBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
    },
    trendText: { fontSize: 10, fontWeight: "700" },
    title: {
      fontSize: 11,
      color: colors.muted,
      fontWeight: "600",
      marginBottom: 4,
    },
    value: { fontSize: 22, fontWeight: "800", color: colors.text },
    unit: { fontSize: 12, color: colors.muted, fontWeight: "500" },
    sub: { fontSize: 11, color: colors.muted, marginTop: 4 },
  });

const CHART_H = 80;
const MIN_W = 82.0;
const MAX_W = 84.0;

const getWeightChartStyles = (colors) =>
  StyleSheet.create({
    wrapper: { marginTop: 10 },
    labels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 6,
    },
    label: { fontSize: 10, color: colors.muted, fontWeight: "600" },
  });

const getProgressRowStyles = (colors) =>
  StyleSheet.create({
    row: { marginBottom: 16 },
    labelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 7,
    },
    label: { fontSize: 13, fontWeight: "600", color: colors.text },
    value: { fontSize: 13, fontWeight: "800", color: colors.text },
    unit: { fontWeight: "400", color: colors.muted, fontSize: 12 },
    track: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: "hidden",
    },
    fill: { height: "100%", borderRadius: 4 },
    ideal: { fontSize: 10, color: colors.muted, marginTop: 4 },
  });

const getLogStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      gap: 10,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    dayBox: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    dayBoxToday: { backgroundColor: colors.text },
    dayText: { fontSize: 12, fontWeight: "700", color: colors.muted },
    dayTextToday: { color: colors.background },
    weight: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.text },
    trendBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    trendText: { fontSize: 11, fontWeight: "700" },
    todayBadge: {
      backgroundColor: `${colors.primary}18`,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    todayText: { fontSize: 10, fontWeight: "800", color: colors.primary },
  });

const getInsightStyles = (colors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
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
    title: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 3,
    },
    text: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },
  });

const getStyles = (colors) =>
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
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text },
    content: { padding: 16, paddingBottom: 40 },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.border,
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
      ...shadowStyle({
        color: colors.text,
        offsetY: 2,
        opacity: 0.06,
        radius: 4,
        elevation: 2,
      }),
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
    trendPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 10,
    },
    trendPillText: { fontSize: 11, fontWeight: "700" },
    weightRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 16,
    },
    weightValue: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
    },
    weightUnit: { fontSize: 13, color: colors.muted },
    weightSub: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 3,
      textAlign: "center",
    },
    weightDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    goalBarTrack: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: "hidden",
    },
    goalBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    goalBarLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 6,
    },
    goalBarLabel: { fontSize: 10, color: colors.muted, fontWeight: "600" },
    heightChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.border,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 10,
    },
    heightChipText: { fontSize: 12, fontWeight: "600", color: colors.text },
    bmiTip: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 7,
      backgroundColor: `${colors.primary}12`,
      borderRadius: 12,
      padding: 12,
      marginTop: 10,
    },
    bmiTipText: {
      flex: 1,
      fontSize: 12,
      color: colors.primary,
      lineHeight: 17,
    },
    goalChip: {
      backgroundColor: `${colors.primary}18`,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    goalChipText: { fontSize: 11, fontWeight: "700", color: colors.primary },
    monthStats: { flexDirection: "row", justifyContent: "space-around" },
    monthStat: { alignItems: "center" },
    monthStatVal: { fontSize: 16, fontWeight: "800" },
    monthStatLabel: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 4,
      fontWeight: "600",
    },
    logWeightBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 28,
      height: 54,
      marginTop: 4,
    },
    logWeightBtnText: {
      color: colors.background,
      fontWeight: "700",
      fontSize: 15,
    },
  });

const BMIGauge = ({ bmi, colors }) => {
  const { width: screenWidth } = useWindowDimensions();
  const gaugeStyles = getGaugeStyles(colors);
  const cat = getBMICategory(bmi);
  const trackWidth = Math.max(Math.min(screenWidth - 72, 420), 240);
  const pct = Math.min(Math.max((bmi - 15) / 25, 0), 1);
  const indicatorX = pct * trackWidth;

  return (
    <View style={gaugeStyles.wrapper}>
      <View style={[gaugeStyles.track, { width: trackWidth }]}>
        {[
          { color: "#60A5FA", flex: 0.148 },
          { color: "#10B981", flex: 0.26 },
          { color: "#F59E0B", flex: 0.2 },
          { color: "#EF4444", flex: 0.392 },
        ].map((seg, i) => (
          <View
            key={i}
            style={[
              gaugeStyles.seg,
              { flex: seg.flex, backgroundColor: seg.color },
              i === 0 && { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
              i === 3 && {
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
              },
            ]}
          />
        ))}
        <View
          style={[gaugeStyles.needle, { left: Math.max(indicatorX - 6, 0) }]}
        />
      </View>
      <View style={[gaugeStyles.labels, { width: trackWidth }]}>
        <Text style={gaugeStyles.rangeLabel}>15</Text>
        <Text style={gaugeStyles.rangeLabel}>18.5</Text>
        <Text style={gaugeStyles.rangeLabel}>25</Text>
        <Text style={gaugeStyles.rangeLabel}>30</Text>
        <Text style={gaugeStyles.rangeLabel}>40+</Text>
      </View>
      <View style={gaugeStyles.valueRow}>
        <Text style={gaugeStyles.bmiValue}>{bmi}</Text>
        <View
          style={[gaugeStyles.catBadge, { backgroundColor: `${cat.color}20` }]}
        >
          <Text style={[gaugeStyles.catText, { color: cat.color }]}>
            {cat.label}
          </Text>
        </View>
      </View>
    </View>
  );
};

const DonutRing = ({ pct, color, colors, size = 80, strokeW = 9 }) => {
  const R = (size - strokeW) / 2;
  const CIRC = 2 * Math.PI * R;
  const pctNorm = Math.max(0, Math.min(Number(pct) || 0, 100));
  const filled = (pctNorm / 100) * CIRC;
  const remaining = Math.max(0, CIRC - filled);
  return (
    <Svg width={size} height={size}>
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
        stroke={color}
        strokeWidth={strokeW}
        fill="none"
        strokeDasharray={`${filled} ${remaining}`}
        strokeLinecap="round"
        strokeDashoffset={0}
        rotation={-90}
        originX={size / 2}
        originY={size / 2}
      />
    </Svg>
  );
};

const BodyStatCard = ({
  colors,
  icon,
  iconColor,
  iconBg,
  title,
  value,
  unit,
  sub,
  subColor,
  trend,
  ring,
  ringColor,
  style,
}) => {
  const bscStyles = getBscStyles(colors);
  return (
    <View style={[bscStyles.card, style]}>
      <View style={bscStyles.top}>
        <View style={[bscStyles.iconBox, { backgroundColor: iconBg }]}>
          <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
        </View>
        {trend && (
          <View
            style={[
              bscStyles.trendBadge,
              { backgroundColor: `${trend.color}18` },
            ]}
          >
            <MaterialCommunityIcons
              name={trend.icon}
              size={12}
              color={trend.color}
            />
            <Text style={[bscStyles.trendText, { color: trend.color }]}>
              {trend.label}
            </Text>
          </View>
        )}
      </View>
      <Text style={bscStyles.title}>{title}</Text>
      {ring !== undefined ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginVertical: 6,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={bscStyles.value}>
              {value}
              <Text style={bscStyles.unit}>{unit}</Text>
            </Text>
            {sub && (
              <Text
                style={[bscStyles.sub, { color: subColor || colors.muted }]}
              >
                {sub}
              </Text>
            )}
          </View>
          <View
            style={{
              width: 80,
              height: 80,
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 12,
            }}
          >
            <DonutRing
              pct={ring}
              color={ringColor || iconColor}
              colors={colors}
              size={80}
              strokeW={9}
            />
            <View
              style={{
                position: "absolute",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "800", color: colors.text }}
              >
                {value}
                <Text style={{ fontSize: 10, color: colors.muted }}>
                  {unit}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={bscStyles.value}>
          {value}
          <Text style={bscStyles.unit}>{unit}</Text>
        </Text>
      )}
    </View>
  );
};

const WeightChart = ({ data, colors }) => {
  const { width: screenWidth } = useWindowDimensions();
  const weightChartStyles = getWeightChartStyles(colors);
  const CHART_W = Math.max(screenWidth - 80, 120);
  const toX = (i) => (i / (data.length - 1)) * CHART_W;
  const toY = (v) => CHART_H - ((v - MIN_W) / (MAX_W - MIN_W)) * CHART_H;
  const pathD = data
    .map((d, i) => {
      const x = toX(i);
      const y = toY(d.val);
      if (i === 0) return `M${x},${y}`;
      const px = toX(i - 1);
      const py = toY(data[i - 1].val);
      const cpx = (px + x) / 2;
      return `C${cpx},${py} ${cpx},${y} ${x},${y}`;
    })
    .join(" ");
  return (
    <View style={weightChartStyles.wrapper}>
      <Svg width={CHART_W} height={CHART_H + 4}>
        <Defs>
          <LinearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0.2" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {[MIN_W, (MIN_W + MAX_W) / 2, MAX_W].map((v) => (
          <Line
            key={v}
            x1="0"
            y1={toY(v)}
            x2={CHART_W}
            y2={toY(v)}
            stroke={colors.border}
            strokeWidth="1"
          />
        ))}
        <Path
          d={pathD}
          fill="none"
          stroke={colors.primary}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={`${pathD} L${CHART_W},${CHART_H} L0,${CHART_H} Z`}
          fill="url(#wGrad)"
        />
        {data.map((d, i) => (
          <Circle
            key={i}
            cx={toX(i)}
            cy={toY(d.val)}
            r={i === data.length - 1 ? 5 : 3}
            fill={
              i === data.length - 1 ? colors.primary : `${colors.primary}55`
            }
          />
        ))}
      </Svg>
      <View style={weightChartStyles.labels}>
        {data.map((d) => (
          <Text key={d.day} style={weightChartStyles.label}>
            {d.day}
          </Text>
        ))}
      </View>
    </View>
  );
};

const ProgressRow = ({ colors, label, value, unit, pct, color, ideal }) => {
  const progressRowStyles = getProgressRowStyles(colors);
  return (
    <View style={progressRowStyles.row}>
      <View style={progressRowStyles.labelRow}>
        <Text style={progressRowStyles.label}>{label}</Text>
        <Text style={progressRowStyles.value}>
          {value}
          <Text style={progressRowStyles.unit}>{unit}</Text>
        </Text>
      </View>
      <View style={progressRowStyles.track}>
        <View
          style={[
            progressRowStyles.fill,
            { width: `${Math.min(pct, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      {ideal && <Text style={progressRowStyles.ideal}>Ideal: {ideal}</Text>}
    </View>
  );
};

const InsightCard = ({ colors, icon, iconColor, iconBg, title, text }) => {
  const insightStyles = getInsightStyles(colors);
  return (
    <View style={insightStyles.card}>
      <View style={[insightStyles.iconBox, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        {title && <Text style={insightStyles.title}>{title}</Text>}
        <Text style={insightStyles.text}>{text}</Text>
      </View>
    </View>
  );
};

export default function BodyComposition({ navigation }) {
  const [userData, setUserData] = useState(USER_DATA);
  const [weekWeights, setWeekWeights] = useState(WEEK_WEIGHTS);
  const [activeTab, setActiveTab] = useState("current");
  const [showWeightModal, setShowWeightModal] = useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const logStyles = getLogStyles(colors);
  const { width: screenWidth } = useWindowDimensions();
  const isNarrow = screenWidth < 430;
  const contentPadding = 20;
  const contentWidth = Math.max(screenWidth - contentPadding * 2, 320);
  const cardWidth = isNarrow ? "100%" : (contentWidth - 12) / 2;
  const d = userData;
  const previousWeight =
    weekWeights.length > 1 ? weekWeights[weekWeights.length - 2].val : d.weight;
  const weightTrend = getTrend(d.weight, previousWeight);
  const toGoal = (d.weight - d.targetWeight).toFixed(1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Body Composition</Text>
        <TouchableOpacity style={styles.syncBtn}>
          <MaterialCommunityIcons name="sync" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabs}>
          {["current", "history"].map((tab) => (
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
                {tab === "current" ? "Current" : "History"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {activeTab === "current" ? (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Weight</Text>
                  <Text style={styles.cardSub}>Updated today</Text>
                </View>
                <View
                  style={[
                    styles.trendPill,
                    { backgroundColor: `${weightTrend.color}18` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={weightTrend.icon}
                    size={14}
                    color={weightTrend.color}
                  />
                  <Text
                    style={[styles.trendPillText, { color: weightTrend.color }]}
                  >
                    {weightTrend.label} this week
                  </Text>
                </View>
              </View>
              <View style={styles.weightRow}>
                <View>
                  <Text style={styles.weightValue}>
                    {d.weight}
                    <Text style={styles.weightUnit}> kg</Text>
                  </Text>
                  <Text style={styles.weightSub}>Current weight</Text>
                </View>
                <View style={styles.weightDivider} />
                <View>
                  <Text style={[styles.weightValue, { color: "#10B981" }]}>
                    {d.targetWeight}
                    <Text style={styles.weightUnit}> kg</Text>
                  </Text>
                  <Text style={styles.weightSub}>Target weight</Text>
                </View>
                <View style={styles.weightDivider} />
                <View>
                  <Text
                    style={[
                      styles.weightValue,
                      { color: "#F59E0B", fontSize: 22 },
                    ]}
                  >
                    {toGoal}
                    <Text style={styles.weightUnit}> kg</Text>
                  </Text>
                  <Text style={styles.weightSub}>To goal</Text>
                </View>
              </View>
              <View style={{ marginTop: 16 }}>
                <View style={styles.goalBarTrack}>
                  <View
                    style={[
                      styles.goalBarFill,
                      {
                        width: `${Math.min(
                          ((d.weight - d.targetWeight) / d.weight) * 100 + 85,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.goalBarLabels}>
                  <Text style={styles.goalBarLabel}>Start</Text>
                  <Text
                    style={[
                      styles.goalBarLabel,
                      { color: "#10B981", fontWeight: "700" },
                    ]}
                  >
                    {Math.round(85)}% to goal
                  </Text>
                  <Text style={styles.goalBarLabel}>Target</Text>
                </View>
              </View>
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>BMI</Text>
                  <Text style={styles.cardSub}>Body Mass Index</Text>
                </View>
                <View style={styles.heightChip}>
                  <MaterialCommunityIcons
                    name="human-male-height"
                    size={14}
                    color={colors.muted}
                  />
                  <Text style={styles.heightChipText}>{d.height} cm</Text>
                </View>
              </View>
              <BMIGauge bmi={d.bmi} colors={colors} />
              <View style={styles.bmiTip}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.bmiTipText}>
                  Losing 4.4 kg would move you into the Healthy range and
                  significantly improve insulin sensitivity.
                </Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Body Metrics</Text>
            <View style={styles.grid}>
              <BodyStatCard
                colors={colors}
                icon="fire"
                iconColor="#EF4444"
                iconBg="#FEE2E2"
                title="BMR (Daily Calories)"
                value={d.bmr}
                unit=" kcal"
                sub="Base metabolic rate"
                style={{ width: cardWidth }}
              />
              <BodyStatCard
                colors={colors}
                icon="human"
                iconColor="#825CFF"
                iconBg="#EDE9FE"
                title="Body Fat"
                value={d.bodyFat}
                unit="%"
                ring={d.bodyFat}
                ringColor="#825CFF"
                sub="Target: <25%"
                subColor={d.bodyFat > 25 ? "#EF4444" : "#10B981"}
                style={{ width: cardWidth }}
              />
              <BodyStatCard
                colors={colors}
                icon="arm-flex"
                iconColor="#10B981"
                iconBg="#D1FAE5"
                title="Muscle Mass"
                value={d.musclePct}
                unit="%"
                ring={d.musclePct}
                ringColor="#10B981"
                sub="Good range"
                subColor="#10B981"
                style={{ width: cardWidth }}
              />
              <BodyStatCard
                colors={colors}
                icon="water"
                iconColor="#3B82F6"
                iconBg="#EFF6FF"
                title="Body Water"
                value={d.waterPct}
                unit="%"
                ring={d.waterPct}
                ringColor="#3B82F6"
                sub="Target: 55-65%"
                style={{ width: cardWidth }}
              />
              <BodyStatCard
                colors={colors}
                icon="liver"
                iconColor="#F59E0B"
                iconBg="#FEF3C7"
                title="Visceral Fat"
                value={d.visceralFat}
                unit=""
                trend={{
                  icon: "trending-down",
                  color: "#10B981",
                  label: "-2%",
                }}
                sub="Target: <10"
                subColor={d.visceralFat > 10 ? "#F59E0B" : "#10B981"}
                style={{ width: cardWidth }}
              />
              <BodyStatCard
                colors={colors}
                icon="bone"
                iconColor="#0284C7"
                iconBg="#E0F2FE"
                title="Bone Mass"
                value={d.boneMass}
                unit=" kg"
                sub="Normal range"
                subColor="#10B981"
                style={{ width: cardWidth }}
              />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Detailed Breakdown</Text>
              <Text style={[styles.cardSub, { marginBottom: 18 }]}>
                Compared to healthy ranges
              </Text>
              <ProgressRow
                colors={colors}
                label="Subcutaneous Fat"
                value={d.subcutFat}
                unit="%"
                pct={(d.subcutFat / 40) * 100}
                color="#825CFF"
                ideal="10–20%"
              />
              <ProgressRow
                colors={colors}
                label="Visceral Fat Level"
                value={d.visceralFat}
                unit=""
                pct={(d.visceralFat / 20) * 100}
                color="#F59E0B"
                ideal="< 10"
              />
              <ProgressRow
                colors={colors}
                label="Muscle Percentage"
                value={d.musclePct}
                unit="%"
                pct={d.musclePct}
                color="#10B981"
                ideal="60–70%"
              />
              <ProgressRow
                colors={colors}
                label="Body Water"
                value={d.waterPct}
                unit="%"
                pct={(d.waterPct / 70) * 100}
                color="#3B82F6"
                ideal="55–65%"
              />
              <ProgressRow
                colors={colors}
                label="Metabolic Age"
                value={d.metabolicAge}
                unit=" yrs"
                pct={(d.metabolicAge / 60) * 100}
                color="#6D28D9"
                ideal="Match real age"
              />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Body Insights</Text>
              <Text style={[styles.cardSub, { marginBottom: 14 }]}>
                Personalised for your goals
              </Text>
              <InsightCard
                colors={colors}
                icon="scale-bathroom"
                iconColor="#825CFF"
                iconBg="#EDE9FE"
                title="Weight progress"
                text="You're 4.4 kg from your target. At your current rate of loss, you could reach it in approximately 10 weeks."
              />
              <InsightCard
                colors={colors}
                icon="liver"
                iconColor="#F59E0B"
                iconBg="#FEF3C7"
                title="Visceral fat alert"
                text="Your visceral fat is above the ideal range. Reducing refined carbs and adding 20-minute daily walks can significantly lower this."
              />
              <InsightCard
                colors={colors}
                icon="arm-flex"
                iconColor="#10B981"
                iconBg="#D1FAE5"
                title="Muscle mass"
                text="Great muscle percentage! Preserving muscle while losing fat improves insulin sensitivity and helps reverse diabetes."
              />
              <InsightCard
                colors={colors}
                icon="water"
                iconColor="#3B82F6"
                iconBg="#EFF6FF"
                title="Hydration"
                text="Your body water is slightly below optimal. Aim for 2.5L of water daily to support metabolic function and glucose regulation."
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Weight This Week</Text>
                  <Text style={styles.cardSub}>Daily readings</Text>
                </View>
                <View style={styles.goalChip}>
                  <Text style={styles.goalChipText}>
                    Goal: {d.targetWeight} kg
                  </Text>
                </View>
              </View>
              <WeightChart data={weekWeights} colors={colors} />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>This Week's Log</Text>
              <Text style={[styles.cardSub, { marginBottom: 14 }]}>
                Daily weight entries
              </Text>
              {weekWeights.map((entry, i) => {
                const isToday = i === weekWeights.length - 1;
                const prev = i > 0 ? weekWeights[i - 1].val : entry.val;
                const trend = getTrend(entry.val, prev);
                return (
                  <View
                    key={entry.day}
                    style={[
                      logStyles.row,
                      i < weekWeights.length - 1 && logStyles.rowBorder,
                    ]}
                  >
                    <View
                      style={[
                        logStyles.dayBox,
                        isToday && logStyles.dayBoxToday,
                      ]}
                    >
                      <Text
                        style={[
                          logStyles.dayText,
                          isToday && logStyles.dayTextToday,
                        ]}
                      >
                        {entry.day}
                      </Text>
                    </View>
                    <Text style={logStyles.weight}>{entry.val} kg</Text>
                    <View
                      style={[
                        logStyles.trendBadge,
                        { backgroundColor: `${trend.color}18` },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={trend.icon}
                        size={12}
                        color={trend.color}
                      />
                      <Text
                        style={[logStyles.trendText, { color: trend.color }]}
                      >
                        {trend.label}
                      </Text>
                    </View>
                    {isToday && (
                      <View style={logStyles.todayBadge}>
                        <Text style={logStyles.todayText}>Today</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Monthly Summary</Text>
              <Text style={[styles.cardSub, { marginBottom: 16 }]}>
                April 2026
              </Text>
              <View style={styles.monthStats}>
                {[
                  { label: "Start", value: "84.0 kg", color: colors.muted },
                  { label: "Current", value: "82.4 kg", color: colors.primary },
                  { label: "Lost", value: "1.6 kg", color: "#10B981" },
                  { label: "BMI change", value: "-0.5", color: "#10B981" },
                ].map((s, i) => (
                  <View key={i} style={styles.monthStat}>
                    <Text style={[styles.monthStatVal, { color: s.color }]}>
                      {s.value}
                    </Text>
                    <Text style={styles.monthStatLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
        <TouchableOpacity
          style={styles.logWeightBtn}
          onPress={() => setShowWeightModal(true)}
        >
          <MaterialCommunityIcons
            name="scale-bathroom"
            size={20}
            color={colors.background}
          />
          <Text style={styles.logWeightBtnText}>Log Today's Weight</Text>
        </TouchableOpacity>
        <LogWeightModal
          visible={showWeightModal}
          onClose={() => setShowWeightModal(false)}
          lastWeight={d.weight}
          onSaved={({ weight, bmi }) => {
            const rounded = Number(weight.toFixed(1));
            setUserData((prev) => ({ ...prev, weight: rounded, bmi }));
            setWeekWeights((prev) => {
              if (!prev.length) return [{ day: "Today", val: rounded }];
              const next = [...prev];
              next[next.length - 1] = {
                ...next[next.length - 1],
                val: rounded,
              };
              return next;
            });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
