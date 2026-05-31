import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import ReversiaMark from "../../components/ReversiaMark";

const { width: W, height: H } = Dimensions.get("window");

const C = {
  background: "#231F1C",
  primary: "#E07A5F",
  secondary: "#798C73",
  foreground: "#F5F5F4",
  muted: "#3E3835",
  mutedFg: "#A8A29E",
  card: "#2D2825",
};

export default function SplashScreen({ onFinish }) {
  const ringScale1 = useSharedValue(0);
  const ringScale2 = useSharedValue(0);
  const ringScale3 = useSharedValue(0);
  const ringOpacity1 = useSharedValue(0);
  const ringOpacity2 = useSharedValue(0);
  const ringOpacity3 = useSharedValue(0);
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkY = useSharedValue(8);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(8);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    ringScale1.value = withDelay(
      200,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
    ringOpacity1.value = withDelay(200, withTiming(0.12, { duration: 400 }));

    ringScale2.value = withDelay(
      400,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    ringOpacity2.value = withDelay(
      400,
      withSequence(
        withTiming(0.1, { duration: 400 }),
        withDelay(500, withTiming(0, { duration: 500 }))
      )
    );

    ringScale3.value = withDelay(
      550,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
    ringOpacity3.value = withDelay(550, withTiming(0.06, { duration: 400 }));

    logoScale.value = withDelay(
      300,
      withSpring(1, { damping: 14, stiffness: 120 })
    );
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

    wordmarkOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    wordmarkY.value = withDelay(
      700,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    taglineOpacity.value = withDelay(950, withTiming(1, { duration: 500 }));
    taglineY.value = withDelay(
      950,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    screenOpacity.value = withDelay(
      2400,
      withTiming(
        0,
        { duration: 600, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished && onFinish) runOnJS(onFinish)();
        }
      )
    );
  }, [
    ringScale1,
    ringScale2,
    ringScale3,
    ringOpacity1,
    ringOpacity2,
    ringOpacity3,
    logoScale,
    logoOpacity,
    wordmarkOpacity,
    wordmarkY,
    taglineOpacity,
    taglineY,
    screenOpacity,
    onFinish,
  ]);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale1.value }],
    opacity: ringOpacity1.value,
  }));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale2.value }],
    opacity: ringOpacity2.value,
  }));
  const ring3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale3.value }],
    opacity: ringOpacity3.value,
  }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));
  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[splashStyles.root, screenStyle]}>
      <LinearGradient
        colors={[C.primary + "18", "transparent"]}
        style={splashStyles.glow}
      />

      <Animated.View
        style={[
          splashStyles.ring,
          { width: 320, height: 320, borderRadius: 160 },
          ring3Style,
        ]}
      />
      <Animated.View
        style={[
          splashStyles.ring,
          { width: 230, height: 230, borderRadius: 115 },
          ring2Style,
        ]}
      />
      <Animated.View
        style={[
          splashStyles.ring,
          { width: 160, height: 160, borderRadius: 80 },
          ring1Style,
        ]}
      />

      <Animated.View style={[splashStyles.logoWrap, logoStyle]}>
        <LinearGradient
          colors={[C.primary, "#C9614A"]}
          style={splashStyles.logoGradient}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
        >
          <ReversiaMark size={80} />
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[splashStyles.textGroup, wordmarkStyle]}>
        <Text style={splashStyles.wordmark}>
          <Text style={{ color: C.primary }}>Reversia</Text>
        </Text>
      </Animated.View>

      <Animated.Text style={[splashStyles.tagline, taglineStyle]}>
        Reverse what can be reversed.
      </Animated.Text>

      <View style={splashStyles.bottomBar}>
        <View
          style={[splashStyles.bottomLine, { backgroundColor: C.primary }]}
        />
      </View>
    </Animated.View>
  );
}

const splashStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    top: H / 2 - 200,
    left: W / 2 - 200,
  },
  ring: { position: "absolute", borderWidth: 1, borderColor: C.primary },
  logoWrap: { marginBottom: 28 },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  arc: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
  },
  arcTop: {
    top: 0,
    left: 0,
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
  },
  arcBottom: {
    bottom: 0,
    right: 0,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
  },
  logoDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#FFFFFF",
  },
  textGroup: { alignItems: "center" },
  wordmark: {
    fontSize: 36,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: C.mutedFg,
    fontFamily: "DMSans_400Regular",
    letterSpacing: 0.3,
    marginTop: 10,
  },
  bottomBar: { position: "absolute", bottom: 52, alignItems: "center" },
  bottomLine: { width: 40, height: 4, borderRadius: 2, opacity: 0.6 },
});
