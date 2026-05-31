// screens/profile/components/ProfilePreferencesCard.jsx

import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

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

export default function ProfilePreferencesCard({
  notificationsEnabled,
  setNotificationsEnabled,
  isDarkMode,
  onToggleDarkMode,
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
        // solar:bell-bing-bold-duotone → notifications
        iconName="notifications"
        iconColor={colors.primary}
        label="Push Notifications"
        value={notificationsEnabled}
        onValueChange={setNotificationsEnabled}
        colors={colors}
      />
      <ToggleRow
        // solar:moon-sleep-bold-duotone → moon
        iconName="moon"
        iconColor={colors.mutedForeground}
        label="Dark Mode"
        value={isDarkMode}
        onValueChange={onToggleDarkMode}
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
    fontFamily: "PlusJakartaSans_700Bold",
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
});
