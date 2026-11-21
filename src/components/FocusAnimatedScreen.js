import React, { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeProvider";
import { TRANSITION_DURATION_MS } from "../navigation/transitions";

// Wraps a tab's content and animates it in every time the tab gains
// focus: a fade plus a small rise, over the same 300ms the stack
// transitions use — so switching tabs moves at the same pace as
// pushing a screen. The previous version faded from 0.98 to 1 over
// 160ms, which was effectively invisible: tab switches cut instantly
// while everything else in the app moved.
//
// On blur the values reset instantly (no exit animation): the tab
// leaving is replaced at once, and the entering tab's entrance
// covers the cut. On mount the focused tab plays its entrance too,
// so the app opens with the same motion.
export default function FocusAnimatedScreen({ children }) {
  const isFocused = useIsFocused();
  const { colors } = useTheme();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    if (isFocused) {
      opacity.value = withTiming(1, {
        duration: TRANSITION_DURATION_MS,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withTiming(0, {
        duration: TRANSITION_DURATION_MS,
        easing: Easing.out(Easing.ease),
      });
      return;
    }

    opacity.value = 0;
    translateY.value = 10;
  }, [isFocused, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        animatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
