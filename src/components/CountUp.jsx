// components/CountUp.jsx
// A number that counts up to its target instead of jumping there.
// Used for progress numbers (plan percent, fasting sugar, today's
// stats, weekly counts). The animation runs on the UI thread via
// reanimated; the displayed value is mirrored into React state so
// it renders as ordinary text. `from` is only the starting value
// on mount — when `value` changes later, the count continues from
// wherever it currently is.
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function CountUp({
  value,
  from = 0,
  duration = 900,
  style,
  prefix = "",
  suffix = "",
}) {
  const target = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  const animated = useSharedValue(from);
  const [displayed, setDisplayed] = useState(from);

  useEffect(() => {
    animated.value = withTiming(target, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, duration, animated]);

  // Mirror the animated value into state. React bails out when the
  // rounded value has not changed, so this is one render per step.
  useAnimatedReaction(
    () => Math.round(animated.value),
    (rounded) => {
      runOnJS(setDisplayed)(rounded);
    }
  );

  return (
    <Text style={style}>
      {prefix}
      {displayed}
      {suffix}
    </Text>
  );
}
