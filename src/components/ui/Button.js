import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

export default function Button({
  title,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[{ backgroundColor: colors.primary }, styles.button, style]}
    >
      <Text style={[{ color: "#FFFFFF" }, styles.text, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
