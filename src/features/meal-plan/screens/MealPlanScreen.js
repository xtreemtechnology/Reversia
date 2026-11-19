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
import { FONTS } from "../../../theme/tokens";
import FadeIn from "../../home/components/FadeIn";
import PressScale from "../../home/components/PressScale";
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
  const weekTotals = useMemo(() => {
    let meals = 0;
    let snacks = 0;
    MEAL_PLAN.forEach((dayPlan) => {
      dayPlan.meals.forEach((meal) => {
        if (meal.slot === "snack") snacks += 1;
        else meals += 1;
      });
    });
    return { days: MEAL_PLAN.length, meals, snacks };
  }, []);

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

        <FadeIn delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>7-Day Meal Plan</Text>
            <Text style={styles.subtitle}>
              A week of natural-food meals from the Food Guide — breakfast,
              lunch and dinner, with a snack on some days.
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={60}>
          <View style={styles.heroCard}>
            <Text style={styles.heroOverline}>Your week at a glance</Text>
            <Text style={styles.heroBig}>
              {weekTotals.days} days · {weekTotals.meals} meals
            </Text>
            <Text style={styles.heroSub}>
              {weekTotals.snacks > 0
                ? `Plus ${weekTotals.snacks} snacks — every meal from the Food Guide.`
                : "Every meal from the Food Guide."}
            </Text>
          </View>
        </FadeIn>

        {MEAL_PLAN.map((dayPlan, dayIndex) => (
          <FadeIn key={dayPlan.day} delay={Math.min(120 + dayIndex * 60, 420)}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Day {dayPlan.day} — {dayPlan.title}
              </Text>
              {dayPlan.meals.map((meal, index) => (
                <View key={meal.id}>
                  <PressScale
                    onPress={() =>
                      navigation?.navigate("MealDetail", { mealId: meal.id })
                    }
                    style={styles.mealRow}
                    accessibilityLabel={`${SLOT_LABELS[meal.slot]}: ${
                      meal.title
                    }`}
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
                  </PressScale>
                  {index < dayPlan.meals.length - 1 ? (
                    <View style={styles.divider} />
                  ) : null}
                </View>
              ))}
            </View>
          </FadeIn>
        ))}

        <FadeIn delay={180}>
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
        </FadeIn>

        <FadeIn delay={240}>
          <View style={[styles.card, styles.disclaimerCard]}>
            <Text style={styles.muted}>{MEAL_PLAN_DISCLAIMER}</Text>
          </View>
        </FadeIn>
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
      paddingHorizontal: 20,
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
      fontFamily: FONTS.body,
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary,
    },
    header: {
      gap: 4,
    },
    title: {
      fontFamily: FONTS.display,
      fontSize: 30,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontFamily: FONTS.body,
      fontSize: 15,
      color: colors.mutedForeground,
      lineHeight: 21,
    },
    heroCard: {
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 28,
      padding: 22,
      gap: 4,
    },
    heroOverline: {
      fontFamily: FONTS.body,
      fontSize: 11,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    heroBig: {
      fontFamily: FONTS.display,
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.5,
      lineHeight: 32,
    },
    heroSub: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    disclaimerCard: {
      backgroundColor: colors.muted,
    },
    cardTitle: {
      fontFamily: FONTS.display,
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
      fontFamily: FONTS.body,
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
      textTransform: "uppercase",
    },
    mealName: {
      fontFamily: FONTS.display,
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    mealMeta: {
      fontFamily: FONTS.body,
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
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    shopCount: {
      fontFamily: FONTS.body,
      fontSize: 14,
      fontWeight: "700",
      color: colors.mutedForeground,
    },
    muted: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
  });
}
