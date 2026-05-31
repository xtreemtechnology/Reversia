import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

const ERROR_COLOR = "#E28A82";

export default function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  iconName,
  error,
  onSubmitEditing,
  returnKeyType,
  inputRef,
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPassword = !!secureTextEntry;
  const borderColor = error
    ? ERROR_COLOR
    : focused
    ? colors.primary
    : colors.border;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {label}
        </Text>
      ) : null}
      <View
        style={[styles.inputRow, { borderColor, backgroundColor: colors.card }]}
      >
        {iconName ? (
          <Ionicons
            name={iconName}
            size={18}
            color={focused ? colors.primary : colors.mutedForeground}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={isPassword && !revealed}
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize || "none"}
          autoComplete={autoComplete}
          autoCorrect={false}
          style={[styles.input, { color: colors.text }]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType || "done"}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setRevealed((r) => !r)}
            style={styles.eyeBtn}
            activeOpacity={0.65}
          >
            <Ionicons
              name={revealed ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color={ERROR_COLOR} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "DMSans_400Regular",
    height: "100%",
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: ERROR_COLOR,
    flex: 1,
  },
});
