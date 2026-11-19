import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ReversalPlanScreen from "./screens/ReversalPlanScreen";
import ReversalSetupScreen from "./screens/ReversalSetupScreen";
import WeeklyCheckInScreen from "./screens/WeeklyCheckInScreen";
import { MealPlanNavigator } from "../meal-plan";

const Stack = createNativeStackNavigator();

export default function ReversalNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlanHome" component={ReversalPlanScreen} />
      <Stack.Screen name="PlanSetup" component={ReversalSetupScreen} />
      <Stack.Screen name="WeeklyCheckIn" component={WeeklyCheckInScreen} />
      <Stack.Screen name="MealPlan" component={MealPlanNavigator} />
    </Stack.Navigator>
  );
}
