import React, { useEffect, useState } from "react";
import { StatusBar, AppState } from "react-native";
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
import {
  getUserProfile,
  updateUserProfileField,
} from "./src/features/profile/services/profileService";
import WelcomeTransitionScreen from "./src/screens/welcome/WelcomeTransitionScreen";
import PostOnboardingFlow from "./src/features/onboarding/post-onboarding";
import { trackEvent } from "./src/utils/analytics";
import {
  scheduleAllReminders,
  cancelAllReminders,
} from "./src/utils/notificationService";
import { syncOfflineQueue } from "./src/utils/offlineQueue";
const ONBOARDING_KEY = "@reversia_onboarding_complete";
const POST_ONBOARDING_KEY_PREFIX = "@reversia_post_onboarding_complete_";
const POST_ONBOARDING_DISMISSED_PREFIX = "@reversia_post_onboarding_dismissed_";

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showWelcomeTransition, setShowWelcomeTransition] = useState(false);
  const [showPostQuestionnaire, setShowPostQuestionnaire] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(null);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(null);
  const [hasCompletedPostOnboarding, setHasCompletedPostOnboarding] =
    useState(null);
  const [hasDismissedPostOnboarding, setHasDismissedPostOnboarding] =
    useState(null);

  useEffect(() => {
    let mounted = true;

    const readWelcomeSeen = async () => {
      const uid = currentUser?.uid;
      if (!uid) {
        if (mounted) setHasSeenWelcome(false);
        if (mounted) setHasCompletedPostOnboarding(false);
        if (mounted) setHasDismissedPostOnboarding(false);
        return;
      }

      try {
        const value = await AsyncStorage.getItem(
          `@reversia_welcome_seen_${uid}`
        );
        if (mounted) {
          // Never clobber a welcome already seen this session (e.g. the
          // transition shown right after the marketing onboarding, before
          // the account existed, so nothing was written for this uid yet).
          // Only a stored "true" or a first read may set the value.
          setHasSeenWelcome((prev) =>
            value === "true" ? true : prev === null ? false : prev
          );
        }
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
        if (value === "true") {
          if (mounted) setHasCompletedPostOnboarding(true);
          return;
        }
        // No flag on this device: the account may have completed setup
        // on another device. The durable record is the profile in
        // Firestore (questionnaireCompletedAt, written when the flow
        // saves), not this device's storage — check it before forcing
        // the user through setup again. A failed read falls back to
        // the local flag, so an offline login behaves as before.
        let completedRemotely = false;
        try {
          const profile = await getUserProfile(uid);
          completedRemotely = Boolean(profile?.questionnaireCompletedAt);
        } catch (_) {
          // ignore — fall back to the local flag below
        }
        if (completedRemotely) {
          AsyncStorage.setItem(
            `${POST_ONBOARDING_KEY_PREFIX}${uid}`,
            "true"
          ).catch(() => {});
        }
        if (mounted) setHasCompletedPostOnboarding(completedRemotely);
      } catch (_) {
        if (mounted) setHasCompletedPostOnboarding(false);
      }
    };

    const readPostOnboardingDismissed = async () => {
      const uid = currentUser?.uid;
      if (!uid) {
        return;
      }

      try {
        const value = await AsyncStorage.getItem(
          `${POST_ONBOARDING_DISMISSED_PREFIX}${uid}`
        );
        if (value === "true") {
          if (mounted) setHasDismissedPostOnboarding(true);
          return;
        }
        // Same cross-device problem as completion: a skip on another
        // device is recorded in the profile (questionnaireSkippedAt).
        let skippedRemotely = false;
        try {
          const profile = await getUserProfile(uid);
          skippedRemotely = Boolean(profile?.questionnaireSkippedAt);
        } catch (_) {
          // ignore — fall back to the local flag below
        }
        if (skippedRemotely) {
          AsyncStorage.setItem(
            `${POST_ONBOARDING_DISMISSED_PREFIX}${uid}`,
            "true"
          ).catch(() => {});
        }
        if (mounted) setHasDismissedPostOnboarding(skippedRemotely);
      } catch (_) {
        if (mounted) setHasDismissedPostOnboarding(false);
      }
    };

    readWelcomeSeen();
    readPostOnboardingComplete();
    readPostOnboardingDismissed();

    // Attempt to migrate sensitive keys to secure store when app starts
    secureStorage
      .migrateKeys(["@reversia_guest_logs", "@reversia_cached_logs"])
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    let mounted = true;
    if (currentUser?.uid) {
      AsyncStorage.getItem(`@reversia_notifications_enabled_${currentUser.uid}`)
        .then((val) => {
          if (!mounted) return;
          if (val === null || val === "true") {
            scheduleAllReminders().catch(() => {});
          } else {
            cancelAllReminders().catch(() => {});
          }
        })
        .catch(() => {});
    } else if (currentUser === null && authChecked) {
      cancelAllReminders().catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [currentUser, currentUser?.uid, authChecked]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    syncOfflineQueue().catch(() => {});

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        syncOfflineQueue().catch(() => {});
      }
    });

    return () => {
      sub?.remove?.();
    };
  }, [currentUser, currentUser?.uid]);

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
  }, [currentUser, onboardingDone]);

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
          hasCompletedPostOnboarding={hasCompletedPostOnboarding}
          setHasCompletedPostOnboarding={setHasCompletedPostOnboarding}
          hasDismissedPostOnboarding={hasDismissedPostOnboarding}
          setHasDismissedPostOnboarding={setHasDismissedPostOnboarding}
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
  hasCompletedPostOnboarding,
  setHasCompletedPostOnboarding,
  hasDismissedPostOnboarding,
  setHasDismissedPostOnboarding,
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

  // Post-onboarding routing is decided from the persisted flags, not
  // from an event: after signup the auth state flips first, and the old
  // event-driven handoff arrived after the slow profile/verification
  // writes — so the router sent the new user to Home, then "reloaded
  // back" to the setup flow once the event landed. The flags are the
  // single source of truth, so Home can never win that race again.
  // While the flags are still being read, show the splash — never Home.
  const setupKnown =
    hasCompletedPostOnboarding !== null &&
    hasSeenWelcome !== null &&
    hasDismissedPostOnboarding !== null;
  const setupIncomplete =
    Boolean(currentUser) &&
    hasCompletedPostOnboarding === false &&
    !hasDismissedPostOnboarding;

  const welcomeTransition = (
    <WelcomeTransitionScreen
      userName={currentUser?.displayName || "there"}
      onFinish={() => {
        const uid = currentUser?.uid;
        if (uid) {
          AsyncStorage.setItem(`@reversia_welcome_seen_${uid}`, "true").catch(
            () => {}
          );
          setShowPostQuestionnaire(true);
        }
        setHasSeenWelcome(true);
        setShowWelcomeTransition(false);
      }}
    />
  );

  const postOnboardingFlow = (
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
      onSkip={() => {
        // Skipping resolves the gate for this account, exactly as before:
        // the user goes to Home and is not asked again on later launches.
        const uid = currentUser?.uid;
        if (uid) {
          AsyncStorage.setItem(
            `${POST_ONBOARDING_DISMISSED_PREFIX}${uid}`,
            "true"
          ).catch(() => {});
          // Record the skip in the profile too, so a later login on
          // another device does not ask again either.
          updateUserProfileField(
            uid,
            "questionnaireSkippedAt",
            new Date().toISOString()
          ).catch(() => {});
          setHasDismissedPostOnboarding(true);
        }
        setShowPostQuestionnaire(false);
      }}
    />
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
          ) : showWelcomeTransition ||
            (setupIncomplete && setupKnown && !hasSeenWelcome) ? (
            welcomeTransition
          ) : (showPostQuestionnaire && currentUser) ||
            (setupIncomplete && setupKnown && hasSeenWelcome) ? (
            postOnboardingFlow
          ) : currentUser && !setupKnown ? (
            <InlineSplash />
          ) : currentUser ||
            (typeof __DEV__ !== "undefined" &&
              __DEV__ &&
              typeof window !== "undefined" &&
              window.location &&
              window.location.search.includes("forceApp=true")) ? (
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
