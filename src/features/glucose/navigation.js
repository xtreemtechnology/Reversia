import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../../navigation/routeNames";

// Import glucose screens
import GlucoseLog from "./screens/GlucoseLog";
import GlucoseMonitoring from "./screens/GlucoseMonitoring";
import GlucoseEntryScreen from "./screens/GlucoseEntryScreen";

const Stack = createNativeStackNavigator();

/**
 * GlucoseStack - Feature-level navigation for all glucose-related screens
 * Registered as a nested stack in AppStackNavigator
 */
export default function GlucoseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.FEATURES.GLUCOSE_LOG} component={GlucoseLog} />
      <Stack.Screen
        name={ROUTES.FEATURES.GLUCOSE_MONITORING}
        component={GlucoseMonitoring}
      />
      <Stack.Screen name="GlucoseEntry" component={GlucoseEntryScreen} />
    </Stack.Navigator>
  );
}
