// components/home/PressScale.jsx
// Small spring press feedback for tappable cards: shrinks to 96% while
// pressed, springs back on release. Fast and quiet — it confirms the tap
// without drawing attention to itself.

import React from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PressScale({
  children,
  onPress,
  style,
  accessibilityLabel,
  accessibilityRole = "button",
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 18, stiffness: 350 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 350 });
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
