// src/components/NutritionSection.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CircularProgressBase } from "react-native-circular-progress-indicator";
import { shadowStyle } from "../utils/shadows";
import { useTheme } from "../theme/ThemeProvider";

export default function NutritionSection({ calories, macros }) {
  const { colors } = useTheme();
  const percentComplete = (calories.consumed / calories.target) * 100;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Nutrition Summary
      </Text>

      <View style={styles.circularContainer}>
        <CircularProgressBase
          value={percentComplete}
          radius={70}
          activeStrokeColor={colors.primary}
          inActiveStrokeColor={colors.border}
          activeStrokeWidth={12}
          inActiveStrokeWidth={12}
          progressValueStyle={{ color: colors.text }}
          valueSuffix={"%"}
        >
          <View>
            <Text style={[styles.caloriesConsumed, { color: colors.text }]}>
              {calories.consumed}
            </Text>
            <Text style={[styles.caloriesUnit, { color: colors.muted }]}>
              calories
            </Text>
            <Text style={[styles.caloriesTarget, { color: colors.muted }]}>
              of {calories.target}
            </Text>
          </View>
        </CircularProgressBase>
      </View>

      <View style={styles.macrosContainer}>
        <MacroBar
          label="Protein"
          consumed={macros.protein.consumed}
          target={macros.protein.target}
          color={colors.primary}
          colors={colors}
        />
        <MacroBar
          label="Carbs"
          consumed={macros.carbs.consumed}
          target={macros.carbs.target}
          color="#f59e0b"
          colors={colors}
        />
        <MacroBar
          label="Fat"
          consumed={macros.fat.consumed}
          target={macros.fat.target}
          color="#10b981"
          colors={colors}
        />
      </View>
    </View>
  );
}

function MacroBar({ label, consumed, target, color, colors }) {
  const percentage = (consumed / target) * 100;

  return (
    <View style={styles.macroBar}>
      <View style={styles.macroHeader}>
        <Text style={[styles.macroLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.macroValue, { color: colors.muted }]}>
          {consumed}g / {target}g
        </Text>
      </View>
      <View
        style={[
          styles.progressBarBackground,
          { backgroundColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    ...shadowStyle({
      color: "#000",
      offsetY: 2,
      opacity: 0.05,
      radius: 8,
      elevation: 2,
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  circularContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  caloriesConsumed: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  caloriesUnit: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  caloriesTarget: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
  macrosContainer: {
    gap: 16,
  },
  macroBar: {
    gap: 8,
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  macroValue: {
    fontSize: 13,
    color: "#6b7280",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});
