import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingNavigator from "../features/onboarding/navigation";
import AuthStack from "../features/auth/navigation";
import AppStackNavigator from "./AppStackNavigator";
import { ROUTES } from "./routeNames";

const RootStack = createNativeStackNavigator();

// Root navigator that should be rendered inside an existing NavigationContainer.
// Keeps NavigationContainer ownership in App.js so navigation state restore continues to work.
export default function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Onboarding & legacy flow remains the initial screen to avoid behavioral changes. */}
      <RootStack.Screen
        name={ROUTES.ROOT.ONBOARDING_FLOW}
        component={OnboardingNavigator}
      />
      {/* Feature-scoped auth stack available for direct navigation when needed */}
      <RootStack.Screen name={ROUTES.ROOT.AUTH_STACK} component={AuthStack} />
      {/* Canonical auth route name for nested onboarding redirects */}
      <RootStack.Screen name={ROUTES.ROOT.AUTH} component={AuthStack} />
      {/* Root-level main app route so auth listeners can route without nesting assumptions */}
      <RootStack.Screen
        name={ROUTES.ROOT.MAIN_APP}
        component={AppStackNavigator}
      />
      {/* Alias for gradual migration to namespaced route constants */}
      <RootStack.Screen
        name={ROUTES.APP.MAIN_APP}
        component={AppStackNavigator}
      />
    </RootStack.Navigator>
  );
}
