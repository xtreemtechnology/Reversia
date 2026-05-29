// components/MainInsightCard.jsx
// Install: npx expo install @expo/vector-icons

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export default function MainInsightCard({ navigation }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.headline, { color: colors.foreground }]}>
        Your afternoon energy improved significantly after increasing hydration yesterday.
      </Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        Let's keep that momentum going today. A glass of water before your afternoon
        tea could help stabilize your energy until evening.
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        onPress={() => navigation?.navigate("Track")}
      >
        {/* Solar: solar:cup-bold-duotone → Ionicons: cafe */}
        <Ionicons name="cafe" size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Log Hydration</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 8,
  },
  headline: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "500",
    letterSpacing: -0.5,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});