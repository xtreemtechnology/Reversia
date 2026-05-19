import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../../navigation/routeNames";
import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import AccountSetupName from "./screens/AccountSetupName";
import AccountSetupGender from "./screens/AccountSetupGender";
import AccountSetupAge from "./screens/AccountSetupAge";
import AccountSetupWeight from "./screens/AccountSetupWeight";
import AccountSetupHeight from "./screens/AccountSetupHeight";
import AccountSetupGoal from "./screens/AccountSetupGoal";
import AccountSetupHealthStatus from "./screens/AccountSetupHealthStatus";
import AccountSetupActivity from "./screens/AccountSetupActivity";
import AccountSetupReadiness from "./screens/AccountSetupReadiness";
import AccountSetupCheckFrequency from "./screens/AccountSetupCheckFrequency";
import AccountSetupComplete from "./screens/AccountSetupComplete";

const Stack = createNativeStackNavigator();

/**
 * OnboardingFeatureStack - Feature-level navigation for onboarding screens
 * Registered as a nested stack within the OnboardingNavigator
 */
export default function OnboardingFeatureStack() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.ONBOARDING.SPLASH}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={ROUTES.ONBOARDING.SPLASH} component={SplashScreen} />
      <Stack.Screen
        name={ROUTES.ONBOARDING.WELCOME}
        component={WelcomeScreen}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.ACCOUNT_SETUP_NAME}
        component={AccountSetupName}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.ACCOUNT_SETUP_GENDER}
        component={AccountSetupGender}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.ACCOUNT_SETUP_AGE}
        component={AccountSetupAge}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.ACCOUNT_SETUP_WEIGHT}
        component={AccountSetupWeight}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.ACCOUNT_SETUP_HEIGHT}
        component={AccountSetupHeight}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.ACCOUNT_SETUP_GOAL}
        component={AccountSetupGoal}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.ACCOUNT_SETUP_HEALTH_STATUS}
        component={AccountSetupHealthStatus}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.ACCOUNT_SETUP_ACTIVITY}
        component={AccountSetupActivity}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.ACCOUNT_SETUP_READINESS}
        component={AccountSetupReadiness}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.ACCOUNT_SETUP_CHECK_FREQUENCY}
        component={AccountSetupCheckFrequency}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.ACCOUNT_SETUP_COMPLETE}
        component={AccountSetupComplete}
      />
    </Stack.Navigator>
  );
}
