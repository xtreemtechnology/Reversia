// App.js - Updated with Onboarding
import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingNavigator from './src/screens/onboarding/OnboardingNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import HomeScreen from './src/screens/HomeScreen';
import InlineSplash from './src/components/InlineSplash';
import { auth } from './src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function MainApp(props) {
  return <HomeScreen {...props} />;
}

const navigationRef = createNavigationContainerRef();
const NAVIGATION_STATE_KEY = 'NAVIGATION_STATE_V1';

export default function App() {
  const [initialState, setInitialState] = useState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [mountedAt, setMountedAt] = useState(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const restoreNavigationState = async () => {
      const hasOnboardingRoute = (state) => {
        const check = (node) => {
          if (!node) return false;
          if (Array.isArray(node)) return node.some(check);
          if (node.name && (node.name.includes('Onboarding') || node.name.includes('AccountSetup') || node.name.includes('OnboardingStart'))) return true;
          if (node.routes && Array.isArray(node.routes)) return node.routes.some(check);
          if (node.state) return check(node.state);
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

            // If a user is already signed in, avoid restoring an onboarding route
            // which would kick them back into onboarding on refresh.
            const user = auth?.currentUser;
            if (user && parsed) {
              const containsOnboarding = hasOnboardingRoute(parsed);

              if (containsOnboarding) {
                // If onboarding-related routes exist in the saved state, check local flag
                // If onboarding was completed locally, it's safe to restore; otherwise drop it.
                try {
                  const localFlag = await AsyncStorage.getItem('ONBOARDING_COMPLETE');
                  if (localFlag === 'true') {
                    setInitialState(parsed);
                  } else {
                    await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
                  }
                } catch (e) {
                  // on any AsyncStorage failure be conservative and remove the saved state
                  await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
                }
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
        if (timeoutId) clearTimeout(timeoutId);
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
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    // Only check initial auth state on app start to decide where to route.
    // Avoid reacting to every auth state change to prevent jumping out of onboarding.
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && navigationRef.isReady()) {
        try {
          navigationRef.navigate('MainApp');
        } catch (e) {
          // ignore navigation errors during startup
        }
      }
      // Unsubscribe after the initial trigger so we don't navigate on subsequent auth changes
      unsub();
    });
    return () => { try { unsub && unsub(); } catch {} };
  }, []);

  return (
    <SafeAreaProvider>
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        {isNavigationReady ? (
          <NavigationContainer
            ref={navigationRef}
            initialState={initialState}
            onStateChange={(state) => {
              AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state)).catch(() => {});
            }}
          >
            <ErrorBoundary>
              <OnboardingNavigator MainAppComponent={MainApp} />
            </ErrorBoundary>
          </NavigationContainer>
        ) : (
          <InlineSplash />
        )}
      </>
    </SafeAreaProvider>
  );
}