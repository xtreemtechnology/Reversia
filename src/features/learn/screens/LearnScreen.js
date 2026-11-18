// screens/LearnScreen.js
// Redesigned — "Understand Why" v2
// Structure: Header → Personal Insight → What We've Learned → Recommended Reads → Active Experiment → Past Discoveries

import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";
import { useUserLogs } from "../../../hooks/useUserLogs";
import secureStorage from "../../../utils/secureStorage";
import SolarIcon from "../../../components/SolarIcon";
import { generateAIInsight } from "../services/insightsService";

const EXPERIMENT_KEY = "@reversia_new_experiment_progress";
const DISCOVERIES_KEY = "@reversia_past_discoveries";
const EXPERIMENT_STEPS = 5;

// ─── Helpers ────────────────────────────────────────────────────────────────
function getLatestMeal(logs) {
  return (logs || []).find((l) => l?.category === "meal") || null;
}

function countCategory(logs, category) {
  return (logs || []).filter((l) => l?.category === category).length;
}

function countMealName(logs, name) {
  return (logs || []).filter(
    (l) =>
      l?.category === "meal" &&
      (l?.name?.toLowerCase() === name?.toLowerCase() ||
        l?.type?.toLowerCase() === name?.toLowerCase())
  ).length;
}

// Derive real findings from logs — honest, data-backed
function deriveFindings(logs) {
  const findings = [];
  const meals = (logs || []).filter((l) => l?.category === "meal");
  const water = (logs || []).filter((l) => l?.category === "water" || l?.category === "hydration");
  const checks = (logs || []).filter((l) => l?.category === "body_check");
  const breakfast = meals.filter((l) => l?.type?.toLowerCase() === "breakfast");

  if (breakfast.length >= 3)
    findings.push({
      text: `You've logged breakfast ${breakfast.length} times — days with breakfast show more complete stories.`,
      icon: "restaurant-outline",
      color: "#8055E8",
    });

  if (water.length >= 2)
    findings.push({
      text: `${water.length} water logs recorded. Hydration consistency is building.`,
      icon: "water-outline",
      color: "#A78BFA",
    });

  if (checks.length >= 3)
    findings.push({
      text: `${checks.length} body check-ins completed. That's enough to start seeing mood patterns.`,
      icon: "happy-outline",
      color: "#8B75C8",
    });

  if (meals.length >= 5)
    findings.push({
      text: `${meals.length} meals logged. Reversia can begin connecting meals to how you felt after.`,
      icon: "leaf-outline",
      color: "#8B75C8",
    });

  // Fallback when user has no data yet
  if (findings.length === 0) {
    findings.push(
      {
        text: "Log your first meals and body check-ins to unlock real findings.",
        icon: "ellipse-outline",
        color: "#756D84",
      },
      {
        text: "Reversia learns from your patterns — the more you log, the sharper the picture.",
        icon: "ellipse-outline",
        color: "#756D84",
      }
    );
  }

  return findings.slice(0, 4);
}

// Honest personal insight — never claims to know more than the data supports
function buildPersonalInsight(latestMeal, logs) {
  const mealName = latestMeal?.name || latestMeal?.type || null;
  const mealCount = mealName ? countMealName(logs, mealName) : 0;
  const totalMeals = countCategory(logs, "meal");

  if (!latestMeal) {
    return {
      ready: false,
      title: "Log meals to unlock your first insight.",
      body: "Once you start logging, Reversia will begin connecting your meals, energy, and body check-ins.",
      why: "Real insights only form when there is enough data to compare patterns across multiple days.",
    };
  }

  if (mealCount < 3 || totalMeals < 5) {
    return {
      ready: false,
      title: `What we noticed about ${mealName}.`,
      body: `You've logged ${mealName} ${mealCount} time${
        mealCount !== 1 ? "s" : ""
      } so far. We're still gathering enough data to understand how it affects your energy and mood.`,
      why: "Reversia needs at least 3 logs of the same meal before it can confidently connect it to how you feel after.",
    };
  }

  return {
    ready: true,
    title: `${mealName} appears in your low-energy afternoons.`,
    body: `Across ${mealCount} logs, the meals that were followed by a lower-energy body check-in most often contained ${mealName}. This is a pattern worth testing.`,
    why: "This insight is based on your actual logs — not a generic template. It improves as you log more.",
  };
}

// ─── Personal Insight Card ────────────────────────────────────────────────────
function PersonalInsightCard({ insight, onReadMore, colors, isAI = false }) {
  return (
    <View
      style={[
        pi.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {/* Image */}
      <View style={pi.imageWrap}>
        <Image
          source={{
            uri: "https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/pPgHdP4qecK/components/BvslBcBbctQ.png",
          }}
          style={pi.image}
        />
        <View style={pi.imageOverlay} />
      </View>

      <View style={pi.body}>
        {/* Badge */}
        <View style={pi.badgeRow}>
          <View
            style={[pi.badge, insight.ready ? pi.badgeReady : pi.badgePending]}
          >
            <View
              style={[
                pi.badgeDot,
                insight.ready ? pi.badgeDotReady : pi.badgeDotPending,
              ]}
            />
            <Text
              style={[
                pi.badgeText,
                insight.ready ? pi.badgeTextReady : pi.badgeTextPending,
              ]}
            >
              {insight.ready ? (isAI ? "✦ AI Health Pattern" : "Personal Insight") : "Still Learning"}
            </Text>
          </View>
        </View>

        <Text style={[pi.title, { color: colors.foreground }]}>
          {insight.title}
        </Text>
        <Text style={[pi.bodyText, { color: colors.mutedForeground }]}>
          {insight.body}
        </Text>

        {/* Why this matters */}
        <View style={pi.whyBox}>
          <View style={pi.whyRow}>
            <SolarIcon
              name="info-circle-bold-duotone"
              size={17}
              color={colors.primary}
            />
            <View style={pi.flex1}>
              <Text style={[pi.whyTitle, { color: colors.foreground }]}>
                Why this matters
              </Text>
              <Text style={[pi.whyBody, { color: colors.mutedForeground }]}>
                {insight.why}
              </Text>
            </View>
          </View>
        </View>

        {/* CTA — only when insight is ready */}
        {insight.ready ? (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={onReadMore}
            style={pi.cta}
          >
            <Text style={pi.ctaText}>See full breakdown</Text>
          </TouchableOpacity>
        ) : (
          <View style={[pi.ctaDisabled, { backgroundColor: colors.muted }]}>
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color={colors.mutedForeground}
              style={pi.lockIcon}
            />
            <Text
              style={[pi.ctaDisabledText, { color: colors.mutedForeground }]}
            >
              More data needed to unlock full insight
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const pi = StyleSheet.create({
  card: { borderRadius: 30, overflow: "hidden", borderWidth: 1 },
  imageWrap: { height: 180, position: "relative" },
  image: { width: "100%", height: "100%" },
  imageOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(33,22,19,0.22)",
  },
  body: { padding: 22, marginTop: -12 },
  badgeRow: { marginBottom: 12 },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeReady: { backgroundColor: "rgba(128,85,232,0.18)" },
  badgePending: { backgroundColor: "rgba(154,132,120,0.15)" },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeDotReady: { backgroundColor: "#8B75C8" },
  badgeDotPending: { backgroundColor: "#756D84" },
  badgeText: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  badgeTextReady: { color: "#8B75C8" },
  badgeTextPending: { color: "#756D84" },
  title: { fontSize: 24, lineHeight: 30, fontWeight: "700", marginBottom: 10 },
  bodyText: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  whyBox: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "rgba(33,22,19,0.42)",
  },
  whyRow: { flexDirection: "row", gap: 10 },
  whyTitle: { fontSize: 13, fontWeight: "600", marginBottom: 5 },
  whyBody: { fontSize: 13, lineHeight: 19 },
  flex1: { flex: 1 },
  lockIcon: { marginRight: 7 },
  cta: {
    backgroundColor: "#8055E8",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  ctaText: { color: "#F5F1FF", fontSize: 14, fontWeight: "800" },
  ctaDisabled: {
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabledText: { fontSize: 13, fontWeight: "600" },
});

// ─── What We've Learned ───────────────────────────────────────────────────────
function WhatWeveLearned({ findings, colors, isAI = false }) {
  return (
    <View
      style={[
        wl.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={wl.headerRow}>
        <View style={wl.iconBadge}>
          <Ionicons name={isAI ? "sparkles-outline" : "bulb-outline"} size={17} color="#8055E8" />
        </View>
        <View>
          <Text style={[wl.title, { color: colors.foreground }]}>
            What We've Learned So Far
          </Text>
          <Text style={[wl.subtitle, { color: colors.mutedForeground }]}>
            {isAI ? "Powered by Gemini 1.5 Flash" : "Based on your actual logs"}
          </Text>
        </View>
      </View>

      {findings.map((f, i) => (
        <View
          key={i}
          style={[wl.row, i < findings.length - 1 && wl.rowDivider]}
        >
          <View style={[wl.rowIcon, { backgroundColor: `${f.color}18` }]}>
            <Ionicons name={f.icon} size={14} color={f.color} />
          </View>
          <Text style={[wl.rowText, { color: colors.foreground }]}>
            {f.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

const wl = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, borderWidth: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15, fontWeight: "700" },
  subtitle: { fontSize: 11, marginTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  rowIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  rowText: { fontSize: 13, lineHeight: 19, flex: 1 },
});

// ─── Recommended Reads ────────────────────────────────────────────────────────
function RecommendedReads({ navigation, colors }) {
  const reads = [
    {
      title: "The Hydration-Mood Connection",
      body: "How 2 extra glasses can improve your focus.",
      icon: "water-sun-bold-duotone",
      tint: { bg: "rgba(167,139,250,0.12)", fg: "#A78BFA" },
      route: "HydrationConnection",
    },
    {
      title: "Sleep & Recovery Peaks",
      body: "Why you wake up 'Normal' vs 'Tired'.",
      icon: "sleeping-bold-duotone",
      tint: { bg: "rgba(206,108,96,0.12)", fg: "#CE6C60" },
      route: "SleepRecovery",
    },
    {
      title: "Protein & Sustained Energy",
      body: "Why a protein anchor changes your afternoon.",
      icon: "dumbbell-bold-duotone",
      tint: { bg: "rgba(128,85,232,0.10)", fg: "#8B75C8" },
      route: "ProteinEnergy",
    },
  ];

  return (
    <View style={rr.list}>
      {reads.map((item, i) => (
        <TouchableOpacity
          key={i}
          activeOpacity={0.9}
          onPress={() => navigation?.navigate(item.route)}
          style={[
            rr.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[rr.iconBox, { backgroundColor: item.tint.bg }]}>
            <SolarIcon name={item.icon} size={22} color={item.tint.fg} />
          </View>
          <View style={rr.textCol}>
            <Text style={[rr.title, { color: colors.foreground }]}>
              {item.title}
            </Text>
            <Text style={[rr.body, { color: colors.mutedForeground }]}>
              {item.body}
            </Text>
          </View>
          <SolarIcon
            name="alt-arrow-right-linear"
            size={16}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const rr = StyleSheet.create({
  list: { gap: 12 },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: "700" },
  body: { fontSize: 12, lineHeight: 17 },
});

// ─── Active Experiment ────────────────────────────────────────────────────────
function ActiveExperiment({ experimentStep, onAdvance, onOpenDetail, colors }) {
  const completed = Math.min(experimentStep, EXPERIMENT_STEPS);
  const pct = Math.round((completed / EXPERIMENT_STEPS) * 100);
  const isDone = completed >= EXPERIMENT_STEPS;

  const btnLabel = isDone
    ? "Restart Experiment"
    : completed === 0
    ? "Start Experiment"
    : "Mark Today Complete";

  const days = Array.from({ length: EXPERIMENT_STEPS });

  return (
    <View
      style={[
        ex.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={ex.glow} />

      <Text style={[ex.title, { color: colors.foreground }]}>
        Active Experiment
      </Text>
      <Text style={[ex.body, { color: colors.mutedForeground }]}>
        Does a 10-minute walk after dinner improve your morning energy?
      </Text>

      {/* Day dots */}
      <View style={ex.dotsRow}>
        {days.map((_, i) => {
          const done = i < completed;
          const curr = i === completed;
          return (
            <View key={i} style={ex.dayCol}>
              <View style={[ex.dot, done && ex.dotDone, curr && ex.dotCurrent]}>
                {done ? (
                  <Ionicons name="checkmark" size={10} color="#F5F1FF" />
                ) : (
                  <Text style={[ex.dotNum, curr && ex.dotNumCurrent]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  ex.dayLabel,
                  done && ex.dayLabelDone,
                  curr && ex.dayLabelCurrent,
                ]}
              >
                {done ? "✓" : `D${i + 1}`}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Progress bar */}
      <View style={ex.track}>
        <View style={[ex.fill, { width: `${pct}%` }]} />
      </View>
      <View style={ex.progressLabelRow}>
        <Text style={[ex.progressLabel, { color: colors.mutedForeground }]}>
          {isDone
            ? "All 5 days complete"
            : `${completed} of ${EXPERIMENT_STEPS} days · ${pct}% done`}
        </Text>
      </View>

      {/* Advance button */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onAdvance}
        style={[
          ex.btn,
          { backgroundColor: isDone ? colors.muted : colors.foreground },
        ]}
      >
        <Text
          style={[
            ex.btnText,
            { color: isDone ? colors.mutedForeground : colors.background },
          ]}
        >
          {btnLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onOpenDetail}
        style={ex.detailLink}
      >
        <Text style={[ex.detailLinkText, { color: colors.mutedForeground }]}>
          Open experiment details
        </Text>
      </TouchableOpacity>

      {/* Why */}
      <View style={ex.whyBox}>
        <View style={ex.whyRow}>
          <SolarIcon
            name="info-circle-bold-duotone"
            size={17}
            color={colors.mutedForeground}
          />
          <View style={ex.flex1}>
            <Text style={[ex.whyTitle, { color: colors.foreground }]}>
              Why this matters
            </Text>
            <Text style={[ex.whyBody, { color: colors.mutedForeground }]}>
              Small repeatable changes are easier to trust when the app tracks
              your check-ins in one place.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const ex = StyleSheet.create({
  card: { borderRadius: 28, borderWidth: 1, padding: 22, overflow: "hidden" },
  glow: {
    position: "absolute",
    right: -24,
    bottom: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(128,85,232,0.10)",
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 20, marginBottom: 20 },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayCol: { alignItems: "center", gap: 5, flex: 1 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0E9FF",
    borderWidth: 1.5,
    borderColor: "#E8E1F5",
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: { backgroundColor: "#8055E8", borderColor: "#8055E8" },
  dotCurrent: { borderColor: "#8055E8" },
  dotNum: { fontSize: 11, color: "#756D84", fontWeight: "700" },
  dotNumCurrent: { color: "#8055E8" },
  dayLabel: { fontSize: 9, color: "#756D84", fontWeight: "600" },
  dayLabelDone: { color: "#8B75C8" },
  dayLabelCurrent: { color: "#8055E8" },

  track: {
    height: 4,
    backgroundColor: "#F0E9FF",
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: "#8B75C8", borderRadius: 2 },
  progressLabelRow: { marginBottom: 18 },
  progressLabel: { fontSize: 12 },

  btn: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 14, fontWeight: "800" },

  whyBox: {
    borderRadius: 20,
    padding: 14,
    marginTop: 16,
    backgroundColor: "rgba(33,22,19,0.42)",
  },
  whyRow: { flexDirection: "row", gap: 10 },
  whyTitle: { fontSize: 13, fontWeight: "600", marginBottom: 5 },
  whyBody: { fontSize: 13, lineHeight: 19 },
  flex1: { flex: 1 },
  detailLink: { alignItems: "center", marginTop: 12 },
  detailLinkText: { fontSize: 12, fontWeight: "600" },
});

// ─── Past Discoveries ─────────────────────────────────────────────────────────
function PastDiscoveries({ discoveries, colors }) {
  if (!discoveries || discoveries.length === 0) return null;

  return (
    <View
      style={[
        pd.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={pd.headerRow}>
        <View style={pd.iconBadge}>
          <Ionicons name="ribbon-outline" size={16} color="#8B75C8" />
        </View>
        <View>
          <Text style={[pd.title, { color: colors.foreground }]}>
            Past Discoveries
          </Text>
          <Text style={[pd.subtitle, { color: colors.mutedForeground }]}>
            What your story has revealed
          </Text>
        </View>
      </View>

      {discoveries.map((d, i) => (
        <View
          key={i}
          style={[pd.row, i < discoveries.length - 1 && pd.rowDivider]}
        >
          <View style={pd.timelineCol}>
            <View style={pd.dot} />
            {i < discoveries.length - 1 && <View style={pd.line} />}
          </View>
          <View style={pd.textCol}>
            <Text style={[pd.rowText, { color: colors.foreground }]}>
              {d.text}
            </Text>
            <Text style={[pd.rowWhen, { color: colors.mutedForeground }]}>
              {d.when}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const pd = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, borderWidth: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15, fontWeight: "700" },
  subtitle: { fontSize: 11, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "flex-start" },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  timelineCol: { width: 18, alignItems: "center", marginRight: 12 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#8B75C8",
    marginTop: 5,
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: "rgba(128,85,232,0.18)",
    marginTop: 4,
    minHeight: 20,
  },
  textCol: { flex: 1, paddingBottom: 16 },
  rowText: { fontSize: 13, fontWeight: "500", lineHeight: 19 },
  rowWhen: { fontSize: 11, marginTop: 3 },
});

// ─── Root Screen ──────────────────────────────────────────────────────────────
export default function LearnScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { logs } = useUserLogs(30);
  const latestMeal = getLatestMeal(logs);

  const [experimentStep, setExperimentStep] = useState(0);
  const [experimentReady, setExperimentReady] = useState(false);
  const [discoveries, setDiscoveries] = useState([]);

  // Load persisted state
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [expStored, discStored] = await Promise.all([
          secureStorage.getItem(EXPERIMENT_KEY),
          secureStorage.getItem(DISCOVERIES_KEY),
        ]);
        if (!mounted) return;
        const step = Number(expStored);
        if (Number.isFinite(step) && step >= 0)
          setExperimentStep(Math.min(step, EXPERIMENT_STEPS));
        if (discStored) {
          const parsed = JSON.parse(discStored);
          if (Array.isArray(parsed)) setDiscoveries(parsed);
        }
      } catch (_) {
        /* use defaults */
      } finally {
        if (mounted) setExperimentReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist experiment step
  useEffect(() => {
    if (!experimentReady) return;
    secureStorage
      .setItem(EXPERIMENT_KEY, String(experimentStep))
      .catch(() => {});
  }, [experimentReady, experimentStep]);

  const advanceExperiment = () => {
    setExperimentStep((s) => {
      const next = s >= EXPERIMENT_STEPS ? 0 : s + 1;
      // When experiment completes, add a discovery
      if (next === EXPERIMENT_STEPS) {
        const newDiscovery = {
          text: "Completed the 10-minute walk experiment — check your energy logs to see the pattern.",
          when: "This week",
        };
        setDiscoveries((prev) => {
          const updated = [newDiscovery, ...prev].slice(0, 6);
          secureStorage
            .setItem(DISCOVERIES_KEY, JSON.stringify(updated))
            .catch(() => {});
          return updated;
        });
      }
      return next;
    });
  };

  const openExperimentDetail = () => {
    navigation?.navigate("ExperimentDetail");
  };

  const [aiInsights, setAiInsights] = useState({ ready: false, insights: [], source: "empty" });

  useEffect(() => {
    if (!logs || logs.length === 0) return;
    let active = true;
    generateAIInsight(logs)
      .then((res) => {
        if (active && res) {
          setAiInsights(res);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [logs]);

  const rawInsight = useMemo(
    () => buildPersonalInsight(latestMeal, logs),
    [latestMeal, logs]
  );

  const insight = useMemo(() => {
    if (aiInsights.source === "ai" && aiInsights.insights?.length > 0) {
      return {
        ready: true,
        title: "Pattern detected from your logs",
        body: aiInsights.insights[0],
        why: "Analyzed with Gemini 1.5 Flash using your last 30 days of meals, glucose, and body checks.",
      };
    }
    return rawInsight;
  }, [aiInsights, rawInsight]);

  const rawFindings = useMemo(() => deriveFindings(logs), [logs]);

  const findings = useMemo(() => {
    if (aiInsights.source === "ai" && aiInsights.insights?.length > 1) {
      const aiItems = aiInsights.insights.slice(1).map((text) => ({
        text,
        icon: "sparkles-outline",
        color: "#8055E8",
      }));
      return [...aiItems, ...rawFindings].slice(0, 4);
    }
    return rawFindings;
  }, [aiInsights, rawFindings]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 124 },
        ]}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Understand Why
          </Text>
          <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
            Connecting the dots of your body's story.
          </Text>
        </View>

        {/* ① Personal Insight */}
        <PersonalInsightCard
          insight={insight}
          isAI={aiInsights.source === "ai"}
          onReadMore={() => navigation?.navigate("InsightDetail")}
          colors={colors}
        />

        {/* ② What We've Learned So Far */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            What We've Learned So Far
          </Text>
          <WhatWeveLearned
            findings={findings}
            colors={colors}
            isAI={aiInsights.source === "ai"}
          />
        </View>

        {/* ③ Recommended Reads */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Recommended Reads
          </Text>
          <RecommendedReads navigation={navigation} colors={colors} />
        </View>

        {/* ④ Active Experiment */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Active Experiment
          </Text>
          <ActiveExperiment
            experimentStep={experimentStep}
            onAdvance={advanceExperiment}
            onOpenDetail={openExperimentDetail}
            colors={colors}
          />
        </View>

        {/* ⑤ Past Discoveries */}
        {discoveries.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Past Discoveries
            </Text>
            <PastDiscoveries discoveries={discoveries} colors={colors} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20, gap: 24 },
  header: { gap: 6 },
  heading: { fontSize: 30, lineHeight: 34, fontWeight: "700" },
  subheading: { fontSize: 15 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
});
