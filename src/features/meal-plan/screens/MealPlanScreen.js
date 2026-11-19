// src/features/meal-plan/screens/MealPlanScreen.js
// Home screen of the 7-day meal plan: one card per day with its three
// meals (and snack where the day has one), tapping a meal opens its
// recipe, and the grouped weekly shopping list at the bottom. Carb
// notes are a simple guide from the food data — not measured
// glycaemic index values.

import React, { useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";
import {
  MEAL_PLAN,
  MEAL_PLAN_DISCLAIMER,
  SLOT_LABELS,
} from "../data/mealPlanData";
import { getWeekShoppingList } from "../services/mealPlanService";

function carbLabel(carbNote) {
  return carbNote === "low" ? "Low carb note" : "Medium carb note";
}

export default function MealPlanScreen({ navigation }) {
  const { colors } = useTheme();
  const shoppingList = useMemo(() => getWeekShoppingList(), []);

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
          style={styles.backRow}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Plan</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>7-Day Meal Plan</Text>
          <Text style={styles.subtitle}>
            A week of natural-food meals from the Food Guide — breakfast, lunch
            and dinner, with a snack on some days.
          </Text>
        </View>

        {MEAL_PLAN.map((dayPlan) => (
          <View key={dayPlan.day} style={styles.card}>
            <Text style={styles.cardTitle}>
              Day {dayPlan.day} — {dayPlan.title}
            </Text>
            {dayPlan.meals.map((meal, index) => (
              <View key={meal.id}>
                <TouchableOpacity
                  onPress={() =>
                    navigation?.navigate("MealDetail", { mealId: meal.id })
                  }
                  activeOpacity={0.8}
                  style={styles.mealRow}
                >
                  <View style={styles.mealTextWrap}>
                    <Text style={styles.slotLabel}>
                      {SLOT_LABELS[meal.slot]}
                    </Text>
                    <Text style={styles.mealName}>{meal.title}</Text>
                    <Text style={styles.mealMeta}>
                      {meal.prepTime} min · {carbLabel(meal.carbNote)}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.mutedForeground}
                  />
                </TouchableOpacity>
                {index < dayPlan.meals.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </View>
            ))}
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shopping list for the week</Text>
          <Text style={styles.muted}>
            Grouped by how many meals use each item.
          </Text>
          {shoppingList.map((item) => (
            <View key={item.ingredient} style={styles.shopRow}>
              <Text style={styles.shopIngredient}>{item.ingredient}</Text>
              <Text style={styles.shopCount}>× {item.count}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.disclaimerCard]}>
          <Text style={styles.muted}>{MEAL_PLAN_DISCLAIMER}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 120,
      gap: 16,
    },
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      alignSelf: "flex-start",
    },
    backText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary,
    },
    header: {
      gap: 4,
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      fontSize: 15,
      color: colors.mutedForeground,
      lineHeight: 21,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    disclaimerCard: {
      backgroundColor: colors.muted,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    mealRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      gap: 12,
    },
    mealTextWrap: {
      flex: 1,
      gap: 2,
    },
    slotLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
      textTransform: "uppercase",
    },
    mealName: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    mealMeta: {
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    shopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 4,
    },
    shopIngredient: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    shopCount: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.mutedForeground,
    },
    muted: {
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
  });
}
