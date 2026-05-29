import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import SolarIcon from "../components/SolarIcon";
import CustomTabBar from "./CustomTabBar";

// stable renderer to avoid defining component inline inside MainTabNavigator
const renderCustomTabBar = (props) => <CustomTabBar {...props} />;

import { HomeScreen } from "../features/home";
import { TrackScreen } from "../features/track";
import { LearnScreen } from "../features/learn";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import FocusAnimatedScreen from "../components/FocusAnimatedScreen";

const Tab = createBottomTabNavigator();

function TabBarIcon({ name, focused, color, size = 24 }) {
  switch (name) {
    case "Home":
      // Becomes bold-duotone when inactive, solid bold when active
      return (
        <SolarIcon
          name={focused ? "home-smile-bold" : "home-smile-bold-duotone"}
          size={size}
          color={color}
        />
      );
    case "Track":
      // Using add-circle from the mockup spec: solar:add-circle-bold-duotone
      return (
        <SolarIcon
          name={focused ? "add-circle-bold" : "add-circle-bold-duotone"}
          size={size}
          color={color}
        />
      );
    case "Learn":
      // solar:book-bookmark-bold
      return (
        <SolarIcon
          name={focused ? "book-bookmark-bold" : "book-bookmark-bold-duotone"}
          size={size}
          color={color}
        />
      );
    case "Profile":
      // solar:user-circle-bold-duotone
      return (
        <SolarIcon
          name={focused ? "user-circle-bold" : "user-circle-bold-duotone"}
          size={size}
          color={color}
        />
      );
    default:
      return null;
  }
}

function buildScreenOptions(insets, colors) {
  return ({ route }) => ({
    headerShown: false,
    tabBarShowLabel: true,
    tabBarHideOnKeyboard: true,

    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.mutedForeground,

    tabBarStyle: [
      styles.tabBarStyle,
      {
        // Safe area offset positioning matching fixed bottom-6 left-6 right-6
        bottom: insets.bottom > 0 ? insets.bottom : 24,
      },
    ],

    tabBarLabelStyle: {
      fontFamily: "DM Sans",
      fontSize: 10,
      fontWeight: "500",
      marginTop: 2,
    },

    tabBarItemStyle: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },

    tabBarIcon: ({ focused, color }) => (
      <TabBarIcon name={route.name} focused={focused} color={color} size={24} />
    ),
  });
}

export default function MainTabNavigator() {
  try {
    const profiler = require("../utils/renderProfiler");
    profiler.increment("MainTabNavigator");
  } catch (error) {
    // no-op
  }

  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const screenOptions = React.useMemo(
    () => buildScreenOptions(insets, colors),
    [insets, colors]
  );

  const sceneBackgroundColor = colors.background;

  return (
    <Tab.Navigator
      screenOptions={screenOptions}
      tabBar={renderCustomTabBar}
      sceneContainerStyle={{ backgroundColor: sceneBackgroundColor }}
    >
      <Tab.Screen name="Home" options={{ tabBarLabel: "Home" }}>
        {(props) => (
          <FocusAnimatedScreen routeName={props.route.name}>
            <HomeScreen {...props} />
          </FocusAnimatedScreen>
        )}
      </Tab.Screen>

      <Tab.Screen name="Track" options={{ tabBarLabel: "Track" }}>
        {(props) => (
          <FocusAnimatedScreen routeName={props.route.name}>
            <TrackScreen {...props} />
          </FocusAnimatedScreen>
        )}
      </Tab.Screen>

      <Tab.Screen name="Learn" options={{ tabBarLabel: "Learn" }}>
        {(props) => (
          <FocusAnimatedScreen routeName={props.route.name}>
            <LearnScreen {...props} />
          </FocusAnimatedScreen>
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile" options={{ tabBarLabel: "Profile" }}>
        {(props) => (
          <FocusAnimatedScreen routeName={props.route.name}>
            <ProfileScreen {...props} />
          </FocusAnimatedScreen>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    position: "absolute",
    left: 24,
    right: 24,
    height: 68,
    borderRadius: 100, // rounded-full
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderTopWidth: 1,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 220, 0.9)",
    paddingHorizontal: 16,

    // Smooth elevation & shadow system matching shadow-2xl layout
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});
