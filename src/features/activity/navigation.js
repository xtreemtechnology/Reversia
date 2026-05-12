import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../../navigation/routeNames";

// Import activity screens
import ActivityList from "./screens/ActivityList";
import ActivityTracker from "./screens/ActivityTracker";
import ExerciseEntryScreen from "./screens/ExerciseEntryScreen";
import LogHistoryScreen from "./screens/LogHistoryScreen";

const Stack = createNativeStackNavigator();

/**
 * ActivityStack - Feature-level navigation for all activity-related screens
 * Registered as a nested stack in AppStackNavigator
 */
export default function ActivityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={ROUTES.FEATURES.ACTIVITY_LOG}
        component={ActivityList}
      />
      <Stack.Screen name="ActivityTracker" component={ActivityTracker} />
      <Stack.Screen name="ExerciseEntry" component={ExerciseEntryScreen} />
      <Stack.Screen name="LogHistory" component={LogHistoryScreen} />
    </Stack.Navigator>
  );
}
