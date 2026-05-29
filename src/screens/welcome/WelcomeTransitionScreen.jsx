import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";

const { width: W, height: H } = Dimensions.get("window");

export default function WelcomeTransitionScreen({ userName = "there", onFinish }) {
  const { colors } = useTheme();
  const containerOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.7);
  const iconOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(16);
  const subOpacity = useSharedValue(0);
  const subY = useSharedValue(14);
  const exitOpacity = useSharedValue(1);

  const firstName = userName?.split(" ")[0] || "there";

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    containerOpacity.value = withTiming(1, { duration: 280, easing: ease });
    iconScale.value = withDelay(120, withSpring(1, { damping: 13, stiffness: 120 }));
    iconOpacity.value = withDelay(120, withTiming(1, { duration: 280, easing: ease }));
    textOpacity.value = withDelay(360, withTiming(1, { duration: 420, easing: ease }));
    textY.value = withDelay(360, withTiming(0, { duration: 420, easing: ease }));
    subOpacity.value = withDelay(620, withTiming(1, { duration: 420, easing: ease }));
    subY.value = withDelay(620, withTiming(0, { duration: 420, easing: ease }));

    exitOpacity.value = withDelay(
      1600,
      withTiming(0, { duration: 520, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) {
          onFinish?.();
        }
      })
    );
  }, [onFinish]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
    transform: [{ translateY: subY.value }],
  }));
  const exitStyle = useAnimatedStyle(() => ({ opacity: exitOpacity.value }));

  return (
    <Animated.View style={[styles.root, { backgroundColor: colors.background }, exitStyle]}>
      <LinearGradient colors={[colors.primary + "18", "transparent"]} style={styles.glow} />

      <Animated.View style={[styles.inner, containerStyle]}>
        <Animated.View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }, iconStyle]}>
          <Ionicons name="sparkles" size={40} color={colors.primary} />
        </Animated.View>

        <Animated.View style={textStyle}>
          <Text style={[styles.welcomeLabel, { color: colors.mutedForeground }]}>Welcome to Reversia,</Text>
          <Text style={[styles.userName, { color: colors.foreground }]}>{firstName}.</Text>
        </Animated.View>

        <Animated.Text style={[styles.subtitle, { color: colors.mutedForeground }, subStyle]}>
          Your personalized insights are ready when you are.
        </Animated.Text>
      </Animated.View>

      <View style={styles.pip}>
        <View style={[styles.pipBar, { backgroundColor: colors.primary }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    top: H / 2 - 180,
    left: W / 2 - 180,
  },
  inner: {
    alignItems: "center",
    gap: 22,
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  welcomeLabel: {
    fontSize: 18,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
  userName: {
    fontSize: 40,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  pip: {
    position: "absolute",
    bottom: 52,
    alignItems: "center",
  },
  pipBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.55,
  },
});
