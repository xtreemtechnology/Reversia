import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CHART_H = 200;
const CHART_W = width - 40; // full width minus horizontal padding

// ─── Mock data points per range ───────────────────────────────────────────────
const DATA = {
  '1 hr':  [120, 126, 130, 128, 122, 118, 115, 119, 126],
  '3 hrs': [110, 140, 165, 148, 130, 118, 112, 122, 135, 126, 119, 115],
  '6 hrs': [95, 105, 130, 160, 145, 128, 112, 100, 108, 120, 135, 126, 118, 110, 106, 115],
  '12 hrs':[88, 92, 110, 135, 155, 148, 130, 115, 100, 95, 102, 115, 130, 145, 138, 126, 118, 112, 108, 114],
  '24 hrs':[80, 85, 90, 95, 110, 130, 155, 148, 130, 115, 100, 92, 88, 95, 110, 125, 140, 148, 135, 120, 110, 105, 108, 115],
};

const TIME_LABELS = {
  '1 hr':  ['6:00', '6:15', '6:30', '6:45', '7:00'],
  '3 hrs': ['4 PM', '5 PM', '6 PM', '7 PM'],
  '6 hrs': ['12 PM', '2 PM', '4 PM', '6 PM'],
  '12 hrs':['6 AM', '12 PM', '6 PM'],
  '24 hrs':['12 AM', '6 AM', '12 PM', '6 PM'],
};

const MIN_GLUCOSE = 50;
const MAX_GLUCOSE = 220;
const SAFE_LOW  = 70;
const SAFE_HIGH = 140;

// ─── Map a glucose value to SVG Y coordinate ─────────────────────────────────
const toY = (val) =>
  CHART_H - ((val - MIN_GLUCOSE) / (MAX_GLUCOSE - MIN_GLUCOSE)) * CHART_H;

// ─── Map index to SVG X coordinate ───────────────────────────────────────────
const toX = (i, total) => (i / (total - 1)) * CHART_W;

// ─── Build smooth SVG path from data array ───────────────────────────────────
const buildPath = (points) => {
  if (points.length < 2) return '';
  return points
    .map((val, i) => {
      const x = toX(i, points.length);
      const y = toY(val);
      if (i === 0) return `M${x},${y}`;
      const prevX = toX(i - 1, points.length);
      const prevY = toY(points[i - 1]);
      const cpX = (prevX + x) / 2;
      return `C${cpX},${prevY} ${cpX},${y} ${x},${y}`;
    })
    .join(' ');
};

// ─── Build area fill path ─────────────────────────────────────────────────────
const buildArea = (points) => {
  const line = buildPath(points);
  const lastX = toX(points.length - 1, points.length);
  return `${line} L${lastX},${CHART_H} L0,${CHART_H} Z`;
};

// ─── Stat Chip ────────────────────────────────────────────────────────────────
const StatChip = ({ label, value, valueColor = '#111827', sub }) => (
  <View style={chipStyles.chip}>
    <Text style={chipStyles.label}>{label}</Text>
    <Text style={[chipStyles.value, { color: valueColor }]}>{value}</Text>
    {sub ? <Text style={chipStyles.sub}>{sub}</Text> : null}
  </View>
);

const chipStyles = StyleSheet.create({
  chip: {
    flex: 1, alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderRadius: 18,
    marginHorizontal: 4,
  },
  label: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 4 },
  value: { fontSize: 18, fontWeight: '800' },
  sub:   { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
});

// ─── Insight Card ─────────────────────────────────────────────────────────────
const InsightCard = ({ icon, iconColor, iconBg, text }) => (
  <View style={insightStyles.card}>
    <View style={[insightStyles.iconBox, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
    </View>
    <Text style={insightStyles.text}>{text}</Text>
  </View>
);

const insightStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFF', borderRadius: 18,
    padding: 16, marginBottom: 10,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
    flexShrink: 0,
  },
  text: { flex: 1, color: '#374151', fontSize: 13, lineHeight: 19 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GlucoseMonitoring({ navigation }) {
  const TIME_RANGES = ['1 hr', '3 hrs', '6 hrs', '12 hrs', '24 hrs'];
  const [activeRange, setActiveRange] = useState('1 hr');
  const [selectedIndex, setSelectedIndex] = useState(null);

  const points = DATA[activeRange];
  const linePath = buildPath(points);
  const areaPath = buildArea(points);

  // Compute stats
  const inRange = points.filter(v => v >= SAFE_LOW && v <= SAFE_HIGH).length;
  const pctInRange = Math.round((inRange / points.length) * 100);
  const avg = Math.round(points.reduce((a, b) => a + b, 0) / points.length);
  const high = Math.max(...points);
  const low  = Math.min(...points);

  // Selected point
  const selVal  = selectedIndex !== null ? points[selectedIndex] : points[points.length - 1];
  const selX    = selectedIndex !== null
    ? toX(selectedIndex, points.length)
    : toX(points.length - 1, points.length);
  const selY    = toY(selVal);
  const inRangePt = selVal >= SAFE_LOW && selVal <= SAFE_HIGH;

  // Safe range Y positions
  const safeHighY = toY(SAFE_HIGH);
  const safeLowY  = toY(SAFE_LOW);

  // Time labels
  const labels = TIME_LABELS[activeRange];

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Glucose Monitoring</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Date Selector ── */}
        <View style={styles.dateSelector}>
          <TouchableOpacity style={styles.navArrow}>
            <Ionicons name="chevron-back" size={18} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={14} color="#3B82F6" style={{ marginRight: 7 }} />
            <Text style={styles.dateText}>2026 April 29</Text>
          </View>
          <TouchableOpacity style={[styles.navArrow, { opacity: 0.3 }]}>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* ── Time Range Filter ── */}
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
                onPress={() => { setActiveRange(range); setSelectedIndex(null); }}
                style={[styles.rangeBtn, isActive && styles.activeRange]}
              >
                <Text style={[styles.rangeBtnText, isActive && styles.activeRangeText]}>
                  {range}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Tooltip ── */}
        <View style={[
          styles.tooltip,
          { alignSelf: selX < CHART_W / 2 ? 'flex-start' : 'flex-end' },
        ]}>
          <Text style={styles.tooltipValue}>{selVal.toFixed(1)} mg/dL</Text>
          <Text style={[
            styles.tooltipStatus,
            { color: inRangePt ? '#10B981' : '#EF4444' },
          ]}>
            {inRangePt ? '✓ In Range' : '⚠ Out of Range'}
          </Text>
        </View>

        {/* ── SVG Chart ── */}
        <View style={styles.chartWrapper}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            {[200, 160, 140, 100, 70, 50].map(v => (
              <Text key={v} style={[
                styles.yLabel,
                (v === 140 || v === 70) && styles.yLabelRange,
              ]}>
                {v}
              </Text>
            ))}
          </View>

          <Svg width={CHART_W} height={CHART_H}>
            <Defs>
              <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0"   stopColor="#825CFF" stopOpacity="0.18" />
                <Stop offset="1"   stopColor="#825CFF" stopOpacity="0.01" />
              </LinearGradient>
              <LinearGradient id="safeZone" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#10B981" stopOpacity="0.07" />
                <Stop offset="1" stopColor="#10B981" stopOpacity="0.07" />
              </LinearGradient>
            </Defs>

            {/* Safe zone fill */}
            <Rect
              x="0" y={safeHighY}
              width={CHART_W} height={safeLowY - safeHighY}
              fill="url(#safeZone)"
            />

            {/* Dashed grid lines */}
            {[50, 100, 150, 200].map(v => (
              <Line
                key={v}
                x1="0" y1={toY(v)}
                x2={CHART_W} y2={toY(v)}
                stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4"
              />
            ))}

            {/* Safe range lines */}
            <Line
              x1="0" y1={safeHighY} x2={CHART_W} y2={safeHighY}
              stroke="#10B981" strokeWidth="1.5" strokeDasharray="6 4"
            />
            <Line
              x1="0" y1={safeLowY} x2={CHART_W} y2={safeLowY}
              stroke="#10B981" strokeWidth="1.5" strokeDasharray="6 4"
            />

            {/* Area fill */}
            <Path d={areaPath} fill="url(#areaGrad)" />

            {/* Line */}
            <Path
              d={linePath}
              fill="none"
              stroke="#825CFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Selected point vertical line */}
            <Line
              x1={selX} y1="0" x2={selX} y2={CHART_H}
              stroke="#111827" strokeWidth="1" strokeDasharray="3 3"
            />

            {/* Selected point dot */}
            <Circle cx={selX} cy={selY} r="7" fill="#111827" />
            <Circle cx={selX} cy={selY} r="4" fill="#FFF" />

            {/* All data points (small dots) */}
            {points.map((val, i) => (
              <Circle
                key={i}
                cx={toX(i, points.length)}
                cy={toY(val)}
                r="3"
                fill={val >= SAFE_LOW && val <= SAFE_HIGH ? '#10B981' : '#EF4444'}
                onPress={() => setSelectedIndex(i)}
              />
            ))}
          </Svg>
        </View>

        {/* X-axis labels */}
        <View style={styles.xAxis}>
          {labels.map((l) => (
            <Text key={l} style={styles.xLabel}>{l}</Text>
          ))}
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <StatChip
            label="Time in Range"
            value={`${pctInRange}%`}
            valueColor={pctInRange >= 70 ? '#10B981' : '#EF4444'}
          />
          <StatChip label="Average" value={`${avg}`} sub="mg/dL" />
          <StatChip label="High / Low" value={`${high}/${low}`} sub="mg/dL" />
        </View>

        {/* ── View Activity Button ── */}
        <TouchableOpacity
          style={styles.activityBtn}
          onPress={() => navigation.navigate('ExerciseEntry')}
        >
          <MaterialCommunityIcons name="run" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.activityBtnText}>View Activity</Text>
        </TouchableOpacity>

        {/* ── Insights ── */}
        <Text style={styles.sectionTitle}>Insights</Text>

        <InsightCard
          icon="run"
          iconColor="#0284C7"
          iconBg="#E0F2FE"
          text="Consider incorporating more physical activity into your daily routine, such as taking short walks after meals."
        />
        <InsightCard
          icon="food-apple"
          iconColor="#D97706"
          iconBg="#FEF3C7"
          text="Your glucose peaked around meal time. Try eating lower-glycaemic foods to keep levels more stable."
        />
        <InsightCard
          icon="water"
          iconColor="#6D28D9"
          iconBg="#EDE9FE"
          text="Staying well hydrated can help your body regulate blood glucose more effectively throughout the day."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  shareBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },

  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  // Date
  dateSelector: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  navArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  dateBadge: {
    flex: 1, marginHorizontal: 10, height: 40, borderRadius: 20,
    backgroundColor: '#EFF6FF', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
  },
  dateText: { color: '#1E40AF', fontWeight: '700', fontSize: 14 },

  // Time range
  rangeBtn: {
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8,
  },
  activeRange: { backgroundColor: '#111827' },
  rangeBtnText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
  activeRangeText: { color: '#FFF' },

  // Tooltip
  tooltip: {
    backgroundColor: '#111827', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, marginBottom: 10, alignSelf: 'flex-start',
  },
  tooltipValue: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  tooltipStatus: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Chart
  chartWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    paddingLeft: 8,
    marginBottom: 6,
  },
  yAxis: {
    width: 32,
    justifyContent: 'space-between',
    paddingVertical: 4,
    height: CHART_H,
  },
  yLabel: { fontSize: 9, color: '#CBD5E1', textAlign: 'right', paddingRight: 4 },
  yLabelRange: { color: '#10B981', fontWeight: '700' },

  // X-axis
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  xLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', marginBottom: 16 },

  // Activity button
  activityBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#111827', borderRadius: 28,
    height: 52, marginBottom: 28,
  },
  activityBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  // Insights
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 14 },
});