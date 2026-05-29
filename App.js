import React, { useEffect, useState } from "react";
import { StatusBar, DeviceEventEmitter } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ThemeProvider, { useTheme } from "./src/theme/ThemeProvider";
import AppNavigator from "./src/navigation/AppNavigator";
import ErrorBoundary from "./src/components/ErrorBoundary";
import InlineSplash from "./src/components/InlineSplash";
import { NotificationHost } from "./src/components/Notification";
import { ConfirmHost } from "./src/components/Confirm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import secureStorage from "./src/utils/secureStorage";
import AuthNavigator from "./src/features/auth/AuthNavigator";
import OnboardingNavigator from "./src/screens/onboarding/OnboardingNavigator";
import { auth } from "./src/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import WelcomeTransitionScreen from "./src/screens/welcome/WelcomeTransitionScreen";
import PostOnboardingFlow from "./src/features/onboarding/post-onboarding";
const ONBOARDING_KEY = "@reversia_onboarding_complete";
const POST_ONBOARDING_KEY_PREFIX = "@reversia_post_onboarding_complete_";

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showWelcomeTransition, setShowWelcomeTransition] = useState(false);
  const [showPostQuestionnaire, setShowPostQuestionnaire] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(null);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(null);
  const [hasCompletedPostOnboarding, setHasCompletedPostOnboarding] = useState(null);

  useEffect(() => {
    // Listen for post-onboarding requests (triggered after signup)
    const postHandler = async () => {
      if (hasCompletedPostOnboarding) {
        return;
      }
      if (hasSeenWelcome) {
        setShowPostQuestionnaire(true);
      } else {
        setShowWelcomeTransition(true);
      }
    };
    const sub = DeviceEventEmitter.addListener(
      "postOnboardingRequested",
      postHandler
    );
    return () => {
      sub?.remove?.();
    };
  }, [
    currentUser,
    hasSeenWelcome,
    hasCompletedPostOnboarding,
    setShowPostQuestionnaire,
    setShowWelcomeTransition,
  ]);

  useEffect(() => {
    let mounted = true;

    const readWelcomeSeen = async () => {
      const uid = currentUser?.uid;
      if (!uid) {
        if (mounted) setHasSeenWelcome(false);
        if (mounted) setHasCompletedPostOnboarding(false);
        return;
      }

      try {
        const value = await AsyncStorage.getItem(
          `@reversia_welcome_seen_${uid}`
        );
        if (mounted) setHasSeenWelcome(value === "true");
      } catch (_) {
        if (mounted) setHasSeenWelcome(false);
      }
    };

    const readPostOnboardingComplete = async () => {
      const uid = currentUser?.uid;
      if (!uid) {
        return;
      }

      try {
        const value = await AsyncStorage.getItem(
          `${POST_ONBOARDING_KEY_PREFIX}${uid}`
        );
        if (mounted) setHasCompletedPostOnboarding(value === "true");
      } catch (_) {
        if (mounted) setHasCompletedPostOnboarding(false);
      }
    };

    readWelcomeSeen();
    readPostOnboardingComplete();

    // Attempt to migrate sensitive keys to secure store when app starts
    secureStorage
      .migrateKeys(["@reversia_guest_logs", "@reversia_cached_logs"])
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ?? null);
      setAuthChecked(true);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;

    const readFlag = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (mounted) setOnboardingDone(value === "true");
      } catch (e) {
        if (mounted) setOnboardingDone(false);
      }
    };

    readFlag();

    // fallback: don't stay on a blocking splash indefinitely
    const t = setTimeout(() => {
      if (mounted && onboardingDone === null) setOnboardingDone(false);
    }, 1200);

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [currentUser]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent
          authChecked={authChecked}
          currentUser={currentUser}
          onboardingDone={onboardingDone}
          setOnboardingDone={setOnboardingDone}
          showWelcomeTransition={showWelcomeTransition}
          setShowWelcomeTransition={setShowWelcomeTransition}
          showPostQuestionnaire={showPostQuestionnaire}
          setShowPostQuestionnaire={setShowPostQuestionnaire}
          hasSeenWelcome={hasSeenWelcome}
          setHasSeenWelcome={setHasSeenWelcome}
          setHasCompletedPostOnboarding={setHasCompletedPostOnboarding}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent({
  authChecked,
  currentUser,
  onboardingDone,
  setOnboardingDone,
  showWelcomeTransition,
  setShowWelcomeTransition,
  showPostQuestionnaire,
  setShowPostQuestionnaire,
  hasSeenWelcome,
  setHasSeenWelcome,
  setHasCompletedPostOnboarding,
}) {
  const { colors } = useTheme();

  const navigationTheme = React.useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.primary,
      },
    }),
    [colors]
  );

  return (
    <>
      <ThemeAwareStatusBar />
      <NavigationContainer theme={navigationTheme}>
        <ErrorBoundary>
          {onboardingDone === null || !authChecked ? (
            <InlineSplash />
          ) : !onboardingDone ? (
            <OnboardingNavigator
              onComplete={() => {
                setOnboardingDone(true);
                trackEvent("onboarding_completed", {
                  userId: currentUser?.uid || null,
                });
                setShowWelcomeTransition(true);
              }}
            />
          ) : showWelcomeTransition ? (
            <WelcomeTransitionScreen
              userName={currentUser?.displayName || "there"}
              onFinish={() => {
                const uid = currentUser?.uid;
                if (uid) {
                  AsyncStorage.setItem(
                    `@reversia_welcome_seen_${uid}`,
                    "true"
                  ).catch(() => {});
                  setShowPostQuestionnaire(true);
                }
                setHasSeenWelcome(true);
                setShowWelcomeTransition(false);
              }}
            />
          ) : showPostQuestionnaire ? (
            <PostOnboardingFlow
              onComplete={async () => {
                const uid = currentUser?.uid;
                if (uid) {
                  await AsyncStorage.setItem(
                    `${POST_ONBOARDING_KEY_PREFIX}${uid}`,
                    "true"
                  ).catch(() => {});
                  setHasCompletedPostOnboarding(true);
                }
                try {
                  // AsyncStorage.setItem("@reversia_user_goal", answers?.primaryGoal || "");
                } catch (_) {}
                setShowPostQuestionnaire(false);
              }}
              onSkip={() => setShowPostQuestionnaire(false)}
            />
          ) : currentUser ? (
            <AppNavigator />
          ) : (
            <AuthNavigator />
          )}
        </ErrorBoundary>
      </NavigationContainer>
      <NotificationHost />
      <ConfirmHost />
    </>
  );
}

function ThemeAwareStatusBar() {
  const { theme, colors } = useTheme();
  return (
    <StatusBar
      barStyle={theme === "dark" ? "light-content" : "dark-content"}
      backgroundColor={colors.background}
    />
  );
}
