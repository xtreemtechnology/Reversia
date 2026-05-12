// src/features/auth/components/AuthButton.js
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../../theme/ThemeProvider";

export const AuthButton = ({
  onPress,
  label = "Sign In",
  loading = false,
  disabled = false,
  style,
  textStyle,
  loadingColor,
  activeOpacity = 0.85,
}) => {
  const { colors } = useTheme();
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.primary },
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={activeOpacity}
    >
      {loading ? (
        <ActivityIndicator color={loadingColor || "#FFF"} />
      ) : (
        <Text style={[styles.text, { color: colors.background }, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default AuthButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
});
