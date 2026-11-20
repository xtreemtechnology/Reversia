// src/features/onboarding/post-onboarding/SetupStates.jsx
//
// The non-question screens of the stepped setup flow: the intro
// (Figma kit screen 13), the generating state (screen 22) and the
// complete summary (screen 23). Layout only comes from the kit —
// Reversia palette and copy throughout. The complete screen lists
// only the answers the user actually gave: no chart, no invented
// plan, no timeline, no medical claims.

import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, T } from "../../../theme/tokens";
import ILLUSTRATIONS from "../../illustrations/illustrations";
import { DEEP_GREEN, PrimaryButton } from "./SetupChrome";

// ── Intro · "Prepare your personal information" ─────────────────────────────

export function IntroStep({ onContinue }) {
  return (
    <View style={styles.introRoot}>
      <View style={styles.introArtArea}>
        <Image
          source={ILLUSTRATIONS["onboard-understand"]}
          style={styles.introArt}
          resizeMode="contain"
        />
      </View>
      <View style={styles.introPanel}>
        <Text style={styles.introHeadline}>
          Prepare your personal information
        </Text>
        <Text style={styles.introSubtext}>
          Answer a few quick questions so Reversia can shape your plan, meals
          and reminders around you.
        </Text>
        <View style={styles.introButton}>
          <PrimaryButton label="Continue" onPress={onContinue} tone="light" />
        </View>
      </View>
    </View>
  );
}

// ── Generating ───────────────────────────────────────────────────────────────

export function GeneratingStep({ error, onRetry, onSkip }) {
  return (
    <View style={styles.generatingRoot}>
      {error ? (
        <>
          <Ionicons name="alert-circle-outline" size={56} color={T.DANGER} />
          <Text style={styles.generatingHeadline}>
            Couldn&apos;t save your answers
          </Text>
          <Text style={styles.generatingSubtext}>
            Check your connection and try again — nothing was lost.
          </Text>
          <View style={styles.generatingRetry}>
            <PrimaryButton label="Try again" onPress={onRetry} />
          </View>
          <TouchableOpacity
            onPress={onSkip}
            activeOpacity={0.6}
            style={styles.generatingSkip}
          >
            <Text style={styles.generatingSkipText}>Skip for now</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={T.PRIMARY} />
          <Text style={styles.generatingHeadline}>Preparing your plan</Text>
          <Text style={styles.generatingSubtext}>
            Setting up your plan and saving your answers…
          </Text>
        </>
      )}
    </View>
  );
}

// ── Complete ─────────────────────────────────────────────────────────────────

export function CompleteStep({ summaryRows, onEnter }) {
  return (
    <View style={styles.completeRoot}>
      <ScrollView
        contentContainerStyle={styles.completeScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.completeHeadline}>Everything is ready!</Text>
        <Text style={styles.completeSubtext}>
          Here&apos;s what you set up — Reversia will shape things around you.
        </Text>
        <View style={styles.summaryCard}>
          {summaryRows.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.summaryRow,
                index < summaryRows.length - 1 && styles.summaryRowDivider,
              ]}
            >
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.completeButton}>
        <PrimaryButton label="Enter Reversia" onPress={onEnter} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  introRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  introArtArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  introArt: {
    width: "100%",
    height: "100%",
  },
  introPanel: {
    backgroundColor: DEEP_GREEN,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 32,
    alignItems: "center",
  },
  introHeadline: {
    fontFamily: FONTS.display,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  introSubtext: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 21,
    color: "#EFF6E4",
    textAlign: "center",
    maxWidth: 320,
  },
  introButton: {
    alignSelf: "stretch",
    marginTop: 24,
  },
  generatingRoot: {
    flex: 1,
    backgroundColor: T.BG,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  generatingHeadline: {
    fontFamily: FONTS.display,
    fontSize: 20,
    fontWeight: "700",
    color: T.TEXT,
    textAlign: "center",
  },
  generatingSubtext: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 21,
    color: T.MUTED,
    textAlign: "center",
  },
  generatingRetry: {
    alignSelf: "stretch",
    marginTop: 8,
  },
  generatingSkip: {
    paddingVertical: 12,
  },
  generatingSkipText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: T.MUTED,
  },
  completeRoot: {
    flex: 1,
    backgroundColor: T.BG,
  },
  completeScroll: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
    gap: 12,
  },
  completeHeadline: {
    fontFamily: FONTS.display,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
    color: DEEP_GREEN,
    textAlign: "center",
  },
  completeSubtext: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 21,
    color: T.MUTED,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: T.SURFACE,
    borderWidth: 1,
    borderColor: T.BORDER,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  summaryRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: T.BORDER,
  },
  summaryLabel: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: T.MUTED,
  },
  summaryValue: {
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: "600",
    color: T.TEXT,
    textAlign: "right",
    flexShrink: 1,
  },
  completeButton: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
