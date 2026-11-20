// components/PopOnActive.jsx
// Wraps children in a view that pops (a quick scale overshoot) the
// moment `active` flips from false to true — the completed-state
// transition for task rows and milestone rows. Nothing happens on
// mount when `active` is already true, and nothing happens when it
// flips back to false: only the completion moment pops.
import React, { useEffect, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function PopOnActive({ active, style, children }) {
  const scale = useSharedValue(1);
  const prevActive = useRef(active);

  useEffect(() => {
    if (active && !prevActive.current) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 120 }),
        withSpring(1, { damping: 8, stiffness: 300 })
      );
    }
    prevActive.current = active;
  }, [active, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
}
