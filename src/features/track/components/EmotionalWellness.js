// components/EmotionalWellness.jsx
// Emojis rendered as Text — no icon library needed for these

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";

const STRESS_OPTIONS = [
  { key: "calm", emoji: "😌", label: "Calm" },
  { key: "steady", emoji: "😊", label: "Steady" },
  { key: "balanced", emoji: "😐", label: "Balanced" },
  { key: "tense", emoji: "😟", label: "Tense" },
  { key: "high-stress", emoji: "😫", label: "High Stress" },
];

export default function EmotionalWellness({
  delay = 300,
  initialLevel = "balanced",
}) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(initialLevel);

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
        Emotional Wellness
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border + "80" },
        ]}
      >
        <Text style={[styles.prompt, { color: colors.mutedForeground }]}>
          How is your stress level right now?
        </Text>
        <View style={styles.emojiRow}>
          {STRESS_OPTIONS.map((opt) => {
            const isActive = selected === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={styles.emojiItem}
                activeOpacity={0.7}
                onPress={() => setSelected(opt.key)}
              >
                <View
                  style={[
                    styles.emojiCircle,
                    {
                      backgroundColor: isActive
                        ? colors.primary + "1A"
                        : colors.background,
                    },
                  ]}
                >
                  <Text
                    style={[styles.emoji, { opacity: isActive ? 1 : 0.45 }]}
                  >
                    {opt.emoji}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.emojiLabel,
                    {
                      color: isActive
                        ? colors.foreground
                        : colors.mutedForeground,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    padding: 24,
    borderWidth: 1,
    gap: 20,
  },
  prompt: {
    fontSize: 14,
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  emojiItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 24,
  },
  emojiLabel: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },
});
