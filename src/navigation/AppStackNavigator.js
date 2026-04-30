import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Main tab screens
import MainTabNavigator from './MainTabNavigator';

// Detail screens (secondary navigations)
import GlucoseMonitoring from '../screens/GlucoseMonitoring';
import NutritionInsights from '../screens/NutritionInsights';
import SleepInsights from '../screens/SleepInsights';
import GlucoseEntryScreen from '../screens/GlucoseEntryScreen';
import MealEntryScreen from '../screens/MealEntryScreen';
import WaterEntryScreen from '../screens/WaterEntryScreen';
import ExerciseEntryScreen from '../screens/ExerciseEntryScreen';
import BMICalculatorScreen from '../screens/BMICalculatorScreen';
import EducationScreen from '../screens/EducationScreen';
import ActivityTracker from '../screens/ActivityTracker';
import BodyComposition from '../screens/BodyComposition';
import MealAnalyser from '../screens/MealAnalyser';
import HealthIntegration from '../screens/HealthIntegration';

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
        cardStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      {/* Main Tabs (Home, Log, Scan, Meal, Profile) */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ gestureEnabled: false }}
      />

      {/* ─── DETAIL SCREENS (Overlay Modals) ─── */}
      {/* Glucose */}
      <Stack.Screen name="GlucoseMonitor" component={GlucoseMonitoring} />
      <Stack.Screen name="GlucoseEntry" component={GlucoseEntryScreen} />

      {/* Nutrition */}
      <Stack.Screen name="NutritionInsights" component={NutritionInsights} />
      <Stack.Screen name="MealEntry" component={MealEntryScreen} />

      {/* Sleep */}
      <Stack.Screen name="SleepInsights" component={SleepInsights} />

      {/* Water */}
      <Stack.Screen name="WaterEntry" component={WaterEntryScreen} />

      {/* Exercise */}
      <Stack.Screen name="ExerciseEntry" component={ExerciseEntryScreen} />

      {/* BMI */}
      <Stack.Screen name="BMICalculator" component={BMICalculatorScreen} />

      {/* Education */}
      <Stack.Screen name="Education" component={EducationScreen} />

      {/* ─── PLACEHOLDER SCREENS ─── */}
      {/* These are called from HomeScreen, created to prevent navigation crashes */}
      <Stack.Screen name="ActivityTracker" component={ActivityTracker} />
      <Stack.Screen name="BodyComposition" component={BodyComposition} />
      <Stack.Screen name="MealAnalyser" component={MealAnalyser} />
      <Stack.Screen name="HealthIntegration" component={HealthIntegration} />
    </Stack.Navigator>
  );
}
