// App.js - Updated with Onboarding
import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ThemeProvider, { useTheme } from "./src/theme/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppNavigator from "./src/navigation/AppNavigator";
import ErrorBoundary from "./src/components/ErrorBoundary";
import InlineSplash from "./src/components/InlineSplash";
import { NotificationHost } from "./src/components/Notification";
import { ConfirmHost } from "./src/components/Confirm";
import { auth } from "./src/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ROUTES } from "./src/navigation/routeNames";

const navigationRef = createNavigationContainerRef();
const NAVIGATION_STATE_KEY = "NAVIGATION_STATE_V1";
const ROOT_ROUTE_NAMES = new Set([
  ROUTES.ROOT.ONBOARDING_FLOW,
  ROUTES.ROOT.AUTH_STACK,
  ROUTES.ROOT.AUTH,
  ROUTES.ROOT.MAIN_APP,
  ROUTES.APP.MAIN_APP,
]);

function isRestorableNavigationState(state) {
  if (!state || !Array.isArray(state.routes) || state.routes.length === 0) {
    return false;
  }

  const rootRoute = state.routes[0];
  return !!rootRoute?.name && ROOT_ROUTE_NAMES.has(rootRoute.name);
}

export default function App() {
  const [initialState, setInitialState] = useState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const restoreNavigationState = async () => {
      const hasOnboardingRoute = (state) => {
        const check = (node) => {
          if (!node) {
            return false;
          }
          if (Array.isArray(node)) {
            return node.some(check);
          }
          if (
            node.name &&
            (node.name.includes("Onboarding") ||
              node.name.includes("AccountSetup") ||
              node.name.includes("OnboardingStart"))
          ) {
            return true;
          }
          if (node.routes && Array.isArray(node.routes)) {
            return node.routes.some(check);
          }
          if (node.state) {
            return check(node.state);
          }
          return false;
        };
        return check(state);
      };

      try {
        // Try to restore saved navigation state so a refresh resumes where the user left off.
        const saved = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);

            if (!isRestorableNavigationState(parsed)) {
              await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
              return;
            }

            // If a user is already signed in, avoid restoring an onboarding route
            // which would kick them back into onboarding on refresh.
            const user = auth?.currentUser;
            if (user && parsed) {
              const localFlag = await AsyncStorage.getItem("ONBOARDING_COMPLETE");
              const containsOnboarding = hasOnboardingRoute(parsed);
              const rootName = parsed?.routes?.[0]?.name;
              const pointsToMainApp =
                rootName === ROUTES.ROOT.MAIN_APP ||
                rootName === ROUTES.APP.MAIN_APP;

              if (containsOnboarding) {
                // If onboarding-related routes exist in the saved state, check local flag
                // If onboarding was completed locally, it's safe to restore; otherwise drop it.
                try {
                  if (localFlag === "true") {
                    setInitialState(parsed);
                  } else {
                    await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
                  }
                } catch (e) {
                  // on any AsyncStorage failure be conservative and remove the saved state
                  await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
                }
              } else if (pointsToMainApp && localFlag !== "true") {
                // If onboarding is incomplete, do not restore a saved main app route.
                await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
              } else {
                setInitialState(parsed);
              }
            } else {
              setInitialState(parsed);
            }
          } catch (e) {
            // If saved state can't be parsed, remove it to avoid breaking navigation
            await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
          }
        }
      } catch (error) {
        // ignore AsyncStorage errors
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (mounted) {
          setIsNavigationReady(true);
        }
      }
    };

    // Set a safety timeout so app doesn't get stuck on splash screen if AsyncStorage hangs
    timeoutId = setTimeout(() => {
      if (mounted) {
        setIsNavigationReady(true);
      }
    }, 8000); // 8 second timeout

    restoreNavigationState();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    // Check initial auth state and only react once on startup.
    let handled = false;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (handled) {
        return;
      }
      handled = true;

      if (user && navigationRef.isReady()) {
        // Only bypass onboarding if it was completed previously.
        AsyncStorage.getItem("ONBOARDING_COMPLETE")
          .then((flag) => {
            if (flag === "true") {
              try {
                navigationRef.navigate(ROUTES.ROOT.MAIN_APP);
              } catch (e) {
                // ignore navigation errors during startup
              }
            }
          })
          .catch(() => {
            // ignore storage errors and keep current onboarding flow
          });
      }
    });

    return () => {
      try {
        unsubscribe && unsubscribe();
      } catch {}
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <>
          <ThemeAwareStatusBar />
          {isNavigationReady ? (
            <NavigationContainer
              ref={navigationRef}
              initialState={initialState}
              onStateChange={(state) => {
                AsyncStorage.setItem(
                  NAVIGATION_STATE_KEY,
                  JSON.stringify(state)
                ).catch(() => {});
              }}
            >
              <ErrorBoundary>
                <AppNavigator />
              </ErrorBoundary>
            </NavigationContainer>
          ) : (
            <InlineSplash />
          )}
          <NotificationHost />
          <ConfirmHost />
        </>
      </ThemeProvider>
    </SafeAreaProvider>
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
