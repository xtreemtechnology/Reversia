// src/components/InsightCard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyle } from "../utils/shadows";
import { useTheme } from "../theme/ThemeProvider";

export default function InsightCard({ type, title, message, icon }) {
  const { colors } = useTheme();

  const getTypeColor = () => {
    switch (type) {
      case "warning":
        return "#f59e0b";
      case "danger":
        return "#ef4444";
      case "success":
        return "#10b981";
      default:
        return "#6366f1";
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderLeftColor: getTypeColor() },
      ]}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name={icon} size={24} color={getTypeColor()} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      </View>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 20,
    borderLeftWidth: 4,
    ...shadowStyle({
      color: "#000",
      offsetY: 2,
      opacity: 0.05,
      radius: 8,
      elevation: 2,
    }),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionButton: {
    padding: 4,
  },
});
