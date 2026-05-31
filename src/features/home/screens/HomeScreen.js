// screens/HomeScreen.js
// Redesigned — Personal Health Companion v2
// Changes: dynamic Quick Actions, Next Best Action card, data-driven Recent Wins,
//          personality-rich header, Weekly Momentum card (scaffold-ready)

import React, { useMemo } from "react";
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

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
        iconColor: "#6A816A",
        iconBg: "rgba(106,129,106,0.15)",
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
        iconColor: "#E3B372",
        iconBg: "rgba(227,179,114,0.15)",
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
        iconColor: "#9A8478",
        iconBg: "rgba(154,132,120,0.15)",
        title: "Log your lunch",
        impact: lunchImpact,
        cta: "Log Meal",
        route: "LogMeal",
        routeParams: {},
      };
    } else if (waterCount < waterGoal) {
      nextAction = {
        icon: "water-outline",
        iconColor: "#E3B372",
        iconBg: "rgba(227,179,114,0.15)",
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
        iconColor: "#D88939",
        iconBg: "rgba(216,137,57,0.15)",
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
    } else if (storyCompleted >= 4) {
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
// ① Today's Story Progress
// ─────────────────────────────────────────────
function TodaysStoryProgress({ storySteps, storyCompleted }) {
  const total = storySteps.length;
  const pct = Math.round((storyCompleted / total) * 100);

  return (
    <View style={sp.card}>
      <View style={sp.topRow}>
        <View style={sp.titleCol}>
          <Text style={sp.label}>TODAY'S STORY</Text>
          <Text style={sp.headline}>
            {storyCompleted} of {total} moments captured
          </Text>
        </View>
        <View style={sp.pctBadge}>
          <Text style={sp.pctNum}>{pct}%</Text>
          <Text style={sp.pctSub}>today</Text>
        </View>
      </View>

      <View style={sp.track}>
        <View style={[sp.fill, { width: `${pct}%` }]} />
      </View>

      <View style={sp.pillRow}>
        {storySteps.map((s, i) => (
          <View key={i} style={[sp.pill, s.done && sp.pillDone]}>
            <Ionicons
              name={s.done ? "checkmark-circle" : "ellipse-outline"}
              size={12}
              color={s.done ? "#6A816A" : "#402E29"}
              style={sp.pillIcon}
            />
            <Text style={[sp.pillText, s.done && sp.pillTextDone]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {storyCompleted < total && (
        <View style={sp.nudge}>
          <Ionicons
            name="partly-sunny-outline"
            size={13}
            color="#9A8478"
            style={sp.nudgeIcon}
          />
          <Text style={sp.nudgeText}>
            Your story is still unfolding — a few moments left to capture.
          </Text>
        </View>
      )}
    </View>
  );
}

const sp = StyleSheet.create({
  card: {
    backgroundColor: "#2D201C",
    borderRadius: 28,
    padding: 22,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  topRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  titleCol: { flex: 1 },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9A8478",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headline: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F4EAE4",
    lineHeight: 22,
  },
  pctBadge: {
    backgroundColor: "rgba(106,129,106,0.15)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(106,129,106,0.25)",
  },
  pctNum: { fontSize: 18, fontWeight: "700", color: "#6A816A" },
  pctSub: { fontSize: 9, color: "#9A8478", marginTop: 1 },
  track: {
    height: 4,
    backgroundColor: "#3A2A25",
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: "#6A816A", borderRadius: 2 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 14 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A2A25",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  pillIcon: { marginRight: 5 },
  pillDone: {
    backgroundColor: "rgba(106,129,106,0.12)",
    borderColor: "rgba(106,129,106,0.25)",
  },
  pillText: { fontSize: 11, color: "#9A8478", fontWeight: "500" },
  pillTextDone: { color: "#6A816A", fontWeight: "600" },
  nudge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 10,
  },
  nudgeIcon: { marginRight: 6 },
  nudgeText: { fontSize: 12, color: "#9A8478", flex: 1, lineHeight: 17 },
});

// ─────────────────────────────────────────────
// ② Next Best Action (new — main CTA)
// ─────────────────────────────────────────────
function NextBestAction({ action, navigation }) {
  if (!action) return null;
  return (
    <View style={nb.outer}>
      <View style={nb.inner}>
        <Text style={nb.sectionLabel}>NEXT BEST ACTION</Text>

        <View style={nb.contentRow}>
          <View style={[nb.iconBadge, { backgroundColor: action.iconBg }]}>
            <Ionicons name={action.icon} size={22} color={action.iconColor} />
          </View>
          <View style={nb.contentTextCol}>
            <Text style={nb.title}>{action.title}</Text>
            <Text style={nb.impact}>{action.impact}</Text>
          </View>
        </View>

        {action.cta && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[nb.ctaBtn, { borderColor: action.iconColor }]}
            onPress={() =>
              navigation?.navigate(action.route, action.routeParams)
            }
          >
            <Text style={[nb.ctaText, { color: action.iconColor }]}>
              {action.cta}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={14}
              color={action.iconColor}
              style={nb.ctaArrow}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const nb = StyleSheet.create({
  outer: {
    backgroundColor: "#2D201C",
    borderRadius: 28,
    padding: 4,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  inner: {
    backgroundColor: "rgba(216,137,57,0.07)",
    borderRadius: 24,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9A8478",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 14,
  },
  contentTextCol: { flex: 1 },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F4EAE4",
    marginBottom: 5,
    lineHeight: 22,
  },
  impact: { fontSize: 13, color: "#9A8478", lineHeight: 18 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  ctaText: { fontSize: 14, fontWeight: "700" },
  ctaArrow: { marginLeft: 6 },
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
          <SolarIcon name="focus-star-bold" size={20} color="#6A816A" />
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
          color="#D88939"
          style={cc.patternIcon}
        />
        <Text style={cc.patternText}>{clarity.patternText}</Text>
      </View>
    </View>
  );
}

const cc = StyleSheet.create({
  card: {
    backgroundColor: "#2D201C",
    borderRadius: 28,
    padding: 22,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  glowTopRight: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(216,137,57,0.10)",
  },
  glowBottomLeft: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(106,129,106,0.10)",
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
    backgroundColor: "rgba(106,129,106,0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    marginTop: 2,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#F4EAE4", marginBottom: 6 },
  confidenceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  confidenceLabel: { fontSize: 11, color: "#9A8478" },
  dotRow: { flexDirection: "row", gap: 3 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#3A2A25",
    borderWidth: 1,
    borderColor: "#402E29",
  },
  dotFilled: { backgroundColor: "#D88939", borderColor: "#D88939" },
  confidenceVal: { fontSize: 11, color: "#D88939", fontWeight: "600" },
  body: { fontSize: 14, color: "#9A8478", lineHeight: 21, marginBottom: 14 },
  patternChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(216,137,57,0.10)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(216,137,57,0.20)",
  },
  patternIcon: { marginRight: 5 },
  patternText: { fontSize: 11, color: "#D88939", fontWeight: "600" },
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
      <View style={tf.inner}>
        <View style={tf.headerRow}>
          <SolarIcon name="sun-fog-bold" size={18} color="#D88939" />
          <Text style={tf.overline}>TODAY'S FOCUS</Text>
        </View>
        <Text style={tf.headline}>{headline}</Text>
        <View style={tf.actionBox}>
          <View style={tf.actionLabelRow}>
            <Ionicons
              name="arrow-forward-circle"
              size={15}
              color="#D88939"
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
              color="#9A8478"
              style={tf.whyIcon}
            />
            <View style={tf.whyTextCol}>
              <Text style={tf.whyTitle}>Why this matters</Text>
              <Text style={tf.whyBody}>{whyBody}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const tf = StyleSheet.create({
  outer: {
    backgroundColor: "#2D201C",
    borderRadius: 28,
    padding: 4,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  inner: {
    backgroundColor: "rgba(216,137,57,0.10)",
    borderRadius: 24,
    padding: 20,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  overline: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D88939",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginLeft: 8,
  },
  headline: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F4EAE4",
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  actionBox: {
    backgroundColor: "rgba(216,137,57,0.12)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(216,137,57,0.20)",
  },
  actionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  actionIcon: { marginRight: 7 },
  actionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D88939",
    letterSpacing: 0.6,
  },
  actionBody: { fontSize: 13, color: "#F4EAE4", lineHeight: 19, opacity: 0.85 },
  whyBox: {
    backgroundColor: "rgba(33,22,19,0.40)",
    borderRadius: 14,
    padding: 13,
  },
  whyRow: { flexDirection: "row", alignItems: "flex-start" },
  whyIcon: { marginRight: 9, marginTop: 1 },
  whyTextCol: { flex: 1 },
  whyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F4EAE4",
    marginBottom: 4,
  },
  whyBody: { fontSize: 13, color: "#9A8478", lineHeight: 19 },
});

// ─────────────────────────────────────────────
// ⑤ Quick Actions — fully dynamic
// ─────────────────────────────────────────────
function QuickActions({ navigation, derived }) {
  const { bodyCheckToday, waterCount, lunchLogged, latestMeal } = derived;

  const actions = [
    {
      icon: "body-check-bold",
      isSolar: true,
      color: "#6A816A",
      bg: "rgba(106,129,106,0.15)",
      label: "Body Check",
      sub: bodyCheckToday ? "Checked in today" : "Log how you feel",
      dimmed: bodyCheckToday,
      onPress: () => navigation?.navigate("BodyCheck"),
    },
    {
      icon: "repeat-meal-bold",
      isSolar: true,
      color: "#D88939",
      bg: "rgba(216,137,57,0.15)",
      label: "Repeat Meal",
      sub: latestMeal
        ? `Repeat ${latestMeal.type || "last"} meal`
        : "Repeat yesterday's dinner",
      dimmed: false,
      onPress: () =>
        navigation?.navigate("RepeatMeal", {
          mealType: latestMeal?.type || "Dinner",
        }),
    },
    {
      icon: "plate-bold-duotone",
      isSolar: true,
      color: "#9A8478",
      bg: "rgba(154,132,120,0.15)",
      label: "Log Meal",
      sub: lunchLogged ? "Lunch already logged" : "No lunch logged yet",
      dimmed: false,
      onPress: () => navigation?.navigate("LogMeal"),
    },
    {
      icon: "water-outline",
      isSolar: false,
      color: "#E3B372",
      bg: "rgba(227,179,114,0.15)",
      label: "Log Water",
      sub:
        waterCount > 0
          ? `${waterCount} glass${waterCount !== 1 ? "es" : ""} logged today`
          : "None logged yet",
      dimmed: false,
      onPress: () => navigation?.navigate("LogWater"),
    },
  ];

  return (
    <View style={qa.grid}>
      {actions.map((item, i) => (
        <TouchableOpacity
          key={i}
          activeOpacity={0.85}
          style={[qa.card, item.dimmed && qa.cardDimmed]}
          onPress={item.onPress}
        >
          <View style={[qa.iconBadge, { backgroundColor: item.bg }]}>
            {item.isSolar ? (
              <SolarIcon name={item.icon} size={24} color={item.color} />
            ) : (
              <Ionicons name={item.icon} size={24} color={item.color} />
            )}
          </View>
          <Text style={qa.label}>{item.label}</Text>
          <Text style={qa.sub}>{item.sub}</Text>
          {item.dimmed && (
            <View style={qa.doneBadge}>
              <Ionicons
                name="checkmark-circle"
                size={13}
                color="#6A816A"
                style={qa.doneIcon}
              />
              <Text style={qa.doneBadgeText}>Done</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const qa = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#2D201C",
    width: "47.5%",
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 16,
  },
  cardDimmed: { opacity: 0.65 },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F4EAE4",
    textAlign: "center",
  },
  sub: {
    fontSize: 11,
    color: "#9A8478",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 8,
    lineHeight: 15,
  },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(106,129,106,0.12)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  doneIcon: { marginRight: 3 },
  doneBadgeText: { fontSize: 10, color: "#6A816A", fontWeight: "700" },
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
            <Ionicons name="ribbon-outline" size={18} color="#6A816A" />
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
          <Ionicons name="ribbon-outline" size={18} color="#6A816A" />
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
    backgroundColor: "#2D201C",
    borderRadius: 28,
    padding: 22,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
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
    backgroundColor: "rgba(106,129,106,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#F4EAE4" },
  subtitle: { fontSize: 12, color: "#9A8478", marginTop: 2 },
  winRow: { flexDirection: "row", alignItems: "flex-start" },
  timelineCol: { width: 20, alignItems: "center", marginRight: 14 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6A816A",
    marginTop: 5,
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: "rgba(106,129,106,0.20)",
    marginTop: 4,
    minHeight: 22,
  },
  winTextCol: { flex: 1, paddingBottom: 18 },
  winText: {
    fontSize: 14,
    color: "#F4EAE4",
    fontWeight: "500",
    lineHeight: 20,
  },
  winWhen: { fontSize: 11, color: "#9A8478", marginTop: 3 },
  emptyState: { fontSize: 13, color: "#9A8478", lineHeight: 19 },
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
          <Ionicons name="trending-up-outline" size={18} color="#D88939" />
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
          const deltaColor = delta >= 0 ? "#6A816A" : "#CE6C60";
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
    backgroundColor: "#2D201C",
    borderRadius: 28,
    padding: 22,
    marginHorizontal: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
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
    backgroundColor: "rgba(216,137,57,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#F4EAE4" },
  subtitle: { fontSize: 12, color: "#9A8478", marginTop: 2 },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
  },
  trendRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  trendLabel: { fontSize: 14, color: "#F4EAE4", fontWeight: "500" },
  trendRight: { flexDirection: "row", alignItems: "center" },
  trendCurrent: {
    fontSize: 12,
    color: "#F4EAE4",
    fontWeight: "600",
    marginRight: 6,
  },
  trendArrow: { marginRight: 3 },
  trendDelta: { fontSize: 14, fontWeight: "700" },
  emptyState: { fontSize: 13, color: "#9A8478", lineHeight: 19 },
});

// ─────────────────────────────────────────────
// Root HomeScreen
// ─────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { logs } = useUserLogs(20);
  const { userData, displayName } = useUserProfile();
  const derived = useDerivedState(logs);

  const {
    storySteps,
    storyCompleted,
    nextAction,
    wins,
    headerSub,
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
      <StatusBar barStyle="light-content" backgroundColor="#211613" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greetingTitle}>
              {getGreeting()} {firstName}
            </Text>
            <Text style={styles.greetingSub}>{headerSub}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.profileImageWrapper}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileFallback}>
                <Text style={styles.profileFallbackText}>{avatarInitial}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ① Story Progress */}
        <TodaysStoryProgress
          storySteps={storySteps}
          storyCompleted={storyCompleted}
        />

        {/* ② Next Best Action */}
        <NextBestAction action={nextAction} navigation={navigation} />

        {/* ③ Clarity Insight */}
        <ClarityCard clarity={clarity} />

        {/* ④ Today's Focus */}
        <TodaysFocusCard
          breakfastLogged={breakfastLogged}
          latestMeal={latestMeal}
          waterCount={waterCount}
          bodyCheckToday={bodyCheckToday}
        />

        {/* ⑤ Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <QuickActions navigation={navigation} derived={derived} />

        {/* ⑥ Recent Wins */}
        <Text style={styles.sectionTitle}>Recent Wins</Text>
        <RecentWins wins={wins} />

        {/* ⑦ Weekly Momentum */}
        <Text style={styles.sectionTitle}>Weekly Momentum</Text>
        <WeeklyMomentum momentum={momentum} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#211613" },
  scrollContent: { paddingBottom: 120 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 20 : 20,
    paddingBottom: 24,
  },
  headerText: { flex: 1 },
  greetingTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F4EAE4",
    letterSpacing: -0.5,
  },
  greetingSub: {
    fontSize: 13,
    color: "#9A8478",
    marginTop: 5,
    lineHeight: 18,
  },
  profileImageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  profileImage: { width: "100%", height: "100%" },
  profileFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2D201C",
  },
  profileFallbackText: {
    color: "#D88939",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F4EAE4",
    paddingHorizontal: 26,
    marginBottom: 14,
    marginTop: 4,
  },
});
