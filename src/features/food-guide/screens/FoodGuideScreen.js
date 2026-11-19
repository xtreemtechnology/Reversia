// src/features/food-guide/screens/FoodGuideScreen.js
// Home screen of the Natural Food Guide: search, rating filter chips and
// food cards with a real photo on top where one exists. Ratings are a
// simple guide from the foods' carbs, protein and preparation — not
// measured glycaemic index values.

import React, { useMemo, useState } from "react";
import {
  Image,
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
import { T, FONTS } from "../../../theme/tokens";
import FadeIn from "../../home/components/FadeIn";
import PressScale from "../../home/components/PressScale";
import {
  FOOD_GUIDE_RATINGS,
  FOOD_GUIDE_DISCLAIMER,
} from "../data/foodGuideData";
import { searchFoodGuide, countByRating } from "../services/foodGuideService";
import { getFoodPhoto } from "../foodPhotos";

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
        <FadeIn delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>Food Guide</Text>
            <Text style={styles.subtitle}>
              Natural foods for steady sugar — search a food, then check its
              rating.
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={60}>
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
        </FadeIn>

        <FadeIn delay={120}>
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
            <Text style={styles.ratingMeaning}>{RATING_MEANINGS[rating]}</Text>
          ) : null}
        </FadeIn>

        {results.length === 0 ? (
          <FadeIn delay={180}>
            <View style={styles.card}>
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>No foods found</Text>
                <Text style={styles.muted}>
                  Try a different name — beans, yam, zobo, suya.
                </Text>
              </View>
            </View>
          </FadeIn>
        ) : (
          results.map((food, index) => {
            const photo = getFoodPhoto(food.id);
            return (
              <FadeIn key={food.id} delay={Math.min(180 + index * 40, 420)}>
                <PressScale
                  style={styles.foodCard}
                  onPress={() =>
                    navigation?.navigate("FoodDetail", {
                      foodId: food.id,
                    })
                  }
                  accessibilityLabel={`${food.name}, rated ${food.rating}`}
                >
                  {photo ? (
                    <Image
                      source={photo}
                      style={styles.foodPhoto}
                      resizeMode="cover"
                      accessibilityLabel={`Photo of ${food.name}`}
                    />
                  ) : null}
                  <View style={styles.foodBody}>
                    <View style={styles.foodTopRow}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <RatingBadge rating={food.rating} styles={styles} />
                    </View>
                    <Text style={styles.foodMeta}>
                      {food.amount} · {food.cal} kcal · {food.carbs} carbs ·{" "}
                      {food.protein} protein
                    </Text>
                    <Text style={styles.foodMeta}>
                      {food.category} · {loadLabel(food.load)}
                    </Text>
                  </View>
                </PressScale>
              </FadeIn>
            );
          })
        )}

        <FadeIn delay={240}>
          <View style={[styles.card, styles.disclaimerCard]}>
            <Text style={styles.muted}>{FOOD_GUIDE_DISCLAIMER}</Text>
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
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 999,
      paddingHorizontal: 16,
      height: 52,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontFamily: FONTS.body,
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
      borderRadius: 999,
      backgroundColor: colors.muted,
      borderWidth: 1.5,
      borderColor: "transparent",
    },
    chipActive: {
      backgroundColor: "rgba(139,195,74,0.14)",
      borderColor: colors.primary,
    },
    chipText: {
      fontFamily: FONTS.body,
      fontSize: 13,
      color: colors.mutedForeground,
      fontWeight: "600",
    },
    chipTextActive: {
      color: colors.primary,
      fontWeight: "700",
    },
    ratingMeaning: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
      marginTop: 10,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    disclaimerCard: {
      backgroundColor: colors.muted,
    },
    foodCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    foodPhoto: {
      width: "100%",
      height: 150,
    },
    foodBody: {
      padding: 16,
      gap: 4,
    },
    foodTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    foodName: {
      fontFamily: FONTS.display,
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      flex: 1,
    },
    foodMeta: {
      fontFamily: FONTS.body,
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    badge: {
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    badgeText: {
      fontFamily: FONTS.body,
      fontSize: 12,
      fontWeight: "700",
    },
    emptyRow: {
      alignItems: "center",
      paddingVertical: 24,
      gap: 6,
    },
    emptyText: {
      fontFamily: FONTS.display,
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    muted: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
      textAlign: "center",
    },
  });
}
