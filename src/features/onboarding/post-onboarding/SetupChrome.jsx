// src/features/onboarding/post-onboarding/SetupChrome.jsx
//
// Shared chrome for the stepped setup flow, following the Figma kit's
// Account Setup screens (layout only — Reversia palette and copy):
// a header with a back chevron and a Skip pill, a centred step counter,
// a centred question headline + subtext, and a deep-green pill button
// pinned at the bottom of the screen.

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, T } from "../../../theme/tokens";
import FadeIn from "../../home/components/FadeIn";

// Deep green used for headlines, the primary button and selected states.
// Same value as HOME_CURVE_GREEN in the Home curve header.
export const DEEP_GREEN = "#3C5F27";

export function SetupHeader({ onBack, onSkip, canGoBack }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        disabled={!canGoBack}
        activeOpacity={0.6}
        style={[styles.backBtn, !canGoBack && styles.backBtnHidden]}
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={24} color={T.TEXT} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSkip}
        activeOpacity={0.6}
        style={styles.skipPill}
        accessibilityLabel="Skip setup"
      >
        <Text style={styles.skipPillText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

export function QuestionHeader({ stepNumber, totalSteps, headline, subtext }) {
  return (
    <View style={styles.questionBlock}>
      {/* Keyed by step so the number fades/slides in again on every change. */}
      <FadeIn key={stepNumber}>
        <Text style={styles.counter}>
          <Text style={styles.counterCurrent}>{stepNumber}</Text>
          <Text style={styles.counterRest}> / {totalSteps}</Text>
        </Text>
      </FadeIn>
      <Text style={styles.headline}>{headline}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled, tone = "dark" }) {
  const light = tone === "light";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.primaryButton,
        light && styles.primaryButtonLight,
        disabled && styles.primaryButtonDisabled,
      ]}
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.primaryButtonText,
          light && styles.primaryButtonTextLight,
        ]}
      >
        {label}
      </Text>
      <Ionicons
        name="arrow-forward"
        size={18}
        color={light ? "#1E2B1A" : "#FFFFFF"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    height: 60,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnHidden: {
    opacity: 0,
  },
  skipPill: {
    borderWidth: 1,
    borderColor: T.BORDER,
    backgroundColor: T.SURFACE,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  skipPillText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: "500",
    color: T.TEXT,
  },
  questionBlock: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  counter: {
    fontFamily: FONTS.body,
    fontSize: 14,
    marginBottom: 16,
  },
  counterCurrent: {
    color: DEEP_GREEN,
    fontWeight: "700",
  },
  counterRest: {
    color: T.MUTED,
  },
  headline: {
    fontFamily: FONTS.display,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
    color: DEEP_GREEN,
    textAlign: "center",
    marginBottom: 12,
  },
  subtext: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 21,
    color: T.MUTED,
    textAlign: "center",
    maxWidth: 320,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 60,
    borderRadius: 999,
    backgroundColor: DEEP_GREEN,
  },
  primaryButtonLight: {
    backgroundColor: "#FFFFFF",
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  primaryButtonTextLight: {
    color: "#1E2B1A",
  },
});
