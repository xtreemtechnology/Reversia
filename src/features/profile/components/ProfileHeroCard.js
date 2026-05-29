// screens/profile/components/ProfileHeroCard.jsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export default function ProfileHeroCard({
  initials,
  fullName,
  email,
  diabetesStatus,
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border + "80" },
      ]}
    >
      {/* Glow blob */}
      <View style={styles.glowBlob} />

      {/* Avatar */}
      <View style={styles.avatarRing}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "22" }]}> 
          <Text style={[styles.avatarText, { color: colors.primary }]}> 
            {initials}
          </Text>
        </View>
      </View>

      <Text style={[styles.name, { color: colors.foreground }]}>{fullName}</Text>
      <Text style={[styles.email, { color: colors.mutedForeground }]}>{email}</Text>

      {/* Status badge */}
      <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }]}> 
        {/* solar:heart-pulse-bold → heart */}
        <Ionicons name="heart" size={13} color={colors.primary} />
        <Text style={[styles.badgeText, { color: colors.primary }]}>
          {diabetesStatus}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    marginBottom: 4,
  },
  glowBlob: {
    position: "absolute",
    top: -28,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(224,122,95,0.12)",
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(224,122,95,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  email: {
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 16,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
