// components/ProgressRing.jsx
// A circular progress ring that sweeps to its value instead of
// jumping there. The arc is an SVG circle whose dash offset is
// animated on the UI thread (the standard reanimated + SVG pattern).
// `children` render centred inside the ring — usually the count the
// ring is showing. Progress is clamped to 0–1.
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ProgressRing({
  progress = 0,
  size = 48,
  strokeWidth = 5,
  color = "#689F38",
  trackColor = "#DCE8D4",
  duration = 900,
  style,
  children,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress || 0));
  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(clamped, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, duration, animated]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animated.value),
  }));

  const centre = size / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={centre}
          cy={centre}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={centre}
          cy={centre}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${centre} ${centre})`}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
