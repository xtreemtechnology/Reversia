// components/Header.jsx
// Install: npx expo install @expo/vector-icons

import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export default function Header({ userData, onBellPress }) {
  const { colors } = useTheme();

  const firstName = userData?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning," : hour < 17 ? "Good afternoon," : "Good evening,";

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image
          source={
            userData?.photoURL
              ? { uri: userData.photoURL }
              : { uri: "https://randomuser.me/api/portraits/women/44.jpg" }
          }
          style={[styles.avatar, { borderColor: colors.border }]}
        />
        <View style={styles.textGroup}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {greeting}
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {firstName}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.bellButton, { backgroundColor: colors.card }]}
        onPress={onBellPress}
        activeOpacity={0.7}
      >
        {/* Solar: solar:bell-bing-bold-duotone → Ionicons equivalent */}
        <Ionicons name="notifications" size={22} color={colors.foreground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  textGroup: {
    flexDirection: "column",
  },
  greeting: {
    fontSize: 13,
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});