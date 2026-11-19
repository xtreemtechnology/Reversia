// src/features/reversal/screens/WeeklyCheckInScreen.js
// Weekly check-in for the Reversal Plan: fasting sugar, HbA1c (optional),
// natural meals and post-meal walks this week, energy and notes. The week
// is worked out from the plan start date, and the change since the last
// check-in is shown when one exists.

import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import { FONTS } from "../../../theme/tokens";
import FadeIn from "../../home/components/FadeIn";
import PressScale from "../../home/components/PressScale";
import {
  getReversalPlan,
  listWeeklyCheckIns,
  saveWeeklyCheckIn,
  getCurrentWeek,
} from "../services/reversalService";
import { trackEvent } from "../../../utils/analytics";

const ENERGY_OPTIONS = [
  { value: 1, label: "1 — Very low" },
  { value: 2, label: "2 — Low" },
  { value: 3, label: "3 — Okay" },
  { value: 4, label: "4 — Good" },
  { value: 5, label: "5 — Great" },
];

function parseCount(text, max) {
  if (text === "" || text === null || text === undefined) return null;
  const value = parseInt(String(text), 10);
  if (Number.isNaN(value)) return null;
  return Math.min(Math.max(value, 0), max);
}

export default function WeeklyCheckInScreen({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [previousCheckIn, setPreviousCheckIn] = useState(null);
  const [fastingSugar, setFastingSugar] = useState("");
  const [hba1c, setHba1c] = useState("");
  const [naturalMeals, setNaturalMeals] = useState("");
  const [walksAfterMeals, setWalksAfterMeals] = useState("");
  const [energy, setEnergy] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
    try {
      const [loadedPlan, loadedCheckIns] = await Promise.all([
        getReversalPlan(uid).catch(() => null),
        listWeeklyCheckIns(uid).catch(() => []),
      ]);
      setPlan(loadedPlan);
      setPreviousCheckIn(
        Array.isArray(loadedCheckIns) && loadedCheckIns.length > 0
          ? loadedCheckIns[0]
          : null
      );
    } catch (error) {
      console.warn("Failed to load reversal check-in", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const week = plan?.startDate ? getCurrentWeek(plan.startDate) : 0;

  const styles = makeStyles(colors);

  const fastingNumber =
    fastingSugar.trim() === "" ? null : parseFloat(fastingSugar);
  const fastingValid =
    fastingNumber === null ||
    (!Number.isNaN(fastingNumber) && fastingNumber > 0 && fastingNumber < 1000);
  const previousFasting =
    previousCheckIn?.fastingSugar != null
      ? Number(previousCheckIn.fastingSugar)
      : null;
  const fastingChange =
    fastingValid && fastingNumber !== null && previousFasting !== null
      ? Math.round((fastingNumber - previousFasting) * 10) / 10
      : null;

  const handleSave = async () => {
    const meals = parseCount(naturalMeals, 21);
    const walks = parseCount(walksAfterMeals, 21);
    if (!fastingValid) {
      Alert.alert(
        "Check your fasting sugar",
        "Please enter a valid fasting sugar in mg/dL, for example 110."
      );
      return;
    }
    if (fastingNumber === null && meals === null) {
      Alert.alert(
        "Add something first",
        "Please add at least your fasting sugar or how many natural meals you ate this week."
      );
      return;
    }
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Sign in first", "Please sign in before saving a check-in.");
      return;
    }
    if (!plan) {
      Alert.alert(
        "No plan yet",
        "Please start your 12-week plan first, then come back for your check-in."
      );
      navigation?.navigate("PlanSetup");
      return;
    }
    setSaving(true);
    try {
      await saveWeeklyCheckIn(uid, {
        week,
        fastingSugar: fastingNumber,
        hba1c: hba1c.trim() === "" ? null : parseFloat(hba1c),
        naturalMeals: meals,
        walksAfterMeals: walks,
        energy,
        notes: notes.trim(),
      });
      trackEvent("reversal_weekly_checkin", { week }).catch(() => {});
      Alert.alert(
        "Check-in saved",
        `Week ${week} is saved. Well done — keep going.`,
        [
          {
            text: "Done",
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Could not save your check-in",
        "Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Loading your check-in…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.title}>No plan yet</Text>
          <Text style={styles.body}>
            Start your 12-week plan first, then come back here for your weekly
            check-in.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation?.navigate("PlanSetup")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Set up your plan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            <Text style={styles.title}>Week {week} check-in</Text>
            <Text style={styles.subtitle}>
              A quick look at how this week went. Small steps count.
            </Text>
          </FadeIn>

          {previousFasting !== null ? (
            <FadeIn delay={60}>
              <View style={styles.heroCard}>
                <Text style={styles.heroOverline}>Last check-in</Text>
                <Text style={styles.heroBig}>
                  {previousFasting}
                  <Text style={styles.heroBigUnit}> mg/dL</Text>
                </Text>
                <Text style={styles.heroSub}>
                  Fasting sugar
                  {previousCheckIn?.week
                    ? ` in week ${previousCheckIn.week}`
                    : ""}
                  .
                </Text>
                {fastingChange !== null ? (
                  <Text style={styles.heroChange}>
                    {fastingChange < 0
                      ? `Down ${Math.abs(
                          fastingChange
                        )} mg/dL since then — nice progress.`
                      : fastingChange > 0
                      ? `Up ${fastingChange} mg/dL since then — one week does not define your journey.`
                      : "Same as last time — steady is good."}
                  </Text>
                ) : null}
              </View>
            </FadeIn>
          ) : null}

          <FadeIn delay={120}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fasting sugar (mg/dL)</Text>
              <TextInput
                style={styles.input}
                value={fastingSugar}
                onChangeText={setFastingSugar}
                placeholder="For example 110"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
              <Text style={styles.muted}>
                Normal fasting is below 100, pre-diabetes 100–125, diabetes 126
                and above.
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={180}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>HbA1c % (optional)</Text>
              <TextInput
                style={styles.input}
                value={hba1c}
                onChangeText={setHba1c}
                placeholder="For example 6.8"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="decimal-pad"
              />
              <Text style={styles.muted}>
                Only add this when you have a new lab result — no need to test
                every week.
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={240}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Natural meals this week (0–21)
              </Text>
              <TextInput
                style={styles.input}
                value={naturalMeals}
                onChangeText={setNaturalMeals}
                placeholder="For example 12"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
              <Text style={styles.muted}>
                Count meals built on whole, natural foods — beans, vegetables,
                fish, eggs, oats, ofada rice.
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={300}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Walks after meals (0–21)</Text>
              <TextInput
                style={styles.input}
                value={walksAfterMeals}
                onChangeText={setWalksAfterMeals}
                placeholder="For example 9"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
              <Text style={styles.muted}>
                A 10-minute walk after a meal helps keep sugar steadier.
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={360}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>How is your energy?</Text>
              {ENERGY_OPTIONS.map((option) => {
                const active = energy === option.value;
                return (
                  <PressScale
                    key={option.value}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => setEnergy(option.value)}
                    accessibilityLabel={option.label}
                  >
                    <Ionicons
                      name={active ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={active ? colors.primary : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        active && styles.optionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </PressScale>
                );
              })}
            </View>
          </FadeIn>

          <FadeIn delay={420}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="What worked this week? What was hard?"
                placeholderTextColor={colors.mutedForeground}
                multiline
              />
            </View>
          </FadeIn>

          <FadeIn delay={480}>
            <TouchableOpacity
              style={[styles.primaryButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Saving…" : "Save check-in"}
              </Text>
            </TouchableOpacity>
          </FadeIn>
        </ScrollView>
      </KeyboardAvoidingView>
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
    empty: {
      flex: 1,
      padding: 20,
      gap: 12,
      justifyContent: "center",
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
    muted: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    heroCard: {
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 28,
      padding: 22,
      gap: 4,
    },
    heroOverline: {
      fontFamily: FONTS.body,
      fontSize: 11,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    heroBig: {
      fontFamily: FONTS.display,
      fontSize: 44,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -1,
      lineHeight: 48,
    },
    heroBigUnit: {
      fontSize: 18,
      fontWeight: "700",
    },
    heroSub: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    heroChange: {
      fontFamily: FONTS.body,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      lineHeight: 20,
      marginTop: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      height: 52,
      paddingHorizontal: 18,
      fontFamily: FONTS.body,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    notesInput: {
      height: "auto",
      minHeight: 96,
      borderRadius: 20,
      paddingVertical: 14,
      textAlignVertical: "top",
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
