import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../../navigation/routeNames";
import OnboardingSplashScreen from "./screens/OnboardingSplashScreen";
import OnboardingStartScreen from "./screens/OnboardingStartScreen";

// Import onboarding screens
import AccountSetupName from "./screens/AccountSetupName";
import AccountSetupAge from "./screens/AccountSetupAge";
import AccountSetupGender from "./screens/AccountSetupGender";
import AccountSetupHeight from "./screens/AccountSetupHeight";
import AccountSetupWeight from "./screens/AccountSetupWeight";
import AccountSetupHealthStatus from "./screens/AccountSetupHealthStatus";
import AccountSetupGoal from "./screens/AccountSetupGoal";
import AccountSetupReadiness from "./screens/AccountSetupReadiness";
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
      <Stack.Screen
        name={ROUTES.ONBOARDING.SPLASH}
        component={OnboardingSplashScreen}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING.START}
        component={OnboardingStartScreen}
      />
      <Stack.Screen
        name="AccountSetupName"
        component={AccountSetupName}
      />
      <Stack.Screen name="AccountSetupAge" component={AccountSetupAge} />
      <Stack.Screen name="AccountSetupGender" component={AccountSetupGender} />
      <Stack.Screen name="AccountSetupHeight" component={AccountSetupHeight} />
      <Stack.Screen name="AccountSetupWeight" component={AccountSetupWeight} />
      <Stack.Screen
        name="AccountSetupHealthStatus"
        component={AccountSetupHealthStatus}
      />
      <Stack.Screen name="AccountSetupGoal" component={AccountSetupGoal} />
      <Stack.Screen
        name="AccountSetupReadiness"
        component={AccountSetupReadiness}
      />
      <Stack.Screen
        name="AccountSetupComplete"
        component={AccountSetupComplete}
      />
    </Stack.Navigator>
  );
}
