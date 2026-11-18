// src/features/food-guide/screens/FoodDetailScreen.js
// Detail for one food in the Natural Food Guide: rating and what it
// means, carb-load band, nutrition from the app's own food list, the
// tip, and the swap suggestion. Ratings are a simple guide — not
// measured glycaemic index values.

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
import { FOOD_GUIDE_DISCLAIMER } from "../data/foodGuideData";
import { getFoodById, getSwapFor } from "../services/foodGuideService";
import { RATING_MEANINGS, ratingColor } from "./FoodGuideScreen";

function ratingLabel(rating) {
  return rating.charAt(0).toUpperCase() + rating.slice(1);
}

function loadLabel(load) {
  if (load === "low") return "Low carb load";
  if (load === "high") return "High carb load";
  return "Medium carb load";
}

export default function FoodDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const foodId = route?.params?.foodId;
  const food = getFoodById(foodId);
  const swap = food ? getSwapFor(food) : null;

  const styles = makeStyles(colors);

  if (!food) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.title}>Food not found</Text>
          <Text style={styles.muted}>
            That food is not in the guide. Go back and search again.
          </Text>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            activeOpacity={0.8}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Back to the guide</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const badgeColor = ratingColor(food.rating);
  const macros = [
    { label: "Calories", value: `${food.cal} kcal` },
    { label: "Protein", value: food.protein },
    { label: "Carbs", value: food.carbs },
    { label: "Fat", value: food.fat },
  ];

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
          <Ionicons
            name="chevron-back"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.backText}>Food Guide</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{food.name}</Text>
          <Text style={styles.subtitle}>
            {food.category} · {food.amount}
          </Text>
        </View>

        <View style={styles.card}>
          <View
            style={[
              styles.badge,
              { backgroundColor: `${badgeColor}1F` },
            ]}
          >
            <Text
              style={[styles.badgeText, { color: badgeColor }]}
            >
              {ratingLabel(food.rating)}
            </Text>
          </View>
          <Text style={styles.body}>{RATING_MEANINGS[food.rating]}</Text>
          <Text style={styles.muted}>
            {loadLabel(food.load)} for this serving ·{" "}
            {food.carbs} carbs, {food.protein} protein.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nutrition per serving</Text>
          <Text style={styles.muted}>
            Copied from the app&apos;s own food list — {food.amount}.
          </Text>
          <View style={styles.macroRow}>
            {macros.map((macro) => (
              <View key={macro.label} style={styles.macroPill}>
                <Text style={styles.macroPillVal}>{macro.value}</Text>
                <Text style={styles.macroPillLabel}>{macro.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tip</Text>
          <Text style={styles.body}>{food.tip}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Swap</Text>
          {swap ? (
            <TouchableOpacity
              onPress={() =>
                navigation?.push("FoodDetail", { foodId: swap.id })
              }
              activeOpacity={0.8}
              style={styles.swapRow}
            >
              <View style={styles.swapTextWrap}>
                <Text style={styles.bodyBold}>
                  Try {swap.name} instead
                </Text>
                <Text style={styles.muted}>
                  Rated {ratingLabel(swap.rating)} · {swap.amount} ·{" "}
                  {swap.carbs} carbs. Tap to see it.
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          ) : (
            <Text style={styles.body}>
              No swap needed — the advice here is portion and pairing:
              keep the serving modest and pair it with protein or
              vegetables.
            </Text>
          )}
        </View>

        <View style={[styles.card, styles.disclaimerCard]}>
          <Text style={styles.muted}>{FOOD_GUIDE_DISCLAIMER}</Text>
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
    badge: {
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 10,
      alignSelf: "flex-start",
    },
    badgeText: {
      fontSize: 13,
      fontWeight: "700",
    },
    macroRow: {
      flexDirection: "row",
      gap: 10,
    },
    macroPill: {
      flex: 1,
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: "center",
      gap: 2,
    },
    macroPillVal: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    macroPillLabel: {
      fontSize: 10,
      color: colors.mutedForeground,
    },
    swapRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    swapTextWrap: {
      flex: 1,
      gap: 2,
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
