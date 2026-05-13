import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Main tab screens
import MainTabNavigator from "./MainTabNavigator";
import { ROUTES } from "./routeNames";

// Detail screens (secondary navigations)
import GlucoseMonitoring from "../features/glucose/screens/GlucoseMonitoring";
import NutritionInsights from "../features/nutrition/screens/NutritionInsights";
import SleepInsights from "../features/sleep/screens/SleepInsights";
import GlucoseEntryScreen from "../features/glucose/screens/GlucoseEntryScreen";
import WaterEntryScreen from "../features/water/screens/WaterEntryScreen";
import ExerciseEntryScreen from "../features/activity/screens/ExerciseEntryScreen";
import LogHistoryScreen from "../features/activity/screens/LogHistoryScreen";
import BMICalculatorScreen from "../features/bmi/screens/BMICalculatorScreen";
import EducationScreen from "../features/education/screens/EducationScreen";
import ActivityTracker from "../features/activity/screens/ActivityTracker";
import BodyComposition from "../features/body/screens/BodyComposition";
import HealthIntegration from "../features/health/screens/HealthIntegration";

// Imported from modularized features
import { MealEntryScreen } from "../features/meals";
import MealAnalyser from "../features/meals/screens/MealAnalyser";

// Settings feature stack (modular navigator)
import SettingsStack from "../features/settings/navigation";

// Meals feature stack (modular navigator)
import MealsStack from "../features/meals/navigation";

// Glucose feature stack (modular navigator)
import GlucoseStack from "../features/glucose/navigation";

// Activity feature stack (modular navigator)
import ActivityStack from "../features/activity/navigation";

// Profile feature stack (modular navigator)
import ProfileStack from "../features/profile/navigation";

const Stack = createNativeStackNavigator();

/**
 * AppStack handles all authenticated user navigation.
 * MainTabNavigator is the root of the app tabs.
 * All detail/modal screens overlay on top via native stack.
 */
export default function AppStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#F8FAFC" },
      }}
    >
      {/* Main Tabs (Home, Log, Scan, Meal, Profile) */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ gestureEnabled: false, animationEnabled: false }}
      />
      {/* alias for gradual migration to centralized route constants */}
      <Stack.Screen
        name={ROUTES.APP.MAIN_TABS}
        component={MainTabNavigator}
        options={{ gestureEnabled: false, animationEnabled: false }}
      />

      {/* ─── DETAIL SCREENS (Overlay Modals) ─── */}
      {/* Glucose */}
      <Stack.Screen
        name="GlucoseMonitor"
        component={GlucoseMonitoring}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="GlucoseEntry"
        component={GlucoseEntryScreen}
        options={{ gestureEnabled: false }}
      />

      {/* Nutrition */}
      <Stack.Screen
        name="NutritionInsights"
        component={NutritionInsights}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="MealEntry"
        component={MealEntryScreen}
        options={{ gestureEnabled: false }}
      />

      {/* Sleep */}
      <Stack.Screen
        name="SleepInsights"
        component={SleepInsights}
        options={{ gestureEnabled: false }}
      />

      {/* Water */}
      <Stack.Screen
        name="WaterEntry"
        component={WaterEntryScreen}
        options={{ gestureEnabled: false }}
      />

      {/* Exercise */}
      <Stack.Screen
        name="ExerciseEntry"
        component={ExerciseEntryScreen}
        options={{ gestureEnabled: false }}
      />

      {/* Logs */}
      <Stack.Screen
        name="LogHistory"
        component={LogHistoryScreen}
        options={{ gestureEnabled: false }}
      />

      {/* BMI */}
      <Stack.Screen
        name="BMICalculator"
        component={BMICalculatorScreen}
        options={{ gestureEnabled: false }}
      />

      {/* Education */}
      <Stack.Screen
        name="Education"
        component={EducationScreen}
        options={{ gestureEnabled: false }}
      />

      {/* ─── PLACEHOLDER SCREENS ─── */}
      {/* These are called from HomeScreen, created to prevent navigation crashes */}
      <Stack.Screen name="ActivityTracker" component={ActivityTracker} />
      <Stack.Screen name="BodyComposition" component={BodyComposition} />
      <Stack.Screen name="MealAnalyser" component={MealAnalyser} />
      <Stack.Screen name="HealthIntegration" component={HealthIntegration} />

      {/* ─── SETTINGS STACK (modular feature navigator) ─── */}
      <Stack.Screen
        name="Settings"
        component={SettingsStack}
        options={{ gestureEnabled: false }}
      />

      {/* ─── MEALS STACK (modular feature navigator) ─── */}
      <Stack.Screen
        name="Meals"
        component={MealsStack}
        options={{ gestureEnabled: false }}
      />

      {/* ─── GLUCOSE STACK (modular feature navigator) ─── */}
      <Stack.Screen
        name="Glucose"
        component={GlucoseStack}
        options={{ gestureEnabled: false }}
      />

      {/* ─── ACTIVITY STACK (modular feature navigator) ─── */}
      <Stack.Screen
        name="Activity"
        component={ActivityStack}
        options={{ gestureEnabled: false }}
      />

      {/* ─── PROFILE STACK (modular feature navigator) ─── */}
      <Stack.Screen
        name="Profile"
        component={ProfileStack}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
