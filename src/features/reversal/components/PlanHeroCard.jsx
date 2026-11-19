// components/reversal/PlanHeroCard.jsx
//
// The green hero card from the fresh reference: one bold card that shows
// where the 12-week Reversal Plan stands. Used on Home and on Profile so
// the plan looks the same everywhere. No Pro tier, no paywall — the plan
// is the app's own feature.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { T, FONTS } from "../../../theme/tokens";
import PressScale from "../../home/components/PressScale";
import {
  calculateProgress,
  getPhaseForWeek,
  getNextMilestone,
} from "../services/reversalService";

export default function PlanHeroCard({ plan, onPress, style }) {
  if (!plan?.startDate) {
    return (
      <PressScale
        style={[styles.card, style]}
        onPress={onPress}
        accessibilityLabel="Start your 12-week Reversal Plan"
      >
        <View style={styles.iconCircle}>
          <Ionicons name="leaf" size={24} color={T.TEXT} />
        </View>
        <Text style={styles.title}>Start your 12-week Reversal Plan</Text>
        <Text style={styles.body}>
          A gentle guide to steadier sugar — natural food, small habits, and a
          weekly check-in.
        </Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Start the plan</Text>
          <Ionicons name="arrow-forward" size={15} color={T.TEXT} />
        </View>
      </PressScale>
    );
  }

  const progress = calculateProgress(plan.startDate);
  const phase = getPhaseForWeek(progress.week);
  const next = getNextMilestone(progress.week);

  return (
    <PressScale
      style={[styles.card, style]}
      onPress={onPress}
      accessibilityLabel={`Reversal Plan, week ${progress.week} of 12`}
    >
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="leaf" size={24} color={T.TEXT} />
        </View>
        <Text style={styles.overline}>
          Reversal Plan · Week {progress.week} of 12
        </Text>
      </View>
      <Text style={styles.title}>
        {phase ? `${phase.title} phase` : "Your reversal plan"}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress.percent}%` }]} />
      </View>
      <Text style={styles.body}>
        {phase ? phase.focus : "Keep going — small steps, every day."}
      </Text>
      {next ? (
        <Text style={styles.next}>
          Next: {next.title} — week {next.week}
        </Text>
      ) : (
        <Text style={styles.next}>
          Final week — review your numbers with your doctor.
        </Text>
      )}
      <View style={styles.cta}>
        <Text style={styles.ctaText}>View your plan</Text>
        <Ionicons name="arrow-forward" size={15} color={T.TEXT} />
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#AED581",
    borderRadius: 28,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(30,43,26,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  overline: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: "800",
    color: T.TEXT,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    flex: 1,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 22,
    fontWeight: "800",
    color: T.TEXT,
    letterSpacing: -0.4,
    lineHeight: 27,
    marginBottom: 12,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.55)",
    overflow: "hidden",
    marginBottom: 12,
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: T.TEXT,
  },
  body: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: T.TEXT,
    lineHeight: 20,
    marginBottom: 6,
  },
  next: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: "700",
    color: T.TEXT,
    opacity: 0.75,
    marginBottom: 14,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 13,
    gap: 6,
  },
  ctaText: {
    fontFamily: FONTS.display,
    fontSize: 14,
    fontWeight: "800",
    color: T.TEXT,
  },
});
