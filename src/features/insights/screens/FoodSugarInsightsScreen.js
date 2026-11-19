// src/features/insights/screens/FoodSugarInsightsScreen.js
// Summary screen for food-to-sugar insights: which foods and meals were
// followed by steady, moderate or sharp rises, from the user's own logs.
// Read-only: it never writes logs and never changes how meals or glucose
// are logged. Verdicts only appear with at least 2 paired readings.

import React, { useMemo } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";
import { T, FONTS } from "../../../theme/tokens";
import FadeIn from "../../home/components/FadeIn";
import PressScale from "../../home/components/PressScale";
import { useUserLogs } from "../../../hooks/useUserLogs";
import {
  MIN_READINGS_FOR_VERDICT,
  RISE_LABELS,
  VERDICT_LABELS,
  buildFoodSugarSummary,
} from "../services/foodSugarService";
import { getFoodById } from "../../food-guide/services/foodGuideService";

export const FOOD_SUGAR_DISCLAIMER =
  "These are observations from your own logged meals and glucose readings, not a diagnosis. " +
  "A reading counts as after a meal only when it was logged within 2 hours after that meal. " +
  "Rise classes are a simple guide — steady is a rise of 30 mg/dL or less, moderate is 31–70, sharp is over 70 — " +
  "not a medical standard, and your response to a food can vary day to day. " +
  "Talk to your doctor about any pattern that worries you, and before changing food or medication.";

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

function ClassChip({ riseClass, styles }) {
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: `${RISE_COLORS[riseClass] || T.MUTED}20` },
      ]}
    >
      <View
        style={[
          styles.chipDot,
          { backgroundColor: RISE_COLORS[riseClass] || T.MUTED },
        ]}
      />
      <Text
        style={[styles.chipText, { color: RISE_COLORS[riseClass] || T.MUTED }]}
      >
        {RISE_LABELS[riseClass]}
      </Text>
    </View>
  );
}

function CountsLine({ counts, colors, styles }) {
  const parts = [];
  if (counts.steady > 0) parts.push(`${counts.steady} steady`);
  if (counts.moderate > 0) parts.push(`${counts.moderate} moderate`);
  if (counts.sharp > 0) parts.push(`${counts.sharp} sharp`);
  if (counts.noBaseline > 0)
    parts.push(`${counts.noBaseline} without an earlier reading`);
  return (
    <Text style={[styles.rowMeta, { color: colors.mutedForeground }]}>
      {parts.length > 0 ? parts.join(" · ") : "No paired readings yet"}
    </Text>
  );
}

export default function FoodSugarInsightsScreen({ navigation }) {
  const { colors } = useTheme();
  const { logs, loading } = useUserLogs(100);

  const summary = useMemo(() => buildFoodSugarSummary(logs), [logs]);
  const styles = makeStyles(colors);

  const hasPairs = summary.pairs.length > 0;
  const hasAnyLogs = logs.length > 0;

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
          <Text style={styles.backText}>Learn</Text>
        </TouchableOpacity>

        <FadeIn delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>Food &amp; Sugar</Text>
            <Text style={styles.subtitle}>
              How your meals lined up with your glucose readings — from your own
              logs, nothing guessed.
            </Text>
          </View>
        </FadeIn>

        {loading && !hasAnyLogs ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[styles.loadingText, { color: colors.mutedForeground }]}
            >
              Reading your logs…
            </Text>
          </View>
        ) : !hasPairs ? (
          <FadeIn delay={60}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Not enough to show yet</Text>
              <Text
                style={[styles.cardBody, { color: colors.mutedForeground }]}
              >
                Log a meal, then log a glucose reading within 2 hours after it.
                Once you have a few of those pairs, this screen will show which
                foods and meals were followed by steady readings and which came
                with a sharper rise.
              </Text>
              <Text
                style={[styles.cardBody, { color: colors.mutedForeground }]}
              >
                {summary.totals.unpairedReadings > 0
                  ? `You have ${
                      summary.totals.unpairedReadings
                    } glucose reading${
                      summary.totals.unpairedReadings !== 1 ? "s" : ""
                    } with no meal logged in the 2 hours before — those stay unpaired.`
                  : "No paired readings yet."}
              </Text>
            </View>
          </FadeIn>
        ) : (
          <>
            {/* Summary counts — the hero: three big numbers */}
            <FadeIn delay={60}>
              <View style={[styles.card, styles.heroCard]}>
                <Text style={styles.cardTitle}>Your pairs so far</Text>
                <View style={styles.countRow}>
                  <View style={styles.countCell}>
                    <Text style={styles.countValue}>
                      {summary.totals.pairedReadings}
                    </Text>
                    <Text
                      style={[
                        styles.countLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      paired readings
                    </Text>
                  </View>
                  <View style={styles.countCell}>
                    <Text style={styles.countValue}>
                      {summary.totals.foodsObserved}
                    </Text>
                    <Text
                      style={[
                        styles.countLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      foods observed
                    </Text>
                  </View>
                  <View style={styles.countCell}>
                    <Text style={styles.countValue}>
                      {summary.totals.unpairedReadings}
                    </Text>
                    <Text
                      style={[
                        styles.countLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      unpaired readings
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.cardBody, { color: colors.mutedForeground }]}
                >
                  A reading pairs with a meal only when it was logged within 2
                  hours after that meal. Readings outside that window are shown
                  unpaired, never force-matched.
                </Text>
              </View>
            </FadeIn>

            {/* Per-food patterns */}
            <FadeIn delay={120}>
              <Text style={styles.sectionTitle}>How foods lined up</Text>
            </FadeIn>
            {summary.byFood.length === 0 ? (
              <FadeIn delay={180}>
                <View style={styles.card}>
                  <Text
                    style={[styles.cardBody, { color: colors.mutedForeground }]}
                  >
                    No logged meal matched a food in the Food Guide yet.
                  </Text>
                </View>
              </FadeIn>
            ) : (
              summary.byFood.map((entry, index) => {
                const food = entry.food || getFoodById(entry.id);
                if (!food) return null;
                return (
                  <FadeIn
                    key={entry.id}
                    delay={Math.min(180 + index * 40, 420)}
                  >
                    <PressScale
                      style={styles.card}
                      onPress={() =>
                        navigation?.navigate("FoodSugarDetail", {
                          kind: "food",
                          foodId: food.id,
                        })
                      }
                      accessibilityLabel={`${food.name} pattern`}
                    >
                      <View style={styles.rowTop}>
                        <Text style={styles.rowTitle}>{food.name}</Text>
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
                              {
                                color: RATING_COLORS[food.rating] || T.MUTED,
                              },
                            ]}
                          >
                            {food.rating}
                          </Text>
                        </View>
                      </View>
                      <CountsLine
                        counts={entry.counts}
                        colors={colors}
                        styles={styles}
                      />
                      <Text
                        style={[
                          styles.verdictText,
                          { color: colors.foreground },
                        ]}
                      >
                        {entry.verdict
                          ? VERDICT_LABELS[entry.verdict]
                          : `Not enough readings yet — ${MIN_READINGS_FOR_VERDICT} paired readings needed for a pattern.`}
                      </Text>
                    </PressScale>
                  </FadeIn>
                );
              })
            )}

            {/* Per-meal patterns */}
            <FadeIn delay={180}>
              <Text style={styles.sectionTitle}>Meals with a pattern</Text>
            </FadeIn>
            {summary.byMeal.length === 0 ? (
              <FadeIn delay={240}>
                <View style={styles.card}>
                  <Text
                    style={[styles.cardBody, { color: colors.mutedForeground }]}
                  >
                    No meal has a paired reading yet.
                  </Text>
                </View>
              </FadeIn>
            ) : (
              summary.byMeal.map((entry, index) => (
                <FadeIn key={entry.id} delay={Math.min(240 + index * 40, 480)}>
                  <PressScale
                    style={styles.card}
                    onPress={() =>
                      navigation?.navigate("FoodSugarDetail", {
                        kind: "meal",
                        mealName: entry.mealName,
                      })
                    }
                    accessibilityLabel={`${entry.mealName} pattern`}
                  >
                    <Text style={styles.rowTitle}>{entry.mealName}</Text>
                    <Text
                      style={[
                        styles.rowMeta,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {formatWhen(
                        entry.pairs.length > 0
                          ? entry.pairs[entry.pairs.length - 1].mealTime
                          : null
                      )}
                      {entry.mealType ? ` · ${entry.mealType}` : ""}
                    </Text>
                    <CountsLine
                      counts={entry.counts}
                      colors={colors}
                      styles={styles}
                    />
                    <Text
                      style={[styles.verdictText, { color: colors.foreground }]}
                    >
                      {entry.verdict
                        ? VERDICT_LABELS[entry.verdict]
                        : `Not enough readings yet — ${MIN_READINGS_FOR_VERDICT} paired readings needed for a pattern.`}
                    </Text>
                  </PressScale>
                </FadeIn>
              ))
            )}

            {/* Recent pairs */}
            <FadeIn delay={240}>
              <Text style={styles.sectionTitle}>Recent pairs</Text>
            </FadeIn>
            {summary.pairs
              .slice()
              .sort((a, b) => b.readingTime.getTime() - a.readingTime.getTime())
              .slice(0, 5)
              .map((pair, index) => (
                <FadeIn key={pair.id} delay={Math.min(300 + index * 40, 540)}>
                  <View style={styles.card}>
                    <View style={styles.rowTop}>
                      <Text style={styles.rowTitle}>{pair.mealName}</Text>
                      <ClassChip riseClass={pair.riseClass} styles={styles} />
                    </View>
                    <Text
                      style={[
                        styles.rowMeta,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {formatWhen(pair.readingTime)}
                      {pair.mealType ? ` · ${pair.mealType}` : ""} ·{" "}
                      {pair.baselineMgdl === null
                        ? "no earlier reading to compare"
                        : `${pair.baselineMgdl} → ${pair.afterMgdl} mg/dL` +
                          (pair.riseMgdl !== null
                            ? ` (${pair.riseMgdl >= 0 ? "+" : ""}${
                                pair.riseMgdl
                              })`
                            : "")}
                    </Text>
                  </View>
                </FadeIn>
              ))}
          </>
        )}

        {/* Disclaimer */}
        <FadeIn delay={300}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Read this first</Text>
            <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
              {FOOD_SUGAR_DISCLAIMER}
            </Text>
          </View>
        </FadeIn>
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
    backText: {
      fontFamily: FONTS.body,
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary,
    },
    header: { marginBottom: 4 },
    title: {
      fontFamily: FONTS.display,
      fontSize: 30,
      fontWeight: "800",
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontFamily: FONTS.body,
      fontSize: 15,
      color: colors.mutedForeground,
      marginTop: 6,
      lineHeight: 21,
    },
    loadingWrap: { alignItems: "center", paddingVertical: 40, gap: 12 },
    loadingText: { fontFamily: FONTS.body, fontSize: 14 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroCard: {
      backgroundColor: colors.muted,
    },
    cardTitle: {
      fontFamily: FONTS.display,
      fontSize: 17,
      fontWeight: "700",
      color: colors.foreground,
    },
    cardBody: {
      fontFamily: FONTS.body,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 8,
    },
    sectionTitle: {
      fontFamily: FONTS.body,
      fontSize: 13,
      fontWeight: "700",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginTop: 8,
    },
    countRow: { flexDirection: "row", marginTop: 16, gap: 8 },
    countCell: { flex: 1, alignItems: "center" },
    countValue: {
      fontFamily: FONTS.display,
      fontSize: 32,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: -0.8,
    },
    countLabel: {
      fontFamily: FONTS.body,
      fontSize: 11,
      marginTop: 2,
      textAlign: "center",
    },
    rowTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    rowTitle: {
      fontFamily: FONTS.display,
      fontSize: 15,
      fontWeight: "700",
      color: colors.foreground,
      flex: 1,
    },
    rowMeta: {
      fontFamily: FONTS.body,
      fontSize: 12,
      marginTop: 6,
      lineHeight: 17,
    },
    verdictText: {
      fontFamily: FONTS.body,
      fontSize: 13,
      fontWeight: "600",
      marginTop: 8,
    },
    ratingPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    ratingText: {
      fontFamily: FONTS.body,
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
    chipText: { fontFamily: FONTS.body, fontSize: 11, fontWeight: "700" },
  });
}
