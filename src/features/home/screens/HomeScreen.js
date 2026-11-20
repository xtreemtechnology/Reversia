// screens/HomeScreen.js
// Redesigned — fresh light look, following the soft-green reference:
// header → headline → ask pill → plan hero → quick tiles →
// today's tasks → glucose → clarity → mood → focus → wins → momentum.

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SolarIcon from "../../../components/SolarIcon";
import { useUserLogs } from "../../../hooks/useUserLogs";
import { useUserProfile } from "../../../hooks/useUserProfile";
import GlucoseTrendChart from "../components/GlucoseTrendChart";
import FadeIn from "../components/FadeIn";
import PressScale from "../components/PressScale";
import HomeCurveHeader, {
  HOME_CURVE_HEIGHT,
  HOME_CURVE_GREEN,
} from "../components/HomeCurveHeader";
import PlanHeroCard from "../../reversal/components/PlanHeroCard";
import { auth } from "../../../config/firebase";
import { getReversalPlan } from "../../reversal/services/reversalService";
import { getFoodById } from "../../food-guide/services/foodGuideService";
import {
  getFoodPhoto,
  FOOD_PHOTO_STRIP_IDS,
} from "../../food-guide/foodPhotos";
import { FONTS } from "../../../theme/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import CompanionBuddy from "../../../components/CompanionBuddy";
import CompanionSpeech from "../../../components/CompanionSpeech";
import MoodFace from "../../../components/MoodFace";

// ─────────────────────────────────────────────
// Data helpers — derive everything from logs
// ─────────────────────────────────────────────
/** Convert a Firestore Timestamp / Date / ISO string to a JS Date.
 * Log `createdAt` values arrive as Firestore Timestamps (writers use
 * serverTimestamp()), and `new Date(timestamp)` is Invalid Date — so
 * every date parse below goes through this helper. Same helper as the
 * insights screens. */
function toDate(ts) {
  if (!ts) return null;
  if (ts?.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

function useDerivedState(logs = []) {
  return useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();

    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - 6);
    currentWeekStart.setHours(0, 0, 0, 0);

    const previousWeekStart = new Date(today);
    previousWeekStart.setDate(today.getDate() - 13);
    previousWeekStart.setHours(0, 0, 0, 0);

    const currentWeekEnd = new Date(today);
    currentWeekEnd.setHours(23, 59, 59, 999);

    const previousWeekEnd = new Date(currentWeekStart);
    previousWeekEnd.setMilliseconds(-1);

    const getLogDate = (log) => toDate(log?.createdAt);

    const getWaterGlasses = (log) => {
      if (typeof log?.glasses === "number") return log.glasses;
      if (typeof log?.liters === "number") {
        return Math.max(1, Math.round(log.liters / 0.25));
      }
      return 1;
    };

    const isHydrationLog = (log) =>
      log?.category === "water" || log?.category === "hydration";

    const getWindow = (date) => {
      if (!date) return null;
      if (date >= currentWeekStart && date <= currentWeekEnd) return "current";
      if (date >= previousWeekStart && date <= previousWeekEnd)
        return "previous";
      return null;
    };

    const formatTime = (value) => {
      const date = toDate(value);
      if (!date || Number.isNaN(date.getTime())) return null;
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    };

    const todayLogs = logs.filter((l) => {
      const d = toDate(l?.createdAt);
      return d && d.toDateString() === todayStr;
    });

    // Body check
    const bodyCheckToday = todayLogs.some((l) => l?.category === "body_check");

    // Evening reflection: a body check-in logged after 6 PM. A morning
    // check-in counts for "Body Check" only, so this step is only
    // completable in the evening.
    const eveningReflectionDone = todayLogs.some(
      (l) =>
        l?.category === "body_check" && toDate(l?.createdAt)?.getHours() >= 18
    );

    const weekBuckets = {
      current: { hydration: 0, meal: 0, bodyCheck: 0 },
      previous: { hydration: 0, meal: 0, bodyCheck: 0 },
    };

    logs.forEach((log) => {
      const windowName = getWindow(getLogDate(log));
      if (!windowName) return;

      if (isHydrationLog(log)) {
        weekBuckets[windowName].hydration += getWaterGlasses(log);
      }
      if (log?.category === "meal") {
        weekBuckets[windowName].meal += 1;
      }
      if (log?.category === "body_check") {
        weekBuckets[windowName].bodyCheck += 1;
      }
    });

    // Water / hydration
    const waterLogs = todayLogs.filter(isHydrationLog);
    const waterCount = waterLogs.reduce(
      (sum, log) => sum + getWaterGlasses(log),
      0
    );
    const waterGoal = 8;

    // Meals
    const mealLogs = todayLogs.filter((l) => l?.category === "meal");
    const breakfastLogged = mealLogs.some(
      (l) => l?.type?.toLowerCase() === "breakfast"
    );
    const lunchLogged = mealLogs.some(
      (l) => l?.type?.toLowerCase() === "lunch"
    );
    const dinnerLogged = mealLogs.some(
      (l) => l?.type?.toLowerCase() === "dinner"
    );

    // Latest meal (any day)
    const latestMeal = logs.find((l) => l?.category === "meal") || null;

    const latestMealLabel =
      latestMeal?.type || latestMeal?.name || "latest meal";

    const clarity = (() => {
      if (latestMeal && waterCount > 0) {
        return {
          title: `${latestMealLabel} is shaping your day`,
          body: latestMeal?.notes
            ? latestMeal.notes
            : "Your latest meal and hydration logs give the app a real anchor point for the next suggestion.",
          confidenceLabel: "Moderate",
          confidenceLevel: 4,
          patternText: `${latestMealLabel} · recent meal pattern`,
        };
      }

      if (latestMeal) {
        return {
          title: `${latestMealLabel} is shaping your day`,
          body: latestMeal?.notes
            ? latestMeal.notes
            : "Your latest meal log gives the app a real anchor point for the next suggestion.",
          confidenceLabel: "Building",
          confidenceLevel: 3,
          patternText: `${latestMealLabel} · recent meal pattern`,
        };
      }

      if (waterCount > 0) {
        return {
          title: "Hydration is starting to show",
          body: `You logged ${waterCount} glass${
            waterCount !== 1 ? "es" : ""
          } of water today. That helps the app read your energy pattern more accurately.`,
          confidenceLabel: "Building",
          confidenceLevel: Math.min(4, 2 + Math.ceil(waterCount / 3)),
          patternText: `Hydration · ${waterCount} glass${
            waterCount !== 1 ? "es" : ""
          } logged`,
        };
      }

      return {
        title: "Clarity is emerging",
        body: "Your energy levels were noticeably more stable yesterday afternoon. This may be linked to your earlier lunch and improved hydration throughout the morning.",
        confidenceLabel: "Low",
        confidenceLevel: 2,
        patternText: "Pattern detected · 4-day window",
      };
    })();

    // Story progress steps
    const storySteps = [
      { label: "Body Check", done: bodyCheckToday },
      {
        label: "Glucose",
        done: todayLogs.some((l) => l?.category === "glucose"),
      },
      { label: "Breakfast Logged", done: breakfastLogged },
      { label: "Water Check-In", done: waterCount >= 4 },
      { label: "Lunch", done: lunchLogged },
      { label: "Evening Reflection", done: eveningReflectionDone },
    ];
    const storyCompleted = storySteps.filter((s) => s.done).length;

    // Data-driven wins
    const wins = [];
    const latestBodyCheck = [...todayLogs]
      .filter((log) => log?.category === "body_check")
      .sort(
        (a, b) =>
          (toDate(b?.createdAt)?.getTime() || 0) -
          (toDate(a?.createdAt)?.getTime() || 0)
      )[0];
    const latestHydration = [...waterLogs].sort(
      (a, b) =>
        (toDate(b?.createdAt)?.getTime() || 0) -
        (toDate(a?.createdAt)?.getTime() || 0)
    )[0];
    const latestBreakfast = [...mealLogs]
      .filter((log) => log?.type?.toLowerCase() === "breakfast")
      .sort(
        (a, b) =>
          (toDate(b?.createdAt)?.getTime() || 0) -
          (toDate(a?.createdAt)?.getTime() || 0)
      )[0];

    if (latestBreakfast) {
      const time = formatTime(latestBreakfast.createdAt);
      wins.push({
        text: time ? `Logged breakfast at ${time}` : "Logged breakfast today",
        when: latestBreakfast.foods?.length
          ? `${latestBreakfast.foods.length} food item${
              latestBreakfast.foods.length === 1 ? "" : "s"
            }`
          : "Breakfast",
      });
    }
    if (latestHydration) {
      const time = formatTime(latestHydration.createdAt);
      wins.push({
        text: time
          ? `Logged ${waterCount} glass${
              waterCount !== 1 ? "es" : ""
            } at ${time}`
          : `Logged ${waterCount} glass${
              waterCount !== 1 ? "es" : ""
            } of water today`,
        when: "Hydration",
      });
    }
    if (latestBodyCheck) {
      const time = formatTime(latestBodyCheck.createdAt);
      wins.push({
        text: time
          ? `Completed a body check-in at ${time}`
          : "Completed a body check-in today",
        when: latestBodyCheck.mood ? `Mood: ${latestBodyCheck.mood}` : "Today",
      });
    }

    // Header subtitle — rotates based on state
    let headerSub = "Your story continues today.";
    if (!bodyCheckToday && !breakfastLogged && waterCount === 0) {
      headerSub = "Here's what your body has been noticing.";
    } else if (storyCompleted >= 5) {
      headerSub = "You've captured most of today — well done.";
    } else if (storyCompleted >= 2) {
      headerSub = `${storyCompleted} moments captured. Keep going.`;
    }

    const momentum = [
      {
        label: "Hydration",
        current: weekBuckets.current.hydration,
        previous: weekBuckets.previous.hydration,
        unit: "glasses",
      },
      {
        label: "Meals logged",
        current: weekBuckets.current.meal,
        previous: weekBuckets.previous.meal,
        unit: "logs",
      },
      {
        label: "Body check-ins",
        current: weekBuckets.current.bodyCheck,
        previous: weekBuckets.previous.bodyCheck,
        unit: "logs",
      },
    ];

    return {
      bodyCheckToday,
      // Today's mood and latest check-in identity, for the companion:
      // the buddy reacts when a new check-in lands and mirrors the
      // mood of the day. The id is the stable identity (a fresh fetch
      // returns new Timestamp objects); the ms value bounds recency.
      todayMood: latestBodyCheck?.mood || null,
      latestBodyCheckId: latestBodyCheck?.id || null,
      latestBodyCheckAtMs: toDate(latestBodyCheck?.createdAt)?.getTime() || 0,
      waterCount,
      waterGoal,
      breakfastLogged,
      lunchLogged,
      dinnerLogged,
      latestMeal,
      storySteps,
      storyCompleted,
      wins,
      headerSub,
      clarity,
      momentum,
      // Visibility gates — these sections stay off Home until there is
      // real data behind them (see the render below).
      hasClarityData: Boolean(latestMeal) || waterCount > 0,
      hasMomentumData: momentum.some(
        (item) => item.current > 0 || item.previous > 0
      ),
    };
  }, [logs]);
}

// ─────────────────────────────────────────────
// Companion speech — what the buddy says, from real data only.
// Priority: a fully done day > today's mood > progress so far >
// time of day. Never an invented pattern, never a medical claim.
// ─────────────────────────────────────────────
function companionMessage({ todayMood, storyCompleted, storyTotal }) {
  if (storyTotal > 0 && storyCompleted >= storyTotal) {
    return "Everything's done today. Well done.";
  }
  if (todayMood === "great") return "Feeling great — love that energy.";
  if (todayMood === "good") return "Feeling good today. Keep it going.";
  if (todayMood === "rough" || todayMood === "low") {
    return "Rough days happen. One gentle step is enough.";
  }
  if (todayMood === "okay") return "Thanks for checking in. Steady does it.";
  if (storyCompleted > 0) {
    return `${storyCompleted} of ${storyTotal} done already — nice.`;
  }
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning — a fresh day. Start small.";
  if (hour < 18) return "Good afternoon — still plenty of day left.";
  return "Good evening — a gentle check-in goes a long way.";
}

// ─────────────────────────────────────────────
// Today's Tasks — the day's remaining moments as a tappable list, built
// from the same story steps the old ring hero used. Done rows show a
// green check; open rows show where to go next.
// ─────────────────────────────────────────────
const TASK_ROUTES = {
  "Body Check": "BodyCheck",
  Glucose: "GlucoseLog",
  "Breakfast Logged": "LogMeal",
  "Water Check-In": "LogWater",
  Lunch: "LogMeal",
  "Evening Reflection": "BodyCheck",
};

function TasksList({ storySteps, navigation }) {
  const { colors } = useTheme();
  const tl = makeTl(colors);
  return (
    <View style={tl.card}>
      {storySteps.map((step, i) => {
        const route = TASK_ROUTES[step.label];
        const row = (
          <View style={tl.row}>
            <View style={[tl.iconBadge, step.done && tl.iconBadgeDone]}>
              <Ionicons
                name={step.done ? "checkmark" : "ellipse-outline"}
                size={16}
                color={
                  step.done ? colors.primaryForeground : colors.mutedForeground
                }
              />
            </View>
            <Text style={[tl.label, step.done && tl.labelDone]}>
              {step.label}
            </Text>
            {route && !step.done ? (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.mutedForeground}
              />
            ) : null}
          </View>
        );
        if (!route) {
          return <View key={i}>{row}</View>;
        }
        return (
          <PressScale
            key={i}
            onPress={() => navigation?.navigate(route)}
            accessibilityLabel={step.label}
          >
            {row}
          </PressScale>
        );
      })}
    </View>
  );
}

function makeTl(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      marginHorizontal: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 6,
      paddingHorizontal: 14,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 11,
    },
    iconBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    iconBadgeDone: {
      backgroundColor: colors.secondary,
    },
    label: {
      fontFamily: FONTS.body,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
    },
    labelDone: {
      color: colors.mutedForeground,
    },
  });
}
// ─────────────────────────────────────────────
// ③ Clarity Insight Card
// ─────────────────────────────────────────────
function ClarityCard({ clarity }) {
  const { colors } = useTheme();
  const cc = makeCc(colors);
  return (
    <View style={cc.card}>
      <View style={cc.glowTopRight} />
      <View style={cc.glowBottomLeft} />
      <View style={cc.headerRow}>
        <View style={cc.iconBadge}>
          <SolarIcon name="focus-star-bold" size={20} color={colors.primary} />
        </View>
        <View style={cc.headerTextCol}>
          <Text style={cc.title}>{clarity.title}</Text>
          <View style={cc.confidenceRow}>
            <Text style={cc.confidenceLabel}>Confidence</Text>
            <View style={cc.dotRow}>
              {[1, 2, 3, 4, 5].map((d) => (
                <View
                  key={d}
                  style={[cc.dot, d <= clarity.confidenceLevel && cc.dotFilled]}
                />
              ))}
            </View>
            <Text style={cc.confidenceVal}>{clarity.confidenceLabel}</Text>
          </View>
        </View>
      </View>
      <Text style={cc.body}>{clarity.body}</Text>
      <View style={cc.patternChip}>
        <Ionicons
          name="git-branch-outline"
          size={12}
          color={colors.primary}
          style={cc.patternIcon}
        />
        <Text style={cc.patternText}>{clarity.patternText}</Text>
      </View>
    </View>
  );
}

function makeCc(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 22,
      marginHorizontal: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    glowTopRight: {
      position: "absolute",
      top: -20,
      right: -20,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(139,195,74,0.07)",
    },
    glowBottomLeft: {
      position: "absolute",
      bottom: -20,
      left: -20,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(139,195,74,0.05)",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    headerTextCol: { flex: 1 },
    iconBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(139,195,74,0.14)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
      marginTop: 2,
    },
    title: {
      fontFamily: FONTS.display,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 6,
    },
    confidenceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    confidenceLabel: {
      fontFamily: FONTS.body,
      fontSize: 11,
      color: colors.mutedForeground,
    },
    dotRow: { flexDirection: "row", gap: 3 },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dotFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
    confidenceVal: {
      fontFamily: FONTS.body,
      fontSize: 11,
      color: colors.primary,
      fontWeight: "600",
    },
    body: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 21,
      marginBottom: 14,
    },
    patternChip: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: "rgba(139,195,74,0.10)",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: "rgba(139,195,74,0.25)",
    },
    patternIcon: { marginRight: 5 },
    patternText: {
      fontFamily: FONTS.body,
      fontSize: 11,
      color: colors.primary,
      fontWeight: "600",
    },
  });
}

// ─────────────────────────────────────────────
// ④ Today's Focus Card
// ─────────────────────────────────────────────
function TodaysFocusCard({
  breakfastLogged,
  latestMeal,
  waterCount,
  bodyCheckToday,
}) {
  const { colors } = useTheme();
  const tf = makeTf(colors);
  const latestMealLabel = latestMeal?.type || latestMeal?.name || "recent meal";
  const latestMealType = latestMeal?.type?.toLowerCase();
  const latestMealTime = toDate(latestMeal?.createdAt)?.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  let headline = "Try adding protein to your next meal today.";
  let actionBody =
    "Add eggs, greek yogurt, beans, or another protein source to keep the day more steady.";
  let whyBody =
    "A balanced meal gives the app a stronger signal for the rest of your day.";

  if (latestMeal) {
    if (latestMealType === "breakfast") {
      headline = latestMealTime
        ? `Breakfast logged at ${latestMealTime}`
        : "Breakfast is already logged today";
      actionBody = latestMeal?.notes
        ? latestMeal.notes
        : "You’ve got a clear morning anchor now. Keep lunch balanced so the day stays steady.";
      whyBody =
        "Breakfast is the best signal for the rest of today, so the app can now compare later meals against a real start.";
    } else if (latestMealType === "lunch") {
      headline = latestMealTime
        ? `Lunch logged at ${latestMealTime}`
        : "Lunch is already logged today";
      actionBody = latestMeal?.notes
        ? latestMeal.notes
        : "Lunch is your strongest midday anchor. Keep hydration up and aim for a steadier dinner.";
      whyBody =
        "With lunch logged, the app can compare afternoon energy against a mid-day meal instead of a generic baseline.";
    } else if (latestMealType === "dinner") {
      headline = latestMealTime
        ? `Dinner logged at ${latestMealTime}`
        : "Dinner is already logged today";
      actionBody = latestMeal?.notes
        ? latestMeal.notes
        : "Dinner closes the day’s pattern. Tomorrow morning will tell the app whether the trend holds.";
      whyBody =
        "Dinner gives the app a full-day anchor, which helps compare tomorrow’s energy against last night’s meal pattern.";
    } else {
      headline = latestMealTime
        ? `${latestMealLabel} logged at ${latestMealTime}`
        : `${latestMealLabel} is already shaping today`;
      actionBody = latestMeal?.notes
        ? latestMeal.notes
        : `${latestMealLabel} is your latest meal anchor. Use the next meal to keep the pattern steady.`;
      whyBody =
        "The latest meal gives the app a live anchor point instead of a generic suggestion.";
    }
  } else if (breakfastLogged) {
    headline = "Keep protein in your next meal today.";
    actionBody =
      "Your first meal is already in motion. Keep the rest of the day steady with another protein-forward meal.";
    whyBody =
      "When meals stay balanced, the app can track your energy patterns with more confidence across the rest of the day.";
  }

  if (waterCount > 0 && !latestMeal) {
    actionBody = `You’ve logged ${waterCount} glass$
{waterCount !== 1 ? "es" : ""} of water today. Pair the next meal with protein to keep momentum steady.`;
  }

  if (bodyCheckToday && !latestMeal) {
    whyBody =
      "Your body check-in is already in place, so adding the next meal helps complete the picture for today.";
  }

  return (
    <View style={tf.outer}>
      <View style={tf.headerRow}>
        <SolarIcon name="sun-fog-bold" size={18} color={colors.primary} />
        <Text style={tf.overline}>TODAY'S FOCUS</Text>
      </View>
      <Text style={tf.headline}>{headline}</Text>
      <View style={tf.actionBox}>
        <View style={tf.actionLabelRow}>
          <Ionicons
            name="arrow-forward-circle"
            size={15}
            color={colors.primary}
            style={tf.actionIcon}
          />
          <Text style={tf.actionLabel}>RECOMMENDED ACTION</Text>
        </View>
        <Text style={tf.actionBody}>{actionBody}</Text>
      </View>
      <View style={tf.whyBox}>
        <View style={tf.whyRow}>
          <Ionicons
            name="information-circle"
            size={17}
            color={colors.mutedForeground}
            style={tf.whyIcon}
          />
          <View style={tf.whyTextCol}>
            <Text style={tf.whyTitle}>Why this matters</Text>
            <Text style={tf.whyBody}>{whyBody}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function makeTf(colors) {
  return StyleSheet.create({
    outer: {
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 20,
      marginHorizontal: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    overline: {
      fontFamily: FONTS.body,
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginLeft: 8,
    },
    headline: {
      fontFamily: FONTS.display,
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 30,
      letterSpacing: -0.3,
      marginBottom: 14,
    },
    actionBox: {
      backgroundColor: "rgba(139,195,74,0.08)",
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "rgba(139,195,74,0.20)",
    },
    actionLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    actionIcon: { marginRight: 7 },
    actionLabel: {
      fontFamily: FONTS.body,
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
      letterSpacing: 0.6,
    },
    actionBody: {
      fontFamily: FONTS.body,
      fontSize: 13,
      color: colors.text,
      lineHeight: 19,
      opacity: 0.85,
    },
    whyBox: {
      backgroundColor: colors.muted,
      borderRadius: 14,
      padding: 13,
    },
    whyRow: { flexDirection: "row", alignItems: "flex-start" },
    whyIcon: { marginRight: 9, marginTop: 1 },
    whyTextCol: { flex: 1 },
    whyTitle: {
      fontFamily: FONTS.display,
      fontSize: 13,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    whyBody: {
      fontFamily: FONTS.body,
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 19,
    },
  });
}

// ─────────────────────────────────────────────
// Quick tiles — three in a row, like the reference's Math Solver /
// Give Answer / Textbooks. Each opens a real flow: log a meal, the
// Food Guide, or a glucose check.
// ─────────────────────────────────────────────
function QuickActions({ navigation }) {
  const { colors } = useTheme();
  const qa = makeQa(colors);
  const tiles = [
    {
      icon: "restaurant-outline",
      label: "Log Meal",
      onPress: () => navigation?.navigate("LogMeal"),
    },
    {
      icon: "book-outline",
      label: "Food Guide",
      onPress: () => navigation?.navigate("Foods"),
    },
    {
      icon: "pulse-outline",
      label: "Check Sugar",
      onPress: () => navigation?.navigate("GlucoseLog"),
    },
  ];

  return (
    <View style={qa.row}>
      {tiles.map((tile) => (
        <PressScale
          key={tile.label}
          style={qa.card}
          onPress={tile.onPress}
          accessibilityLabel={tile.label}
        >
          <View style={qa.iconBadge}>
            <Ionicons name={tile.icon} size={24} color={colors.secondary} />
          </View>
          <Text style={qa.label}>{tile.label}</Text>
        </PressScale>
      ))}
    </View>
  );
}

function makeQa(colors) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 18,
      alignItems: "center",
      gap: 10,
    },
    iconBadge: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontFamily: FONTS.display,
      fontSize: 13,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
  });
}
// ─────────────────────────────────────────────
// ⑥ Recent Wins — data-driven
// ─────────────────────────────────────────────
// Only ever rendered when wins.length > 0 (HomeScreen gates it) —
// there is no empty state here by design: the section appears
// when the first real win arrives.
function RecentWins({ wins }) {
  const { colors } = useTheme();
  const rw = makeRw(colors);
  const subtitle =
    wins.length === 1
      ? "1 real win pulled from your logs"
      : `${wins.length} real wins pulled from your logs`;

  return (
    <View style={rw.card}>
      <View style={rw.headerRow}>
        <View style={rw.iconBadge}>
          <Ionicons name="ribbon-outline" size={18} color={colors.primary} />
        </View>
        <View>
          <Text style={rw.title}>Recent Wins</Text>
          <Text style={rw.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {wins.map((w, i) => (
        <View key={i} style={rw.winRow}>
          <View style={rw.timelineCol}>
            <View style={rw.dot} />
            {i < wins.length - 1 && <View style={rw.line} />}
          </View>
          <View style={rw.winTextCol}>
            <Text style={rw.winText}>{w.text}</Text>
            <Text style={rw.winWhen}>{w.when}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function makeRw(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 22,
      marginHorizontal: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      gap: 12,
    },
    iconBadge: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(139,195,74,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: FONTS.display,
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      fontFamily: FONTS.body,
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    winRow: { flexDirection: "row", alignItems: "flex-start" },
    timelineCol: { width: 20, alignItems: "center", marginRight: 14 },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 5,
    },
    line: {
      width: 1.5,
      flex: 1,
      backgroundColor: "rgba(139,195,74,0.25)",
      marginTop: 4,
      minHeight: 22,
    },
    winTextCol: { flex: 1, paddingBottom: 18 },
    winText: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
      lineHeight: 20,
    },
    winWhen: {
      fontFamily: FONTS.body,
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 3,
    },
  });
}

// ─────────────────────────────────────────────
// ⑦ Weekly Momentum
// ─────────────────────────────────────────────
// Only ever rendered when there is data (HomeScreen gates it) —
// there is no empty state here by design: the section appears
// when this week or last week has logged activity.
function WeeklyMomentum({ momentum }) {
  const { colors } = useTheme();
  const wm = makeWm(colors);
  return (
    <View style={wm.card}>
      <View style={wm.headerRow}>
        <View style={wm.iconBadge}>
          <Ionicons
            name="trending-up-outline"
            size={18}
            color={colors.primary}
          />
        </View>
        <View>
          <Text style={wm.title}>Weekly Momentum</Text>
          <Text style={wm.subtitle}>Compared to last week</Text>
        </View>
      </View>
      {momentum.map((item, index) => {
        const delta = item.current - item.previous;
        const deltaColor = delta >= 0 ? colors.primary : colors.destructive;
        const deltaLabel =
          item.previous === 0
            ? item.current > 0
              ? `New this week · ${item.current} ${item.unit}`
              : `No ${item.unit} last week`
            : `${delta >= 0 ? "+" : ""}${delta} vs last week`;

        return (
          <View
            key={item.label}
            style={[
              wm.trendRow,
              index < momentum.length - 1 && wm.trendRowBorder,
            ]}
          >
            <Text style={wm.trendLabel}>{item.label}</Text>
            <View style={wm.trendRight}>
              <Text style={wm.trendCurrent}>
                {item.current} {item.unit}
              </Text>
              <Ionicons
                name={delta >= 0 ? "arrow-up" : "arrow-down"}
                size={12}
                color={deltaColor}
                style={wm.trendArrow}
              />
              <Text style={[wm.trendDelta, { color: deltaColor }]}>
                {deltaLabel}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function makeWm(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 22,
      marginHorizontal: 20,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
      gap: 12,
    },
    iconBadge: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(139,195,74,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: FONTS.display,
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      fontFamily: FONTS.body,
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    trendRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 13,
    },
    trendRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    trendLabel: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    trendRight: { flexDirection: "row", alignItems: "center" },
    trendCurrent: {
      fontFamily: FONTS.body,
      fontSize: 12,
      color: colors.text,
      fontWeight: "600",
      marginRight: 6,
    },
    trendArrow: { marginRight: 3 },
    trendDelta: {
      fontFamily: FONTS.body,
      fontSize: 14,
      fontWeight: "700",
    },
  });
}

// ─────────────────────────────────────────────
// From the Food Guide — horizontal photo strip of guide foods that have
// a real photo. Tapping a card opens that food in the Food Guide.
// ─────────────────────────────────────────────
function FoodGuideStrip({ navigation }) {
  const { colors } = useTheme();
  const fg = makeFg(colors);
  const foods = FOOD_PHOTO_STRIP_IDS.map((id) => getFoodById(id)).filter(
    Boolean
  );
  if (!foods.length) return null;
  return (
    <View style={fg.section}>
      <View style={fg.headerRow}>
        <Text style={fg.title}>From the Food Guide</Text>
        <TouchableOpacity
          onPress={() => navigation?.navigate("Foods")}
          activeOpacity={0.7}
        >
          <Text style={fg.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={fg.strip}
      >
        {foods.map((food) => {
          const photo = getFoodPhoto(food.id);
          const badgeColor =
            food.rating === "safe"
              ? colors.success
              : food.rating === "caution"
              ? colors.warning
              : colors.destructive;
          return (
            <PressScale
              key={food.id}
              style={fg.card}
              onPress={() =>
                navigation?.navigate("Foods", {
                  screen: "FoodDetail",
                  params: { foodId: food.id },
                })
              }
              accessibilityLabel={`${food.name}, rated ${food.rating}`}
            >
              {photo ? (
                <Image
                  source={photo}
                  style={fg.photo}
                  resizeMode="cover"
                  accessibilityLabel={`Photo of ${food.name}`}
                />
              ) : null}
              <View style={fg.body}>
                <Text style={fg.name} numberOfLines={1}>
                  {food.name}
                </Text>
                <View
                  style={[fg.badge, { backgroundColor: `${badgeColor}1F` }]}
                >
                  <Text style={[fg.badgeText, { color: badgeColor }]}>
                    {food.rating.charAt(0).toUpperCase() + food.rating.slice(1)}
                  </Text>
                </View>
              </View>
            </PressScale>
          );
        })}
      </ScrollView>
    </View>
  );
}

function makeFg(colors) {
  return StyleSheet.create({
    section: { marginBottom: 32 },
    headerRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      paddingHorizontal: 22,
      marginBottom: 14,
      marginTop: 4,
    },
    title: {
      fontFamily: FONTS.display,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    viewAll: {
      fontFamily: FONTS.body,
      fontSize: 13,
      fontWeight: "600",
      color: colors.mutedForeground,
    },
    strip: {
      paddingHorizontal: 20,
      gap: 12,
    },
    card: {
      width: 160,
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    photo: {
      width: "100%",
      height: 110,
    },
    body: {
      padding: 12,
      gap: 8,
    },
    name: {
      fontFamily: FONTS.display,
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    badge: {
      borderRadius: 999,
      paddingVertical: 5,
      paddingHorizontal: 10,
      alignSelf: "flex-start",
    },
    badgeText: {
      fontFamily: FONTS.body,
      fontSize: 11,
      fontWeight: "700",
    },
  });
}

// ─────────────────────────────────────────────
// Theme colors passed to chart components
// ─────────────────────────────────────────────
function makeHomeColors(colors) {
  return {
    card: colors.card,
    border: colors.border,
    text: colors.text,
    textMuted: colors.mutedForeground,
    accent: colors.primary,
    green: colors.primary,
    amber: colors.warning,
    red: colors.destructive,
    background: colors.background,
  };
}

// ─────────────────────────────────────────────
// Root HomeScreen — fresh reference layout:
// header → headline → ask pill → plan hero → quick tiles →
// today's tasks → glucose → clarity → mood → focus → wins → momentum.
// ─────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const homeColors = makeHomeColors(colors);
  const { logs } = useUserLogs(20);
  const { userData, displayName } = useUserProfile();
  const derived = useDerivedState(logs);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    let mounted = true;
    getReversalPlan(uid)
      .then((loaded) => {
        if (mounted) setPlan(loaded);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const {
    storySteps,
    storyCompleted,
    wins,
    clarity,
    momentum,
    hasClarityData,
    hasMomentumData,
    breakfastLogged,
    latestMeal,
    waterCount,
    bodyCheckToday,
    todayMood,
    latestBodyCheckId,
    latestBodyCheckAtMs,
  } = derived;

  // Companion reactions: bump bounceKey when a NEW body check-in
  // lands while Home is showing (the user just came back from the
  // body check-in). The first render only records what is already
  // there, and only a check-in from the last minute counts — so
  // opening the app to an older check-in never pops the buddy.
  const [bounceKey, setBounceKey] = useState(0);
  const lastCheckInIdRef = useRef(null);
  const firstCheckInRenderRef = useRef(true);
  useEffect(() => {
    if (firstCheckInRenderRef.current) {
      firstCheckInRenderRef.current = false;
      lastCheckInIdRef.current = latestBodyCheckId;
      return;
    }
    if (latestBodyCheckId && latestBodyCheckId !== lastCheckInIdRef.current) {
      lastCheckInIdRef.current = latestBodyCheckId;
      if (latestBodyCheckAtMs && Date.now() - latestBodyCheckAtMs < 60000) {
        setBounceKey((k) => k + 1);
      }
    }
  }, [latestBodyCheckId, latestBodyCheckAtMs]);

  // The buddy mirrors the day: celebrating when everything is done,
  // happy on a great/good check-in, neutral otherwise — it never
  // mirrors a low or rough mood back at the user.
  const buddyExpression =
    storySteps.length > 0 && storyCompleted >= storySteps.length
      ? "celebrating"
      : todayMood === "great" || todayMood === "good"
      ? "happy"
      : "neutral";
  const speechMessage = companionMessage({
    todayMood,
    storyCompleted,
    storyTotal: storySteps.length,
  });

  const firstName =
    userData?.firstName ||
    displayName?.split(" ")[0] ||
    userData?.displayName?.split(" ")[0] ||
    userData?.name?.split(" ")[0] ||
    "there";
  const avatarUri = userData?.photoURL || userData?.profileImage || null;
  const avatarInitial = firstName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={HOME_CURVE_GREEN} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Curved header: greeting + headline inside the green wave ── */}
        <View style={styles.curveHeader}>
          <HomeCurveHeader />
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.avatarWrap}
              onPress={() => navigation.navigate("Profile")}
              accessibilityLabel="Open your profile"
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{avatarInitial}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.helloPill}>
              <Text style={styles.helloText}>Hello, {firstName}!</Text>
            </View>
          </View>

          {/* ── Headline ── */}
          <Text style={styles.headline}>
            <Text style={styles.headlineStrong}>Need help{"\n"}</Text>
            eating well <Text style={styles.headlineStrong}>today?</Text>
          </Text>
        </View>

        {/* ── Ask pill: tap to ask the Guide; camera/mic log a meal ── */}
        <View style={styles.askPill}>
          <TouchableOpacity
            style={styles.askTextWrap}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Guide")}
            accessibilityLabel="Ask a question"
          >
            <Text style={styles.askText}>Ask a question</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.askIcon}
            onPress={() => navigation.navigate("PhotoLog")}
            accessibilityLabel="Log a meal by photo"
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.askIcon}
            onPress={() => navigation.navigate("VoiceLog")}
            accessibilityLabel="Log a meal by voice"
            activeOpacity={0.7}
          >
            <Ionicons name="mic-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* ── Reversal Plan hero ── */}
        <FadeIn delay={0}>
          <PlanHeroCard
            plan={plan}
            onPress={() => navigation.navigate("Plan")}
          />
        </FadeIn>

        {/* ── Quick tiles ── */}
        <FadeIn delay={60}>
          <QuickActions navigation={navigation} />
        </FadeIn>

        {/* ── Today's Tasks ── */}
        <FadeIn delay={120}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksTitle}>Today&apos;s Tasks</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Track")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <TasksList storySteps={storySteps} navigation={navigation} />
        </FadeIn>

        {/* ── Glucose Trend Chart ── */}
        <FadeIn delay={180}>
          <GlucoseTrendChart
            logs={logs}
            colors={homeColors}
            onPress={() => navigation.navigate("GlucoseLog")}
          />
        </FadeIn>

        {/* ── Clarity Insight — hidden until a meal or water log gives
            it something real to say. With no data at all the fallback
            invents a pattern about "yesterday" that never happened. ── */}
        {hasClarityData ? (
          <FadeIn delay={240}>
            <ClarityCard clarity={clarity} />
          </FadeIn>
        ) : null}

        {/* Companion check-in — a quick, friendly entry point into the existing body-check flow. */}
        <FadeIn delay={300}>
          <View style={styles.moodCard}>
            <CompanionSpeech message={speechMessage} />
            <View style={styles.moodCardHeader}>
              <View style={styles.moodCardCopy}>
                <Text style={styles.moodEyebrow}>A MOMENT FOR YOU</Text>
                <Text style={styles.moodTitle}>How are you feeling today?</Text>
                <Text style={styles.moodSubtitle}>
                  A quick check-in helps Reversia understand your day.
                </Text>
              </View>
              <View style={styles.moodBuddy}>
                <CompanionBuddy
                  size={66}
                  expression={buddyExpression}
                  bounceKey={bounceKey}
                />
              </View>
            </View>
            <View style={styles.moodChoices}>
              {[
                { key: "great", label: "Great" },
                { key: "good", label: "Good" },
                { key: "okay", label: "Okay" },
                { key: "low", label: "Low" },
                { key: "rough", label: "Rough" },
              ].map((mood) => (
                <TouchableOpacity
                  key={mood.key}
                  activeOpacity={0.78}
                  accessibilityRole="button"
                  accessibilityLabel={`Feeling ${mood.label}. Continue to body check-in`}
                  onPress={() =>
                    navigation.navigate("BodyCheck", { initialMood: mood.key })
                  }
                  style={styles.moodChoice}
                >
                  <View style={styles.moodEmojiWrap}>
                    <MoodFace mood={mood.key} size={44} />
                  </View>
                  <Text style={styles.moodChoiceLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {bodyCheckToday ? (
              <View style={styles.moodDoneRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color={colors.primary}
                />
                <Text style={styles.moodDoneText}>
                  You&apos;ve checked in today — you can add another anytime.
                </Text>
              </View>
            ) : null}
          </View>
        </FadeIn>

        {/* ── Today's Focus ── */}
        <FadeIn delay={360}>
          <TodaysFocusCard
            breakfastLogged={breakfastLogged}
            latestMeal={latestMeal}
            waterCount={waterCount}
            bodyCheckToday={bodyCheckToday}
          />
        </FadeIn>

        {/* ── Recent Wins — hidden until there is a real win to show. ── */}
        {wins.length > 0 ? (
          <FadeIn delay={420}>
            <Text style={styles.sectionTitle}>Recent Wins</Text>
            <RecentWins wins={wins} />
          </FadeIn>
        ) : null}

        {/* ── Weekly Momentum — hidden until this week or last week
            has any logged activity. ── */}
        {hasMomentumData ? (
          <FadeIn delay={480}>
            <Text style={styles.sectionTitle}>Weekly Momentum</Text>
            <WeeklyMomentum momentum={momentum} />
          </FadeIn>
        ) : null}

        {/* ── From the Food Guide ── */}
        <FadeIn delay={540}>
          <FoodGuideStrip navigation={navigation} />
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    // Deep green behind the safe-area strip so the curve runs to the very
    // top edge (the ScrollView itself paints the sage screen background).
    container: { flex: 1, backgroundColor: HOME_CURVE_GREEN },
    scrollView: { backgroundColor: colors.background },
    scrollContent: { paddingBottom: 120 },

    // Curved header zone: the SVG wave paints the background; the header
    // row and headline sit inside it.
    curveHeader: {
      height: HOME_CURVE_HEIGHT,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 20,
      paddingTop:
        Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 16 : 16,
      paddingBottom: 20,
    },
    avatarWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: colors.primary,
    },
    avatarImage: { width: "100%", height: "100%" },
    avatarFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.muted,
    },
    avatarFallbackText: {
      fontFamily: FONTS.display,
      color: colors.secondary,
      fontSize: 18,
      fontWeight: "700",
    },
    helloPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    helloText: {
      fontFamily: FONTS.body,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },

    headline: {
      fontFamily: FONTS.display,
      fontSize: 34,
      fontWeight: "400",
      // White by design — the headline sits on the fixed deep-green curve.
      color: "#FFFFFF",
      lineHeight: 42,
      letterSpacing: -0.6,
      paddingHorizontal: 20,
      marginBottom: 18,
    },
    headlineStrong: {
      fontWeight: "800",
    },

    askPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      marginHorizontal: 20,
      // Overlaps the curve's bottom edge, like the reference's search pill
      // straddling the blue wave.
      marginTop: -14,
      marginBottom: 16,
      paddingLeft: 18,
      paddingRight: 8,
      paddingVertical: 6,
      gap: 4,
    },
    askTextWrap: {
      flex: 1,
      paddingVertical: 10,
    },
    askText: {
      fontFamily: FONTS.body,
      fontSize: 15,
      color: colors.mutedForeground,
    },
    askIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },

    tasksHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      paddingHorizontal: 22,
      marginBottom: 12,
      marginTop: 4,
    },
    tasksTitle: {
      fontFamily: FONTS.display,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    viewAll: {
      fontFamily: FONTS.body,
      fontSize: 13,
      fontWeight: "600",
      color: colors.mutedForeground,
    },

    moodCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 18,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    moodCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    moodCardCopy: { flex: 1, paddingRight: 12 },
    moodEyebrow: {
      fontFamily: FONTS.body,
      color: colors.secondary,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.25,
      marginBottom: 7,
    },
    moodTitle: {
      fontFamily: FONTS.display,
      color: colors.text,
      fontSize: 19,
      lineHeight: 25,
      fontWeight: "800",
      letterSpacing: -0.35,
    },
    moodSubtitle: {
      fontFamily: FONTS.body,
      color: colors.mutedForeground,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 5,
      maxWidth: 280,
    },
    moodBuddy: {
      width: 68,
      height: 68,
      alignItems: "center",
      justifyContent: "center",
      marginTop: -8,
      marginRight: -5,
    },
    moodChoices: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 18,
      gap: 5,
    },
    moodChoice: { flex: 1, alignItems: "center", gap: 7 },
    moodEmojiWrap: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.muted,
    },
    moodChoiceLabel: {
      fontFamily: FONTS.body,
      color: colors.mutedForeground,
      fontSize: 10,
      fontWeight: "600",
    },
    moodDoneRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    moodDoneText: {
      fontFamily: FONTS.body,
      color: colors.secondary,
      fontSize: 11,
      flex: 1,
    },
    sectionTitle: {
      fontFamily: FONTS.display,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      paddingHorizontal: 22,
      marginBottom: 14,
      marginTop: 4,
    },
  });
}
