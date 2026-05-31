import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "../theme/ThemeProvider";
import BottomNav from "../features/home/components/BottomNav";

import { HomeScreen } from "../features/home";
import { TrackScreen } from "../features/track";
import { LearnScreen } from "../features/learn";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import FocusAnimatedScreen from "../components/FocusAnimatedScreen";

const Tab = createBottomTabNavigator();

function HomeWrapper(props) {
  return (
    <FocusAnimatedScreen routeName={props.route.name}>
      <HomeScreen {...props} />
    </FocusAnimatedScreen>
  );
}

function TrackWrapper(props) {
  return (
    <FocusAnimatedScreen routeName={props.route.name}>
      <TrackScreen {...props} />
    </FocusAnimatedScreen>
  );
}

function LearnWrapper(props) {
  return (
    <FocusAnimatedScreen routeName={props.route.name}>
      <LearnScreen {...props} />
    </FocusAnimatedScreen>
  );
}

function ProfileWrapper(props) {
  return (
    <FocusAnimatedScreen routeName={props.route.name}>
      <ProfileScreen {...props} />
    </FocusAnimatedScreen>
  );
}

function buildScreenOptions() {
  return () => ({
    headerShown: false,
    tabBarHideOnKeyboard: true,
  });
}

function TabBarRenderer(props) {
  return (
    <BottomNav
      navigation={props.navigation}
      currentRouteName={props.state.routes[props.state.index].name}
    />
  );
}

export default function MainTabNavigator() {
  try {
    const profiler = require("../utils/renderProfiler");
    profiler.increment("MainTabNavigator");
  } catch (error) {}

  const { colors } = useTheme();
  const screenOptions = React.useMemo(() => buildScreenOptions(), []);

  const sceneBackgroundColor = colors.background;

  return (
    <Tab.Navigator
      screenOptions={screenOptions}
      tabBar={TabBarRenderer}
      sceneContainerStyle={{ backgroundColor: sceneBackgroundColor }}
    >
      <Tab.Screen
        name="Home"
        component={HomeWrapper}
        options={{ tabBarLabel: "Home" }}
      />

      <Tab.Screen
        name="Track"
        component={TrackWrapper}
        options={{ tabBarLabel: "Track" }}
      />

      <Tab.Screen
        name="Learn"
        component={LearnWrapper}
        options={{ tabBarLabel: "Learn" }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileWrapper}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}
