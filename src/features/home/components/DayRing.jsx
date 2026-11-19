// components/home/DayRing.jsx
// Custom SVG progress ring for the Home hero — drawn from scratch with
// react-native-svg and animated with a Reanimated spring. No progress-bar
// library: the ring is Reversia's own day-at-a-glance mark.

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { T, FONTS } from "../../../theme/tokens";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Counts from 0 to `target` once, eased, with requestAnimationFrame so it
// behaves identically on native and web.
function useCountUp(target, duration = 900, delay = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start = 0;
    let cancelled = false;
    const timeout = setTimeout(() => {
      const step = (t) => {
        if (cancelled) return;
        if (!start) start = t;
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return value;
}

export default function DayRing({
  value = 0,
  total = 1,
  size = 216,
  strokeWidth = 18,
  color = T.PRIMARY,
  trackColor = T.PRIMARY_LIGHT,
  delay = 120,
  label = "captured today",
}) {
  const pct = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const progress = useSharedValue(0);
  const number = useCountUp(Math.round(pct * 100), 900, delay);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withSpring(pct, { damping: 20, stiffness: 90 })
    );
  }, [pct, delay, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - progress.value),
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.number}>{number}%</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    fontFamily: FONTS.display,
    fontSize: 64,
    fontWeight: "800",
    color: T.TEXT,
    letterSpacing: -1.5,
    lineHeight: 70,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: "700",
    color: T.MUTED,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 2,
  },
});
