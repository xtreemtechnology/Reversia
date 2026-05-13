// src/components/WaterTracker.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyle } from "../utils/shadows";
import { useTheme } from "../theme/ThemeProvider";

export default function WaterTracker({ current, target, onAddPress }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const percentage = (current / target) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Water Intake</Text>
          <Text style={styles.subtitle}>
            Stay hydrated for better glucose control
          </Text>
        </View>
        <TouchableOpacity onPress={onAddPress} style={styles.addButton}>
          <Ionicons
            name="add-circle-outline"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <Text style={styles.currentIntake}>{current}</Text>
        <Text style={styles.targetIntake}>/ {target} cups</Text>
      </View>

      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>

      <View style={styles.cupsContainer}>
        {[...Array(target)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.cupIcon,
              { backgroundColor: i < current ? colors.primary : colors.border },
            ]}
          >
            <Ionicons
              name="water-outline"
              size={20}
              color={i < current ? colors.background : colors.muted}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 20,
      marginVertical: 12,
      padding: 20,
      borderRadius: 24,
      backgroundColor: colors.card,
      ...shadowStyle({
        color: "#000",
        offsetY: 2,
        opacity: 0.05,
        radius: 8,
        elevation: 2,
      }),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      fontSize: 12,
      marginTop: 2,
      color: colors.muted,
    },
    addButton: {
      padding: 4,
    },
    stats: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: 12,
    },
    currentIntake: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.primary,
    },
    targetIntake: {
      fontSize: 16,
      marginLeft: 4,
      color: colors.muted,
    },
    progressBarBackground: {
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 16,
      backgroundColor: colors.border,
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 4,
    },
    cupsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    cupIcon: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
  });
