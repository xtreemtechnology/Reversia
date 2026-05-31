import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../theme/ThemeProvider";
import { useUserLogs } from "../../../hooks/useUserLogs";
import secureStorage from "../../../utils/secureStorage";
import SolarIcon from "../../../components/SolarIcon";

const EXPERIMENT_KEY = "@reversia_new_experiment_progress";
const EXPERIMENT_STEPS = 5;

function getLatestMeal(logs) {
  return (logs || []).find((log) => log?.category === "meal") || null;
}

function ProgressPill({ colors, currentStep }) {
  const label =
    currentStep >= EXPERIMENT_STEPS
      ? "Completed"
      : `Day ${currentStep + 1} of ${EXPERIMENT_STEPS}`;
  return (
    <View style={[styles.progressPill, { backgroundColor: colors.card }]}>
      <Text
        style={[styles.progressPillText, { color: colors.mutedForeground }]}
      >
        {label}
      </Text>
    </View>
  );
}

function InsightLink({ title, body, icon, accent, onPress, colors }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.linkCard}
    >
      <View style={[styles.linkIcon, { backgroundColor: accent.bg }]}>
        <SolarIcon name={icon} size={22} color={accent.fg} />
      </View>
      <View style={styles.linkTextWrap}>
        <Text style={[styles.linkTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text style={[styles.linkBody, { color: colors.mutedForeground }]}>
          {body}
        </Text>
      </View>
      <SolarIcon
        name="alt-arrow-right-linear"
        size={18}
        color={colors.mutedForeground}
      />
    </TouchableOpacity>
  );
}

export default function LearnScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { logs } = useUserLogs(30);
  const latestMeal = getLatestMeal(logs);
  const latestMealName = latestMeal?.name || latestMeal?.type || "your lunch";

  const [experimentStep, setExperimentStep] = useState(0);
  const [experimentReady, setExperimentReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProgress = async () => {
      try {
        const stored = await secureStorage.getItem(EXPERIMENT_KEY);
        if (!mounted) return;
        const parsed = Number(stored);
        if (Number.isFinite(parsed) && parsed >= 0) {
          setExperimentStep(Math.min(parsed, EXPERIMENT_STEPS));
        }
      } catch (_) {
        if (mounted) setExperimentStep(0);
      } finally {
        if (mounted) setExperimentReady(true);
      }
    };

    loadProgress();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!experimentReady) return;
    secureStorage
      .setItem(EXPERIMENT_KEY, String(experimentStep))
      .catch(() => {});
  }, [experimentReady, experimentStep]);

  const personalInsight = useMemo(() => {
    if (latestMeal) {
      return {
        title: `Why your energy dipped after ${latestMealName}.`,
        body: `The rhythm around ${latestMealName} suggests you may need a protein anchor or a slower follow-up meal later in the day.`,
        why: "This matters because the app can only explain a dip clearly when it can connect the meal, the timing, and the feeling you logged.",
      };
    }

    return {
      title: "Why your energy dipped yesterday at 4 PM.",
      body: "The white rice in your lunch lacked a protein anchor. That created a quick rise and the crash you felt later in the afternoon.",
      why: "This matters because seeing one specific cause makes it easier to test a smaller meal change tomorrow.",
    };
  }, [latestMeal, latestMealName]);

  const experimentLabel =
    experimentStep >= EXPERIMENT_STEPS
      ? "Restart Experiment"
      : experimentStep === 0
      ? "Start Experiment"
      : "Continue Experiment";

  const advanceExperiment = () => {
    setExperimentStep((current) =>
      current >= EXPERIMENT_STEPS ? 0 : current + 1
    );
  };

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
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Understand Why
          </Text>
          <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
            Connecting the dots of your body's story.
          </Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightImageWrap}>
            <Image
              source={{
                uri: "https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/pPgHdP4qecK/components/BvslBcBbctQ.png",
              }}
              style={styles.insightImage}
            />
            <View style={styles.insightGradient} />
          </View>
          <View style={styles.insightBody}>
            <View style={styles.pillRow}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: "rgba(106,129,106,0.18)" },
                ]}
              >
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>Personal Insight</Text>
              </View>
            </View>
            <Text style={[styles.insightTitle, { color: colors.foreground }]}>
              {personalInsight.title}
            </Text>
            <Text
              style={[styles.insightText, { color: colors.mutedForeground }]}
            >
              {personalInsight.body}
            </Text>
            <View style={styles.whyBlock}>
              <View style={styles.whyRow}>
                <SolarIcon
                  name="info-circle-bold-duotone"
                  size={18}
                  color={colors.primary}
                />
                <View style={styles.whyTextWrap}>
                  <Text style={[styles.whyTitle, { color: colors.foreground }]}>
                    Why this matters
                  </Text>
                  <Text
                    style={[styles.whyText, { color: colors.mutedForeground }]}
                  >
                    {personalInsight.why}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => navigation?.navigate("Track")}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Read the full story</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionGap}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Relevant for you
          </Text>
          <View style={styles.linkList}>
            <InsightLink
              title="The Hydration-Mood Connection"
              body="How 2 extra glasses improved your focus."
              icon="water-sun-bold-duotone"
              accent={{ bg: "rgba(227,179,114,0.12)", fg: "#E3B372" }}
              colors={colors}
              onPress={() => navigation?.navigate("HydrationEntry")}
            />
            <InsightLink
              title="Sleep & Recovery Peaks"
              body="Why you woke up 'Normal' vs 'Tired'."
              icon="sleeping-bold-duotone"
              accent={{ bg: "rgba(206,108,96,0.12)", fg: "#CE6C60" }}
              colors={colors}
              onPress={() => navigation?.navigate("SleepEntry")}
            />
          </View>
        </View>

        <View style={styles.sectionGap}>
          <View style={styles.experimentCard}>
            <View style={styles.experimentGlow} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              New Experiment
            </Text>
            <Text
              style={[styles.experimentBody, { color: colors.mutedForeground }]}
            >
              Discover if a 10-minute walk after dinner helps your morning
              glucose.
            </Text>
            <View style={styles.experimentRow}>
              <ProgressPill colors={colors} currentStep={experimentStep} />
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={advanceExperiment}
                style={[
                  styles.experimentButton,
                  { backgroundColor: colors.foreground },
                ]}
              >
                <Text
                  style={[
                    styles.experimentButtonText,
                    { color: colors.background },
                  ]}
                >
                  {experimentLabel}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.whyBlockCompact}>
              <View style={styles.whyRow}>
                <SolarIcon
                  name="info-circle-bold-duotone"
                  size={18}
                  color={colors.mutedForeground}
                />
                <View style={styles.whyTextWrap}>
                  <Text style={[styles.whyTitle, { color: colors.foreground }]}>
                    Why this matters
                  </Text>
                  <Text
                    style={[styles.whyText, { color: colors.mutedForeground }]}
                  >
                    Small repeatable changes are easier to trust when the app
                    tracks your check-ins in one place.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 22,
  },
  header: { gap: 8 },
  heading: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700",
  },
  subheading: {
    fontSize: 15,
  },
  insightCard: {
    backgroundColor: "#2D201C",
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  insightImageWrap: {
    height: 192,
    position: "relative",
  },
  insightImage: {
    width: "100%",
    height: "100%",
  },
  insightGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(33,22,19,0.20)",
  },
  insightBody: {
    padding: 24,
    marginTop: -16,
  },
  pillRow: {
    marginBottom: 14,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#6A816A",
  },
  badgeText: {
    fontSize: 10,
    color: "#6A816A",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  insightTitle: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "700",
    marginBottom: 12,
  },
  insightText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  whyBlock: {
    backgroundColor: "rgba(33,22,19,0.42)",
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },
  whyBlockCompact: {
    backgroundColor: "rgba(33,22,19,0.42)",
    borderRadius: 22,
    padding: 16,
    marginTop: 18,
  },
  whyRow: {
    flexDirection: "row",
    gap: 10,
  },
  whyTextWrap: { flex: 1 },
  whyTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  whyText: {
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    backgroundColor: "#D88939",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: "#211613",
    fontSize: 14,
    fontWeight: "800",
  },
  sectionGap: { gap: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  linkList: {
    gap: 14,
  },
  linkCard: {
    backgroundColor: "#2D201C",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  linkIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  linkTextWrap: {
    flex: 1,
    gap: 4,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  linkBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  experimentCard: {
    backgroundColor: "#2D201C",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 24,
    overflow: "hidden",
  },
  experimentGlow: {
    position: "absolute",
    right: -24,
    bottom: -24,
    width: 124,
    height: 124,
    borderRadius: 999,
    backgroundColor: "rgba(106,129,106,0.10)",
  },
  experimentBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  experimentRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  progressPill: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  progressPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  experimentButton: {
    borderRadius: 18,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  experimentButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
