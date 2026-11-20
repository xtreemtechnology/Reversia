// src/features/onboarding/post-onboarding/PostOnboardingFlow.jsx
//
// Stepped account-setup flow, following the Figma MDI kit's Account
// Setup screens 13–23 (layout only — Reversia palette and copy):
// intro ("Prepare your personal information") → one question per
// screen (name, gender, age, weight, height, goal, target weight,
// journey) → generating → complete.
//
// The flow only runs when a Firebase user exists: App.js does not
// render it before auth, and the save below refuses to pretend it
// succeeded when there is no uid. Answers are saved in a single
// updateUserProfile merge-save while the generating screen shows
// (minimum ~1.5s), and the per-uid completion flag is written here
// inside the flow, so both render paths set it:
//   - Path A: App.js overlay, with onComplete / onSkip props.
//   - Path B: AuthNavigator "PostOnboarding" modal route, with no
//     props — completing navigates back to AuthLanding (the auth
//     stack's initial route), never to the non-existent "Main" route.
// The Reversal Plan baseline (HbA1c / fasting) is NOT collected here;
// it lives separately in ReversalSetupScreen when the plan starts.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, SafeAreaView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateProfile } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { updateUserProfile } from "../../profile/services/profileService";
import { trackEvent } from "../../../utils/analytics";
import { useTheme } from "../../../theme/ThemeProvider";
import { PRIMARY_GOAL_OPTIONS } from "../../reversal/data/planData";
import { SetupHeader, QuestionHeader, PrimaryButton } from "./SetupChrome";
import {
  NameStep,
  GenderStep,
  AgeStep,
  MeasureStep,
  GoalStep,
  TargetWeightStep,
  JourneyStep,
  JOURNEY_OPTIONS,
  weightDisplay,
  heightDisplay,
} from "./SetupSteps";
import { IntroStep, GeneratingStep, CompleteStep } from "./SetupStates";
import {
  splitName,
  formatWeight,
  formatHeight,
  kgToLbs,
  cmToFeetInches,
} from "./setupFormat";

const POST_ONBOARDING_KEY_PREFIX = "@reversia_post_onboarding_complete_";

const SCREENS = [
  "intro",
  "name",
  "gender",
  "age",
  "weight",
  "height",
  "goal",
  "target",
  "journey",
  "generating",
  "complete",
];

const COMPLETE_INDEX = SCREENS.indexOf("complete");

const QUESTION_META = {
  name: {
    number: 1,
    headline: "What is your name?",
    subtext: "Please give your true name — Reversia uses it to greet you.",
  },
  gender: {
    number: 2,
    headline: "What is your gender?",
    subtext: "Please give a true answer to the following question.",
  },
  age: {
    number: 3,
    headline: "How old are you?",
    subtext: "To give you a better experience, we need to know your age.",
  },
  weight: {
    number: 4,
    headline: "What is your weight?",
    subtext: "To give you a better experience, we need to know your weight.",
  },
  height: {
    number: 5,
    headline: "What is your height?",
    subtext: "To give you a better experience, we need to know your height.",
  },
  goal: {
    number: 6,
    headline: "What is your goal?",
    subtext: "Please give a true answer to the following question.",
  },
  target: {
    number: 7,
    headline: "What is your target weight?",
    subtext: "Choose a target to work towards, one step at a time.",
  },
  journey: {
    number: 8,
    headline: "Choose your pace",
    subtext: "Pick the pace that fits your life right now.",
  },
};

// Per-step analytics, same shape as the old flow: post_onboarding_<step>.
// The name itself is never tracked — only that the step was answered.
const STEP_EVENTS = {
  intro: ["post_onboarding_intro", null],
  name: ["post_onboarding_name", null],
  gender: ["post_onboarding_gender", (a) => a.gender],
  age: ["post_onboarding_age", (a) => a.age],
  weight: ["post_onboarding_weight", (a) => a.weightKg],
  height: ["post_onboarding_height", (a) => a.heightCm],
  goal: ["post_onboarding_goal", (a) => a.primaryGoal],
  target: ["post_onboarding_target", (a) => a.targetWeightKg ?? a.weightKg],
  journey: ["post_onboarding_journey", (a) => a.journey],
};

const GENDER_LABELS = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
};

const WEIGHT_UNITS = [
  { value: "kg", label: "kg" },
  { value: "lbs", label: "lbs" },
];

const HEIGHT_UNITS = [
  { value: "cm", label: "cm" },
  { value: "ft", label: "ft" },
];

export default function PostOnboardingFlow({ onComplete, onSkip, navigation }) {
  const theme = useTheme();
  const colors = useMemo(
    () => ({
      background: "#E9F1E2",
      foreground: "#1E2B1A",
      muted: "#7A8A72",
      card: "#FFFFFF",
      primary: "#8BC34A",
      ...theme.colors,
    }),
    [theme]
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    // Prefilled from signup: the account already has a displayName.
    fullName: auth.currentUser?.displayName || "",
    gender: null,
    age: 30,
    weightKg: 70,
    weightUnit: "kg",
    heightCm: 170,
    heightUnit: "cm",
    primaryGoal: null,
    targetWeightKg: null,
    targetUnit: "kg",
    journey: null,
  });
  const [saveError, setSaveError] = useState(false);
  const [saveAttempt, setSaveAttempt] = useState(0);
  const saveStartedRef = useRef(false);

  // The save effect reads the final answers through a ref so it runs
  // exactly once per attempt, without stale-closure or dep churn.
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const current = SCREENS[step];
  const targetKg = answers.targetWeightKg ?? answers.weightKg;

  // The intro screen is white edge to edge; the rest of the flow sits
  // on the sage theme background.
  const rootStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: current === "intro" ? "#FFFFFF" : colors.background,
    }),
    [colors.background, current]
  );

  const setAnswer = (key, value) => setAnswers((s) => ({ ...s, [key]: value }));

  const canContinue =
    current === "name"
      ? answers.fullName.trim().length > 0
      : current === "gender"
      ? answers.gender !== null
      : current === "goal"
      ? answers.primaryGoal !== null
      : current === "journey"
      ? answers.journey !== null
      : true;

  const handleContinue = async () => {
    const [event, getValue] = STEP_EVENTS[current] || [];
    if (event) {
      await trackEvent(event, {
        value: getValue ? getValue(answers) : null,
        userId: auth.currentUser?.uid || null,
      });
    }
    if (step < SCREENS.length - 1) {
      setStep((s) => s + 1);
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
    if (typeof onSkip === "function") {
      onSkip();
    } else if (navigation) {
      navigation.navigate("AuthLanding");
    }
  };

  const handleEnter = () => {
    if (typeof onComplete === "function") {
      onComplete(answers);
    } else if (navigation) {
      navigation.navigate("AuthLanding");
    }
  };

  const handleRetrySave = () => {
    setSaveError(false);
    saveStartedRef.current = false;
    setSaveAttempt((a) => a + 1);
  };

  // Generating step: run the single merge-save, keep the screen up for
  // at least ~1.5s, then advance to Complete. A failed save (including
  // no uid — never pretend success) shows the error state instead.
  useEffect(() => {
    if (current !== "generating") return;
    if (saveStartedRef.current) return;
    saveStartedRef.current = true;
    let cancelled = false;

    const runSave = async () => {
      const startedAt = Date.now();
      const snapshot = answersRef.current;
      const uid = auth.currentUser?.uid;
      let ok = false;
      if (uid) {
        try {
          const { firstName, lastName } = splitName(snapshot.fullName);
          const finalTargetKg = snapshot.targetWeightKg ?? snapshot.weightKg;
          await updateUserProfile(uid, {
            firstName,
            lastName,
            gender: snapshot.gender,
            age: snapshot.age,
            weight: String(snapshot.weightKg),
            height: String(snapshot.heightCm),
            primaryGoal: snapshot.primaryGoal,
            targetWeight: String(finalTargetKg),
            journey: snapshot.journey,
            questionnaireUpdatedAt: new Date().toISOString(),
            questionnaireCompletedAt: new Date().toISOString(),
          });
          const user = auth.currentUser;
          const displayName = (snapshot.fullName || "").trim();
          if (user && displayName && user.displayName !== displayName) {
            await updateProfile(user, { displayName });
          }
          await AsyncStorage.setItem(
            `${POST_ONBOARDING_KEY_PREFIX}${uid}`,
            "true"
          );
          ok = true;
        } catch (e) {
          console.warn("Failed to persist setup answers", e);
        }
      }
      const elapsed = Date.now() - startedAt;
      if (elapsed < 1500) {
        await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
      }
      if (cancelled) return;
      if (ok) {
        await trackEvent("post_onboarding_completed", {
          userId: auth.currentUser?.uid || null,
        });
        setStep(COMPLETE_INDEX);
      } else {
        setSaveError(true);
      }
    };

    runSave();
    return () => {
      cancelled = true;
    };
  }, [current, saveAttempt]);

  const summaryRows = [
    { label: "Name", value: answers.fullName.trim() || "—" },
    { label: "Age", value: `${answers.age} years` },
    { label: "Gender", value: GENDER_LABELS[answers.gender] || "—" },
    {
      label: "Weight",
      value: `${formatWeight(
        answers.weightKg,
        answers.weightUnit
      )} → ${formatWeight(targetKg, answers.targetUnit)}`,
    },
    {
      label: "Height",
      value: formatHeight(answers.heightCm, answers.heightUnit),
    },
    {
      label: "Goal",
      value:
        PRIMARY_GOAL_OPTIONS.find((o) => o.value === answers.primaryGoal)
          ?.label || "—",
    },
    {
      label: "Journey",
      value:
        JOURNEY_OPTIONS.find((o) => o.value === answers.journey)?.title || "—",
    },
  ];

  const renderQuestionInput = () => {
    switch (current) {
      case "name":
        return (
          <NameStep
            value={answers.fullName}
            onChange={(v) => setAnswer("fullName", v)}
          />
        );
      case "gender":
        return (
          <GenderStep
            value={answers.gender}
            onChange={(v) => setAnswer("gender", v)}
          />
        );
      case "age":
        return (
          <AgeStep value={answers.age} onChange={(v) => setAnswer("age", v)} />
        );
      case "weight": {
        const box = weightDisplay(answers.weightKg, answers.weightUnit);
        return (
          <MeasureStep
            value={answers.weightKg}
            onChange={(v) => setAnswer("weightKg", v)}
            unit={answers.weightUnit}
            onUnitChange={(u) => setAnswer("weightUnit", u)}
            units={WEIGHT_UNITS}
            min={30}
            max={200}
            displayValue={box.displayValue}
            unitLabel={box.unitLabel}
            formatValue={(v) =>
              answers.weightUnit === "lbs" ? String(kgToLbs(v)) : String(v)
            }
          />
        );
      }
      case "height": {
        const box = heightDisplay(answers.heightCm, answers.heightUnit);
        return (
          <MeasureStep
            value={answers.heightCm}
            onChange={(v) => setAnswer("heightCm", v)}
            unit={answers.heightUnit}
            onUnitChange={(u) => setAnswer("heightUnit", u)}
            units={HEIGHT_UNITS}
            min={140}
            max={210}
            displayValue={box.displayValue}
            unitLabel={box.unitLabel}
            formatValue={(v) =>
              answers.heightUnit === "ft" ? cmToFeetInches(v) : String(v)
            }
          />
        );
      }
      case "goal":
        return (
          <GoalStep
            value={answers.primaryGoal}
            onChange={(v) => setAnswer("primaryGoal", v)}
          />
        );
      case "target":
        return (
          <TargetWeightStep
            currentKg={answers.weightKg}
            targetKg={targetKg}
            onTargetChange={(v) => setAnswer("targetWeightKg", v)}
            unit={answers.targetUnit}
            onUnitChange={(u) => setAnswer("targetUnit", u)}
          />
        );
      case "journey":
        return (
          <JourneyStep
            value={answers.journey}
            onChange={(v) => setAnswer("journey", v)}
          />
        );
      default:
        return null;
    }
  };

  const meta = QUESTION_META[current];
  const isQuestion = Boolean(meta);

  return (
    <SafeAreaView style={rootStyle}>
      {current === "intro" ? (
        <IntroStep onContinue={handleContinue} />
      ) : current === "generating" ? (
        <GeneratingStep
          error={saveError}
          onRetry={handleRetrySave}
          onSkip={handleSkip}
        />
      ) : current === "complete" ? (
        <CompleteStep summaryRows={summaryRows} onEnter={handleEnter} />
      ) : isQuestion ? (
        <View style={styles.questionRoot}>
          <SetupHeader
            onBack={handleBack}
            onSkip={handleSkip}
            canGoBack={step > 0}
          />
          <ScrollView
            contentContainerStyle={styles.questionScroll}
            showsVerticalScrollIndicator={false}
          >
            <QuestionHeader
              stepNumber={meta.number}
              totalSteps={8}
              headline={meta.headline}
              subtext={meta.subtext}
            />
            {renderQuestionInput()}
          </ScrollView>
          <View style={styles.bottomBar}>
            <PrimaryButton
              label="Continue"
              onPress={handleContinue}
              disabled={!canContinue}
            />
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  questionRoot: { flex: 1 },
  questionScroll: { paddingBottom: 24 },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
});
