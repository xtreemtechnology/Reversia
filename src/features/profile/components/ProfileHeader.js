// screens/profile/components/ProfileHeader.jsx
// Install: npx expo install @expo/vector-icons

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export default function ProfileHeader({ onBack, onEditAvatar }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        style={[styles.backBtn, { backgroundColor: colors.card }]}
      >
        {/* solar:arrow-left-bold → chevron-back */}
        <Ionicons name="chevron-back" size={22} color={colors.foreground} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.foreground }]}>
        My Profile
      </Text>

      <TouchableOpacity
        onPress={onEditAvatar}
        activeOpacity={0.8}
        style={[styles.editBtn, { backgroundColor: colors.foreground }]}
      >
        <Text style={[styles.editText, { color: colors.background }]}>
          Edit
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  editBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  editText: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
