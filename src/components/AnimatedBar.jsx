// components/AnimatedBar.jsx
// A progress bar whose fill sweeps to its value instead of jumping
// there. The track and fill styles come from the caller, so the bar
// looks exactly like the static bar it replaces — only the width is
// animated. `percent` is clamped to 0–100.
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function AnimatedBar({
  percent,
  trackStyle,
  fillStyle,
  duration = 900,
}) {
  const clamped = Math.max(0, Math.min(100, percent || 0));
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(clamped, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, duration, fill]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${fill.value}%`,
  }));

  return (
    <View style={trackStyle}>
      <Animated.View style={[fillStyle, animatedFillStyle]} />
    </View>
  );
}
