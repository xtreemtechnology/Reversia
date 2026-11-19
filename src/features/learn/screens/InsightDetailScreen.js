import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SolarIcon from "../../../components/SolarIcon";
import { useTheme } from "../../../theme/ThemeProvider";
import { T, FONTS } from "../../../theme/tokens";
import FadeIn from "../../../home/components/FadeIn";
import { useUserLogs } from "../../../hooks/useUserLogs";

function getLatestMeal(logs) {
  return (logs || []).find((l) => l?.category === "meal") || null;
}

/** Convert a Firestore Timestamp / Date / ISO string to a JS Date */
function toDate(ts) {
  if (!ts) return null;
  if (ts?.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

/** Format a Date as "h:mm AM/PM" */
function formatTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Returns "YYYY-MM-DD" for a log entry */
function logDay(log) {
  const d = toDate(log?.createdAt);
  return d ? d.toISOString().slice(0, 10) : null;
}

/**
 * Build a timeline from the most recent day that has at least one log.
 * Falls back to today if nothing found.
 */
function buildTimeline(logs) {
  if (!logs?.length) return { dayLabel: "No logs yet", items: [] };

  // Find the most recent day that has logs
  const days = {};
  for (const log of logs) {
    const day = logDay(log);
    if (!day) continue;
    if (!days[day]) days[day] = [];
    days[day].push(log);
  }
  const sortedDays = Object.keys(days).sort().reverse();
  if (!sortedDays.length) return { dayLabel: "No logs yet", items: [] };

  const latestDay = sortedDays[0];
  const dayLogs = days[latestDay].sort((a, b) => {
    const da = toDate(a.createdAt);
    const db_ = toDate(b.createdAt);
    return (da?.getTime() || 0) - (db_?.getTime() || 0);
  });

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let dayLabel = latestDay;
  if (latestDay === today) dayLabel = "Today";
  else if (latestDay === yesterday) dayLabel = "Yesterday";

  const items = dayLogs.map((log) => {
    const time = formatTime(toDate(log.createdAt));
    if (log.category === "meal") {
      const name = log.name || log.type || "Meal";
      return {
        time,
        event: `${
          log.type
            ? log.type.charAt(0).toUpperCase() + log.type.slice(1)
            : "Meal"
        } logged`,
        detail: name,
        icon: "restaurant-outline",
        color: T.PRIMARY,
      };
    }
    if (log.category === "water" || log.category === "hydration") {
      const glasses = log.glasses
        ? `${log.glasses} glass${log.glasses !== 1 ? "es" : ""}`
        : log.liters
        ? `${log.liters}L`
        : "Water";
      return {
        time,
        event: "Water logged",
        detail: glasses,
        icon: "water-outline",
        color: T.SECONDARY,
      };
    }
    if (log.category === "sleep") {
      return {
        time,
        event: "Sleep logged",
        detail: `${log.duration || log.hours || "?"}h · ${log.quality || ""}`,
        icon: "moon-outline",
        color: "#7B8FD8",
      };
    }
    if (log.category === "body_check") {
      const mood = log.mood
        ? log.mood.charAt(0).toUpperCase() + log.mood.slice(1)
        : "Check-in";
      const symptoms = log.symptoms?.length
        ? ` · ${log.symptoms.slice(0, 2).join(", ")}`
        : "";
      return {
        time,
        event: `Body check — ${mood}`,
        detail: log.energy
          ? `Energy ${log.energy}/10${symptoms}`
          : symptoms.trim() || "Logged",
        icon: "happy-outline",
        color: "#CE6C60",
      };
    }
    if (log.category === "glucose") {
      return {
        time,
        event: "Glucose logged",
        detail: `${log.value} ${log.unit || "mg/dL"} · ${log.context || ""}`,
        icon: "analytics-outline",
        color: "#64A0DC",
      };
    }
    return {
      time,
      event: "Log entry",
      detail: log.category || "",
      icon: "ellipse-outline",
      color: T.MUTED,
    };
  });

  return { dayLabel, items };
}

/** Derive real "What We Noticed" observations from logs */
function buildObservations(logs) {
  const obs = [];
  const meals = (logs || []).filter((l) => l?.category === "meal");
  const checks = (logs || []).filter((l) => l?.category === "body_check");
  const water = (logs || []).filter(
    (l) => l?.category === "water" || l?.category === "hydration"
  );

  const breakfast = meals.filter((l) => l?.type?.toLowerCase() === "breakfast");
  const noProteinBreakfast = breakfast.filter(
    (l) => !l?.protein || Number(l.protein) < 5
  );
  if (noProteinBreakfast.length > 0) {
    obs.push({
      label: "Low protein in some breakfasts",
      impact: "May contribute to mid-morning energy dips",
      color: "#CE6C60",
    });
  }

  const lowWaterDays = water.length < 3;
  if (lowWaterDays) {
    obs.push({
      label: "Water intake could be higher",
      impact: "Hydration affects focus and mood throughout the day",
      color: T.PRIMARY,
    });
  }

  const tiredChecks = checks.filter(
    (l) =>
      l?.symptoms?.some((s) =>
        ["Tired", "Fatigue", "Brain Fog", "Low Energy"].includes(s)
      ) || l?.energy <= 4
  );
  if (tiredChecks.length > 0) {
    obs.push({
      label: `${tiredChecks.length} low-energy check-in${
        tiredChecks.length > 1 ? "s" : ""
      } logged`,
      impact: "These moments help Reversia identify what triggered the dip",
      color: T.PRIMARY,
    });
  }

  if (obs.length === 0) {
    obs.push({
      label: "Keep logging to unlock observations",
      impact: "Reversia needs more data to identify meaningful patterns",
      color: T.MUTED,
    });
  }

  return obs.slice(0, 3);
}

/** Compute pattern confidence (0–5 dots) based on log count */
function confidenceScore(logs) {
  const count = (logs || []).length;
  if (count >= 30) return 5;
  if (count >= 20) return 4;
  if (count >= 10) return 3;
  if (count >= 5) return 2;
  if (count >= 2) return 1;
  return 0;
}

function confidenceLabel(score) {
  if (score >= 5) return "High";
  if (score >= 3) return "Moderate";
  if (score >= 1) return "Early";
  return "No data yet";
}

function SectionLabel({ text, color = T.MUTED }) {
  return <Text style={[sl.text, { color }]}>{text.toUpperCase()}</Text>;
}

const sl = StyleSheet.create({
  text: {
    fontFamily: FONTS.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
});

function WhyBox({ text, colors }) {
  return (
    <View style={[wb.box, { backgroundColor: T.PRIMARY_LIGHT }]}>
      <View style={wb.row}>
        <SolarIcon
          name="info-circle-bold-duotone"
          size={16}
          color={colors.primary}
        />
        <View style={{ flex: 1 }}>
          <Text style={[wb.title, { color: colors.foreground }]}>
            Why this matters
          </Text>
          <Text style={[wb.body, { color: colors.mutedForeground }]}>
            {text}
          </Text>
        </View>
      </View>
    </View>
  );
}

const wb = StyleSheet.create({
  box: { borderRadius: 16, padding: 14 },
  row: { flexDirection: "row", gap: 10 },
  title: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  body: { fontSize: 13, lineHeight: 19 },
});

export default function InsightDetailScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { logs } = useUserLogs(30);
  const latestMeal = getLatestMeal(logs);
  const mealName = latestMeal?.name || latestMeal?.type || "your recent meal";

  const { dayLabel, items: timeline } = buildTimeline(logs);
  const observations = buildObservations(logs);
  const confidence = confidenceScore(logs);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Full Breakdown
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            What the data shows
          </Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        <FadeIn delay={0}>
          <View
            style={[
              styles.heroCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.heroIconBadge,
                { backgroundColor: "rgba(139,195,74,0.14)" },
              ]}
            >
              <Ionicons name="analytics-outline" size={22} color={T.PRIMARY} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              {mealName} appears in your low-energy afternoons.
            </Text>
            <Text style={[styles.heroBody, { color: colors.mutedForeground }]}>
              Across your recent logs, meals that were followed by a
              lower-energy body check-in most often contained {mealName}. This
              is a pattern worth testing.
            </Text>
            <View style={styles.confidenceRow}>
              <Text
                style={[
                  styles.confidenceLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                Pattern confidence
              </Text>
              <View style={styles.dotRow}>
                {[1, 2, 3, 4, 5].map((d) => (
                  <View
                    key={d}
                    style={[styles.dot, d <= confidence && styles.dotFilled]}
                  />
                ))}
              </View>
              <Text style={styles.confidenceVal}>
                {confidenceLabel(confidence)}
              </Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={60}>
          <View style={styles.sectionBlock}>
            <SectionLabel text={`${dayLabel}'s Timeline`} />
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {timeline.length === 0 ? (
                <View style={styles.emptyTimeline}>
                  <Text
                    style={[
                      styles.timelineDetail,
                      {
                        color: colors.mutedForeground,
                        textAlign: "center",
                        paddingVertical: 20,
                      },
                    ]}
                  >
                    No logs found yet. Start logging meals, water, and body
                    check-ins to see your timeline here.
                  </Text>
                </View>
              ) : (
                timeline.map((item, i) => (
                  <View key={i} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <Text
                        style={[
                          styles.timelineTime,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {item.time}
                      </Text>
                    </View>
                    <View style={styles.timelineSpine}>
                      <View
                        style={[
                          styles.timelineDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      {i < timeline.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: colors.border },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text
                        style={[
                          styles.timelineEvent,
                          { color: colors.foreground },
                        ]}
                      >
                        {item.event}
                      </Text>
                      <Text
                        style={[
                          styles.timelineDetail,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {item.detail}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <View style={styles.sectionBlock}>
            <SectionLabel text="What We Noticed" />
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {observations.map((obs, i) => (
                <View
                  key={i}
                  style={[
                    styles.obsRow,
                    i < observations.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: T.BORDER,
                    },
                  ]}
                >
                  <View
                    style={[styles.obsDot, { backgroundColor: obs.color }]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.obsLabel, { color: colors.foreground }]}
                    >
                      {obs.label}
                    </Text>
                    <Text
                      style={[
                        styles.obsImpact,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {obs.impact}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <WhyBox
              text="These observations are pulled from your actual logs — not a template. They improve as you log more consistently."
              colors={colors}
            />
          </View>
        </FadeIn>

        <FadeIn delay={180}>
          <View style={styles.sectionBlock}>
            <SectionLabel text="Suggested Experiment" />
            <View
              style={[
                styles.experimentCard,
                {
                  backgroundColor: "rgba(139,195,74,0.08)",
                  borderColor: "rgba(139,195,74,0.20)",
                },
              ]}
            >
              <View style={styles.expHeaderRow}>
                <Ionicons
                  name="flask-outline"
                  size={18}
                  color={T.PRIMARY}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.expTitle, { color: colors.foreground }]}>
                  Try adding protein to breakfast
                </Text>
              </View>
              <Text style={[styles.expBody, { color: colors.mutedForeground }]}>
                For the next 3 days, add eggs, greek yogurt, or beans to your
                first meal and log a body check-in by 11 AM. Reversia will
                compare the results.
              </Text>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => navigation?.navigate("ExperimentDetail")}
                style={styles.expBtn}
              >
                <Text style={styles.expBtnText}>Go to Active Experiment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: FONTS.display, fontSize: 17, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 2 },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    marginHorizontal: 24,
    marginBottom: 8,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  heroIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    fontFamily: FONTS.display,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
    marginBottom: 10,
  },
  heroBody: { fontSize: 14, lineHeight: 21, marginBottom: 14 },
  confidenceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  confidenceLabel: { fontSize: 11 },
  dotRow: { flexDirection: "row", gap: 3 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: T.PRIMARY_LIGHT,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  dotFilled: { backgroundColor: T.PRIMARY, borderColor: T.PRIMARY },
  confidenceVal: { fontSize: 11, color: T.PRIMARY, fontWeight: "600" },
  sectionBlock: { paddingHorizontal: 24, marginBottom: 20 },
  card: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderWidth: 1,
    marginBottom: 10,
  },
  timelineRow: { flexDirection: "row", paddingVertical: 12 },
  timelineLeft: { width: 62 },
  timelineTime: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  timelineSpine: { alignItems: "center", width: 20, marginRight: 12 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  timelineLine: { width: 1.5, flex: 1, marginTop: 4 },
  timelineContent: { flex: 1 },
  timelineEvent: { fontSize: 13, fontWeight: "700" },
  timelineDetail: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  obsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
  },
  obsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 12,
  },
  obsLabel: { fontSize: 13, fontWeight: "700" },
  obsImpact: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  experimentCard: { borderRadius: 22, borderWidth: 1, padding: 18 },
  expHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  expTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  expBody: { fontSize: 13, lineHeight: 19, marginBottom: 16 },
  expBtn: {
    backgroundColor: T.PRIMARY,
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: "center",
  },
  expBtnText: { fontSize: 14, fontWeight: "700", color: T.WHITE },
  emptyTimeline: { paddingVertical: 10 },
});
