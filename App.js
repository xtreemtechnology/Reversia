// App.js - Updated with Onboarding
import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingNavigator from './src/screens/onboarding/OnboardingNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import HomeScreen from './src/screens/HomeScreen';
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

    const restoreNavigationState = async () => {
      try {
        // Try to restore saved navigation state so a refresh resumes where the user left off.
        const saved = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setInitialState(parsed);
          } catch (e) {
            // If saved state can't be parsed, remove it to avoid breaking navigation
            await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
          }
        }
      } catch (error) {
        // ignore AsyncStorage errors
      } finally {
        if (mounted) {
          setIsNavigationReady(true);
        }
      }
    };

    restoreNavigationState();

    return () => {
      mounted = false;
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
        ) : null}
      </>
    </SafeAreaProvider>
  );
}