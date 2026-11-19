/* eslint-disable react-native/no-inline-styles */
// screens/profile/components/ProfilePreferencesCard.jsx
//
// Notifications toggle plus the appearance choice. The old binary
// dark/light switch fought the fresh default (it sent every screen to
// the old lavender/dark palettes), so it is now an explicit choice:
// Fresh (the soft-green default) or Bold (the dark Phase 1 look).

import React from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";
import { FONTS } from "../../../theme/tokens";

function ToggleRow({
  iconName,
  iconColor,
  label,
  value,
  onValueChange,
  colors,
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + "22" }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <Text style={[styles.toggleLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      <Switch
        value={!!value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function ThemeRow({ iconName, label, hint, selected, onPress, colors }) {
  return (
    <TouchableOpacity
      style={styles.themeRow}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${label} theme`}
    >
      <View
        style={[styles.iconWrap, { backgroundColor: colors.primary + "22" }]}
      >
        <Ionicons name={iconName} size={18} color={colors.primary} />
      </View>
      <View style={styles.themeTextCol}>
        <Text style={[styles.toggleLabel, { color: colors.foreground }]}>
          {label}
        </Text>
        <Text style={[styles.themeHint, { color: colors.mutedForeground }]}>
          {hint}
        </Text>
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : "transparent",
          },
        ]}
      >
        {selected ? (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfilePreferencesCard({
  notificationsEnabled,
  setNotificationsEnabled,
  currentTheme,
  onSelectTheme,
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border + "80" },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.foreground }]}>
        Preferences
      </Text>

      <ToggleRow
        iconName="notifications"
        iconColor={colors.primary}
        label="Push Notifications"
        value={notificationsEnabled}
        onValueChange={setNotificationsEnabled}
        colors={colors}
      />

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        APPEARANCE
      </Text>
      <ThemeRow
        iconName="sunny"
        label="Fresh"
        hint="Soft green, light — the default look"
        selected={currentTheme === "fresh"}
        onPress={() => onSelectTheme("fresh")}
        colors={colors}
      />
      <ThemeRow
        iconName="moon"
        label="Bold"
        hint="Dark green-charcoal, lime accent"
        selected={currentTheme === "bold"}
        onPress={() => onSelectTheme("bold")}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: 20,
    borderWidth: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: FONTS.display,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 2,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
  },
  themeTextCol: {
    flex: 1,
    gap: 2,
  },
  themeHint: {
    fontSize: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
