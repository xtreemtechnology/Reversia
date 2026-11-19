// src/features/reversal/screens/ReversalSetupScreen.js
// First-run setup for the 12-week Reversal Plan: pick a baseline HbA1c range,
// a fasting sugar range and a primary goal, then save the plan to Firestore.

import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import { FONTS } from "../../../theme/tokens";
import FadeIn from "../../home/components/FadeIn";
import PressScale from "../../home/components/PressScale";
import { startReversalPlan } from "../services/reversalService";
import {
  HBA1C_OPTIONS,
  FASTING_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  SAFETY_NOTE,
} from "../data/planData";
import { trackEvent } from "../../../utils/analytics";

export default function ReversalSetupScreen({ navigation }) {
  const { colors } = useTheme();
  const [hba1c, setHba1c] = useState(null);
  const [fasting, setFasting] = useState(null);
  const [primaryGoal, setPrimaryGoal] = useState(null);
  const [saving, setSaving] = useState(false);

  const styles = makeStyles(colors);

  const handleSave = async () => {
    if (!hba1c && !fasting) {
      Alert.alert(
        "Add a baseline",
        "Please choose your most recent HbA1c range or your fasting sugar range so we can track your progress."
      );
      return;
    }
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Sign in first", "Please sign in before starting your plan.");
      return;
    }
    setSaving(true);
    try {
      await startReversalPlan(uid, {
        baselineHba1c: hba1c,
        baselineFasting: fasting,
        primaryGoal,
        startDate: new Date().toISOString(),
      });
      trackEvent("reversal_plan_started", {
        baselineHba1c: hba1c || null,
        baselineFasting: fasting || null,
        primaryGoal: primaryGoal || null,
      }).catch(() => {});
      navigation?.goBack();
    } catch (error) {
      Alert.alert(
        "Could not save your plan",
        "Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderOptions = (options, selected, onSelect) =>
    options.map((option) => {
      const active = selected === option.value;
      return (
        <PressScale
          key={option.value}
          style={[styles.option, active && styles.optionActive]}
          onPress={() => onSelect(option.value)}
          accessibilityLabel={option.label}
        >
          <Ionicons
            name={active ? "radio-button-on" : "radio-button-off"}
            size={20}
            color={active ? colors.primary : colors.mutedForeground}
          />
          <Text style={[styles.optionText, active && styles.optionTextActive]}>
            {option.label}
          </Text>
        </PressScale>
      );
    });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
          <Text style={styles.backText}>Back to your plan</Text>
        </TouchableOpacity>

        <FadeIn delay={0}>
          <Text style={styles.title}>Set up your plan</Text>
          <Text style={styles.subtitle}>
            Your 12 weeks start today. We use these numbers as your baseline so
            you can see how far you have come.
          </Text>
        </FadeIn>

        <FadeIn delay={60}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your most recent HbA1c</Text>
            {renderOptions(HBA1C_OPTIONS, hba1c, setHba1c)}
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your fasting blood sugar</Text>
            {renderOptions(FASTING_OPTIONS, fasting, setFasting)}
          </View>
        </FadeIn>

        <FadeIn delay={180}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your main goal</Text>
            {renderOptions(PRIMARY_GOAL_OPTIONS, primaryGoal, setPrimaryGoal)}
          </View>
        </FadeIn>

        <FadeIn delay={240}>
          <View style={[styles.card, styles.noteCard]}>
            <Text style={styles.cardTitle}>Before you start</Text>
            <Text style={styles.body}>{SAFETY_NOTE}</Text>
          </View>
        </FadeIn>

        <FadeIn delay={300}>
          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? "Saving…" : "Start my 12-week plan"}
            </Text>
          </TouchableOpacity>
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
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    backText: {
      fontFamily: FONTS.body,
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary,
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
    noteCard: {
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
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingVertical: 13,
      paddingHorizontal: 14,
    },
    optionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.muted,
    },
    optionText: {
      flex: 1,
      fontFamily: FONTS.body,
      fontSize: 15,
      color: colors.text,
      lineHeight: 21,
    },
    optionTextActive: {
      fontWeight: "600",
      color: colors.text,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 15,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      fontFamily: FONTS.display,
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}
