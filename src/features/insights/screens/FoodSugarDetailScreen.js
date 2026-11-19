// src/features/insights/screens/FoodSugarDetailScreen.js
// Detail for one food or one meal: every paired reading for it, newest
// first, with the before → after values and the rise class. For a food,
// the Food Guide rating, tip and swap are shown alongside its pattern.

import React, { useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";
import { T } from "../../../theme/tokens";
import { useUserLogs } from "../../../hooks/useUserLogs";
import {
  MIN_READINGS_FOR_VERDICT,
  RISE_LABELS,
  VERDICT_LABELS,
  buildFoodSugarSummary,
} from "../services/foodSugarService";
import {
  getFoodById,
  getSwapFor,
} from "../../food-guide/services/foodGuideService";
import { FOOD_SUGAR_DISCLAIMER } from "./FoodSugarInsightsScreen";

const RISE_COLORS = {
  steady: T.SUCCESS,
  moderate: T.WARNING,
  sharp: T.DANGER,
  "no-baseline": T.MUTED,
};

const RATING_COLORS = {
  safe: T.SUCCESS,
  caution: T.WARNING,
  avoid: T.DANGER,
};

function formatWhen(date) {
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function FoodSugarDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { logs } = useUserLogs(100);
  const kind = route?.params?.kind;
  const foodId = route?.params?.foodId;
  const mealName = route?.params?.mealName;

  const summary = useMemo(() => buildFoodSugarSummary(logs), [logs]);
  const styles = makeStyles(colors);

  const food = kind === "food" ? getFoodById(foodId) : null;
  const entry =
    kind === "food"
      ? summary.byFood.find((item) => item.id === foodId)
      : kind === "meal"
      ? summary.byMeal.find(
          (item) => item.id === String(mealName || "").toLowerCase()
        )
      : null;
  const swap = food ? getSwapFor(food) : null;

  const pairs = useMemo(() => {
    if (!entry) return [];
    return entry.pairs
      .slice()
      .sort((a, b) => b.readingTime.getTime() - a.readingTime.getTime());
  }, [entry]);

  const title = food ? food.name : mealName || "Food & Sugar";
  const subtitle = food
    ? "Its pattern across your paired readings."
    : "Every paired reading for this meal, newest first.";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
          style={styles.backRow}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Food &amp; Sugar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {!entry ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nothing to show yet</Text>
            <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
              No paired readings for this yet. Log the meal, then log a glucose
              reading within 2 hours after it.
            </Text>
          </View>
        ) : (
          <>
            {food ? (
              <View style={styles.card}>
                <View style={styles.rowTop}>
                  <Text style={styles.cardTitle}>Food Guide</Text>
                  <View
                    style={[
                      styles.ratingPill,
                      {
                        backgroundColor: `${
                          RATING_COLORS[food.rating] || T.MUTED
                        }20`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ratingText,
                        { color: RATING_COLORS[food.rating] || T.MUTED },
                      ]}
                    >
                      {food.rating}
                    </Text>
                  </View>
                </View>
                {food.tip ? (
                  <Text
                    style={[styles.cardBody, { color: colors.mutedForeground }]}
                  >
                    {food.tip}
                  </Text>
                ) : null}
                {swap ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.swapRow}
                    onPress={() =>
                      navigation?.navigate("Foods", {
                        screen: "FoodDetail",
                        params: { foodId: swap.id },
                      })
                    }
                  >
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={[styles.swapText, { color: colors.primary }]}>
                      Swap to try: {swap.name}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pattern so far</Text>
              <Text
                style={[styles.cardBody, { color: colors.mutedForeground }]}
              >
                {entry.counts.steady} steady · {entry.counts.moderate} moderate
                · {entry.counts.sharp} sharp
                {entry.counts.noBaseline > 0
                  ? ` · ${entry.counts.noBaseline} without an earlier reading`
                  : ""}
              </Text>
              <Text style={[styles.verdictText, { color: colors.foreground }]}>
                {entry.verdict
                  ? VERDICT_LABELS[entry.verdict]
                  : `Not enough readings yet — ${MIN_READINGS_FOR_VERDICT} paired readings needed for a pattern.`}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Paired readings</Text>
            {pairs.map((pair) => (
              <View key={pair.id} style={styles.card}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowTitle}>
                    {formatWhen(pair.readingTime)} ·{" "}
                    {formatTime(pair.readingTime)}
                  </Text>
                  <View
                    style={[
                      styles.chip,
                      {
                        backgroundColor: `${
                          RISE_COLORS[pair.riseClass] || T.MUTED
                        }20`,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.chipDot,
                        {
                          backgroundColor:
                            RISE_COLORS[pair.riseClass] || T.MUTED,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        { color: RISE_COLORS[pair.riseClass] || T.MUTED },
                      ]}
                    >
                      {RISE_LABELS[pair.riseClass]}
                    </Text>
                  </View>
                </View>
                {kind === "food" ? (
                  <Text
                    style={[styles.rowMeta, { color: colors.mutedForeground }]}
                  >
                    {pair.mealName}
                    {pair.mealType ? ` · ${pair.mealType}` : ""}
                  </Text>
                ) : null}
                <Text
                  style={[styles.rowMeta, { color: colors.mutedForeground }]}
                >
                  {pair.baselineMgdl === null
                    ? `After-meal reading ${pair.afterMgdl} mg/dL — no earlier reading to compare.`
                    : `${pair.baselineMgdl} → ${pair.afterMgdl} mg/dL` +
                      (pair.riseMgdl !== null
                        ? ` (${pair.riseMgdl >= 0 ? "+" : ""}${
                            pair.riseMgdl
                          } mg/dL)`
                        : "") +
                      (pair.baselineSource === "fasting"
                        ? " · compared with your fasting readings"
                        : "")}
                </Text>
              </View>
            ))}
          </>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Read this first</Text>
          <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
            {FOOD_SUGAR_DISCLAIMER}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20, paddingBottom: 60, gap: 16 },
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 8,
    },
    backText: { fontSize: 15, fontWeight: "600", color: colors.primary },
    header: { marginBottom: 4 },
    title: { fontSize: 24, fontWeight: "800", color: colors.foreground },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 6,
      lineHeight: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    cardBody: { fontSize: 13, lineHeight: 19, marginTop: 8 },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginTop: 8,
    },
    rowTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    rowTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.foreground,
      flex: 1,
    },
    rowMeta: { fontSize: 12, marginTop: 6, lineHeight: 17 },
    verdictText: { fontSize: 13, fontWeight: "600", marginTop: 8 },
    ratingPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    ratingText: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "capitalize",
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    chipDot: { width: 7, height: 7, borderRadius: 4 },
    chipText: { fontSize: 11, fontWeight: "700" },
    swapRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
    },
    swapText: { fontSize: 13, fontWeight: "700", flex: 1 },
  });
}
