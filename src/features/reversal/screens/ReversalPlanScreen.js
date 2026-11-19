// src/features/reversal/screens/ReversalPlanScreen.js
// Home screen of the 12-week Reversal Plan: baseline, progress, this week's
// goals, milestones and the safety disclaimer.

import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import { T, FONTS } from "../../../theme/tokens";
import FadeIn from "../../home/components/FadeIn";
import PressScale from "../../home/components/PressScale";
import PlanHeroCard from "../components/PlanHeroCard";
import { getUserProfile } from "../../profile/services/profileService";
import {
  getReversalPlan,
  listWeeklyCheckIns,
  updatePlanGoals,
  calculateProgress,
  getNextMilestone,
} from "../services/reversalService";
import {
  PLAN_LENGTH_WEEKS,
  WEEKLY_GOALS,
  MILESTONES,
  HBA1C_OPTIONS,
  FASTING_OPTIONS,
  REVERSAL_DISCLAIMER,
} from "../data/planData";

const GOALS_STORAGE_KEY = "@reversia_reversal_goals";

function optionLabel(options, value) {
  if (!value) return "Not set";
  const found = options.find((option) => option.value === value);
  return found ? found.label : value;
}

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ReversalPlanScreen({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState({});

  const load = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
    try {
      const [loadedPlan, loadedCheckIns, loadedProfile] = await Promise.all([
        getReversalPlan(uid).catch(() => null),
        listWeeklyCheckIns(uid).catch(() => []),
        getUserProfile(uid).catch(() => null),
      ]);
      setPlan(loadedPlan);
      setCheckIns(Array.isArray(loadedCheckIns) ? loadedCheckIns : []);
      setProfile(loadedProfile);
      const storedGoals = await AsyncStorage.getItem(GOALS_STORAGE_KEY).catch(
        () => null
      );
      const mergedGoals = {
        ...(loadedPlan?.completedGoals || {}),
        ...(storedGoals ? JSON.parse(storedGoals) : {}),
      };
      setGoals(mergedGoals);
    } catch (error) {
      // Keep the empty state instead of crashing the tab.
      console.warn("Failed to load reversal plan", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = navigation?.addListener?.("focus", load);
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [load, navigation]);

  const toggleGoal = async (key) => {
    const nextGoals = { ...goals, [key]: !goals[key] };
    setGoals(nextGoals);
    try {
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(nextGoals));
    } catch (error) {
      // Local cache is best-effort only.
    }
    const uid = auth.currentUser?.uid;
    if (uid && plan) {
      updatePlanGoals(uid, nextGoals).catch(() => {});
    }
  };

  const progress = plan?.startDate ? calculateProgress(plan.startDate) : null;
  const week = progress?.week || 0;
  const phase = progress?.phase || null;
  const weekGoals = week >= 1 ? WEEKLY_GOALS[week - 1] : null;
  const nextMilestone = getNextMilestone(week);
  const lastCheckIn = checkIns[0] || null;

  const styles = makeStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Loading your plan…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn delay={0}>
          <Text style={styles.title}>Your Reversal Plan</Text>
          <Text style={styles.subtitle}>
            A 12-week guide to steady blood sugar with mostly natural foods.
          </Text>
        </FadeIn>

        {!plan ? (
          <>
            <FadeIn delay={60}>
              <PlanHeroCard
                plan={null}
                onPress={() => navigation?.navigate("PlanSetup")}
              />
            </FadeIn>
            {profile?.primaryHba1c || profile?.fastingBloodSugar ? (
              <FadeIn delay={120}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>From your profile</Text>
                  <Text style={styles.body}>
                    HbA1c {optionLabel(HBA1C_OPTIONS, profile.primaryHba1c)},
                    fasting{" "}
                    {optionLabel(FASTING_OPTIONS, profile.fastingBloodSugar)}.
                  </Text>
                </View>
              </FadeIn>
            ) : null}
          </>
        ) : (
          <>
            <FadeIn delay={60}>
              <View style={styles.heroCard}>
                <Text style={styles.heroOverline}>
                  Week {week} of {PLAN_LENGTH_WEEKS}
                </Text>
                <Text style={styles.heroBig}>{progress.percent}%</Text>
                <Text style={styles.heroSub}>through the plan</Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress.percent}%` },
                    ]}
                  />
                </View>
                {phase ? (
                  <Text style={styles.heroPhase}>
                    {phase.title} phase · Weeks {phase.weeks[0]}–
                    {phase.weeks[phase.weeks.length - 1]}
                  </Text>
                ) : null}
                {nextMilestone ? (
                  <Text style={styles.heroNext}>
                    Next milestone: Week {nextMilestone.week} —{" "}
                    {nextMilestone.title}
                  </Text>
                ) : (
                  <Text style={styles.heroNext}>
                    You have reached the final week — time to review with your
                    clinician.
                  </Text>
                )}
              </View>
            </FadeIn>

            <FadeIn delay={120}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Your baseline</Text>
                <Text style={styles.body}>
                  HbA1c: {optionLabel(HBA1C_OPTIONS, plan.baselineHba1c)}
                </Text>
                <Text style={styles.body}>
                  Fasting sugar:{" "}
                  {optionLabel(FASTING_OPTIONS, plan.baselineFasting)}
                </Text>
                <Text style={styles.body}>
                  Started: {formatDate(plan.startDate)}
                </Text>
                {plan.primaryGoal ? (
                  <Text style={styles.body}>
                    Goal:{" "}
                    {plan.primaryGoal
                      .replace(/_/g, " ")
                      .replace(/^./, (c) => c.toUpperCase())}
                  </Text>
                ) : null}
              </View>
            </FadeIn>

            {phase ? (
              <FadeIn delay={180}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>This phase</Text>
                  <Text style={styles.body}>{phase.description}</Text>
                  <Text style={styles.body}>Focus: {phase.focus}</Text>
                </View>
              </FadeIn>
            ) : null}

            {weekGoals ? (
              <FadeIn delay={240}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>
                    Week {weekGoals.week}: {weekGoals.title}
                  </Text>
                  <Text style={styles.body}>
                    Natural food focus: {weekGoals.naturalFoodFocus}
                  </Text>
                  {weekGoals.goals.map((goal, index) => {
                    const key = `${weekGoals.week}-${index}`;
                    const done = Boolean(goals[key]);
                    return (
                      <PressScale
                        key={key}
                        style={styles.goalRow}
                        onPress={() => toggleGoal(key)}
                        accessibilityLabel={`${goal}${done ? ", done" : ""}`}
                      >
                        <Ionicons
                          name={done ? "checkmark-circle" : "ellipse-outline"}
                          size={24}
                          color={done ? colors.primary : colors.mutedForeground}
                        />
                        <Text
                          style={[styles.goalText, done && styles.goalTextDone]}
                        >
                          {goal}
                        </Text>
                      </PressScale>
                    );
                  })}
                </View>
              </FadeIn>
            ) : null}

            <FadeIn delay={300}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Milestones</Text>
                {MILESTONES.map((milestone) => {
                  const reached = week >= milestone.week;
                  return (
                    <View key={milestone.week} style={styles.milestoneRow}>
                      <Ionicons
                        name={reached ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={
                          reached ? colors.primary : colors.mutedForeground
                        }
                      />
                      <View style={styles.milestoneText}>
                        <Text style={styles.bodyBold}>
                          Week {milestone.week} — {milestone.title}
                        </Text>
                        <Text style={styles.muted}>
                          {milestone.description}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </FadeIn>

            <FadeIn delay={360}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Weekly check-ins</Text>
                {lastCheckIn?.fastingSugar ? (
                  <>
                    <Text style={styles.bigNumber}>
                      {lastCheckIn.fastingSugar}
                      <Text style={styles.bigNumberUnit}> mg/dL</Text>
                    </Text>
                    <Text style={styles.muted}>
                      Last fasting sugar
                      {lastCheckIn.week ? ` · week ${lastCheckIn.week}` : ""}.
                    </Text>
                  </>
                ) : null}
                <Text style={styles.body}>
                  {checkIns.length === 0
                    ? "No check-ins yet. Your first check-in is in week 3."
                    : `${checkIns.length} check-in${
                        checkIns.length === 1 ? "" : "s"
                      } saved.`}
                </Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation?.navigate("WeeklyCheckIn")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Weekly check-in</Text>
                </TouchableOpacity>
              </View>
            </FadeIn>
          </>
        )}

        <FadeIn delay={420}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>7-day meal plan</Text>
            <Text style={styles.body}>
              A week of natural-food meals from the Food Guide — breakfast,
              lunch and dinner, with recipes and a shopping list.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation?.navigate("MealPlan")}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                See the 7-day meal plan
              </Text>
            </TouchableOpacity>
          </View>
        </FadeIn>

        <FadeIn delay={480}>
          <View style={[styles.card, styles.disclaimerCard]}>
            <Text style={styles.cardTitle}>A note on safety</Text>
            <Text style={styles.body}>{REVERSAL_DISCLAIMER}</Text>
          </View>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 120,
      gap: 16,
    },
    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    title: {
      fontFamily: FONTS.display,
      fontSize: 30,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontFamily: FONTS.body,
      fontSize: 15,
      color: colors.mutedForeground,
      lineHeight: 21,
      marginTop: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      padding: 20,
      gap: 10,
    },
    disclaimerCard: {
      backgroundColor: colors.muted,
    },
    cardTitle: {
      fontFamily: FONTS.display,
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
    body: {
      fontFamily: FONTS.body,
      fontSize: 15,
      color: colors.text,
      lineHeight: 21,
    },
    bodyBold: {
      fontFamily: FONTS.body,
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      lineHeight: 21,
    },
    muted: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    heroCard: {
      backgroundColor: "#AED581",
      borderRadius: 28,
      padding: 22,
      gap: 6,
    },
    heroOverline: {
      fontFamily: FONTS.body,
      fontSize: 11,
      fontWeight: "800",
      color: T.TEXT,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    heroBig: {
      fontFamily: FONTS.display,
      fontSize: 44,
      fontWeight: "800",
      color: T.TEXT,
      letterSpacing: -1,
      lineHeight: 48,
    },
    heroSub: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: T.TEXT,
      opacity: 0.8,
      marginBottom: 8,
    },
    heroPhase: {
      fontFamily: FONTS.body,
      fontSize: 14,
      fontWeight: "700",
      color: T.TEXT,
      lineHeight: 20,
    },
    heroNext: {
      fontFamily: FONTS.body,
      fontSize: 13,
      color: T.TEXT,
      opacity: 0.8,
      lineHeight: 19,
    },
    progressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: "rgba(255,255,255,0.55)",
      overflow: "hidden",
      marginBottom: 8,
    },
    progressFill: {
      height: 8,
      borderRadius: 4,
      backgroundColor: T.TEXT,
    },
    bigNumber: {
      fontFamily: FONTS.display,
      fontSize: 36,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: -0.8,
    },
    bigNumberUnit: {
      fontSize: 16,
      fontWeight: "700",
    },
    goalRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingVertical: 6,
    },
    goalText: {
      flex: 1,
      fontFamily: FONTS.body,
      fontSize: 15,
      color: colors.text,
      lineHeight: 21,
    },
    goalTextDone: {
      color: colors.mutedForeground,
      textDecorationLine: "line-through",
    },
    milestoneRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingVertical: 4,
    },
    milestoneText: {
      flex: 1,
      gap: 2,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 15,
      paddingHorizontal: 16,
      alignItems: "center",
      marginTop: 4,
    },
    primaryButtonText: {
      fontFamily: FONTS.display,
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}
