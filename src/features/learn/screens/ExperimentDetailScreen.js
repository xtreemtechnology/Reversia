import React, { useEffect, useState } from "react";
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
import { useTheme } from "../../../theme/ThemeProvider";
import { T, FONTS } from "../../../theme/tokens";
import FadeIn from "../../home/components/FadeIn";
import secureStorage from "../../../utils/secureStorage";
import { useUserLogs } from "../../../hooks/useUserLogs";

const EXPERIMENT_KEY = "@reversia_new_experiment_progress";
const START_DATE_KEY = "@reversia_experiment_start_date";
const EXPERIMENT_STEPS = 5;

function SectionLabel({ text }) {
  return <Text style={sl.t}>{text.toUpperCase()}</Text>;
}

const sl = StyleSheet.create({
  t: {
    fontFamily: FONTS.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: T.MUTED,
    marginBottom: 10,
  },
});

export default function ExperimentDetailScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { logs } = useUserLogs(30);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [startDate, setStartDate] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [stored, storedDate] = await Promise.all([
          secureStorage.getItem(EXPERIMENT_KEY),
          secureStorage.getItem(START_DATE_KEY),
        ]);
        if (!mounted) return;
        const parsed = Number(stored);
        if (Number.isFinite(parsed) && parsed >= 0)
          setStep(Math.min(parsed, EXPERIMENT_STEPS));
        if (storedDate) setStartDate(storedDate);
      } catch (_) {
        /* use default */
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    secureStorage.setItem(EXPERIMENT_KEY, String(step)).catch(() => {});
  }, [step, ready]);

  const advance = async () => {
    setStep((s) => {
      const next = s >= EXPERIMENT_STEPS ? 0 : s + 1;
      if (s === 0 && next === 1) {
        const now = new Date().toISOString();
        setStartDate(now);
        secureStorage.setItem(START_DATE_KEY, now).catch(() => {});
      } else if (next === 0) {
        setStartDate(null);
        secureStorage.removeItem(START_DATE_KEY).catch(() => {});
      }
      return next;
    });
  };

  const isDone = step >= EXPERIMENT_STEPS;
  const pct = Math.round((step / EXPERIMENT_STEPS) * 100);

  // Calculate before vs during comparison
  const comparison = React.useMemo(() => {
    if (!startDate || step === 0 || !logs || logs.length === 0) {
      return null;
    }
    const startMs = new Date(startDate).getTime();
    const sevenDaysBeforeMs = startMs - 7 * 24 * 60 * 60 * 1000;

    const toTs = (l) => {
      if (!l?.createdAt) return 0;
      if (l.createdAt.toDate) return l.createdAt.toDate().getTime();
      return new Date(l.createdAt).getTime();
    };

    const beforeChecks = logs.filter((l) => {
      const t = toTs(l);
      return (
        l.category === "body_check" && t >= sevenDaysBeforeMs && t < startMs
      );
    });
    const duringChecks = logs.filter((l) => {
      const t = toTs(l);
      return l.category === "body_check" && t >= startMs;
    });

    const avgEnergy = (arr) => {
      const valid = arr
        .map((l) => Number(l.energyLevel || l.energy))
        .filter((n) => Number.isFinite(n) && n > 0);
      if (valid.length === 0) return null;
      return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1);
    };

    const beforeEnergy = avgEnergy(beforeChecks);
    const duringEnergy = avgEnergy(duringChecks);

    return {
      beforeEnergy: beforeEnergy || "—",
      duringEnergy: duringEnergy || "—",
      energyImproved:
        beforeEnergy && duringEnergy
          ? Number(duringEnergy) > Number(beforeEnergy)
          : null,
    };
  }, [startDate, step, logs]);

  const dayNotes = [
    "Take a 10-minute walk within 30 minutes of finishing dinner.",
    "Walk again tonight. Notice if you feel less sluggish before bed.",
    "Day 3 — you're halfway. Log a body check-in first thing tomorrow.",
    "Almost there. Note your energy level when you wake up.",
    "Final day! Log your morning energy and complete the experiment.",
  ];

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
            Active Experiment
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            10-Minute Walk
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
              styles.progressCard,
              {
                backgroundColor: "rgba(139,195,74,0.08)",
                borderColor: "rgba(139,195,74,0.18)",
              },
            ]}
          >
            <View style={styles.progressTop}>
              <View
                style={[
                  styles.progressIcon,
                  { backgroundColor: "rgba(139,195,74,0.12)" },
                ]}
              >
                <Ionicons name="walk-outline" size={26} color={T.SECONDARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.progressTitle, { color: colors.foreground }]}
                >
                  10-Minute Walk After Dinner
                </Text>
                <Text
                  style={[
                    styles.progressSub,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {isDone
                    ? "Experiment complete"
                    : `Day ${step + 1} of ${EXPERIMENT_STEPS}`}
                </Text>
              </View>
              <View
                style={[
                  styles.pctBadge,
                  {
                    backgroundColor: isDone
                      ? "rgba(139,195,74,0.18)"
                      : "rgba(139,195,74,0.14)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pctNum,
                    { color: isDone ? T.SECONDARY : T.PRIMARY },
                  ]}
                >
                  {pct}%
                </Text>
              </View>
            </View>

            <View style={styles.dotsRow}>
              {Array.from({ length: EXPERIMENT_STEPS }).map((_, i) => {
                const done = i < step;
                const curr = i === step;
                return (
                  <View key={i} style={styles.dayCol}>
                    <View
                      style={[
                        styles.dot,
                        done && styles.dotDone,
                        curr && styles.dotCurrent,
                      ]}
                    >
                      {done ? (
                        <Ionicons name="checkmark" size={11} color={T.WHITE} />
                      ) : (
                        <Text
                          style={[styles.dotNum, curr && { color: T.PRIMARY }]}
                        >
                          {i + 1}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.dayLabel,
                        done && { color: T.SECONDARY },
                        curr && { color: T.PRIMARY },
                      ]}
                    >
                      {done ? "✓" : `D${i + 1}`}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%` }]} />
            </View>
            <View style={styles.progressLabelRow}>
              <Text
                style={[
                  styles.progressLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                {isDone
                  ? "All 5 days complete"
                  : `${step} of ${EXPERIMENT_STEPS} days · ${pct}% done`}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.92}
              onPress={advance}
              style={[
                styles.btn,
                { backgroundColor: isDone ? colors.muted : colors.primary },
              ]}
              disabled={isDone}
            >
              <Text
                style={[
                  styles.btnText,
                  { color: isDone ? colors.mutedForeground : "#FFFFFF" },
                ]}
              >
                {isDone
                  ? "Restart Experiment"
                  : step === 0
                  ? "Start Experiment"
                  : "Mark Today Complete"}
              </Text>
            </TouchableOpacity>

            <View style={[styles.whyBox, { backgroundColor: T.PRIMARY_LIGHT }]}>
              <View style={styles.whyRow}>
                <Ionicons
                  name="information-circle"
                  size={17}
                  color={colors.mutedForeground}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.whyTitle, { color: colors.foreground }]}>
                    Why this matters
                  </Text>
                  <Text
                    style={[styles.whyBody, { color: colors.mutedForeground }]}
                  >
                    Small repeatable changes are easier to trust when the app
                    tracks your check-ins in one place.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </FadeIn>

        {!isDone && step < EXPERIMENT_STEPS && (
          <FadeIn delay={60}>
            <View style={styles.block}>
              <SectionLabel text={`Day ${step + 1} Guidance`} />
              <View
                style={[
                  styles.noteCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: "rgba(139,195,74,0.25)",
                  },
                ]}
              >
                <Ionicons
                  name="arrow-forward-circle"
                  size={16}
                  color={T.PRIMARY}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.noteText, { color: colors.foreground }]}>
                  {dayNotes[step]}
                </Text>
              </View>
            </View>
          </FadeIn>
        )}

        <FadeIn delay={120}>
          <View style={styles.block}>
            <SectionLabel text="What To Notice" />
            {[
              {
                icon: "moon-outline",
                color: "#CE6C60",
                label: "Sleep quality",
                desc: "Does falling asleep feel easier?",
              },
              {
                icon: "flash-outline",
                color: T.PRIMARY,
                label: "Morning energy",
                desc: "Log your body check-in when you wake up.",
              },
              {
                icon: "restaurant-outline",
                color: T.SECONDARY,
                label: "Evening cravings",
                desc: "Do you feel less hungry before bed?",
              },
            ].map((item, i) => (
              <View
                key={i}
                style={[
                  styles.noticeRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.noticeIcon,
                    { backgroundColor: `${item.color}18` },
                  ]}
                >
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.noticeLabel, { color: colors.foreground }]}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={[
                      styles.noticeDesc,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {item.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </FadeIn>

        <FadeIn delay={180}>
          <View style={styles.block}>
            <SectionLabel text="Why This Experiment" />
            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              Post-meal walks — even short ones — have been shown to blunt the
              blood sugar rise that follows dinner. Over 5 days, the pattern
              should become visible in your morning body check-ins.
            </Text>
            <View style={[styles.whyBox, { backgroundColor: T.PRIMARY_LIGHT }]}>
              <Ionicons
                name="information-circle"
                size={15}
                color={colors.primary}
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <Text
                style={[
                  styles.whyText,
                  { color: colors.mutedForeground, flex: 1 },
                ]}
              >
                Reversia will compare your body check-in results before and
                after the experiment to show you whether it made a difference.
              </Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={240}>
          <View style={styles.block}>
            <SectionLabel text="Pattern Comparison (Before vs During)" />
            {comparison ? (
              <View
                style={[
                  styles.compareCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.compareRow}>
                  <View style={styles.compareCol}>
                    <Text
                      style={[
                        styles.compareLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      7 Days Before
                    </Text>
                    <Text
                      style={[styles.compareVal, { color: colors.foreground }]}
                    >
                      {comparison.beforeEnergy} / 10
                    </Text>
                    <Text
                      style={[
                        styles.compareSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Avg Energy
                    </Text>
                  </View>
                  <View style={styles.compareDivider} />
                  <View style={styles.compareCol}>
                    <Text style={[styles.compareLabel, { color: T.PRIMARY }]}>
                      During Walk Test
                    </Text>
                    <Text
                      style={[
                        styles.compareVal,
                        {
                          color: comparison.energyImproved
                            ? "#10B981"
                            : colors.foreground,
                        },
                      ]}
                    >
                      {comparison.duringEnergy} / 10{" "}
                      {comparison.energyImproved ? "↑" : ""}
                    </Text>
                    <Text
                      style={[
                        styles.compareSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Avg Energy
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.noteCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Ionicons
                  name="analytics-outline"
                  size={16}
                  color={colors.primary}
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={[styles.noteText, { color: colors.mutedForeground }]}
                >
                  {step === 0
                    ? "Start the experiment to unlock before vs. during comparison data."
                    : "Keep logging body check-ins during the 5 days to populate your comparison stats."}
                </Text>
              </View>
            )}
          </View>
        </FadeIn>

        <FadeIn delay={300}>
          <View style={styles.btnRow}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => navigation?.navigate("BodyCheck")}
              style={[
                styles.secBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="happy-outline"
                size={16}
                color={colors.foreground}
                style={{ marginRight: 7 }}
              />
              <Text style={[styles.secBtnText, { color: colors.foreground }]}>
                Body Check
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={advance}
              style={[
                styles.primaryBtn,
                isDone && { backgroundColor: colors.muted },
              ]}
              disabled={isDone}
            >
              <Text
                style={[
                  styles.primaryBtnText,
                  isDone && { color: colors.mutedForeground },
                ]}
              >
                {isDone ? "Completed" : `Mark Day ${step + 1} Done`}
              </Text>
            </TouchableOpacity>
          </View>
        </FadeIn>

        {isDone && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setStep(0)}
            style={styles.restartBtn}
          >
            <Ionicons
              name="refresh"
              size={14}
              color={T.MUTED}
              style={{ marginRight: 7 }}
            />
            <Text style={styles.restartText}>Restart experiment</Text>
          </TouchableOpacity>
        )}
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
  progressCard: {
    borderRadius: 28,
    padding: 22,
    marginHorizontal: 24,
    marginBottom: 8,
    borderWidth: 1,
  },
  progressTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTitle: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  progressSub: { fontSize: 12, marginTop: 2 },
  pctBadge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  pctNum: { fontFamily: FONTS.display, fontSize: 17, fontWeight: "700" },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  dayCol: { alignItems: "center", gap: 5, flex: 1 },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: T.PRIMARY_LIGHT,
    borderWidth: 1.5,
    borderColor: T.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: { backgroundColor: T.PRIMARY, borderColor: T.PRIMARY },
  dotCurrent: { borderColor: T.PRIMARY },
  dotNum: { fontSize: 11, color: T.MUTED, fontWeight: "700" },
  dayLabel: { fontSize: 9, color: T.MUTED, fontWeight: "600" },
  track: {
    height: 4,
    backgroundColor: T.PRIMARY_LIGHT,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: T.SECONDARY, borderRadius: 2 },
  progressLabelRow: { marginBottom: 18 },
  progressLabel: { fontSize: 12 },
  btn: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 14, fontWeight: "800" },
  whyBox: { borderRadius: 20, padding: 14, marginTop: 16 },
  whyRow: { flexDirection: "row", gap: 10 },
  whyTitle: { fontSize: 13, fontWeight: "600", marginBottom: 5 },
  whyBody: { fontSize: 13, lineHeight: 19 },
  block: { paddingHorizontal: 24, marginTop: 20, marginBottom: 4 },
  bodyText: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  noteText: { fontSize: 14, lineHeight: 20, flex: 1 },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  noticeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeLabel: { fontSize: 14, fontWeight: "700" },
  noticeDesc: { fontSize: 12, marginTop: 2 },
  compareCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  compareCol: {
    alignItems: "center",
    flex: 1,
  },
  compareLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  compareVal: {
    fontFamily: FONTS.display,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  compareSub: {
    fontSize: 11,
  },
  compareDivider: {
    width: 1,
    height: 40,
    backgroundColor: T.BORDER,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 24,
    marginTop: 24,
  },
  secBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    paddingVertical: 14,
    borderWidth: 1,
  },
  secBtnText: { fontSize: 14, fontWeight: "700" },
  primaryBtn: {
    flex: 2,
    backgroundColor: T.PRIMARY,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 14, fontWeight: "800", color: T.WHITE },
  restartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  restartText: { fontSize: 13, color: T.MUTED },
});
