import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";

export default function AuthButton({ label, onPress, loading, disabled, variant = "primary", iconName }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.97, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    onPress?.();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";
  const isOutline = variant === "outline";
  const buttonBackgroundColor = isPrimary ? colors.primary : isGhost ? "transparent" : "transparent";
  const buttonBorderColor = isOutline ? colors.border : "transparent";
  const buttonTextColor = isPrimary ? "#FFFFFF" : colors.text;
  const iconColor = isPrimary ? "#FFFFFF" : colors.primary;

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={disabled || loading}
        style={[
          styles.btn,
          { backgroundColor: buttonBackgroundColor, borderColor: buttonBorderColor },
          isOutline ? styles.outline : null,
          (disabled || loading) ? styles.disabled : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={isPrimary ? "#FFFFFF" : colors.primary} />
        ) : (
          <View style={styles.inner}>
            {iconName ? <Ionicons name={iconName} size={18} color={iconColor} /> : null}
            <Text style={[styles.label, { color: buttonTextColor }]}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  outline: {
    borderWidth: 1.5,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.55,
  },
});
