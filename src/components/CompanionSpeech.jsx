// components/CompanionSpeech.jsx
// The companion's speech bubble: a short contextual line in the
// companion's own voice, next to the buddy. The copy always comes
// from real data (today's mood, tasks done, time of day) — never an
// invented pattern. The bubble replays its entrance (fade + rise)
// whenever the message changes: it remounts itself on a new message,
// so callers just pass the message.
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeProvider";
import { FONTS } from "../theme/tokens";

export default function CompanionSpeech({ message }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  if (!message) return null;
  return <Bubble key={message} message={message} styles={styles} />;
}

function Bubble({ message, styles }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.ease),
    });
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message}</Text>
        <View style={styles.tail} />
      </View>
    </Animated.View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    // The gap below the bubble is where the tail hangs; the tail
    // points down-right toward the buddy in the header below.
    wrap: {
      marginBottom: 12,
    },
    bubble: {
      backgroundColor: colors.muted,
      borderRadius: 18,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    text: {
      fontFamily: FONTS.body,
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
    },
    tail: {
      position: "absolute",
      bottom: -6,
      right: 30,
      width: 12,
      height: 12,
      backgroundColor: colors.muted,
      transform: [{ rotate: "45deg" }],
      borderRadius: 2,
    },
  });
}
