/* eslint-disable react-native/no-inline-styles */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export const MealCard = ({ meal, isDone, onToggle, onNavigate, colors }) => {
  const theme = useTheme();
  const t = colors || theme.colors;

  return (
    <View
      style={[
        mealStyles.card,
        { backgroundColor: t.card, borderColor: t.border },
        isDone && mealStyles.cardDone,
      ]}
    >
      {/* Addy's Choice badge */}
      {meal.isChoice && (
        <View style={mealStyles.choiceBadge}>
          <MaterialCommunityIcons name="star-decagram" size={12} color="#FFF" />
          <Text style={mealStyles.choiceText}>ADDY'S CHOICE</Text>
        </View>
      )}

      {/* Header row */}
      <View style={[mealStyles.headerRow, meal.isChoice && { marginTop: 28 }]}>
        <View style={mealStyles.leftHeader}>
          <View
            style={[mealStyles.typeBadge, { backgroundColor: t.background }]}
          >
            <Text style={[mealStyles.typeText, { color: t.primary }]}>
              {meal.type}
            </Text>
          </View>
          <Text style={[mealStyles.timeText, { color: t.muted }]}>
            {meal.time}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isDone ? "checkmark-circle" : "ellipse-outline"}
            size={28}
            color={isDone ? "#10B981" : t.border}
          />
        </TouchableOpacity>
      </View>

      {/* Meal body */}
      <View style={mealStyles.body}>
        <View style={[mealStyles.iconBox, { backgroundColor: meal.iconBg }]}>
          <MaterialCommunityIcons
            name={meal.icon}
            size={28}
            color={isDone ? t.muted : meal.iconColor}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              mealStyles.title,
              { color: t.text },
              isDone && mealStyles.titleDone,
            ]}
          >
            {meal.title}
          </Text>
          <Text style={[mealStyles.desc, { color: t.muted }]} numberOfLines={1}>
            {meal.desc}
          </Text>
          <View style={mealStyles.metaRow}>
            <Text style={[mealStyles.fiberText, { color: "#10B981" }]}>
              {meal.fiber}
            </Text>
            <View
              style={[mealStyles.giBadge, { backgroundColor: meal.giColor }]}
            >
              <Text style={[mealStyles.giText, { color: meal.giTextColor }]}>
                {meal.gi}
              </Text>
            </View>
            <Text style={[mealStyles.calsText, { color: t.muted }]}>
              {meal.calories} kcal
            </Text>
          </View>
        </View>
      </View>

      {/* Metabolic sequence */}
      <View
        style={[
          mealStyles.seqBox,
          { backgroundColor: t.background, borderColor: t.border },
        ]}
      >
        <View style={mealStyles.seqLeft}>
          <MaterialCommunityIcons
            name="swap-vertical"
            size={14}
            color={t.primary}
          />
          <Text style={[mealStyles.seqLabel, { color: t.primary }]}>
            METABOLIC ORDER
          </Text>
        </View>
        <Text style={[mealStyles.seqValue, { color: t.text }]}>
          {meal.sequence}
        </Text>
      </View>

      {/* Macro mini row */}
      <View style={mealStyles.macroRow}>
        {[
          { label: "Protein", value: `${meal.protein}g`, color: "#10B981" },
          { label: "Carbs", value: `${meal.carbs}g`, color: "#F59E0B" },
        ].map((m) => (
          <View key={m.label} style={mealStyles.macroItem}>
            <Text style={[mealStyles.macroVal, { color: m.color }]}>
              {m.value}
            </Text>
            <Text style={[mealStyles.macroLabel, { color: t.muted }]}>
              {m.label}
            </Text>
          </View>
        ))}
        <TouchableOpacity
          style={[
            mealStyles.logBtn,
            { borderColor: t.border, backgroundColor: t.background },
          ]}
          onPress={onNavigate}
        >
          <MaterialCommunityIcons
            name="pencil-plus"
            size={14}
            color={t.primary}
          />
          <Text style={[mealStyles.logBtnText, { color: t.primary }]}>Log</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const mealStyles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardDone: { opacity: 0.75 },

  choiceBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#FFB02E",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  choiceText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  leftHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeBadge: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: { fontSize: 11, fontWeight: "800" },
  timeText: { fontSize: 12, fontWeight: "600" },

  body: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "800", marginBottom: 3 },
  titleDone: { textDecorationLine: "line-through" },
  desc: { fontSize: 12, marginBottom: 6 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  fiberText: { fontSize: 12, fontWeight: "700" },
  giBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  giText: { fontSize: 10, fontWeight: "800" },
  calsText: { fontSize: 12, fontWeight: "600" },

  seqBox: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  seqLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  seqLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  seqValue: { fontSize: 13, fontWeight: "600" },

  macroRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  macroItem: { alignItems: "center" },
  macroVal: { fontSize: 14, fontWeight: "800" },
  macroLabel: { fontSize: 10, fontWeight: "600", marginTop: 1 },
  logBtn: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  logBtnText: { fontSize: 13, fontWeight: "700" },
});
