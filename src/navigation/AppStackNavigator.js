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
import LogHistoryScreen from '../screens/LogHistoryScreen';
import BMICalculatorScreen from '../screens/BMICalculatorScreen';
import EducationScreen from '../screens/EducationScreen';
import ActivityTracker from '../screens/ActivityTracker';
import BodyComposition from '../screens/BodyComposition';
import MealAnalyser from '../screens/MealAnalyser';
import HealthIntegration from '../screens/HealthIntegration';

// Settings screens
import NotificationSettings from '../screens/settings/NotificationSettings';
import EditProfile from '../screens/settings/EditProfile';
import ChangePassword from '../screens/settings/ChangePassword';
import { 
  HealthGoals, 
  PrivacySettings, 
  DataSync, 
  ExportData, 
  Appearance, 
  About, 
  Support, 
  DeleteAccount, 
  Notifications 
} from '../screens/settings/PlaceholderSettings';

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
        options={{ gestureEnabled: false, animationEnabled: false }}
      />

      {/* ─── DETAIL SCREENS (Overlay Modals) ─── */}
      {/* Glucose */}
      <Stack.Screen name="GlucoseMonitor" component={GlucoseMonitoring} options={{ gestureEnabled: false }} />
      <Stack.Screen name="GlucoseEntry" component={GlucoseEntryScreen} options={{ gestureEnabled: false }} />

      {/* Nutrition */}
      <Stack.Screen name="NutritionInsights" component={NutritionInsights} options={{ gestureEnabled: false }} />
      <Stack.Screen name="MealEntry" component={MealEntryScreen} options={{ gestureEnabled: false }} />

      {/* Sleep */}
      <Stack.Screen name="SleepInsights" component={SleepInsights} options={{ gestureEnabled: false }} />

      {/* Water */}
      <Stack.Screen name="WaterEntry" component={WaterEntryScreen} options={{ gestureEnabled: false }} />

      {/* Exercise */}
      <Stack.Screen name="ExerciseEntry" component={ExerciseEntryScreen} options={{ gestureEnabled: false }} />

      {/* Logs */}
      <Stack.Screen name="LogHistory" component={LogHistoryScreen} options={{ gestureEnabled: false }} />

      {/* BMI */}
      <Stack.Screen name="BMICalculator" component={BMICalculatorScreen} options={{ gestureEnabled: false }} />

      {/* Education */}
      <Stack.Screen name="Education" component={EducationScreen} options={{ gestureEnabled: false }} />

      {/* ─── PLACEHOLDER SCREENS ─── */}
      {/* These are called from HomeScreen, created to prevent navigation crashes */}
      <Stack.Screen name="ActivityTracker" component={ActivityTracker} />
      <Stack.Screen name="BodyComposition" component={BodyComposition} />
      <Stack.Screen name="MealAnalyser" component={MealAnalyser} />
      <Stack.Screen name="HealthIntegration" component={HealthIntegration} />

      {/* ─── SETTINGS SCREENS ─── */}
      <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ gestureEnabled: false }} />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{ gestureEnabled: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ gestureEnabled: false }} />
      <Stack.Screen name="HealthGoals" component={HealthGoals} options={{ gestureEnabled: false }} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettings} options={{ gestureEnabled: false }} />
      <Stack.Screen name="DataSync" component={DataSync} options={{ gestureEnabled: false }} />
      <Stack.Screen name="ExportData" component={ExportData} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Appearance" component={Appearance} options={{ gestureEnabled: false }} />
      <Stack.Screen name="About" component={About} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Support" component={Support} options={{ gestureEnabled: false }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccount} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Notifications" component={Notifications} options={{ gestureEnabled: false }} />
    </Stack.Navigator>
  );
}
