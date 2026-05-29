// components/QuickStatsGrid.jsx
// Solar icon mapping:
//   solar:cup-bold-duotone       → Ionicons: cafe
//   solar:add-circle-linear      → Ionicons: add-circle-outline
//   solar:moon-bold-duotone      → Ionicons: moon
//   solar:pen-new-square-linear  → Ionicons: create-outline
// Install: npx expo install @expo/vector-icons

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";

function StatCard({
  iconName,
  iconColor,
  iconBg,
  actionIcon,
  title,
  value,
  onPress,
  colors,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border + "80" },
      ]}
    >
      {/* Top row: icon + action button */}
      <View style={styles.cardTop}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
        <Ionicons name={actionIcon} size={22} color={colors.mutedForeground} />
      </View>

      {/* Labels */}
      <Text style={[styles.cardTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      <Text style={[styles.cardValue, { color: colors.mutedForeground }]}>
        {value}
      </Text>
    </TouchableOpacity>
  );
}

export default function QuickStatsGrid({
  delay = 200,
  hydrationLiters = 0,
  sleepLabel = "No sleep logged",
  onHydrationPress,
  onSleepPress,
}) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  React.useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const hydrationDisplay =
    hydrationLiters > 0 ? `${hydrationLiters.toFixed(1)}L today` : "0L today";

  return (
    <Animated.View style={[styles.grid, animStyle]}>
      <StatCard
        iconName="cafe" // solar:cup-bold-duotone
        iconColor={colors.primary}
        iconBg={colors.primary + "33"}
        actionIcon="add-circle-outline" // solar:add-circle-linear
        title="Hydration"
        value={hydrationDisplay}
        onPress={onHydrationPress}
        colors={colors}
      />
      <StatCard
        iconName="moon" // solar:moon-bold-duotone
        iconColor={colors.secondary}
        iconBg={colors.secondary + "33"}
        actionIcon="create-outline" // solar:pen-new-square-linear
        title="Sleep"
        value={sleepLabel}
        onPress={onSleepPress}
        colors={colors}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 16,
  },
  card: {
    flex: 1,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  cardValue: {
    fontSize: 13,
  },
});
