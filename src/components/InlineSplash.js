import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import ReversiaMark from "./ReversiaMark";

export default function InlineSplash() {
  const logoScale = useSharedValue(0.9);
  const glowScale = useSharedValue(0.92);
  const glowOpacity = useSharedValue(0.18);
  const haloScale = useSharedValue(0.88);
  const haloOpacity = useSharedValue(0.08);

  useEffect(() => {
    logoScale.value = withDelay(100, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }));
    glowOpacity.value = withDelay(80, withTiming(0.24, { duration: 500, easing: Easing.out(Easing.cubic) }));
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1600, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.92, { duration: 1600, easing: Easing.inOut(Easing.cubic) })
      ),
      -1,
      true
    );
    haloScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1800, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.88, { duration: 1800, easing: Easing.inOut(Easing.cubic) })
      ),
      -1,
      true
    );
    haloOpacity.value = withRepeat(
      withSequence(
        withTiming(0.12, { duration: 1800, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.04, { duration: 1800, easing: Easing.inOut(Easing.cubic) })
      ),
      -1,
      true
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value * glowScale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: haloOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#231F1C" />
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={logoStyle}>
        <ReversiaMark size={112} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#231F1C",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(224, 122, 95, 0.18)",
    shadowColor: "#E07A5F",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
