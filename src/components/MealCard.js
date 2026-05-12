// src/components/MealCard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyle } from "../utils/shadows";
import { useTheme } from "../theme/ThemeProvider";

export default function MealCard({ name, calories, time, recommended, items }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.mealName, { color: colors.text }]}>{name}</Text>
        {recommended && (
          <View
            style={[
              styles.recommendedBadge,
              { backgroundColor: "rgba(16,185,129,0.18)" },
            ]}
          >
            <Ionicons name="leaf-outline" size={12} color="#10b981" />
            <Text style={styles.recommendedText}>Diabetes-Friendly</Text>
          </View>
        )}
      </View>

      <Text style={[styles.calories, { color: colors.primary }]}>
        {calories} calories
      </Text>
      <Text style={[styles.items, { color: colors.muted }]}>{items}</Text>

      <View style={styles.footer}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={14} color={colors.muted} />
          <Text style={[styles.time, { color: colors.muted }]}>{time}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.logMealButton,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.logMealText, { color: colors.primary }]}>
            Log Meal
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginRight: 12,
      width: 200,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadowStyle({
        color: "#000",
        offsetY: 2,
        opacity: 0.05,
        radius: 8,
        elevation: 2,
      }),
    },
    header: {
      marginBottom: 8,
    },
    mealName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    recommendedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(16,185,129,0.18)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: "flex-start",
    },
    recommendedText: {
      fontSize: 10,
      color: "#10b981",
      fontWeight: "600",
    },
    calories: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 4,
    },
    items: {
      fontSize: 12,
      color: colors.muted,
      marginBottom: 12,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    time: {
      fontSize: 11,
      color: colors.muted,
    },
    logMealButton: {
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    logMealText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: "600",
    },
  });
