import React, { useState, useMemo } from "react";
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
import Svg, { Rect, Line, Defs, LinearGradient, Stop } from "react-native-svg";
import { useUserLogs } from "../../../hooks/useUserLogs";
import { useTheme } from "../../../theme/ThemeProvider";

const getDateKey = (value) => {
  if (!value) return null;
  const date =
    typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
};

const QUALITY_COLOR = {
  Poor: "#EF4444",
  Fair: "#F59E0B",
  Good: "#10B981",
  Great: "#825CFF",
};

const STATUS_STYLE = {
  Normal: { bg: "#D1FAE5", dot: "#10B981", text: "#065F46" },
  Elevated: { bg: "#FEF3C7", dot: "#F59E0B", text: "#92400E" },
};

const getStageStyles = (colors) =>
  StyleSheet.create({
    wrapper: { marginVertical: 14 },
    bar: {
      flexDirection: "row",
      height: 22,
      borderRadius: 8,
      overflow: "hidden",
      gap: 2,
    },
    segment: { height: "100%" },
    segmentStart: { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
    segmentEnd: { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
    legend: { flexDirection: "row", flexWrap: "wrap", marginTop: 10, gap: 12 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  });

const getTimeStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 14,
      backgroundColor: colors.background,
      borderRadius: 16,
      marginBottom: 14,
    },
    block: { alignItems: "center", gap: 3 },
    label: {
      fontSize: 11,
      color: colors.muted,
      fontWeight: "600",
      marginTop: 2,
    },
    value: { fontSize: 16, fontWeight: "800", color: colors.text },
    divider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  });

const getStatStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 4,
    },
    chip: { alignItems: "center", flex: 1 },
    value: { fontSize: 18, fontWeight: "800", color: colors.text },
    label: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 3,
      fontWeight: "600",
    },
    divider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  });

const getEffStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 8,
    },
    track: {
      flex: 1,
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: "hidden",
    },
    fill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
    label: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.primary,
      width: 34,
    },
  });

const getWeekStyles = (colors) =>
  StyleSheet.create({
    wrapper: { marginTop: 10 },
    labels: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 2,
    },
    dayLabel: {
      fontSize: 11,
      color: colors.muted,
      fontWeight: "600",
      width: 30,
      textAlign: "center",
    },
    dayLabelActive: { color: colors.primary, fontWeight: "800" },
  });

const getStageCardStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderLeftWidth: 3,
    },
    top: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    name: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.text },
    pct: { fontSize: 13, fontWeight: "800", color: colors.muted },
    dur: { fontSize: 12, color: colors.muted, marginLeft: 16 },
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
    content: { flex: 1 },
    title: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 3,
    },
    text: { flex: 1, color: colors.muted, fontSize: 13, lineHeight: 19 },
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
    calBtn: {
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
    cardSubGap: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
      marginBottom: 14,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusText: { fontSize: 12, fontWeight: "700" },
    effTipBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: `${colors.primary}12`,
      borderRadius: 12,
      padding: 12,
      marginTop: 14,
    },
    effTipText: {
      flex: 1,
      fontSize: 13,
      color: colors.primary,
      lineHeight: 18,
    },
    goalChip: {
      backgroundColor: `${colors.primary}18`,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    goalChipText: { fontSize: 11, fontWeight: "700", color: colors.primary },
    weekStats: {
      flexDirection: "row",
      borderTopWidth: 1,
      marginTop: 14,
      paddingTop: 14,
    },
    weekStat: { flex: 1, alignItems: "center" },
    weekStatVal: { fontSize: 16, fontWeight: "800", color: colors.text },
    weekStatValGreen: { color: "#10B981" },
    weekStatLabel: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 4,
      fontWeight: "600",
    },
    weekStatDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 6,
    },
  });

const StagesBar = ({ colors, stages }) => {
  const stageStyles = getStageStyles(colors);
  return (
    <View style={stageStyles.wrapper}>
      <View style={stageStyles.bar}>
        {stages.map((s, i) => (
          <View
            key={i}
            style={[
              stageStyles.segment,
              { flex: s.pct, backgroundColor: s.color },
              i === 0 && stageStyles.segmentStart,
              i === stages.length - 1 && stageStyles.segmentEnd,
            ]}
          />
        ))}
      </View>
      <View style={stageStyles.legend}>
        {stages
          .filter(
            (s, i, arr) => arr.findIndex((x) => x.label === s.label) === i
          )
          .map((s) => (
            <View key={s.label} style={stageStyles.legendItem}>
              <View
                style={[stageStyles.legendDot, { backgroundColor: s.color }]}
              />
              <Text style={stageStyles.legendText}>{s.label}</Text>
            </View>
          ))}
      </View>
    </View>
  );
};

const SleepTimes = ({ colors, bedTime, wakeTime }) => {
  const timeStyles = getTimeStyles(colors);
  return (
    <View style={timeStyles.row}>
      <View style={timeStyles.block}>
        <MaterialCommunityIcons name="bed" size={16} color="#6D28D9" />
        <Text style={timeStyles.label}>Bedtime</Text>
        <Text style={timeStyles.value}>{bedTime}</Text>
      </View>
      <View style={timeStyles.divider} />
      <View style={timeStyles.block}>
        <MaterialCommunityIcons
          name="weather-sunny"
          size={16}
          color="#F59E0B"
        />
        <Text style={timeStyles.label}>Wake up</Text>
        <Text style={timeStyles.value}>{wakeTime}</Text>
      </View>
    </View>
  );
};

const StatRow = ({ colors, totalSleep, efficiency, status }) => {
  const statStyles = getStatStyles(colors);
  const statusColor = status === "Normal" ? "#10B981" : "#F59E0B";
  return (
    <View style={statStyles.row}>
      <View style={statStyles.chip}>
        <Text style={statStyles.value}>
          {totalSleep.hrs}h {totalSleep.mins}m
        </Text>
        <Text style={statStyles.label}>Total Sleep</Text>
      </View>
      <View style={statStyles.divider} />
      <View style={statStyles.chip}>
        <Text style={statStyles.value}>{efficiency}%</Text>
        <Text style={statStyles.label}>Efficiency</Text>
      </View>
      <View style={statStyles.divider} />
      <View style={statStyles.chip}>
        <Text style={[statStyles.value, { color: statusColor }]}>{status}</Text>
        <Text style={statStyles.label}>Status</Text>
      </View>
    </View>
  );
};

const EfficiencyBar = ({ colors, pct }) => {
  const effStyles = getEffStyles(colors);
  return (
    <View style={effStyles.wrapper}>
      <View style={effStyles.track}>
        <View style={[effStyles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={effStyles.label}>{pct}%</Text>
    </View>
  );
};

const CHART_H = 90;
const MAX_HRS = 10;

const WeekChart = ({ colors, data }) => {
  const { width: screenWidth } = useWindowDimensions();
  const weekStyles = getWeekStyles(colors);
  const BAR_W = Math.floor((screenWidth - 80) / data.length);
  return (
    <View style={weekStyles.wrapper}>
      <Svg width={screenWidth - 40} height={CHART_H + 30}>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        <Line
          x1="0"
          y1={CHART_H - (8 / MAX_HRS) * CHART_H}
          x2={screenWidth - 40}
          y2={CHART_H - (8 / MAX_HRS) * CHART_H}
          stroke={colors.border}
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        {data.map((d, i) => {
          const barH = (d.hrs / MAX_HRS) * CHART_H;
          const x = i * BAR_W + BAR_W / 2 - 10;
          const y = CHART_H - barH;
          const isToday = d.day === "Sun";
          return (
            <Rect
              key={d.day}
              x={x}
              y={y}
              width={20}
              height={barH}
              fill={isToday ? "url(#barGrad)" : colors.border}
              rx="6"
            />
          );
        })}
      </Svg>
      <View style={weekStyles.labels}>
        {data.map((d) => (
          <Text
            key={d.day}
            style={[
              weekStyles.dayLabel,
              d.day === "Sun" && weekStyles.dayLabelActive,
            ]}
          >
            {d.day}
          </Text>
        ))}
      </View>
    </View>
  );
};

const StageCard = ({ colors, stage }) => {
  const sdStyles = getStageCardStyles(colors);
  return (
    <View style={[sdStyles.card, { borderLeftColor: stage.color }]}>
      <View style={sdStyles.top}>
        <View style={[sdStyles.dot, { backgroundColor: stage.color }]} />
        <Text style={sdStyles.name}>{stage.label} Sleep</Text>
        <Text style={sdStyles.pct}>{Math.round(stage.pct * 100)}%</Text>
      </View>
      <Text style={sdStyles.dur}>
        {Math.floor(stage.duration / 60) > 0
          ? `${Math.floor(stage.duration / 60)}h `
          : ""}
        {stage.duration % 60}m of total sleep
      </Text>
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
      <View style={insightStyles.content}>
        {title && <Text style={insightStyles.title}>{title}</Text>}
        <Text style={insightStyles.text}>{text}</Text>
      </View>
    </View>
  );
};

export default function SleepInsights({ navigation }) {
  const [activeTab, setActiveTab] = useState("tonight");
  const { logs } = useUserLogs(60);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const sleepLogs = useMemo(
    () => logs.filter((log) => log.type === "sleep").slice(0, 30),
    [logs]
  );
  const lastSleepLog = sleepLogs[0] || null;

  const sleepData = useMemo(() => {
    const log = lastSleepLog || {};
    const minutes = Number(log.value) || 440;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return {
      bedTime: log.bedTime || "11:33 PM",
      wakeTime: log.wakeTime || "08:38 AM",
      totalSleep: { hrs, mins },
      efficiency: log.efficiency || 86,
      status: log.status || "Normal",
      stages: log.stages || [
        { label: "Awake", duration: 25, color: "#FCD34D", pct: 0.06 },
        { label: "Light", duration: 220, color: "#86EFAC", pct: 0.45 },
        { label: "Deep", duration: 115, color: "#818CF8", pct: 0.25 },
        { label: "REM", duration: 75, color: "#6D28D9", pct: 0.16 },
        { label: "Awake", duration: 30, color: "#FCD34D", pct: 0.08 },
      ],
    };
  }, [lastSleepLog]);

  const weekData = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const weekLogs = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const dayName = dayNames[d.getDay()];
      const dayLog = sleepLogs.find(
        (log) => getDateKey(log.timestamp) === dateKey
      );
      const hrs = dayLog ? (Number(dayLog.value) || 0) / 60 : 0;
      const quality = !dayLog
        ? "None"
        : hrs < 5
        ? "Poor"
        : hrs < 6.5
        ? "Fair"
        : hrs < 8
        ? "Good"
        : "Great";
      weekLogs.push({ day: dayName, hrs: hrs.toFixed(1), quality });
    }
    return weekLogs;
  }, [sleepLogs]);

  const { bedTime, wakeTime, totalSleep, efficiency, status, stages } =
    sleepData;
  const uniqueStages = [
    { label: "Light", duration: 220, color: "#86EFAC", pct: 0.45 },
    { label: "Deep", duration: 115, color: "#818CF8", pct: 0.25 },
    { label: "REM", duration: 75, color: "#6D28D9", pct: 0.16 },
    { label: "Awake", duration: 55, color: "#FCD34D", pct: 0.14 },
  ];
  const statusStyle = STATUS_STYLE[status] || STATUS_STYLE.Elevated;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep Insights</Text>
        <TouchableOpacity style={styles.calBtn}>
          <Ionicons name="calendar-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabs}>
          {["tonight", "weekly"].map((tab) => (
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
                {tab === "tonight" ? "Last Night" : "This Week"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "tonight" ? (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Sleep Stages</Text>
                  <Text style={styles.cardSub}>Last night's breakdown</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.bg },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusStyle.dot },
                    ]}
                  />
                  <Text
                    style={[styles.statusText, { color: statusStyle.text }]}
                  >
                    {status}
                  </Text>
                </View>
              </View>
              <StagesBar colors={colors} stages={stages} />
              <SleepTimes
                colors={colors}
                bedTime={bedTime}
                wakeTime={wakeTime}
              />
              <StatRow
                colors={colors}
                totalSleep={totalSleep}
                efficiency={efficiency}
                status={status}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sleep Efficiency</Text>
              <Text style={styles.cardSub}>Time asleep vs. time in bed</Text>
              <EfficiencyBar colors={colors} pct={efficiency} />
              <View style={styles.effTipBox}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.effTipText}>
                  Great sleep efficiency! Keep up the healthy habits to maintain
                  this positive trend.
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Stage Breakdown</Text>
              <Text style={styles.cardSubGap}>What your body was doing</Text>
              {uniqueStages.map((s) => (
                <StageCard key={s.label} colors={colors} stage={s} />
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sleep Insights</Text>
              <Text style={styles.cardSubGap}>
                Personalised recommendations
              </Text>
              <InsightCard
                colors={colors}
                icon="bed"
                iconColor="#6D28D9"
                iconBg="#EDE9FE"
                title="Light Sleep"
                text="To improve light sleep, keep a regular sleep schedule, optimise a quiet dark environment, limit stimulants and screens before bed."
              />
              <InsightCard
                colors={colors}
                icon="brain"
                iconColor="#0284C7"
                iconBg="#E0F2FE"
                title="REM Sleep"
                text="Your REM sleep is within a healthy range. Avoiding alcohol and keeping stress low can further improve REM quality."
              />
              <InsightCard
                colors={colors}
                icon="moon-waning-crescent"
                iconColor="#059669"
                iconBg="#D1FAE5"
                title="Deep Sleep"
                text="Deep sleep supports glucose regulation and insulin sensitivity. Regular exercise during the day can help increase deep sleep duration."
              />
              <InsightCard
                colors={colors}
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
              <WeekChart colors={colors} data={weekData} />
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
                  <Text style={[styles.weekStatVal, styles.weekStatValGreen]}>
                    5 / 7
                  </Text>
                  <Text style={styles.weekStatLabel}>Good nights</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Night by Night</Text>
              <Text style={styles.cardSubGap}>This week's sleep log</Text>
              {weekData.map((d, i) => {
                const qualityColor = QUALITY_COLOR[d.quality] || colors.primary;
                return (
                  <View
                    key={d.day}
                    style={[
                      nightStyles.row,
                      i < weekData.length - 1 && [
                        nightStyles.rowBorder,
                        { borderBottomColor: colors.border },
                      ],
                    ]}
                  >
                    <View
                      style={[
                        nightStyles.dayBox,
                        d.day === "Sun" && nightStyles.dayBoxActive,
                        {
                          backgroundColor:
                            d.day === "Sun" ? colors.primary : colors.card,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          nightStyles.dayText,
                          d.day === "Sun" && nightStyles.dayTextActive,
                          {
                            color: d.day === "Sun" ? colors.card : colors.muted,
                          },
                        ]}
                      >
                        {d.day}
                      </Text>
                    </View>
                    <View
                      style={[
                        nightStyles.barTrack,
                        { backgroundColor: colors.border },
                      ]}
                    >
                      <View
                        style={[
                          nightStyles.barFill,
                          {
                            width: `${(d.hrs / 10) * 100}%`,
                            backgroundColor: qualityColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[nightStyles.hrs, { color: colors.text }]}>
                      {d.hrs}h
                    </Text>
                    <View
                      style={[
                        nightStyles.qualityBadge,
                        { backgroundColor: `${qualityColor}20` },
                      ]}
                    >
                      <Text
                        style={[
                          nightStyles.qualityText,
                          { color: qualityColor },
                        ]}
                      >
                        {d.quality}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Weekly Pattern</Text>
              <Text style={styles.cardSubGap}>Trends to watch</Text>
              <InsightCard
                colors={colors}
                icon="trending-up"
                iconColor="#10B981"
                iconBg="#D1FAE5"
                title="Improving trend"
                text="Your sleep duration has improved by 45 minutes compared to last week. Keep maintaining a consistent bedtime routine."
              />
              <InsightCard
                colors={colors}
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

const nightStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  rowBorder: { borderBottomWidth: 1 },
  dayBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dayBoxActive: {},
  dayText: { fontSize: 12, fontWeight: "700" },
  dayTextActive: { color: "#FFF" },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  hrs: { width: 30, fontSize: 13, fontWeight: "700", textAlign: "right" },
  qualityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  qualityText: { fontSize: 11, fontWeight: "700" },
});
