// src/features/meal-plan/screens/MealDetailScreen.js
// One meal from the 7-day meal plan: description, prep time, carb
// note, ingredients, steps, tip, and the foods with their Food Guide
// ratings. Tapping a food opens it in the Food Guide. Carb notes are
// a simple guide from the food data — not measured glycaemic index
// values.

import React from "react";
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
import { MEAL_PLAN_DISCLAIMER, SLOT_LABELS } from "../data/mealPlanData";
import { getMealById } from "../services/mealPlanService";
import { getFoodById, getSwapFor } from "../../food-guide/services/foodGuideService";
import { RATING_MEANINGS, ratingColor } from "../../food-guide/screens/FoodGuideScreen";

function ratingLabel(rating) {
  return rating.charAt(0).toUpperCase() + rating.slice(1);
}

function carbLabel(carbNote) {
  return carbNote === "low" ? "Low carb note" : "Medium carb note";
}

function openFoodInGuide(navigation, foodId) {
  navigation?.navigate("Foods", {
    screen: "FoodDetail",
    params: { foodId },
  });
}

export default function MealDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const mealId = route?.params?.mealId;
  const meal = getMealById(mealId);

  const styles = makeStyles(colors);

  if (!meal) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.title}>Meal not found</Text>
          <Text style={styles.muted}>
            That meal is not in the plan. Go back and pick another day.
          </Text>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            activeOpacity={0.8}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Back to the meal plan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const foods = meal.foodIds
    .map((foodId) => getFoodById(foodId))
    .filter(Boolean);

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
          <Text style={styles.backText}>Meal Plan</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{meal.title}</Text>
          <Text style={styles.subtitle}>
            Day {meal.day} · {SLOT_LABELS[meal.slot]} · {meal.prepTime} min ·{" "}
            {carbLabel(meal.carbNote)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.body}>{meal.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ingredients</Text>
          {meal.ingredients.map((ingredient) => (
            <View key={ingredient} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.body}>{ingredient}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Steps</Text>
          {meal.steps.map((step, index) => (
            <View key={`${meal.id}-step-${index}`} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.body}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tip</Text>
          <Text style={styles.body}>{meal.tip}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Foods in this meal</Text>
          <Text style={styles.muted}>
            Ratings from the Food Guide — tap a food to see it there.
          </Text>
          {foods.map((food) => {
            const badgeColor = ratingColor(food.rating);
            const swap = getSwapFor(food);
            return (
              <View key={food.id}>
                <TouchableOpacity
                  onPress={() => openFoodInGuide(navigation, food.id)}
                  activeOpacity={0.8}
                  style={styles.foodRow}
                >
                  <View style={styles.foodTextWrap}>
                    <Text style={styles.bodyBold}>{food.name}</Text>
                    <Text style={styles.muted}>
                      {food.amount} · {food.carbs} carbs · {food.protein}{" "}
                      protein
                    </Text>
                    <Text style={styles.muted}>
                      {RATING_MEANINGS[food.rating]}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: `${badgeColor}1F` },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: badgeColor }]}>
                      {ratingLabel(food.rating)}
                    </Text>
                  </View>
                </TouchableOpacity>
                {food.rating === "caution" && swap ? (
                  <TouchableOpacity
                    onPress={() => openFoodInGuide(navigation, swap.id)}
                    activeOpacity={0.8}
                    style={styles.swapRow}
                  >
                    <Ionicons
                      name="swap-horizontal"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.swapText}>
                      Steadier swap: {swap.name} — tap to see it in the guide.
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
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
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      gap: 10,
    },
    disclaimerCard: {
      backgroundColor: colors.muted,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
    body: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      lineHeight: 21,
    },
    bodyBold: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      lineHeight: 21,
    },
    muted: {
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    bulletRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "flex-start",
    },
    bullet: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 21,
    },
    stepRow: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
    },
    stepNumber: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    stepNumberText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primaryForeground,
    },
    foodRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 4,
    },
    foodTextWrap: {
      flex: 1,
      gap: 2,
    },
    badge: {
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    swapRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 6,
      paddingLeft: 2,
    },
    swapText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      lineHeight: 20,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      gap: 12,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: "center",
      marginTop: 4,
    },
    primaryButtonText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}
