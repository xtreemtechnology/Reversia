import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 1. Onboarding & Intro
import SplashScreen from "./SplashScreen";
import Onboarding1 from "./Onboarding1";
import Onboarding2 from "./Onboarding2";
import Onboarding3 from "./Onboarding3";
import OnboardingStartScreen from "./OnboardingStartScreen";

// 2. Auth Stack (modular feature navigator)
import AuthStack from "../../features/auth/navigation";

// 3. Account Setup (The 8 Steps) - Import from feature folder
import {
  AccountSetupName,
  AccountSetupGender,
  AccountSetupAge,
  AccountSetupWeight,
  AccountSetupHeight,
  AccountSetupGoal,
  AccountSetupHealthStatus,
  AccountSetupReadiness,
  AccountSetupComplete,
} from "../../features/onboarding/index";

// 4. Main App Navigation
import AppStackNavigator from "../../navigation/AppStackNavigator";
import SetupEntry from "../setup/SetupEntry";
import SetupAlias from "../setup/SetupAlias";
import SetupGenerating from "./SetupGenerating";
import { auth } from "../../config/firebase";
import { ROUTES } from "../../navigation/routeNames";

const Stack = createNativeStackNavigator();

function ProtectedMainApp({ navigation }) {
  useEffect(() => {
    if (!auth.currentUser) {
      navigation.replace(ROUTES.ROOT.AUTH, { screen: ROUTES.AUTH.LOGIN });
    }
  }, [navigation]);

  return <AppStackNavigator />;
}

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      {/* --- INITIAL LOAD --- */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      {/* --- INTRO ONBOARDING --- */}
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />

      {/* --- AUTHENTICATION (nested feature stack) --- */}
      <Stack.Screen
        name={ROUTES.ROOT.AUTH}
        component={AuthStack}
        options={{ headerShown: false }}
      />

      {/* --- ACCOUNT SETUP (STEP-BY-STEP) --- */}
      <Stack.Screen name="OnboardingStart" component={OnboardingStartScreen} />
      <Stack.Screen name="AccountSetupName" component={AccountSetupName} />
      <Stack.Screen name="AccountSetupGender" component={AccountSetupGender} />
      <Stack.Screen name="AccountSetupAge" component={AccountSetupAge} />
      <Stack.Screen name="AccountSetupWeight" component={AccountSetupWeight} />
      <Stack.Screen name="AccountSetupHeight" component={AccountSetupHeight} />
      <Stack.Screen name="AccountSetupGoal" component={AccountSetupGoal} />
      <Stack.Screen
        name="AccountSetupHealthStatus"
        component={AccountSetupHealthStatus}
      />
      <Stack.Screen
        name="AccountSetupReadiness"
        component={AccountSetupReadiness}
      />
      <Stack.Screen name="SetupGenerating" component={SetupGenerating} />
      <Stack.Screen
        name="AccountSetupComplete"
        component={AccountSetupComplete}
      />
      <Stack.Screen name="setupIntro" component={SetupAlias} />
      <Stack.Screen name="setupCountry" component={SetupAlias} />
      <Stack.Screen name="setupName" component={SetupAlias} />
      <Stack.Screen name="setupGender" component={SetupAlias} />
      <Stack.Screen name="setupAge" component={SetupAlias} />
      <Stack.Screen name="setupWeight" component={SetupAlias} />
      <Stack.Screen name="setupHeight" component={SetupAlias} />
      <Stack.Screen name="setupComplete" component={SetupAlias} />
      <Stack.Screen name="Setup" component={SetupEntry} />

      {/* --- MAIN APP SECTION --- */}
      {/* AppStackNavigator handles MainTabs + all detail screens */}
      <Stack.Screen
        name={ROUTES.ROOT.MAIN_APP}
        component={ProtectedMainApp}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
