import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

export default function Text({
  children,
  style,
  numberOfLines,
  accessibilityLabel,
}) {
  const { colors } = useTheme();
  return (
    <RNText
      accessibilityLabel={accessibilityLabel}
      numberOfLines={numberOfLines}
      style={[{ color: colors.text }, styles.text, style]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "#0F172A",
    fontSize: 14,
  },
});
