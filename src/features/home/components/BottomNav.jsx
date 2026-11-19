/* eslint-disable react-native/no-inline-styles */
// screens/home/components/BottomNav.jsx
//
// Light bar following the fresh reference: white, soft top border, and the
// active tab as a dark pill holding its icon and label. Inactive tabs show
// an icon only, in muted grey-green.

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SolarIcon from "../../../components/SolarIcon";
import { useTheme } from "../../../theme/ThemeProvider";

const NAV_ITEMS = [
  { label: "Home", route: "Home", icon: "home-smile", iconOut: "home-outline" },
  { label: "Plan", route: "Plan", icon: "map", iconOut: "map-outline" },
  {
    label: "Foods",
    route: "Foods",
    icon: "restaurant",
    iconOut: "restaurant-outline",
  },
  {
    label: "Track",
    route: "Track",
    icon: "add-circle",
    iconOut: "add-circle-outline",
  },
  {
    label: "Learn",
    route: "Learn",
    icon: "book-bookmark",
    iconOut: "book-outline",
  },
  {
    label: "Profile",
    route: "Profile",
    icon: "person",
    iconOut: "person-outline",
  },
];

// Nav content height: 64px + safe-area padding below on iOS.
const NAV_CONTENT_HEIGHT = 64;

function TabIcon({ route, active, color }) {
  const size = 22;
  if (route === "Home") {
    return <SolarIcon name="home-bottomnav-bold" size={size} color={color} />;
  }
  if (route === "Learn") {
    return (
      <SolarIcon name="book-bookmark-bold-duotone" size={size} color={color} />
    );
  }
  if (route === "Profile") {
    return (
      <SolarIcon name="user-circle-bold-duotone" size={size} color={color} />
    );
  }
  const item = NAV_ITEMS.find((entry) => entry.route === route);
  return (
    <Ionicons
      name={active ? item.icon : item.iconOut}
      size={size}
      color={color}
    />
  );
}

export default function BottomNav({ navigation, currentRouteName }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
        },
      ]}
    >
      <View style={styles.inner}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentRouteName === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => navigation?.navigate(item.route)}
              activeOpacity={0.75}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              {isActive ? (
                <View
                  style={[styles.activePill, { backgroundColor: colors.text }]}
                >
                  <TabIcon route={item.route} active color="#FFFFFF" />
                  <Text style={styles.activeLabel}>{item.label}</Text>
                </View>
              ) : (
                <View style={styles.inactiveTab}>
                  <TabIcon
                    route={item.route}
                    active={false}
                    color={colors.mutedForeground}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: "#1E2B1A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    height: NAV_CONTENT_HEIGHT,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  inactiveTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
});
