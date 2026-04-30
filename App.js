// App.js - Updated with Onboarding
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    let mounted = true;

    const restoreNavigationState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
        if (savedState && mounted) {
          setInitialState(JSON.parse(savedState));
        }
      } catch (error) {
        // Ignore restoration failures and fall back to the default route.
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
    </SafeAreaProvider>
  );
}