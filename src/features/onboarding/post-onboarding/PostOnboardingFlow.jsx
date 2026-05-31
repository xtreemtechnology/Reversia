import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";
import { auth } from "../../../config/firebase";
import { updateUserProfile } from "../../profile/services/profileService";
import { trackEvent } from "../../../utils/analytics";
import { useTheme } from "../../../theme/ThemeProvider";

const SCREENS = ["hba1c", "fasting", "food", "fears", "goals"];

const HBA_OPTIONS = [
  { value: "below_5_7", label: "Below 5.7% (normal)" },
  { value: "5_7_6_4", label: "5.7-6.4% (prediabetes)" },
  { value: "6_5_7", label: "6.5-7% (diabetes)" },
  { value: "7_8", label: "7-8% (needs attention)" },
  { value: "above_8", label: "Above 8% (high risk)" },
  { value: "unknown", label: "I don't know yet" },
];

const FASTING_OPTIONS = [
  { value: "below_100", label: "Below 100 mg/dL (normal)" },
  { value: "100_125", label: "100-125 mg/dL (prediabetes)" },
  { value: "126_150", label: "126-150 mg/dL (diabetes)" },
  { value: "151_200", label: "151-200 mg/dL (needs attention)" },
  { value: "above_200", label: "Above 200 mg/dL (high risk)" },
  { value: "unknown", label: "I don't know yet" },
];

const FOOD_OPTIONS = [
  { value: "jollof", label: "Jollof rice with chicken/fish" },
  { value: "swallow", label: "Swallow (eba/garri/fufu/amala) with soup" },
  { value: "beans", label: "Beans porridge / Moi moi" },
  { value: "yam", label: "Yam / Plantain (fried/boiled)" },
  { value: "pounded", label: "Pounded yam with egusi/ogbono" },
  { value: "bread", label: "Bread and tea" },
  { value: "indomie", label: "Indomie noodles" },
];

const FEAR_OPTIONS = [
  { value: "amputation", label: "Losing a limb (amputation)" },
  { value: "blindness", label: "Going blind" },
  { value: "kidney", label: "Kidney damage / dialysis" },
  { value: "meds", label: "Being on medication forever" },
  { value: "food", label: "Not eating my favorite Nigerian foods" },
  { value: "children", label: "Passing diabetes to my children" },
  { value: "nothing", label: "Nothing, I'm hopeful" },
];

const GOAL_OPTIONS = [
  { value: "off_medication", label: "Get off diabetes medication completely" },
  { value: "eat_fav", label: "Eat my favorite Nigerian foods without fear" },
  { value: "energized", label: "Feel energized and in control" },
  { value: "stop_worry", label: "Stop worrying about complications" },
  { value: "save_money", label: "Save money on meds and visits" },
  { value: "live_long", label: "Live to see grandchildren" },
  { value: "help_family", label: "Help my family stay healthy" },
  { value: "understand_body", label: "Finally understand my body" },
];

export default function PostOnboardingFlow({ onComplete, onSkip, navigation }) {
  const theme = useTheme();
  const colors = useMemo(
    () => ({
      background: "#231F1C",
      foreground: "#F5F5F4",
      muted: "#A8A29E",
      card: "#2D2825",
      primary: "#E07A5F",
      ...theme.colors,
    }),
    [theme]
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    primaryGoal: null,
    fasting: null,
    hba1c: null,
    typicalStaples: [],
    fears: [],
    successGoals: [],
  });

  const current = SCREENS[step];

  const toggleMulti = (key, value) => {
    setAnswers((s) => {
      const arr = Array.isArray(s[key]) ? s[key] : [];
      const next = arr.includes(value)
        ? arr.filter((a) => a !== value)
        : [...arr, value];
      return { ...s, [key]: next };
    });
  };

  const setSingle = (key, value) => setAnswers((s) => ({ ...s, [key]: value }));

  const handleContinue = async () => {
    if (current === "hba1c") {
      await trackEvent("post_onboarding_hba1c", {
        value: answers.hba1c || null,
        userId: auth.currentUser?.uid || null,
      });
    }
    if (current === "fasting") {
      await trackEvent("post_onboarding_fasting", {
        value: answers.fasting || null,
        userId: auth.currentUser?.uid || null,
      });
    }
    if (current === "food") {
      await trackEvent("post_onboarding_food", {
        value: answers.typicalStaples || [],
        userId: auth.currentUser?.uid || null,
      });
    }
    if (current === "fears") {
      await trackEvent("post_onboarding_fears", {
        value: answers.fears || [],
        userId: auth.currentUser?.uid || null,
      });
    }
    if (current === "goals") {
      await trackEvent("post_onboarding_goals", {
        value: answers.successGoals || [],
        userId: auth.currentUser?.uid || null,
      });
    }

    if (step < SCREENS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    const uid = auth.currentUser?.uid;
    if (uid) {
      try {
        await updateUserProfile(uid, {
          primaryHba1c: answers.hba1c || null,
          fastingBloodSugar: answers.fasting || null,
          typicalStaples: answers.typicalStaples || [],
          healthFears: answers.fears || [],
          primaryGoal: answers.primaryGoal || null,
          successGoals: answers.successGoals || [],
          questionnaireUpdatedAt: new Date().toISOString(),
          questionnaireCompletedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn("Failed to persist post-onboarding", e);
      }
    }

    await trackEvent("post_onboarding_completed", {
      userId: auth.currentUser?.uid || null,
    });
    if (typeof onComplete === "function") {
      onComplete(answers);
    } else if (navigation) {
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const handleSkip = async () => {
    await trackEvent("post_onboarding_skipped", {
      step: current,
      userId: auth.currentUser?.uid || null,
    });
    if (step < SCREENS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    if (typeof onSkip === "function") {
      onSkip();
    } else if (navigation) {
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.educationCard}>
          {current === "hba1c" && (
            <>
              <Text
                style={[styles.educationTitle, { color: colors.foreground }]}
              >
                ⚠️ DID YOU KNOW?
              </Text>
              <Text
                style={[styles.educationBody, { color: colors.foreground }]}
              >
                Most people only discover they have diabetes when complications
                have already started. Knowing your HBA1c today can prevent 80%
                of future complications.
              </Text>
            </>
          )}
          {current === "fasting" && (
            <>
              <Text
                style={[styles.educationTitle, { color: colors.foreground }]}
              >
                🌙 WHILE YOU SLEEP...
              </Text>
              <Text
                style={[styles.educationBody, { color: colors.foreground }]}
              >
                Your fasting blood sugar is the first warning sign. Most people
                feel nothing until it's too late — every 10 mg/dL above normal
                raises heart disease risk.
              </Text>
            </>
          )}
          {current === "food" && (
            <>
              <Text
                style={[styles.educationTitle, { color: colors.foreground }]}
              >
                🍛 YOUR FAVORITE MEALS
              </Text>
              <Text
                style={[styles.educationBody, { color: colors.foreground }]}
              >
                A typical plate of Jollof rice raises blood sugar faster than 2
                tablespoons of pure sugar. But protein, fiber order, and short
                walks reduce spikes.
              </Text>
            </>
          )}
          {current === "fears" && (
            <>
              <Text
                style={[styles.educationTitle, { color: colors.foreground }]}
              >
                😔 WHAT KEEPS YOU UP AT NIGHT?
              </Text>
              <Text
                style={[styles.educationBody, { color: colors.foreground }]}
              >
                You're not alone — many fear complications like amputation or
                blindness. Reversia shows paths others have walked.
              </Text>
            </>
          )}
          {current === "goals" && (
            <>
              <Text
                style={[styles.educationTitle, { color: colors.foreground }]}
              >
                ✨ IMAGINE THIS...
              </Text>
              <Text
                style={[styles.educationBody, { color: colors.foreground }]}
              >
                Imagine checking your sugar and seeing the progress you want.
                Over 3000 Nigerians have done it — what would success look like
                for you?
              </Text>
            </>
          )}
        </View>

        <View style={styles.questionBlock}>
          {current === "hba1c" && (
            <View>
              <Text
                style={[styles.questionTitle, { color: colors.foreground }]}
              >
                What's your most recent HBA1c?
              </Text>
              {HBA_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  onPress={() => setSingle("hba1c", o.value)}
                  style={[
                    styles.optionRow,
                    answers.hba1c === o.value && styles.optionActive,
                  ]}
                >
                  <Text
                    style={[styles.optionText, { color: colors.foreground }]}
                  >
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {current === "fasting" && (
            <View>
              <Text
                style={[styles.questionTitle, { color: colors.foreground }]}
              >
                What's your most recent fasting blood sugar?
              </Text>
              {FASTING_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  onPress={() => setSingle("fasting", o.value)}
                  style={[
                    styles.optionRow,
                    answers.fasting === o.value && styles.optionActive,
                  ]}
                >
                  <Text
                    style={[styles.optionText, { color: colors.foreground }]}
                  >
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {current === "food" && (
            <View>
              <Text
                style={[styles.questionTitle, { color: colors.foreground }]}
              >
                What are your favorite Nigerian meals? (Select all)
              </Text>
              {FOOD_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  onPress={() => toggleMulti("typicalStaples", o.value)}
                  style={[
                    styles.optionRow,
                    (answers.typicalStaples || []).includes(o.value) &&
                      styles.optionActive,
                  ]}
                >
                  <Text
                    style={[styles.optionText, { color: colors.foreground }]}
                  >
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {current === "fears" && (
            <View>
              <Text
                style={[styles.questionTitle, { color: colors.foreground }]}
              >
                What worries you most about your health? (Select all)
              </Text>
              {FEAR_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  onPress={() => toggleMulti("fears", o.value)}
                  style={[
                    styles.optionRow,
                    (answers.fears || []).includes(o.value) &&
                      styles.optionActive,
                  ]}
                >
                  <Text
                    style={[styles.optionText, { color: colors.foreground }]}
                  >
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {current === "goals" && (
            <View>
              <Text
                style={[styles.questionTitle, { color: colors.foreground }]}
              >
                What would success look like for you? (Select up to 3)
              </Text>
              {GOAL_OPTIONS.map((o) => {
                const selected = (answers.successGoals || []).includes(o.value);
                return (
                  <TouchableOpacity
                    key={o.value}
                    onPress={() => {
                      // limit to 3
                      setAnswers((s) => {
                        const arr = Array.isArray(s.successGoals)
                          ? s.successGoals
                          : [];
                        if (arr.includes(o.value))
                          return {
                            ...s,
                            successGoals: arr.filter((a) => a !== o.value),
                          };
                        if (arr.length >= 3) return s;
                        return { ...s, successGoals: [...arr, o.value] };
                      });
                    }}
                    style={[styles.optionRow, selected && styles.optionActive]}
                  >
                    <Text
                      style={[styles.optionText, { color: colors.foreground }]}
                    >
                      {o.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <View style={styles.secondaryActions}>
            <TouchableOpacity
              onPress={handleBack}
              disabled={step === 0}
              style={[styles.backBtn, step === 0 && styles.backBtnDisabled]}
            >
              <Text
                style={[styles.backText, step === 0 && styles.backTextDisabled]}
              >
                Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: colors.muted }]}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            style={[styles.continueBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.continueText}>
              {step === SCREENS.length - 1
                ? "Take me to Reversia →"
                : "Continue →"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { padding: 20, gap: 18 },
  educationCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 18,
    borderRadius: 14,
  },
  educationTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  educationBody: { fontSize: 15, lineHeight: 20 },
  questionBlock: { marginTop: 14, gap: 12 },
  questionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    marginBottom: 8,
  },
  optionActive: {
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  optionText: { fontSize: 15 },
  actions: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  secondaryActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  backBtn: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 999 },
  backBtnDisabled: { opacity: 0.35 },
  backText: { fontSize: 15, fontWeight: "600" },
  backTextDisabled: { opacity: 0.7 },
  skipBtn: { paddingVertical: 12 },
  skipText: { fontSize: 15 },
  continueBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  continueText: { color: "#fff", fontWeight: "700" },
});
