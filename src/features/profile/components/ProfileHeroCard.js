// screens/profile/components/ProfileHeroCard.jsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export default function ProfileHeroCard({
  initials,
  fullName,
  email,
  diabetesStatus,
  photoURL,
  onEditAvatar,
  onEditProfile,
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
        <TouchableOpacity
          onPress={onEditAvatar}
          activeOpacity={0.8}
          style={styles.avatarButton}
        >
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatarImage} />
          ) : (
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary + "22" },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {initials}
              </Text>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onEditProfile}
        activeOpacity={0.8}
        style={[
          styles.avatarAction,
          { backgroundColor: colors.primary + "18" },
        ]}
      >
        <Ionicons name="pencil" size={14} color={colors.primary} />
        <Text style={[styles.avatarActionText, { color: colors.primary }]}>
          Edit profile
        </Text>
      </TouchableOpacity>

      <Text style={[styles.name, { color: colors.foreground }]}>
        {fullName}
      </Text>
      <Text style={[styles.email, { color: colors.mutedForeground }]}>
        {email}
      </Text>

      {/* Status badge */}
      <View
        style={[
          styles.badge,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
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
  avatarButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  avatarAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 10,
  },
  avatarActionText: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  editBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
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
