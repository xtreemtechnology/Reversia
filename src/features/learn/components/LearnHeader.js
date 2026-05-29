import React from "react";
import { Text, View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";

export default function LearnHeader({ delay = 0 }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }));
  }, [delay, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <View style={[styles.kicker, { backgroundColor: colors.primary + "1A" }]}>
        <Text style={[styles.kickerText, { color: colors.primary }]}>LEARNING</Text>
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>Knowledge for you</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Understanding your body through a local lens.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 12, gap: 8 },
  kicker: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  kickerText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
});
