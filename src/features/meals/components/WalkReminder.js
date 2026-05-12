import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export const WalkReminder = ({ completedCount }) => {
  const { colors } = useTheme();
  if (completedCount === 0) {
    return null;
  }
  return (
    <View
      style={[
        walkStyles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <MaterialCommunityIcons name="walk" size={24} color="#10B981" />
      <View style={{ flex: 1 }}>
        <Text style={[walkStyles.title, { color: colors.text }]}>
          Time for a walk! 🚶
        </Text>
        <Text style={[walkStyles.text, { color: colors.muted }]}>
          You've eaten {completedCount} meal{completedCount > 1 ? "s" : ""}. A
          10-minute walk now can lower your glucose spike by up to 22%.
        </Text>
      </View>
      <TouchableOpacity
        style={[walkStyles.btn, { backgroundColor: colors.primary }]}
      >
        <Text style={walkStyles.btnText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
};

const walkStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  title: { fontSize: 14, fontWeight: "800" },
  text: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  btnText: { color: "#FFF", fontWeight: "800", fontSize: 13 },
});
