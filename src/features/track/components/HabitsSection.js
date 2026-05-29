// components/HabitsSection.jsx
// Small, self-contained habits list used on the Track screen.
// Install icons: npx expo install @expo/vector-icons

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

const HABITS = [
  {
    id: "walk",
    iconName: "walk",
    iconBg: "#E6F4EA",
    iconColor: "#34C759",
    title: "Walk",
    subtitle: "Short walk goal",
    completed: false,
  },
  {
    id: "hydrate",
    iconName: "water",
    iconBg: "#E6F0FF",
    iconColor: "#0A84FF",
    title: "Hydration",
    subtitle: "2L goal",
    completed: false,
  },
  {
    id: "herbalTea",
    iconName: "leaf",
    iconBg: "#E8F9F0",
    iconColor: "#34C759",
    title: "Herbal Tea (Unsweetened)",
    subtitle: "1 cup",
    completed: false,
  },
];

export default function HabitsSection({ navigation, delay = 300 }) {
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

  return (
    <Animated.View style={animStyle}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Habits &amp; Movement
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border + "80" },
        ]}
      >
        {HABITS.map((habit, index) => (
          <React.Fragment key={habit.id}>
            <TouchableOpacity activeOpacity={0.7} style={styles.row}>
              <View
                style={[styles.iconWrap, { backgroundColor: habit.iconBg }]}
              >
                <Ionicons
                  name={habit.iconName}
                  size={22}
                  color={habit.iconColor}
                />
              </View>

              <View style={styles.textGroup}>
                <Text style={[styles.habitTitle, { color: colors.foreground }]}>
                  {habit.title}
                </Text>
                <Text
                  style={[styles.habitSub, { color: colors.mutedForeground }]}
                >
                  {habit.subtitle}
                </Text>
              </View>

              {habit.completed ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.secondary}
                />
              ) : (
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={colors.mutedForeground}
                />
              )}
            </TouchableOpacity>

            {index < HABITS.length - 1 && (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.border + "80" },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
    marginBottom: 16,
  },
  card: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  habitSub: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
