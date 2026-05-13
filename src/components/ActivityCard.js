// src/components/ActivityCard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyle } from "../utils/shadows";
import { useTheme } from "../theme/ThemeProvider";

export default function ActivityCard({
  type,
  title,
  duration,
  calories,
  icon,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      activeOpacity={0.7}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={14} color={colors.muted} />
          <Text style={[styles.statText, { color: colors.muted }]}>
            {duration}
          </Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="flame-outline" size={14} color={colors.muted} />
          <Text style={[styles.statText, { color: colors.muted }]}>
            {calories} cal
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.startButtonText, { color: colors.background }]}>
          Start
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      borderRadius: 20,
      padding: 16,
      marginRight: 12,
      width: 160,
      alignItems: "center",
      ...shadowStyle({
        color: "#000",
        offsetY: 2,
        opacity: 0.05,
        radius: 8,
        elevation: 2,
      }),
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
    },
    stats: {
      gap: 4,
      marginBottom: 12,
      width: "100%",
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    statText: {
      fontSize: 12,
    },
    startButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 12,
      width: "100%",
      alignItems: "center",
    },
    startButtonText: {
      fontWeight: "600",
      fontSize: 13,
    },
  });
