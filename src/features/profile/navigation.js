import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../../navigation/routeNames";

// Import profile screens
import ProfileScreen from "./screens/ProfileScreen";

const Stack = createNativeStackNavigator();

/**
 * ProfileStack - Feature-level navigation for profile screens
 * Registered as a nested stack in AppStackNavigator
 */
export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={ROUTES.FEATURES.PROFILE_VIEW}
        component={ProfileScreen}
      />
    </Stack.Navigator>
  );
}
