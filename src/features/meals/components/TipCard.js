import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

const DAILY_TIPS = [
  "Eating in the correct order — Fiber → Protein → Carbs — can reduce your glucose spike by up to 75%.",
  "A 10-minute walk after meals can lower post-meal blood sugar by up to 22%.",
  "Chewing slowly activates gut hormones that improve insulin response before the food is even digested.",
  "Vinegar before a carb-heavy meal blunts the glucose curve — try 1 tbsp in water.",
  "Cold or reheated rice has more resistant starch, which feeds gut bacteria and lowers GI.",
  "Starting your meal with vegetables coats the gut and slows glucose absorption significantly.",
  "Staying hydrated before meals improves satiety and reduces overeating by up to 20%.",
];

export const TipCard = ({ dayIndex }) => {
  const { colors } = useTheme();
  const tip = DAILY_TIPS[dayIndex % DAILY_TIPS.length];
  return (
    <View
      style={[
        tipStyles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[tipStyles.iconBox, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons
          name="lightning-bolt"
          size={20}
          color={colors.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[tipStyles.title, { color: colors.text }]}>
          Reversal Secret 💡
        </Text>
        <Text style={[tipStyles.text, { color: colors.muted }]}>{tip}</Text>
      </View>
    </View>
  );
};

const tipStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  title: { fontSize: 14, fontWeight: "800", marginBottom: 5 },
  text: { fontSize: 13, lineHeight: 19 },
});
