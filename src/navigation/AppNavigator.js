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
import VoiceLogScreen from "../features/track/screens/VoiceLogScreen";
import PhotoLogScreen from "../features/track/screens/PhotoLogScreen";
import GlucoseLogScreen from "../features/track/screens/GlucoseLogScreen";
import ExportReportScreen from "../features/profile/screens/ExportReportScreen";
import { GuideScreen } from "../features/guide";
import { pushTransition, modalTransition } from "./transitions";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...pushTransition }}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="MealEntry"
        component={MealEntryScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="LogMeal"
        component={LogMealScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="RepeatMeal"
        component={RepeatMealScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="LogWater"
        component={LogWaterScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="HydrationEntry"
        component={HydrationEntryScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="SleepEntry"
        component={SleepEntryScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="BodyCheck"
        component={BodyCheckScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="VoiceLog"
        component={VoiceLogScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="PhotoLog"
        component={PhotoLogScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="GlucoseLog"
        component={GlucoseLogScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="ExportReport"
        component={ExportReportScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
      <Stack.Screen
        name="Guide"
        component={GuideScreen}
        options={{ headerShown: false, ...modalTransition }}
      />
    </Stack.Navigator>
  );
}
