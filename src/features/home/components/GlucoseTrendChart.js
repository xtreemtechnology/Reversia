// components/GlucoseTrendChart.js
// Weekly glucose trend chart card for the HomeScreen.
// Uses react-native-svg (already installed at v15.12.1).

import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, {
  Polyline,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const MMOL_TO_MGDL = 18.0182;

const Y_MIN = 60;
const Y_MAX = 300;

const REF_LINES = [
  { value: 100, color: "#689F38", label: "Normal" },
  { value: 126, color: "#E8A33D", label: "Pre-diabetic" },
  { value: 180, color: "#E86A6A", label: "High" },
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Convert a Firestore Timestamp / Date / ISO string to a JS Date.
 * Glucose logs arrive with `createdAt` as a Firestore Timestamp
 * (writers use serverTimestamp()), and `new Date(timestamp)` is
 * Invalid Date — the chart grouped every reading under a bad key
 * and showed nothing. Same helper as the insights screens. */
function toDate(ts) {
  if (!ts) return null;
  if (ts?.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function toMgDl(value, unit) {
  if (!value || typeof value !== "number") return null;
  const u = (unit || "").toLowerCase().trim();
  if (u === "mmol/l" || u === "mmol") {
    return value * MMOL_TO_MGDL;
  }
  // assume mg/dL
  return value;
}

function getDayKey(date) {
  // Returns "YYYY-MM-DD" for grouping
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getPointColor(mgdl) {
  if (mgdl === null) return "#7A8A72";
  if (mgdl < 100) return "#689F38"; // lime — normal
  if (mgdl < 126) return "#E8A33D"; // amber — pre-diabetic range
  if (mgdl < 180) return "#E8A33D"; // amber — still manageable
  return "#E86A6A"; // red — high
}

// ─────────────────────────────────────────────
// Data hook
// ─────────────────────────────────────────────
function useGlucoseChartData(logs) {
  return useMemo(() => {
    const glucoseLogs = (logs || []).filter(
      (l) => l?.category === "glucose" && l?.value != null
    );

    // Build last-7-days buckets
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }

    // Group glucose readings by day key
    const byDay = {};
    glucoseLogs.forEach((log) => {
      const date = toDate(log?.createdAt);
      if (!date || Number.isNaN(date.getTime())) return;
      const key = getDayKey(date);
      if (!byDay[key]) byDay[key] = [];
      const mgdl = toMgDl(log.value, log.unit);
      if (mgdl !== null) byDay[key].push(mgdl);
    });

    const points = days.map((d) => {
      const key = getDayKey(d);
      const readings = byDay[key];
      if (!readings || readings.length === 0) {
        return { label: DAY_LABELS[d.getDay()], value: null };
      }
      const avg = readings.reduce((s, v) => s + v, 0) / readings.length;
      return { label: DAY_LABELS[d.getDay()], value: Math.round(avg) };
    });

    // Today's latest reading
    const todayKey = getDayKey(today);
    const todayReadings = byDay[todayKey] || [];
    const latestToday =
      todayReadings.length > 0 ? todayReadings[todayReadings.length - 1] : null;

    const hasAnyData = points.some((p) => p.value !== null);

    return { points, latestToday, hasAnyData };
  }, [logs]);
}

// ─────────────────────────────────────────────
// SVG Chart
// ─────────────────────────────────────────────
function GlucoseLineChart({ points, chartWidth, chartHeight, colors }) {
  const PADDING_LEFT = 36;
  const PADDING_RIGHT = 12;
  const PADDING_TOP = 10;
  const PADDING_BOTTOM = 28; // room for day labels

  const drawWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT;
  const drawHeight = chartHeight - PADDING_TOP - PADDING_BOTTOM;

  function yPos(value) {
    // map value from [Y_MIN, Y_MAX] → [drawHeight, 0]
    const clamped = Math.min(Y_MAX, Math.max(Y_MIN, value));
    return PADDING_TOP + ((Y_MAX - clamped) / (Y_MAX - Y_MIN)) * drawHeight;
  }

  function xPos(index) {
    if (points.length <= 1) return PADDING_LEFT + drawWidth / 2;
    return PADDING_LEFT + (index / (points.length - 1)) * drawWidth;
  }

  // Build polyline points string — only connect non-null segments
  // We draw separate segments for contiguous non-null points
  const segments = [];
  let currentSegment = [];
  points.forEach((p, i) => {
    if (p.value !== null) {
      currentSegment.push({ x: xPos(i), y: yPos(p.value), value: p.value });
    } else {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    }
  });
  if (currentSegment.length > 0) segments.push(currentSegment);

  return (
    <Svg width={chartWidth} height={chartHeight}>
      <Defs>
        <LinearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.card} stopOpacity="0" />
          <Stop offset="1" stopColor={colors.card} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Reference lines */}
      {REF_LINES.map((ref) => {
        const y = yPos(ref.value);
        return (
          <React.Fragment key={ref.value}>
            <Line
              x1={PADDING_LEFT}
              y1={y}
              x2={chartWidth - PADDING_RIGHT}
              y2={y}
              stroke={ref.color}
              strokeWidth={1}
              strokeDasharray="4 4"
              strokeOpacity={0.45}
            />
            <SvgText
              x={PADDING_LEFT - 4}
              y={y + 4}
              fontSize={8}
              fill={ref.color}
              textAnchor="end"
              opacity={0.7}
            >
              {ref.value}
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* Polyline segments */}
      {segments.map((seg, si) => {
        if (seg.length < 2) return null;
        const pointsStr = seg.map((pt) => `${pt.x},${pt.y}`).join(" ");
        return (
          <Polyline
            key={si}
            points={pointsStr}
            fill="none"
            stroke="#689F38"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.85}
          />
        );
      })}

      {/* Data point circles */}
      {points.map((p, i) => {
        if (p.value === null) return null;
        const cx = xPos(i);
        const cy = yPos(p.value);
        const fill = getPointColor(p.value);
        return (
          <React.Fragment key={i}>
            <Circle cx={cx} cy={cy} r={5} fill={fill} opacity={0.9} />
            <Circle cx={cx} cy={cy} r={8} fill={fill} opacity={0.15} />
          </React.Fragment>
        );
      })}

      {/* X-axis day labels */}
      {points.map((p, i) => (
        <SvgText
          key={i}
          x={xPos(i)}
          y={chartHeight - 6}
          fontSize={9}
          fill={p.value !== null ? colors.textMuted : "rgba(122,138,114,0.4)"}
          textAnchor="middle"
          fontWeight={p.value !== null ? "600" : "400"}
        >
          {p.label}
        </SvgText>
      ))}
    </Svg>
  );
}

// ─────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────
export default function GlucoseTrendChart({ logs, colors, onPress }) {
  const { width: screenWidth } = useWindowDimensions();
  const { points, latestToday, hasAnyData } = useGlucoseChartData(logs);

  // Hidden until there is a reading to chart — with no data the card
  // would only be an empty-state poster, and the "Check Sugar" quick
  // tile plus Today's Tasks already point at logging.
  if (!hasAnyData) return null;

  // Card width matches the other HomeScreen cards (marginHorizontal 24 on each side)
  const cardPadding = 22;
  const cardMarginH = 24;
  const chartWidth = screenWidth - cardMarginH * 2 - cardPadding * 2;
  const chartHeight = 120;

  const latestLabel =
    latestToday !== null
      ? `${Math.round(latestToday)} mg/dL`
      : "No reading yet";

  const latestColor =
    latestToday !== null
      ? getPointColor(latestToday)
      : colors?.textMuted || "#7A8A72";

  // ── Legend items ──
  const legend = [
    { color: "#689F38", label: "Normal" },
    { color: "#E8A33D", label: "Pre-diabetic" },
    { color: "#E86A6A", label: "High" },
  ];

  return (
    <View
      style={[
        gc.card,
        {
          borderColor: colors?.border || "#DDE7D2",
          backgroundColor: colors?.card || "#FFFFFF",
        },
      ]}
    >
      {/* Header */}
      <View style={gc.headerRow}>
        <View style={gc.headerTextCol}>
          <Text style={gc.overline}>GLUCOSE THIS WEEK</Text>
          <View style={gc.titleRow}>
            <Text style={gc.title}>Glucose Trend</Text>
            <View style={[gc.todayBadge, { borderColor: latestColor }]}>
              <Text style={[gc.todayValue, { color: latestColor }]}>
                {latestLabel}
              </Text>
            </View>
          </View>
          <Text style={gc.subtitle}>
            {latestToday !== null
              ? "Today's latest reading"
              : "Log your first reading below"}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={gc.addBtn}
          onPress={onPress}
        >
          <Ionicons name="add" size={18} color="#689F38" />
        </TouchableOpacity>
      </View>

      {/* Chart — only renders with real readings (see the early
          return above when there is no data). */}
      <View style={gc.chartWrapper}>
        <GlucoseLineChart
          points={points}
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          colors={colors || {}}
        />
      </View>

      {/* Legend */}
      <View style={gc.legendRow}>
        {legend.map((l) => (
          <View key={l.label} style={gc.legendItem}>
            <View style={[gc.legendDot, { backgroundColor: l.color }]} />
            <Text style={gc.legendLabel}>{l.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const gc = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTextCol: { flex: 1 },
  overline: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7A8A72",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  title: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 18,
    fontWeight: "700",
    color: "#F3EFE3",
    lineHeight: 22,
  },
  todayBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(163,230,53,0.12)",
  },
  todayValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    color: "#7A8A72",
    marginTop: 3,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(163,230,53,0.12)",
    borderWidth: 1,
    borderColor: "rgba(163,230,53,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 2,
  },

  // Chart
  chartWrapper: {
    marginHorizontal: -4,
    marginBottom: 10,
  },

  // Legend
  legendRow: {
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: "#7A8A72",
    fontWeight: "500",
  },
});
