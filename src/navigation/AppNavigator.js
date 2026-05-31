import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "./MainTabNavigator";
import LoginScreen from "../features/auth/screens/LoginScreen";
import MealEntryScreen from "../features/track/screens/MealEntryScreen";
import LogMealScreen from "../features/track/screens/LogMealScreen";
import RepeatMealScreen from "../features/track/screens/RepeatMealScreen";
import LogWaterScreen from "../features/track/screens/LogWaterScreen";
import HydrationEntryScreen from "../features/track/screens/HydrationEntryScreen";
import SleepEntryScreen from "../features/track/screens/SleepEntryScreen";
import BodyCheckScreen from "../features/track/screens/BodyCheckScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="MealEntry"
        component={MealEntryScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="LogMeal"
        component={LogMealScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="RepeatMeal"
        component={RepeatMealScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="LogWater"
        component={LogWaterScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="HydrationEntry"
        component={HydrationEntryScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="SleepEntry"
        component={SleepEntryScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="BodyCheck"
        component={BodyCheckScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack.Navigator>
  );
}
