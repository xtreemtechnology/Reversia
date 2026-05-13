import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export const DaySummary = ({ meals, completed, calorieGoal = 2600 }) => {
  const { colors } = useTheme();
  const eatenCals = meals
    .filter((m) => completed.includes(m.id))
    .reduce((s, m) => s + m.calories, 0);
  const totalCals = meals.reduce((s, m) => s + m.calories, 0);
  const totalProt = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const pct = Math.round((eatenCals / calorieGoal) * 100);

  return (
    <View style={[summaryStyles.card, { backgroundColor: colors.primary }]}>
      <View style={summaryStyles.headerRow}>
        <View>
          <Text style={summaryStyles.title}>Today's Nutrition</Text>
          <Text style={summaryStyles.sub}>
            {eatenCals} of {calorieGoal} kcal eaten
          </Text>
        </View>
        <View style={summaryStyles.pctBadge}>
          <Text style={summaryStyles.pctText}>{pct}%</Text>
        </View>
      </View>

      {/* Calorie bar */}
      <View style={summaryStyles.track}>
        <View
          style={[summaryStyles.fill, { width: `${Math.min(pct, 100)}%` }]}
        />
      </View>

      {/* Macro chips */}
      <View style={summaryStyles.macros}>
        {[
          {
            label: "Plan Calories",
            value: `${totalCals} kcal`,
            color: "#7C3AED",
            icon: "fire",
          },
          {
            label: "Protein",
            value: `${totalProt}g`,
            color: "#10B981",
            icon: "arm-flex",
          },
          {
            label: "Carbs",
            value: `${totalCarbs}g`,
            color: "#F59E0B",
            icon: "bread-slice",
          },
        ].map((m) => (
          <View key={m.label} style={summaryStyles.macroChip}>
            <MaterialCommunityIcons name={m.icon} size={14} color={m.color} />
            <Text style={[summaryStyles.macroVal, { color: m.color }]}>
              {m.value}
            </Text>
            <Text style={summaryStyles.macroLabel}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const summaryStyles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  sub: { fontSize: 12, color: "#E9D5FF", marginTop: 3 },
  pctBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pctText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
  track: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  fill: { height: "100%", backgroundColor: "#FFF", borderRadius: 3 },
  macros: { flexDirection: "row", justifyContent: "space-between" },
  macroChip: { alignItems: "center", gap: 3 },
  macroVal: { fontSize: 14, fontWeight: "800" },
  macroLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },
});
