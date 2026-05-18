// src/navigation/MainTabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";

import HomeScreen from "../features/home/screens/HomeScreen";
import LogScreen from "../features/log/screens/LogScreen";
import ScanScreen from "../features/scan/screens/ScanScreen";
import MealPlanScreen from "../features/meals/screens/MealPlanScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";

const Tab = createBottomTabNavigator();

// ─── Constants ────────────────────────────────────────────────────────────────
const TAB_BAR_HEIGHT = 74; // visible bar height (icon + label)
const SCAN_BTN_HEIGHT = 64; // center scan button diameter
const ANDROID_EXTRA_PAD = 12; // breathing room above Android system nav
const IOS_LABEL_PAD = 4;

function HomeTabIcon({ focused, color }) {
  const s = 26;

  return (
    <Ionicons name={focused ? "home" : "home-outline"} size={s} color={color} />
  );
}

function LogTabIcon({ focused, color }) {
  const s = 26;

  return (
    <MaterialCommunityIcons
      name={focused ? "plus-circle" : "plus-circle-outline"}
      size={s}
      color={color}
    />
  );
}

function MealTabIcon({ color }) {
  const s = 26;

  return (
    <MaterialCommunityIcons
      name="silverware-fork-knife"
      size={s}
      color={color}
    />
  );
}

function ProfileTabIcon({ focused, color }) {
  const s = 26;

  return (
    <Ionicons
      name={focused ? "person" : "person-outline"}
      size={s}
      color={color}
    />
  );
}

const TAB_ICON_COMPONENTS = {
  Home: HomeTabIcon,
  Log: LogTabIcon,
  Meal: MealTabIcon,
  Profile: ProfileTabIcon,
};

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // On Android, insets.bottom can be 0 with gesture nav or ~24 with 3-button nav.
  // We always add a minimum extra padding so the bar never touches the system bar.
  const androidBottom = Math.max(insets.bottom, ANDROID_EXTRA_PAD);
  const iosBottom = insets.bottom; // iOS safe area is reliable

  const tabBarHeight = Platform.select({
    android: TAB_BAR_HEIGHT + androidBottom,
    ios: TAB_BAR_HEIGHT + iosBottom,
  });

  const tabBarPaddingBottom = Platform.select({
    android: androidBottom,
    ios: iosBottom + IOS_LABEL_PAD,
  });

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.icon,
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 12,
          marginHorizontal: 12,
          marginBottom: 10,
          borderRadius: 28,
        },
        tabBarIcon: TAB_ICON_COMPONENTS[route.name] ?? null,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Log"
        component={LogScreen}
        options={{ tabBarLabel: "Log" }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: "",
          tabBarButton: ScanTabButton,
        }}
      />
      <Tab.Screen
        name="Meal"
        component={MealPlanScreen}
        options={{ tabBarLabel: "Meals" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}

// ─── Custom Scan (centre) Button ──────────────────────────────────────────────
// Positioned at the center of the tab bar without excessive lift
function ScanTabButton({
  onPress,
  onLongPress,
  accessibilityRole,
  accessibilityState,
  testID,
}) {
  const { colors } = useTheme();

  // Lift button so it sits centered on the tab bar, overlapping slightly
  const liftAmount = -(SCAN_BTN_HEIGHT / 2 - TAB_BAR_HEIGHT / 2) - 2;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      testID={testID}
      style={[styles.scanWrap, { top: liftAmount }]}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.scanRing,
          { backgroundColor: colors.card, shadowColor: colors.primary },
        ]}
      >
        <View style={[styles.scanBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="scan" size={26} color="#FFF" />
        </View>
      </View>
      <Text style={[styles.scanLabel, { color: colors.primary }]}>Scan</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },

  tabItem: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 2,
  },

  icon: {
    marginBottom: 0,
  },

  // ── Scan button ──
  scanWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    // Don't add paddingBottom here — it shifts the label position
  },
  scanRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  scanBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  scanLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
    marginBottom: Platform.OS === "android" ? 6 : 2,
  },
});
