// src/features/food-guide/screens/FoodGuideScreen.js
// Home screen of the Natural Food Guide: search, rating filter chips and
// food cards in the LogMealScreen card style. Ratings are a simple guide
// from the foods' carbs, protein and preparation — not measured
// glycaemic index values.

import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";
import { T } from "../../../theme/tokens";
import {
  FOOD_GUIDE_RATINGS,
  FOOD_GUIDE_DISCLAIMER,
} from "../data/foodGuideData";
import {
  searchFoodGuide,
  countByRating,
} from "../services/foodGuideService";

export const RATING_MEANINGS = {
  safe: "A good everyday choice for steady sugar.",
  caution: "Fine in a modest portion — pair with protein or vegetables.",
  avoid: "A sugary drink the plan cuts in week 1.",
};

export function ratingColor(rating) {
  if (rating === "safe") return T.SUCCESS;
  if (rating === "caution") return T.WARNING;
  return T.DANGER;
}

function ratingLabel(rating) {
  return rating.charAt(0).toUpperCase() + rating.slice(1);
}

function loadLabel(load) {
  if (load === "low") return "Low carb load";
  if (load === "high") return "High carb load";
  return "Medium carb load";
}

function RatingBadge({ rating, styles }) {
  const color = ratingColor(rating);
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1F` }]}>
      <Text style={[styles.badgeText, { color }]}>{ratingLabel(rating)}</Text>
    </View>
  );
}

export default function FoodGuideScreen({ navigation }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState(null);

  const counts = useMemo(() => countByRating(), []);
  const total = counts.safe + counts.caution + counts.avoid;
  const results = useMemo(
    () => searchFoodGuide(query, rating || undefined),
    [query, rating]
  );

  const chips = [
    { key: null, label: "All", count: total },
    ...FOOD_GUIDE_RATINGS.map((value) => ({
      key: value,
      label: ratingLabel(value),
      count: counts[value],
    })),
  ];

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Food Guide</Text>
          <Text style={styles.subtitle}>
            Natural foods for steady sugar — search a food, then check its
            rating.
          </Text>
        </View>

        <View style={styles.searchWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.mutedForeground}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food or drink..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity
              onPress={() => setQuery("")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.chipRow}>
          {chips.map((chip) => {
            const active = rating === chip.key;
            return (
              <TouchableOpacity
                key={chip.key || "all"}
                onPress={() => setRating(chip.key)}
                activeOpacity={0.8}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {chip.label} ({chip.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {rating ? (
          <Text style={styles.ratingMeaning}>
            {RATING_MEANINGS[rating]}
          </Text>
        ) : null}

        <View style={styles.card}>
          {results.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No foods found</Text>
              <Text style={styles.muted}>
                Try a different name — beans, yam, zobo, suya.
              </Text>
            </View>
          ) : (
            results.map((food, index) => (
              <View key={food.id}>
                <TouchableOpacity
                  onPress={() =>
                    navigation?.navigate("FoodDetail", {
                      foodId: food.id,
                    })
                  }
                  activeOpacity={0.8}
                  style={styles.foodRow}
                >
                  <View style={styles.foodTextWrap}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodMeta}>
                      {food.amount} · {food.cal} kcal · {food.carbs} carbs ·{" "}
                      {food.protein} protein
                    </Text>
                    <Text style={styles.foodMeta}>
                      {food.category} · {loadLabel(food.load)}
                    </Text>
                  </View>
                  <RatingBadge rating={food.rating} styles={styles} />
                </TouchableOpacity>
                {index < results.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </View>
            ))
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
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingHorizontal: 14,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: colors.muted,
      borderWidth: 1.5,
      borderColor: "transparent",
    },
    chipActive: {
      backgroundColor: "rgba(128,85,232,0.14)",
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontWeight: "600",
    },
    chipTextActive: {
      color: colors.primary,
      fontWeight: "700",
    },
    ratingMeaning: {
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    disclaimerCard: {
      backgroundColor: colors.muted,
      paddingVertical: 16,
    },
    foodRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      gap: 12,
    },
    foodTextWrap: {
      flex: 1,
      gap: 2,
    },
    foodName: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    foodMeta: {
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
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
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    emptyRow: {
      alignItems: "center",
      paddingVertical: 24,
      gap: 6,
    },
    emptyText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    muted: {
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
      textAlign: "center",
    },
  });
}
