/* eslint-disable react-native/no-inline-styles */
// screens/home/components/BottomNav.jsx
//
// Light bar following the fresh reference: white, soft top border, and the
// active tab as a dark pill holding its icon and label. Inactive tabs show
// an icon only, in muted grey-green.
//
// The pill is a single absolutely-positioned element that glides between
// tabs on a critically damped Reanimated spring (no overshoot). Each tab
// also renders an invisible copy of its pill, so the pill's width is known
// before that tab is ever active. On first mount the pill appears in place
// — it never glides in from nowhere.

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
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

// Pill height: 22px icon + 9px vertical padding on each side.
const PILL_HEIGHT = 40;
const PILL_TOP = (NAV_CONTENT_HEIGHT - PILL_HEIGHT) / 2;

// Critically damped spring (damping ratio ~0.97): the pill glides and
// settles without overshoot.
const PILL_SPRING = { damping: 30, stiffness: 240 };

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

function PillContent({ route }) {
  const item = NAV_ITEMS.find((entry) => entry.route === route);
  return (
    <>
      <TabIcon route={route} active color="#FFFFFF" />
      <Text style={styles.activeLabel}>{item.label}</Text>
    </>
  );
}

export default function BottomNav({ navigation, currentRouteName }) {
  const { colors } = useTheme();

  // Measured layouts, keyed by route: tab container (x/width relative to
  // the row) and the pill content width inside it.
  const tabLayouts = useRef({});
  const pillWidths = useRef({});
  const didInit = useRef(false);
  const [pillReady, setPillReady] = useState(false);
  const pillX = useSharedValue(0);
  const pillW = useSharedValue(0);

  const updatePill = useCallback(
    (animate) => {
      const tab = tabLayouts.current[currentRouteName];
      const width = pillWidths.current[currentRouteName];
      if (!tab || !width) return;
      const x = tab.x + (tab.width - width) / 2;
      if (!didInit.current) {
        // First mount: appear in place, no glide from nowhere.
        pillX.value = x;
        pillW.value = width;
        didInit.current = true;
        setPillReady(true);
      } else if (animate) {
        pillX.value = withSpring(x, PILL_SPRING);
        pillW.value = withSpring(width, PILL_SPRING);
      } else {
        pillX.value = x;
        pillW.value = width;
      }
    },
    [currentRouteName, pillX, pillW]
  );

  // Glide when the active tab changes. All tabs are measured at mount, so
  // the target is always known by now.
  useEffect(() => {
    if (didInit.current) updatePill(true);
  }, [updatePill]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillW.value,
  }));

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
        {pillReady && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glidingPill,
              pillStyle,
              { backgroundColor: colors.text },
            ]}
          >
            <PillContent route={currentRouteName} />
          </Animated.View>
        )}
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
              onLayout={(event) => {
                tabLayouts.current[item.route] = event.nativeEvent.layout;
                if (isActive) updatePill(false);
              }}
            >
              {/* Invisible copy of the pill: measures its width so the
                  gliding pill knows where to land before a tab is active.
                  Absolutely positioned so it never disturbs the layout. */}
              <View
                aria-hidden
                pointerEvents="none"
                style={[styles.activePill, styles.measuringPill]}
                onLayout={(event) => {
                  pillWidths.current[item.route] =
                    event.nativeEvent.layout.width;
                  if (isActive) updatePill(false);
                }}
              >
                <PillContent route={item.route} />
              </View>
              {!isActive && (
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
  glidingPill: {
    position: "absolute",
    left: 0,
    top: PILL_TOP,
    height: PILL_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
  },
  measuringPill: {
    position: "absolute",
    opacity: 0,
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
