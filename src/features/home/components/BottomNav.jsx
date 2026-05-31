// screens/home/components/BottomNav.jsx
//
// Full-width border-top nav — matches HTML design exactly.
// NOT a floating pill. Fixed to bottom with blur background.
//
// Install: npx expo install expo-blur

import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import SolarIcon from "../../../components/SolarIcon";
import { useTheme } from "../../../theme/ThemeProvider";

const NAV_ITEMS = [
  { label: "Home", route: "Home", icon: "home-smile", iconOut: "home-outline" },
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

// HTML nav height = h-20 = 80px content + safe-area padding below
const NAV_CONTENT_HEIGHT = 80;

export default function BottomNav({ navigation, currentRouteName }) {
  const { colors } = useTheme();

  const wrapperStyle = useMemo(
    () => [styles.wrapper, { borderTopColor: colors.border }],
    [colors.border]
  );

  // rgba(background, 0.80) — matches HTML bg-background/80
  const blurOverlayStyle = useMemo(
    () => [
      StyleSheet.absoluteFill,
      { backgroundColor: `${colors.background}CC` },
    ],
    [colors.background]
  );

  const innerStyle = useMemo(
    () => [
      styles.inner,
      {
        // iOS: add physical home-indicator space (≈20–34 pt)
        // Android: no extra padding needed
        paddingBottom: Platform.OS === "ios" ? 20 : 0,
      },
    ],
    []
  );

  return (
    <View style={wrapperStyle}>
      {/* Blur layer — mirrors backdrop-blur-xl */}
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      {/* Tint overlay on top of blur */}
      <View style={blurOverlayStyle} />

      <View style={innerStyle}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentRouteName === item.route;
          const iconColor = isActive ? colors.primary : colors.mutedForeground;

          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => navigation?.navigate(item.route)}
              activeOpacity={0.7}
              style={styles.tab}
            >
              {item.route === "Home" ? (
                <SolarIcon
                  name="home-bottomnav-bold"
                  size={24}
                  color={iconColor}
                />
              ) : item.route === "Learn" ? (
                <SolarIcon
                  name="book-bookmark-bold-duotone"
                  size={24}
                  color={iconColor}
                />
              ) : item.route === "Profile" ? (
                <SolarIcon
                  name="user-circle-bold-duotone"
                  size={24}
                  color={iconColor}
                />
              ) : (
                <Ionicons
                  name={isActive ? item.icon : item.iconOut}
                  size={24}
                  color={iconColor}
                />
              )}
              <Text
                style={[
                  styles.tabLabel,
                  { color: iconColor },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {item.label}
              </Text>
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
    borderTopWidth: StyleSheet.hairlineWidth, // matches border-white/5 — ultra-thin
    overflow: "hidden",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    height: NAV_CONTENT_HEIGHT, // h-20 = 80px, matching HTML exactly
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6, // gap-1.5 ≈ 6px
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10, // text-[10px]
    fontWeight: "500",
    letterSpacing: 0.5, // tracking-wide approximation
  },
  tabLabelActive: {
    fontWeight: "700", // active tab is bolder in the HTML
  },
});

// NOTE: If expo-blur causes issues on older devices, replace the BlurView with:
//   <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background + "E6" }]} />
