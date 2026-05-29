import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/ThemeProvider";

function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const sanitized = hex.replace("#", "");
  const full =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((c) => c + c)
          .join("")
      : sanitized;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function GlassCard({
  children,
  style,
  intensity = 70,
  tintColor,
  ...rest
}) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  // Derive overlay colors: use tintColor when provided so the card subtly picks up background hues
  const baseTint = tintColor || (isDark ? colors.primary : colors.background);
  const overlayStart = hexToRgba(baseTint, isDark ? 0.06 : 0.18);
  const overlayEnd = hexToRgba(baseTint, isDark ? 0.02 : 0.08);

  const borderColor = tintColor
    ? hexToRgba(tintColor, 0.12)
    : hexToRgba(isDark ? "#FFFFFF" : "#000000", 0.06);

  return (
    <BlurView
      intensity={intensity}
      tint={isDark ? "dark" : "light"}
      style={[styles.blur, { borderColor }, style]}
      {...rest}
    >
      <LinearGradient
        colors={[overlayStart, overlayEnd]}
        start={[0, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.inner}>{children}</View>

      {/* subtle top highlight to sharpen the edge */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: styles.blur.borderRadius,
            borderWidth: 0.5,
            borderColor: hexToRgba("#FFFFFF", isDark ? 0.02 : 0.06),
          },
        ]}
      />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 10,
  },
  inner: {
    position: "relative",
    zIndex: 1,
  },
});
