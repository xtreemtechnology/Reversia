// screens/HomeScreen.js
// Redesigned — fresh light look, following the soft-green reference:
// header → headline → ask pill → plan hero → quick tiles →
// today's tasks → glucose → clarity → mood → focus → wins → momentum.

import React, { useEffect, useMemo, useState } from "react";
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
import { T, FONTS } from "../../../theme/tokens";
import CompanionBuddy from "../../../components/CompanionBuddy";
import MoodFace from "../../../components/MoodFace";

// ─────────────────────────────────────────────
// Data helpers — derive everything from logs
// ─────────────────────────────────────────────
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

    const getLogDate = (log) => {
      if (!log?.createdAt) return null;
      return new Date(log.createdAt);
    };

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
      const date = value ? new Date(value) : null;
      if (!date || Number.isNaN(date.getTime())) return null;
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    };

    const todayLogs = logs.filter((l) => {
      const d = l?.createdAt ? new Date(l.createdAt) : null;
      return d && d.toDateString() === todayStr;
    });

    // Body check
    const bodyCheckToday = todayLogs.some((l) => l?.category === "body_check");

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
      { label: "Evening Reflection", done: false }, // only possible after 6 PM
    ];
    const storyCompleted = storySteps.filter((s) => s.done).length;

    // Next Best Action — priority ladder
    let lunchImpact =
      "Consistent meal logging helps surface your body's patterns faster.";
    if (breakfastLogged) {
      lunchImpact =
        "Breakfast is already captured, so lunch will anchor the rest of today.";
    } else if (latestMeal) {
      lunchImpact = `Your latest meal is ${latestMealLabel}; logging lunch updates the pattern.`;
    }

    let nextAction = null;
    if (!bodyCheckToday) {
      nextAction = {
        icon: "happy-outline",
        iconColor: "#689F38",
        iconBg: "rgba(139,195,74,0.12)",
        title: "Log a body check-in",
        impact: latestMeal
          ? `You already logged ${latestMealLabel}; a body check-in completes the morning picture.`
          : "Helps build a clearer picture of your daily energy patterns.",
        cta: "Body Check",
        route: "BodyCheck",
        routeParams: {},
      };
    } else if (waterCount < 3) {
      nextAction = {
        icon: "water-outline",
        iconColor: "#5E9B4A",
        iconBg: "rgba(139,195,74,0.12)",
        title: "Drink a glass of water",
        impact: latestMeal
          ? `${latestMealLabel} is already in your log. Water helps the app see how that meal is landing.`
          : "May improve energy stability and reduce afternoon fatigue.",
        cta: "Log Water",
        route: "LogWater",
        routeParams: {},
      };
    } else if (!lunchLogged) {
      nextAction = {
        icon: "restaurant-outline",
        iconColor: "#E8A33D",
        iconBg: "rgba(232,163,61,0.12)",
        title: "Log your lunch",
        impact: lunchImpact,
        cta: "Log Meal",
        route: "LogMeal",
        routeParams: {},
      };
    } else if (waterCount < waterGoal) {
      nextAction = {
        icon: "water-outline",
        iconColor: "#5E9B4A",
        iconBg: "rgba(139,195,74,0.12)",
        title: `${waterGoal - waterCount} more glasses to hit your goal`,
        impact: latestMeal
          ? `You're on track after ${latestMealLabel}. Keep hydration going to keep the pattern readable.`
          : "You're on track — keep the hydration going.",
        cta: "Log Water",
        route: "LogWater",
        routeParams: {},
      };
    } else {
      nextAction = {
        icon: "moon-outline",
        iconColor: "#689F38",
        iconBg: "rgba(139,195,74,0.12)",
        title: latestMeal
          ? `${latestMealLabel} is already shaping today`
          : "You're doing well today",
        impact: latestMeal
          ? latestMeal?.notes ||
            "All key check-ins are complete. Check back this evening."
          : "All key check-ins are complete. Check back this evening.",
        cta: null,
        route: null,
        routeParams: {},
      };
    }

    // Data-driven wins
    const wins = [];
    const latestBodyCheck = [...todayLogs]
      .filter((log) => log?.category === "body_check")
      .sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      )[0];
    const latestHydration = [...waterLogs].sort(
      (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
    )[0];
    const latestBreakfast = [...mealLogs]
      .filter((log) => log?.type?.toLowerCase() === "breakfast")
      .sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
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
      waterCount,
      waterGoal,
      breakfastLogged,
      lunchLogged,
      dinnerLogged,
      latestMeal,
      storySteps,
      storyCompleted,
      nextAction,
      wins,
      headerSub,
      clarity,
      momentum,
    };
  }, [logs]);
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
};

function TasksList({ storySteps, navigation }) {
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
                color={step.done ? "#FFFFFF" : T.MUTED}
              />
            </View>
            <Text style={[tl.label, step.done && tl.labelDone]}>
              {step.label}
            </Text>
            {route && !step.done ? (
              <Ionicons name="chevron-forward" size={16} color={T.MUTED} />
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

const tl = StyleSheet.create({
  card: {
    backgroundColor: T.SURFACE,
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.BORDER,
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
    backgroundColor: T.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadgeDone: {
    backgroundColor: T.SECONDARY,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: "600",
    color: T.TEXT,
    flex: 1,
  },
  labelDone: {
    color: T.MUTED,
  },
});
// ─────────────────────────────────────────────
// ③ Clarity Insight Card
// ─────────────────────────────────────────────
function ClarityCard({ clarity }) {
  return (
    <View style={cc.card}>
      <View style={cc.glowTopRight} />
      <View style={cc.glowBottomLeft} />
      <View style={cc.headerRow}>
        <View style={cc.iconBadge}>
          <SolarIcon name="focus-star-bold" size={20} color={T.PRIMARY} />
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
          color={T.PRIMARY}
          style={cc.patternIcon}
        />
        <Text style={cc.patternText}>{clarity.patternText}</Text>
      </View>
    </View>
  );
}

const cc = StyleSheet.create({
  card: {
    backgroundColor: T.SURFACE,
    borderRadius: 28,
    padding: 22,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.BORDER,
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
    color: T.TEXT,
    marginBottom: 6,
  },
  confidenceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  confidenceLabel: { fontFamily: FONTS.body, fontSize: 11, color: T.MUTED },
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
  confidenceVal: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: T.PRIMARY,
    fontWeight: "600",
  },
  body: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: T.MUTED,
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
    color: T.PRIMARY,
    fontWeight: "600",
  },
});

// ─────────────────────────────────────────────
// ④ Today's Focus Card
// ─────────────────────────────────────────────
function TodaysFocusCard({
  breakfastLogged,
  latestMeal,
  waterCount,
  bodyCheckToday,
}) {
  const latestMealLabel = latestMeal?.type || latestMeal?.name || "recent meal";
  const latestMealType = latestMeal?.type?.toLowerCase();
  const latestMealTime = latestMeal?.createdAt
    ? new Date(latestMeal.createdAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

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
        <SolarIcon name="sun-fog-bold" size={18} color={T.PRIMARY} />
        <Text style={tf.overline}>TODAY'S FOCUS</Text>
      </View>
      <Text style={tf.headline}>{headline}</Text>
      <View style={tf.actionBox}>
        <View style={tf.actionLabelRow}>
          <Ionicons
            name="arrow-forward-circle"
            size={15}
            color={T.PRIMARY}
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
            color={T.MUTED}
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

const tf = StyleSheet.create({
  outer: {
    backgroundColor: T.SURFACE,
    borderRadius: 28,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  overline: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: "700",
    color: T.PRIMARY,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginLeft: 8,
  },
  headline: {
    fontFamily: FONTS.display,
    fontSize: 22,
    fontWeight: "700",
    color: T.TEXT,
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
    color: T.PRIMARY,
    letterSpacing: 0.6,
  },
  actionBody: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: T.TEXT,
    lineHeight: 19,
    opacity: 0.85,
  },
  whyBox: {
    backgroundColor: T.PRIMARY_LIGHT,
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
    color: T.TEXT,
    marginBottom: 4,
  },
  whyBody: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: T.MUTED,
    lineHeight: 19,
  },
});

// ─────────────────────────────────────────────
// Quick tiles — three in a row, like the reference's Math Solver /
// Give Answer / Textbooks. Each opens a real flow: log a meal, the
// Food Guide, or a glucose check.
// ─────────────────────────────────────────────
function QuickActions({ navigation }) {
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
            <Ionicons name={tile.icon} size={24} color={T.SECONDARY} />
          </View>
          <Text style={qa.label}>{tile.label}</Text>
        </PressScale>
      ))}
    </View>
  );
}

const qa = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: T.SURFACE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.BORDER,
    paddingVertical: 18,
    alignItems: "center",
    gap: 10,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: T.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: FONTS.display,
    fontSize: 13,
    fontWeight: "700",
    color: T.TEXT,
    textAlign: "center",
  },
});
// ─────────────────────────────────────────────
// ⑥ Recent Wins — data-driven
// ─────────────────────────────────────────────
function RecentWins({ wins }) {
  let subtitle = "Start logging to surface real patterns";
  if (wins.length === 1) {
    subtitle = "1 real win pulled from your logs";
  } else if (wins.length > 1) {
    subtitle = `${wins.length} real wins pulled from your logs`;
  }

  if (!wins.length) {
    return (
      <View style={rw.card}>
        <View style={rw.headerRow}>
          <View style={rw.iconBadge}>
            <Ionicons name="ribbon-outline" size={18} color={T.PRIMARY} />
          </View>
          <View>
            <Text style={rw.title}>Recent Wins</Text>
            <Text style={rw.subtitle}>{subtitle}</Text>
          </View>
        </View>
        <Text style={rw.emptyState}>
          Log a meal, water, or a body check-in and this section will fill with
          your real progress.
        </Text>
      </View>
    );
  }

  return (
    <View style={rw.card}>
      <View style={rw.headerRow}>
        <View style={rw.iconBadge}>
          <Ionicons name="ribbon-outline" size={18} color={T.PRIMARY} />
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

const rw = StyleSheet.create({
  card: {
    backgroundColor: T.SURFACE,
    borderRadius: 28,
    padding: 22,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: T.BORDER,
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
    color: T.TEXT,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: T.MUTED,
    marginTop: 2,
  },
  winRow: { flexDirection: "row", alignItems: "flex-start" },
  timelineCol: { width: 20, alignItems: "center", marginRight: 14 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.PRIMARY,
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
    color: T.TEXT,
    fontWeight: "500",
    lineHeight: 20,
  },
  winWhen: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: T.MUTED,
    marginTop: 3,
  },
  emptyState: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: T.MUTED,
    lineHeight: 19,
  },
});

// ─────────────────────────────────────────────
// ⑦ Weekly Momentum (scaffold — wires up later)
// ─────────────────────────────────────────────
function WeeklyMomentum({ momentum }) {
  const hasData = momentum.some(
    (item) => item.current > 0 || item.previous > 0
  );

  return (
    <View style={wm.card}>
      <View style={wm.headerRow}>
        <View style={wm.iconBadge}>
          <Ionicons name="trending-up-outline" size={18} color={T.PRIMARY} />
        </View>
        <View>
          <Text style={wm.title}>Weekly Momentum</Text>
          <Text style={wm.subtitle}>Compared to last week</Text>
        </View>
      </View>
      {!hasData ? (
        <Text style={wm.emptyState}>
          Log a few meals, body check-ins, and glasses of water to reveal your
          weekly momentum.
        </Text>
      ) : (
        momentum.map((item, index) => {
          const delta = item.current - item.previous;
          const deltaColor = delta >= 0 ? T.PRIMARY : T.DANGER;
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
        })
      )}
    </View>
  );
}

const wm = StyleSheet.create({
  card: {
    backgroundColor: T.SURFACE,
    borderRadius: 28,
    padding: 22,
    marginHorizontal: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: T.BORDER,
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
    color: T.TEXT,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: T.MUTED,
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
    borderBottomColor: T.BORDER,
  },
  trendLabel: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: T.TEXT,
    fontWeight: "500",
  },
  trendRight: { flexDirection: "row", alignItems: "center" },
  trendCurrent: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: T.TEXT,
    fontWeight: "600",
    marginRight: 6,
  },
  trendArrow: { marginRight: 3 },
  trendDelta: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: T.MUTED,
    lineHeight: 19,
  },
});

// ─────────────────────────────────────────────
// From the Food Guide — horizontal photo strip of guide foods that have
// a real photo. Tapping a card opens that food in the Food Guide.
// ─────────────────────────────────────────────
function FoodGuideStrip({ navigation }) {
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
              ? T.SUCCESS
              : food.rating === "caution"
              ? T.WARNING
              : T.DANGER;
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

const fg = StyleSheet.create({
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
    color: T.TEXT,
  },
  viewAll: {
    fontFamily: FONTS.body,
    fontSize: 13,
    fontWeight: "600",
    color: T.MUTED,
  },
  strip: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 160,
    backgroundColor: T.SURFACE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.BORDER,
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
    color: T.TEXT,
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

// ─────────────────────────────────────────────
// Theme colors passed to chart components
// ─────────────────────────────────────────────
const HOME_COLORS = {
  card: T.SURFACE,
  border: T.BORDER,
  text: T.TEXT,
  textMuted: T.MUTED,
  accent: T.PRIMARY,
  green: T.PRIMARY,
  amber: T.AMBER,
  red: T.DANGER,
  background: T.BG,
};

// ─────────────────────────────────────────────
// Root HomeScreen — fresh reference layout:
// header → headline → ask pill → plan hero → quick tiles →
// today's tasks → glucose → clarity → mood → focus → wins → momentum.
// ─────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
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
    wins,
    clarity,
    momentum,
    breakfastLogged,
    latestMeal,
    waterCount,
    bodyCheckToday,
  } = derived;

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
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.helloPill}
              onPress={() => navigation.navigate("Profile")}
            >
              <Text style={styles.helloText}>Hello, {firstName}!</Text>
              <Ionicons name="chevron-down" size={14} color={T.TEXT} />
            </TouchableOpacity>
            <View style={styles.headerSpacer} />
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate("Guide")}
              accessibilityLabel="Ask the Reversia Guide"
            >
              <Ionicons name="sparkles" size={20} color={T.SECONDARY} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate("Profile")}
              accessibilityLabel="Menu"
            >
              <Ionicons name="menu" size={20} color={T.TEXT} />
            </TouchableOpacity>
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
            <Ionicons name="camera-outline" size={20} color={T.TEXT} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.askIcon}
            onPress={() => navigation.navigate("VoiceLog")}
            accessibilityLabel="Log a meal by voice"
            activeOpacity={0.7}
          >
            <Ionicons name="mic-outline" size={20} color={T.TEXT} />
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
            colors={HOME_COLORS}
            onPress={() => navigation.navigate("GlucoseLog")}
          />
        </FadeIn>

        {/* ── Clarity Insight ── */}
        <FadeIn delay={240}>
          <ClarityCard clarity={clarity} />
        </FadeIn>

        {/* Companion check-in — a quick, friendly entry point into the existing body-check flow. */}
        <FadeIn delay={300}>
          <View style={styles.moodCard}>
            <View style={styles.moodCardHeader}>
              <View style={styles.moodCardCopy}>
                <Text style={styles.moodEyebrow}>A MOMENT FOR YOU</Text>
                <Text style={styles.moodTitle}>How are you feeling today?</Text>
                <Text style={styles.moodSubtitle}>
                  A quick check-in helps Reversia understand your day.
                </Text>
              </View>
              <View style={styles.moodBuddy}>
                <CompanionBuddy size={66} />
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
                <Ionicons name="checkmark-circle" size={15} color={T.PRIMARY} />
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

        {/* ── Recent Wins ── */}
        <FadeIn delay={420}>
          <Text style={styles.sectionTitle}>Recent Wins</Text>
          <RecentWins wins={wins} />
        </FadeIn>

        {/* ── Weekly Momentum ── */}
        <FadeIn delay={480}>
          <Text style={styles.sectionTitle}>Weekly Momentum</Text>
          <WeeklyMomentum momentum={momentum} />
        </FadeIn>

        {/* ── From the Food Guide ── */}
        <FadeIn delay={540}>
          <FoodGuideStrip navigation={navigation} />
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Deep green behind the safe-area strip so the curve runs to the very
  // top edge (the ScrollView itself paints the sage screen background).
  container: { flex: 1, backgroundColor: HOME_CURVE_GREEN },
  scrollView: { backgroundColor: T.BG },
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
    borderColor: T.PRIMARY,
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.PRIMARY_LIGHT,
  },
  avatarFallbackText: {
    fontFamily: FONTS.display,
    color: T.SECONDARY,
    fontSize: 18,
    fontWeight: "700",
  },
  helloPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.SURFACE,
    borderWidth: 1,
    borderColor: T.BORDER,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  helloText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: "600",
    color: T.TEXT,
  },
  headerSpacer: { flex: 1 },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.SURFACE,
    borderWidth: 1,
    borderColor: T.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  headline: {
    fontFamily: FONTS.display,
    fontSize: 34,
    fontWeight: "400",
    color: T.WHITE,
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
    backgroundColor: T.SURFACE,
    borderWidth: 1,
    borderColor: T.BORDER,
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
    color: T.MUTED,
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
    color: T.TEXT,
  },
  viewAll: {
    fontFamily: FONTS.body,
    fontSize: 13,
    fontWeight: "600",
    color: T.MUTED,
  },

  moodCard: {
    backgroundColor: T.SURFACE,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: T.BORDER,
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
    color: T.SECONDARY,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.25,
    marginBottom: 7,
  },
  moodTitle: {
    fontFamily: FONTS.display,
    color: T.TEXT,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    letterSpacing: -0.35,
  },
  moodSubtitle: {
    fontFamily: FONTS.body,
    color: T.MUTED,
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
    borderColor: T.BORDER,
    backgroundColor: T.PRIMARY_LIGHT,
  },
  moodChoiceLabel: {
    fontFamily: FONTS.body,
    color: T.MUTED,
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
    borderTopColor: T.BORDER,
  },
  moodDoneText: {
    fontFamily: FONTS.body,
    color: T.SECONDARY,
    fontSize: 11,
    flex: 1,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: "700",
    color: T.TEXT,
    paddingHorizontal: 22,
    marginBottom: 14,
    marginTop: 4,
  },
});
