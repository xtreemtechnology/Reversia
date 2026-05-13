import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../../navigation/routeNames";

// Import meals screens
import MealPlanScreen from "./screens/MealPlanScreen";
import MealEntryScreen from "./screens/MealEntryScreen";
import MealAnalyser from "./screens/MealAnalyser";

const Stack = createNativeStackNavigator();

/**
 * MealsStack - Feature-level navigation for all meal-related screens
 * Registered as a nested stack in AppStackNavigator
 */
export default function MealsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={ROUTES.FEATURES.MEAL_PLAN}
        component={MealPlanScreen}
      />
      <Stack.Screen
        name={ROUTES.FEATURES.MEAL_ENTRY}
        component={MealEntryScreen}
      />
      <Stack.Screen
        name={ROUTES.FEATURES.MEALS_ANALYSER}
        component={MealAnalyser}
      />
    </Stack.Navigator>
  );
}
