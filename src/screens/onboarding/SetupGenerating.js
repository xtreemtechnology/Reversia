import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { shadowStyle } from "../../utils/shadows";
import { useTheme } from "../../theme/ThemeProvider";

export default function SetupGenerating({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Rotation Animation for the outer circle
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000, // Slightly faster for a "working" feel
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Pulsing Animation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Navigation Logic
    // Using navigation.replace is correct here so they can't go "back"
    // into the loader after finishing.
    const timer = setTimeout(() => {
      navigation.replace("AccountSetupComplete");
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.loaderWrapper}>
          {/* Animated Rotating Border */}
          <Animated.View
            style={[styles.outerCircle, { transform: [{ rotate: spin }] }]}
          />

          {/* Central Pulsing Icon */}
          <View style={styles.innerCircle}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              {/* Using a more "medical/health" focused icon to match the theme */}
              <MaterialCommunityIcons
                name="heart-pulse"
                size={54}
                color={colors.background}
              />
            </Animated.View>
          </View>
        </View>

        <Text style={styles.title}>Preparing your plan</Text>
        <Text style={styles.subtitle}>
          Analyzing your health profile to create your personalized nutrition
          and wellness plan...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    loaderWrapper: {
      width: 150,
      height: 150,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 40,
    },
    outerCircle: {
      position: "absolute",
      width: 140,
      height: 140,
      borderRadius: 70,
      borderWidth: 4,
      borderColor: colors.primary,
      borderTopColor: colors.card,
      borderRightColor: colors.card,
    },
    innerCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      ...shadowStyle({
        color: colors.primary,
        offsetY: 6,
        opacity: 0.4,
        radius: 12,
        elevation: 8,
      }),
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: colors.muted,
      textAlign: "center",
      lineHeight: 24,
    },
  });
