// src/screens/SleepInsights.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, {
  Rect,
  Circle,
  Line,
  Defs,
  LinearGradient,
  Stop,
  Path,
} from 'react-native-svg';

const { width } = Dimensions.get('window');

// ─── Mock Data ────────────────────────────────────────────────────────────────
const SLEEP_DATA = {
  bedTime:   '11:33 PM',
  wakeTime:  '08:38 AM',
  totalSleep: { hrs: 7, mins: 20 },
  efficiency: 86,
  status: 'Normal',
  stages: [
    { label: 'Awake',   duration: 25,  color: '#FCD34D', pct: 0.06 },
    { label: 'Light',   duration: 220, color: '#86EFAC', pct: 0.45 },
    { label: 'Deep',    duration: 115, color: '#818CF8', pct: 0.25 },
    { label: 'REM',     duration: 75,  color: '#6D28D9', pct: 0.16 },
    { label: 'Awake',   duration: 30,  color: '#FCD34D', pct: 0.08 },
  ],
  weekData: [
    { day: 'Mon', hrs: 6.5, quality: 'Fair'   },
    { day: 'Tue', hrs: 7.8, quality: 'Good'   },
    { day: 'Wed', hrs: 5.2, quality: 'Poor'   },
    { day: 'Thu', hrs: 8.1, quality: 'Great'  },
    { day: 'Fri', hrs: 7.0, quality: 'Good'   },
    { day: 'Sat', hrs: 7.3, quality: 'Good'   },
    { day: 'Sun', hrs: 7.3, quality: 'Good'   },
  ],
};

const QUALITY_COLOR = {
  Poor:  '#EF4444',
  Fair:  '#F59E0B',
  Good:  '#10B981',
  Great: '#825CFF',
};

// ─── Sleep Stages Bar ─────────────────────────────────────────────────────────
const StagesBar = ({ stages }) => (
  <View style={stageStyles.wrapper}>
    <View style={stageStyles.bar}>
      {stages.map((s, i) => (
        <View
          key={i}
          style={[
            stageStyles.segment,
            { flex: s.pct, backgroundColor: s.color },
            i === 0 && { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
            i === stages.length - 1 && { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
          ]}
        />
      ))}
    </View>
    {/* Legend */}
    <View style={stageStyles.legend}>
      {stages
        .filter((s, i, arr) => arr.findIndex(x => x.label === s.label) === i)
        .map(s => (
          <View key={s.label} style={stageStyles.legendItem}>
            <View style={[stageStyles.legendDot, { backgroundColor: s.color }]} />
            <Text style={stageStyles.legendText}>{s.label}</Text>
          </View>
        ))}
    </View>
  </View>
);

const stageStyles = StyleSheet.create({
  wrapper: { marginVertical: 14 },
  bar: { flexDirection: 'row', height: 22, borderRadius: 8, overflow: 'hidden', gap: 2 },
  segment: { height: '100%' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
});

// ─── Sleep Time Display ───────────────────────────────────────────────────────
const SleepTimes = ({ bedTime, wakeTime }) => (
  <View style={timeStyles.row}>
    <View style={timeStyles.block}>
      <MaterialCommunityIcons name="bed" size={16} color="#6D28D9" />
      <Text style={timeStyles.label}>Bedtime</Text>
      <Text style={timeStyles.value}>{bedTime}</Text>
    </View>
    <View style={timeStyles.divider} />
    <View style={timeStyles.block}>
      <MaterialCommunityIcons name="weather-sunny" size={16} color="#F59E0B" />
      <Text style={timeStyles.label}>Wake up</Text>
      <Text style={timeStyles.value}>{wakeTime}</Text>
    </View>
  </View>
);

const timeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: '#F8FAFC', borderRadius: 16, marginBottom: 14,
  },
  block: { alignItems: 'center', gap: 3 },
  label: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginTop: 2 },
  value: { fontSize: 16, fontWeight: '800', color: '#111827' },
  divider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },
});

// ─── Stats Row ────────────────────────────────────────────────────────────────
const StatRow = ({ totalSleep, efficiency, status }) => (
  <View style={statStyles.row}>
    <View style={statStyles.chip}>
      <Text style={statStyles.value}>{totalSleep.hrs}h {totalSleep.mins}m</Text>
      <Text style={statStyles.label}>Total Sleep</Text>
    </View>
    <View style={statStyles.divider} />
    <View style={statStyles.chip}>
      <Text style={statStyles.value}>{efficiency}%</Text>
      <Text style={statStyles.label}>Efficiency</Text>
    </View>
    <View style={statStyles.divider} />
    <View style={statStyles.chip}>
      <Text style={[statStyles.value, { color: '#10B981' }]}>{status}</Text>
      <Text style={statStyles.label}>Status</Text>
    </View>
  </View>
);

const statStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 4,
  },
  chip: { alignItems: 'center', flex: 1 },
  value: { fontSize: 18, fontWeight: '800', color: '#111827' },
  label: { fontSize: 11, color: '#9CA3AF', marginTop: 3, fontWeight: '600' },
  divider: { width: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
});

// ─── Efficiency Bar ───────────────────────────────────────────────────────────
const EfficiencyBar = ({ pct }) => (
  <View style={effStyles.wrapper}>
    <View style={effStyles.track}>
      <View style={[effStyles.fill, { width: `${pct}%` }]} />
    </View>
    <Text style={effStyles.label}>{pct}%</Text>
  </View>
);

const effStyles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  track: {
    flex: 1, height: 8, backgroundColor: '#F3F4F6',
    borderRadius: 4, overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
  label: { fontSize: 13, fontWeight: '800', color: '#10B981', width: 34 },
});

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────
const CHART_H = 90;
const MAX_HRS  = 10;

const WeekChart = ({ data }) => {
  const BAR_W = Math.floor((width - 80) / data.length);

  return (
    <View style={weekStyles.wrapper}>
      <Svg width={width - 40} height={CHART_H + 30}>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#825CFF" stopOpacity="1" />
            <Stop offset="1" stopColor="#C4B5FD" stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        {/* Goal line at 8hrs */}
        <Line
          x1="0" y1={CHART_H - (8 / MAX_HRS) * CHART_H}
          x2={width - 40} y2={CHART_H - (8 / MAX_HRS) * CHART_H}
          stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="5 4"
        />
        {data.map((d, i) => {
          const barH  = (d.hrs / MAX_HRS) * CHART_H;
          const x     = i * BAR_W + BAR_W / 2 - 10;
          const y     = CHART_H - barH;
          const isToday = d.day === 'Sun';
          return (
            <React.Fragment key={d.day}>
              <Rect
                x={x} y={y} width={20} height={barH}
                fill={isToday ? 'url(#barGrad)' : '#E5E7EB'}
                rx="6"
              />
              {/* Day label */}
              <Svg x={x - 4} y={CHART_H + 8} width={28} height={16}>
                <Path d="" />
              </Svg>
            </React.Fragment>
          );
        })}
      </Svg>
      {/* X labels below */}
      <View style={weekStyles.labels}>
        {data.map((d, i) => (
          <Text
            key={d.day}
            style={[weekStyles.dayLabel, d.day === 'Sun' && weekStyles.dayLabelActive]}
          >
            {d.day}
          </Text>
        ))}
      </View>
    </View>
  );
};

const weekStyles = StyleSheet.create({
  wrapper: { marginTop: 10 },
  labels: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 2 },
  dayLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', width: 30, textAlign: 'center' },
  dayLabelActive: { color: '#825CFF', fontWeight: '800' },
});

// ─── Stage Detail Card ────────────────────────────────────────────────────────
const StageCard = ({ stage }) => (
  <View style={[sdStyles.card, { borderLeftColor: stage.color }]}>
    <View style={sdStyles.top}>
      <View style={[sdStyles.dot, { backgroundColor: stage.color }]} />
      <Text style={sdStyles.name}>{stage.label} Sleep</Text>
      <Text style={sdStyles.pct}>{Math.round(stage.pct * 100)}%</Text>
    </View>
    <Text style={sdStyles.dur}>
      {Math.floor(stage.duration / 60) > 0
        ? `${Math.floor(stage.duration / 60)}h `
        : ''}
      {stage.duration % 60}m of total sleep
    </Text>
  </View>
);

const sdStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FAFAFA', borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderLeftWidth: 3,
  },
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  name: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },
  pct: { fontSize: 13, fontWeight: '800', color: '#9CA3AF' },
  dur: { fontSize: 12, color: '#9CA3AF', marginLeft: 16 },
});

// ─── Insight Card ─────────────────────────────────────────────────────────────
const InsightCard = ({ icon, iconColor, iconBg, title, text }) => (
  <View style={insightStyles.card}>
    <View style={[insightStyles.iconBox, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      {title ? <Text style={insightStyles.title}>{title}</Text> : null}
      <Text style={insightStyles.text}>{text}</Text>
    </View>
  </View>
);

const insightStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FAFAFA', borderRadius: 16,
    padding: 14, marginBottom: 10,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, flexShrink: 0,
  },
  title: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 3 },
  text: { flex: 1, color: '#374151', fontSize: 13, lineHeight: 19 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SleepInsights({ navigation }) {
  const [activeTab, setActiveTab] = useState('tonight');
  const { bedTime, wakeTime, totalSleep, efficiency, status, stages, weekData } = SLEEP_DATA;

  // Deduplicate stages for detail cards (combine Awake)
  const uniqueStages = [
    { label: 'Light',  duration: 220, color: '#86EFAC', pct: 0.45 },
    { label: 'Deep',   duration: 115, color: '#818CF8', pct: 0.25 },
    { label: 'REM',    duration: 75,  color: '#6D28D9', pct: 0.16 },
    { label: 'Awake',  duration: 55,  color: '#FCD34D', pct: 0.14 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep Insights</Text>
        <TouchableOpacity style={styles.calBtn}>
          <Ionicons name="calendar-outline" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Tab Switch ── */}
        <View style={styles.tabs}>
          {['tonight', 'weekly'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'tonight' ? 'Last Night' : 'This Week'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'tonight' ? (
          <>
            {/* ── Overview Card ── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Sleep Stages</Text>
                  <Text style={styles.cardSub}>Last night's breakdown</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: status === 'Normal' ? '#D1FAE5' : '#FEF3C7' },
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: status === 'Normal' ? '#10B981' : '#F59E0B' },
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: status === 'Normal' ? '#065F46' : '#92400E' },
                  ]}>
                    {status}
                  </Text>
                </View>
              </View>

              <StagesBar stages={stages} />
              <SleepTimes bedTime={bedTime} wakeTime={wakeTime} />
              <StatRow totalSleep={totalSleep} efficiency={efficiency} status={status} />
            </View>

            {/* ── Sleep Efficiency Card ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sleep Efficiency</Text>
              <Text style={styles.cardSub}>Time asleep vs. time in bed</Text>
              <EfficiencyBar pct={efficiency} />
              <View style={styles.effTipBox}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                <Text style={styles.effTipText}>
                  Great sleep efficiency! Keep up the healthy habits to maintain this positive trend.
                </Text>
              </View>
            </View>

            {/* ── Stage Detail Cards ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Stage Breakdown</Text>
              <Text style={[styles.cardSub, { marginBottom: 14 }]}>
                What your body was doing
              </Text>
              {uniqueStages.map(s => (
                <StageCard key={s.label} stage={s} />
              ))}
            </View>

            {/* ── Insights ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sleep Insights</Text>
              <Text style={[styles.cardSub, { marginBottom: 14 }]}>
                Personalised recommendations
              </Text>
              <InsightCard
                icon="bed"
                iconColor="#6D28D9"
                iconBg="#EDE9FE"
                title="Light Sleep"
                text="To improve light sleep, keep a regular sleep schedule, optimise a quiet dark environment, limit stimulants and screens before bed."
              />
              <InsightCard
                icon="brain"
                iconColor="#0284C7"
                iconBg="#E0F2FE"
                title="REM Sleep"
                text="Your REM sleep is within a healthy range. Avoiding alcohol and keeping stress low can further improve REM quality."
              />
              <InsightCard
                icon="moon-waning-crescent"
                iconColor="#059669"
                iconBg="#D1FAE5"
                title="Deep Sleep"
                text="Deep sleep supports glucose regulation and insulin sensitivity. Regular exercise during the day can help increase deep sleep duration."
              />
              <InsightCard
                icon="clock-time-four-outline"
                iconColor="#D97706"
                iconBg="#FEF3C7"
                title="Consistency"
                text="You went to bed within 30 minutes of your usual time. Consistent sleep timing is strongly linked to better blood sugar control."
              />
            </View>
          </>
        ) : (
          <>
            {/* ── Weekly Chart Card ── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Weekly Sleep</Text>
                  <Text style={styles.cardSub}>Hours per night this week</Text>
                </View>
                <View style={styles.goalChip}>
                  <Text style={styles.goalChipText}>Goal: 8h</Text>
                </View>
              </View>
              <WeekChart data={weekData} />

              {/* Weekly averages */}
              <View style={styles.weekStats}>
                <View style={styles.weekStat}>
                  <Text style={styles.weekStatVal}>7h 2m</Text>
                  <Text style={styles.weekStatLabel}>Avg. duration</Text>
                </View>
                <View style={styles.weekStatDivider} />
                <View style={styles.weekStat}>
                  <Text style={styles.weekStatVal}>84%</Text>
                  <Text style={styles.weekStatLabel}>Avg. efficiency</Text>
                </View>
                <View style={styles.weekStatDivider} />
                <View style={styles.weekStat}>
                  <Text style={[styles.weekStatVal, { color: '#10B981' }]}>5 / 7</Text>
                  <Text style={styles.weekStatLabel}>Good nights</Text>
                </View>
              </View>
            </View>

            {/* ── Night-by-Night ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Night by Night</Text>
              <Text style={[styles.cardSub, { marginBottom: 14 }]}>This week's sleep log</Text>
              {weekData.map((d, i) => (
                <View key={d.day} style={[
                  nightStyles.row,
                  i < weekData.length - 1 && nightStyles.rowBorder,
                ]}>
                  <View style={[nightStyles.dayBox, d.day === 'Sun' && nightStyles.dayBoxActive]}>
                    <Text style={[nightStyles.dayText, d.day === 'Sun' && nightStyles.dayTextActive]}>
                      {d.day}
                    </Text>
                  </View>
                  <View style={nightStyles.barTrack}>
                    <View style={[
                      nightStyles.barFill,
                      {
                        width: `${(d.hrs / 10) * 100}%`,
                        backgroundColor: QUALITY_COLOR[d.quality] || '#10B981',
                      },
                    ]} />
                  </View>
                  <Text style={nightStyles.hrs}>{d.hrs}h</Text>
                  <View style={[
                    nightStyles.qualityBadge,
                    { backgroundColor: QUALITY_COLOR[d.quality] + '20' },
                  ]}>
                    <Text style={[nightStyles.qualityText, { color: QUALITY_COLOR[d.quality] }]}>
                      {d.quality}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ── Weekly Insight ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Weekly Pattern</Text>
              <Text style={[styles.cardSub, { marginBottom: 14 }]}>Trends to watch</Text>
              <InsightCard
                icon="trending-up"
                iconColor="#10B981"
                iconBg="#D1FAE5"
                title="Improving trend"
                text="Your sleep duration has improved by 45 minutes compared to last week. Keep maintaining a consistent bedtime routine."
              />
              <InsightCard
                icon="alert-circle-outline"
                iconColor="#D97706"
                iconBg="#FEF3C7"
                title="Wednesday dip"
                text="You only got 5.2 hours on Wednesday. Poor sleep on weekdays can spike morning glucose levels — aim for at least 7 hours."
              />
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Night-by-Night styles ────────────────────────────────────────────────────
const nightStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 10,
  },
  rowBorder: {
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  dayBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  dayBoxActive: { backgroundColor: '#111827' },
  dayText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  dayTextActive: { color: '#FFF' },
  barTrack: {
    flex: 1, height: 8,
    backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  hrs: { width: 30, fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'right' },
  qualityBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  qualityText: { fontSize: 11, fontWeight: '700' },
});

// ─── Shared Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  calBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },

  content: { padding: 16, paddingBottom: 40 },

  tabs: {
    flexDirection: 'row', backgroundColor: '#F3F4F6',
    borderRadius: 14, padding: 4, marginBottom: 16,
  },
  tab: {
    flex: 1, paddingVertical: 9,
    borderRadius: 11, alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 4, elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#111827' },

  card: {
    backgroundColor: '#FFF', borderRadius: 24,
    padding: 20, marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  cardSub:   { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },

  effTipBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#F0FDF4', borderRadius: 12,
    padding: 12, marginTop: 14,
  },
  effTipText: { flex: 1, fontSize: 13, color: '#065F46', lineHeight: 18 },

  goalChip: {
    backgroundColor: '#EDE9FE', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 12,
  },
  goalChipText: { fontSize: 11, fontWeight: '700', color: '#6D28D9' },

  weekStats: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 20, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  weekStat: { alignItems: 'center' },
  weekStatVal: { fontSize: 17, fontWeight: '800', color: '#111827' },
  weekStatLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 3, fontWeight: '600' },
  weekStatDivider: { width: 1, backgroundColor: '#F3F4F6' },
});