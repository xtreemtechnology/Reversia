import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
/* eslint-disable react-native/no-inline-styles */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  Path,
  Circle,
  Line,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useTheme } from "../../../theme/ThemeProvider";

const CHART_H = 200;

import { useGlucoseLogs } from "../hooks/useGlucoseLogs";

const MIN_GLUCOSE = 50;
const MAX_GLUCOSE = 220;
const SAFE_LOW = 70;
const SAFE_HIGH = 140;

const toY = (val, chartH) =>
  chartH - ((val - MIN_GLUCOSE) / (MAX_GLUCOSE - MIN_GLUCOSE)) * chartH;

const toX = (i, total, chartW) => (i / (total - 1)) * chartW;

const buildPath = (points, chartW, chartH) => {
  if (points.length < 2) {
    return "";
  }
  return points
    .map((val, i) => {
      const x = toX(i, points.length, chartW);
      const y = toY(val, chartH);
      if (i === 0) {
        return `M${x},${y}`;
      }
      const prevX = toX(i - 1, points.length, chartW);
      const prevY = toY(points[i - 1], chartH);
      const cpX = (prevX + x) / 2;
      return `C${cpX},${prevY} ${cpX},${y} ${x},${y}`;
    })
    .join(" ");
};

const buildArea = (points, chartW, chartH) => {
  const line = buildPath(points, chartW, chartH);
  const lastX = toX(points.length - 1, points.length, chartW);
  return `${line} L${lastX},${chartH} L0,${chartH} Z`;
};

const StatChip = ({
  label,
  value,
  valueColor = "#111827",
  sub,
  chipStyles,
}) => (
  <View style={chipStyles.chip}>
    <Text style={chipStyles.label}>{label}</Text>
    <Text style={[chipStyles.value, { color: valueColor }]}>{value}</Text>
    {sub ? <Text style={chipStyles.sub}>{sub}</Text> : null}
  </View>
);

const getChipStyles = (colors) =>
  StyleSheet.create({
    chip: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      backgroundColor: colors.card,
      borderRadius: 18,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      fontSize: 11,
      color: colors.muted,
      fontWeight: "600",
      marginBottom: 4,
    },
    value: { fontSize: 18, fontWeight: "800" },
    sub: { fontSize: 10, color: colors.muted, marginTop: 2 },
  });

const InsightCard = ({ icon, iconColor, iconBg, text, insightStyles }) => (
  <View style={insightStyles.card}>
    <View style={[insightStyles.iconBox, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
    </View>
    <Text style={insightStyles.text}>{text}</Text>
  </View>
);

const getInsightStyles = (colors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      flexShrink: 0,
    },
    text: { flex: 1, color: colors.muted, fontSize: 13, lineHeight: 19 },
  });

export default function GlucoseMonitoring({ navigation }) {
  const { colors } = useTheme();
  const chipStyles = getChipStyles(colors);
  const insightStyles = getInsightStyles(colors);
  const styles = getStyles(colors);
  const { width: screenWidth } = useWindowDimensions();
  const CHART_W = Math.max(screenWidth - 40, 200);
  const TIME_RANGES = ["1 hr", "3 hrs", "6 hrs", "12 hrs", "24 hrs"];
  const [activeRange, setActiveRange] = useState("1 hr");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const { logs } = useGlucoseLogs(200);

  const points = useMemo(() => {
    const hours = Number(activeRange.split(" ")[0]);
    const now = new Date();
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const glogs = logs
      .filter((l) => l.type === "glucose")
      .map((l) => ({
        v: Number(l.value),
        t:
          typeof l.timestamp?.toDate === "function"
            ? l.timestamp.toDate()
            : new Date(l.timestamp),
      }))
      .filter((g) => g.t >= cutoff)
      .sort((a, b) => a.t - b.t);

    if (!glogs.length) {
      return [110];
    }

    const maxPoints = 24;
    if (glogs.length <= maxPoints) {
      return glogs.map((g) => g.v);
    }
    const step = glogs.length / maxPoints;
    const sampled = [];
    for (let i = 0; i < maxPoints; i++) {
      const idx = Math.floor(i * step);
      sampled.push(glogs[idx].v);
    }
    return sampled;
  }, [logs, activeRange]);

  const linePath = buildPath(points, CHART_W, CHART_H);
  const areaPath = buildArea(points, CHART_W, CHART_H);

  const inRange = points.filter((v) => v >= SAFE_LOW && v <= SAFE_HIGH).length;
  const pctInRange = Math.round((inRange / points.length) * 100);
  const avg = Math.round(points.reduce((a, b) => a + b, 0) / points.length);
  const high = Math.max(...points);
  const low = Math.min(...points);

  const selVal =
    selectedIndex !== null ? points[selectedIndex] : points[points.length - 1];
  const selX =
    selectedIndex !== null
      ? toX(selectedIndex, points.length, CHART_W)
      : toX(points.length - 1, points.length, CHART_W);
  const selY = toY(selVal, CHART_H);
  const inRangePt = selVal >= SAFE_LOW && selVal <= SAFE_HIGH;

  const safeHighY = toY(SAFE_HIGH, CHART_H);
  const safeLowY = toY(SAFE_LOW, CHART_H);

  const labels = useMemo(() => {
    const hrs = Number(activeRange.split(" ")[0]);
    const now = new Date();
    if (hrs <= 1) {
      return ["Now"];
    }
    const ticks = 4;
    const arr = [];
    for (let i = ticks; i >= 0; i--) {
      const d = new Date(now.getTime() - (i * hrs * 60 * 60 * 1000) / ticks);
      arr.push(
        d.toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
      );
    }
    return arr;
  }, [activeRange]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Glucose Monitoring</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateSelector}>
          <TouchableOpacity style={styles.navArrow}>
            <Ionicons name="chevron-back" size={18} color={colors.muted} />
          </TouchableOpacity>
          <View style={styles.dateBadge}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.primary}
              style={{ marginRight: 7 }}
            />
            <Text style={styles.dateText}>2026 April 29</Text>
          </View>
          <TouchableOpacity style={[styles.navArrow, { opacity: 0.3 }]}>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingHorizontal: 2 }}
        >
          {TIME_RANGES.map((range) => {
            const isActive = range === activeRange;
            return (
              <TouchableOpacity
                key={range}
                onPress={() => {
                  setActiveRange(range);
                  setSelectedIndex(null);
                }}
                style={[styles.rangeBtn, isActive && styles.activeRange]}
              >
                <Text
                  style={[
                    styles.rangeBtnText,
                    isActive && styles.activeRangeText,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View
          style={[
            styles.tooltip,
            { alignSelf: selX < CHART_W / 2 ? "flex-start" : "flex-end" },
          ]}
        >
          <Text style={styles.tooltipValue}>{selVal.toFixed(1)} mg/dL</Text>
          <Text
            style={[
              styles.tooltipStatus,
              { color: inRangePt ? "#10B981" : "#EF4444" },
            ]}
          >
            {inRangePt ? "✓ In Range" : "⚠ Out of Range"}
          </Text>
        </View>

        <View style={styles.chartWrapper}>
          <View style={styles.yAxis}>
            {[200, 160, 140, 100, 70, 50].map((v) => (
              <Text
                key={v}
                style={[
                  styles.yLabel,
                  (v === 140 || v === 70) && styles.yLabelRange,
                ]}
              >
                {v}
              </Text>
            ))}
          </View>

          <Svg width={CHART_W} height={CHART_H}>
            <Defs>
              <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#22422F" stopOpacity="0.18" />
                <Stop offset="1" stopColor="#22422F" stopOpacity="0.01" />
              </LinearGradient>
              <LinearGradient id="safeZone" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#10B981" stopOpacity="0.07" />
                <Stop offset="1" stopColor="#10B981" stopOpacity="0.07" />
              </LinearGradient>
            </Defs>

            <Rect
              x="0"
              y={safeHighY}
              width={CHART_W}
              height={safeLowY - safeHighY}
              fill="url(#safeZone)"
            />

            {[50, 100, 150, 200].map((v) => (
              <Line
                key={v}
                x1="0"
                y1={toY(v, CHART_H)}
                x2={CHART_W}
                y2={toY(v, CHART_H)}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            <Line
              x1="0"
              y1={safeHighY}
              x2={CHART_W}
              y2={safeHighY}
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <Line
              x1="0"
              y1={safeLowY}
              x2={CHART_W}
              y2={safeLowY}
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <Path d={areaPath} fill="url(#areaGrad)" />
            <Path
              d={linePath}
              fill="none"
              stroke="#22422F"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Line
              x1={selX}
              y1="0"
              x2={selX}
              y2={CHART_H}
              stroke={colors.text}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <Circle cx={selX} cy={selY} r="7" fill={colors.text} />
            <Circle cx={selX} cy={selY} r="4" fill="#FFF" />
            {points.map((val, i) => (
              <Circle
                key={i}
                cx={toX(i, points.length, CHART_W)}
                cy={toY(val, CHART_H)}
                r="3"
                fill={
                  val >= SAFE_LOW && val <= SAFE_HIGH ? "#10B981" : "#EF4444"
                }
                onPress={() => setSelectedIndex(i)}
              />
            ))}
          </Svg>
        </View>

        <View style={styles.xAxis}>
          {labels.map((l) => (
            <Text key={l} style={styles.xLabel}>
              {l}
            </Text>
          ))}
        </View>

        <View style={styles.statsRow}>
          <StatChip
            label="Time in Range"
            value={`${pctInRange}%`}
            valueColor={pctInRange >= 70 ? "#10B981" : "#EF4444"}
            chipStyles={chipStyles}
          />
          <StatChip
            label="Average"
            value={`${avg}`}
            sub="mg/dL"
            chipStyles={chipStyles}
          />
          <StatChip
            label="High / Low"
            value={`${high}/${low}`}
            sub="mg/dL"
            chipStyles={chipStyles}
          />
        </View>

        <TouchableOpacity
          style={styles.activityBtn}
          onPress={() => navigation.navigate("ExerciseEntry")}
        >
          <MaterialCommunityIcons
            name="run"
            size={18}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.activityBtnText}>View Activity</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Insights</Text>
        <InsightCard
          icon="run"
          iconColor="#0284C7"
          iconBg="#E0F2FE"
          text="Consider incorporating more physical activity into your daily routine, such as taking short walks after meals."
          insightStyles={insightStyles}
        />
        <InsightCard
          icon="food-apple"
          iconColor="#D97706"
          iconBg="#FEF3C7"
          text="Your glucose peaked around meal time. Try eating lower-glycaemic foods to keep levels more stable."
          insightStyles={insightStyles}
        />
        <InsightCard
          icon="water"
          iconColor="#6D28D9"
          iconBg="#EDE9FE"
          text="Staying well hydrated can help your body regulate blood glucose more effectively throughout the day."
          insightStyles={insightStyles}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
      backgroundColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    shareBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text },
    content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
    dateSelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    navArrow: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    dateBadge: {
      flex: 1,
      marginHorizontal: 10,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + "14",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    dateText: { fontSize: 13, color: colors.primary, fontWeight: "700" },
    rangeBtn: {
      paddingHorizontal: 16,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      marginRight: 8,
    },
    activeRange: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    rangeBtnText: { fontSize: 13, color: colors.text, fontWeight: "700" },
    activeRangeText: { color: "#FFF" },
    tooltip: {
      marginBottom: 14,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tooltipValue: { fontSize: 14, color: colors.text, fontWeight: "800" },
    tooltipStatus: { fontSize: 12, fontWeight: "700", marginTop: 2 },
    chartWrapper: { flexDirection: "row", marginBottom: 6 },
    yAxis: {
      width: 34,
      justifyContent: "space-between",
      paddingVertical: 8,
      paddingRight: 4,
    },
    yLabel: { fontSize: 11, color: colors.muted, fontWeight: "600" },
    yLabelRange: { color: "#10B981", fontWeight: "800" },
    xAxis: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingLeft: 34,
      marginBottom: 20,
    },
    xLabel: { fontSize: 11, color: colors.muted, fontWeight: "600" },
    statsRow: { flexDirection: "row", marginBottom: 18 },
    activityBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 16,
      marginBottom: 20,
    },
    activityBtnText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 12,
    },
  });
