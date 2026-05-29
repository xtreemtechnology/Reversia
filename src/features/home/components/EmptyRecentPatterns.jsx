import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export default function EmptyRecentPatterns() {
  const { colors } = useTheme();
  const items = [
    { label: "Meals", color: colors.primary },
    { label: "Movement", color: colors.secondary },
    { label: "Hydration", color: "#F2CC8F" },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Recent Patterns</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={styles.iconRow}>
          {items.map((item) => (
            <View key={item.label} style={[styles.iconBox, { backgroundColor: item.color + "22", borderColor: item.color + "40" }]}>
              <Ionicons name="ellipse" size={12} color={item.color} />
            </View>
          ))}
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Patterns appear after a few logs.</Text>
        <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Once you've tracked a couple of meals and activities, Reversia will start identifying what's working for your body.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  iconRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    lineHeight: 22,
  },
});
