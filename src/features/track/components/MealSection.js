// components/MealSection.jsx
// Uses: Ionicons (camera → solar:camera-bold-duotone)
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

export default function MealSection({ navigation, delay = 100 }) {
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
      {/* Section header */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Meals
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.card, borderColor: colors.border + "80" },
          ]}
        >
          <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
            AI Smart Recognition
          </Text>
        </View>
      </View>

      {/* Camera snap button with dashed border */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => navigation?.navigate("MealEntry", { openCamera: true })}
        style={[
          styles.snapButton,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary + "50", // ~30% opacity
          },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.primary + "1A" },
          ]}
        >
          {/* Solar: solar:camera-bold-duotone → Ionicons: camera */}
          <Ionicons name="camera" size={32} color={colors.primary} />
        </View>
        <View style={styles.snapText}>
          <Text style={[styles.snapTitle, { color: colors.foreground }]}>
            Snap your meal
          </Text>
          <Text style={[styles.snapSub, { color: colors.mutedForeground }]}>
            Recognizes Nigerian &amp; African dishes
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  snapButton: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  snapText: {
    alignItems: "center",
    gap: 4,
  },
  snapTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  snapSub: {
    fontSize: 14,
  },
});
