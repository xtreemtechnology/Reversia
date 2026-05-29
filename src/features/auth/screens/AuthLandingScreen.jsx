import React, { useEffect } from "react";
import { View, Text, StyleSheet, Platform, StatusBar } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import ReversiaMark from "../../../components/ReversiaMark";
import AuthButton from "../components/AuthButton";

export default function AuthLandingScreen({ navigation }) {
  const { colors } = useTheme();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(16);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(24);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    logoOpacity.value = withDelay(100, withTiming(1, { duration: 500, easing: ease }));
    logoScale.value = withDelay(100, withSpring(1, { damping: 14, stiffness: 110 }));
    textOpacity.value = withDelay(320, withTiming(1, { duration: 460, easing: ease }));
    textY.value = withDelay(320, withTiming(0, { duration: 460, easing: ease }));
    cardOpacity.value = withDelay(520, withTiming(1, { duration: 460, easing: ease }));
    cardY.value = withDelay(520, withTiming(0, { duration: 460, easing: ease }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value, transform: [{ scale: logoScale.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value, transform: [{ translateY: textY.value }] }));
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value, transform: [{ translateY: cardY.value }] }));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.ring, { width: 360, height: 360, borderRadius: 180, borderColor: colors.primary + "18" }]} />
      <View style={[styles.ring, { width: 260, height: 260, borderRadius: 130, borderColor: colors.primary + "12" }]} />
      <View style={[styles.ring, { width: 170, height: 170, borderRadius: 85, borderColor: colors.primary + "20" }]} />

      <View style={styles.topSection}>
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <ReversiaMark size={64} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.brandGroup, textStyle]}>
          <Text style={styles.wordmark}>
            <Text style={{ color: colors.primary }}>Re</Text>
            <Text style={{ color: colors.text }}>versia</Text>
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Reverse what can be reversed.</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, cardStyle]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Begin your journey</Text>
        <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>Track your habits, understand your body, and start reversing what can be reversed.</Text>

        <View style={styles.btnGroup}>
          <AuthButton label="Create an account" onPress={() => navigation.navigate("SignUp")} variant="primary" />
          <AuthButton label="Sign in" onPress={() => navigation.navigate("SignIn")} variant="outline" />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 48,
    paddingBottom: 0,
  },
  ring: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    borderWidth: 1,
  },
  topSection: {
    alignItems: "center",
    gap: 28,
    paddingTop: 20,
  },
  logoWrap: {},
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  brandGroup: {
    alignItems: "center",
    gap: 8,
  },
  wordmark: {
    fontSize: 36,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    letterSpacing: 0.2,
  },
  card: {
    width: "100%",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
    gap: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    lineHeight: 22,
    marginBottom: 8,
  },
  btnGroup: {
    gap: 12,
  },
});
