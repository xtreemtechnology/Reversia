import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import { useUserLogs } from "../../../hooks/useUserLogs";
import secureStorage from "../../../utils/secureStorage";
import SolarIcon from "../../../components/SolarIcon";

const FAVORITES_KEY = "@reversia_local_favorites";

const DEFAULT_FAVORITES = [
  {
    id: "jollof",
    name: "Jollof",
    subtitle: "Staple",
    image:
      "https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/pPgHdP4qecK/components/X16anVRGLVq.png",
    icon: "plate-bold-duotone",
    tint: "rgba(216,137,57,0.14)",
    accent: "#D88939",
  },
  {
    id: "pounded-yam",
    name: "Pounded Yam",
    subtitle: "Traditional",
    image:
      "https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/pPgHdP4qecK/components/Uuwn4s5TRFb.png",
    icon: "plate-bold-duotone",
    tint: "rgba(106,129,106,0.14)",
    accent: "#6A816A",
  },
  {
    id: "akara",
    name: "Akara",
    subtitle: "Protein-rich",
    icon: "cup-bold-duotone",
    tint: "rgba(206,108,96,0.16)",
    accent: "#CE6C60",
  },
  {
    id: "moi-moi",
    name: "Moi Moi",
    subtitle: "Steamed beans",
    icon: "book-bookmark-bold-duotone",
    tint: "rgba(106,129,106,0.16)",
    accent: "#6A816A",
  },
];

function getLatestMeal(logs) {
  return (logs || []).find((log) => log?.category === "meal") || null;
}

function mealLabel(meal) {
  return meal?.name || meal?.type || "Last meal";
}

function buildFavoriteFromMeal(meal) {
  const label = mealLabel(meal);
  return {
    id: `meal-${Date.now()}`,
    name: label,
    subtitle: meal?.type || "From your story",
    icon: "history-bold-duotone",
    tint: "rgba(216,137,57,0.16)",
    accent: "#D88939",
    sourceMealType: meal?.type || "Lunch",
  };
}

function FavoriteCard({ item, onPress, onRemove, colors }) {
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.favoriteCard}
    >
      <View style={styles.favoriteMedia}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.favoriteImage} />
        ) : (
          <View
            style={[styles.favoriteFallback, { backgroundColor: item.tint }]}
          >
            <SolarIcon
              name={item.icon || "plate-bold-duotone"}
              size={22}
              color={item.accent}
            />
          </View>
        )}
        <TouchableOpacity
          onPress={onRemove}
          activeOpacity={0.85}
          style={styles.removeChip}
        >
          <Text style={styles.removeChipText}>×</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.favoriteBody}>
        <Text
          style={[styles.favoriteTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={[styles.favoriteSubtitle, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TrackScreen({ navigation, route }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { logs } = useUserLogs(30);
  const latestMeal = getLatestMeal(logs);
  const latestMealName = mealLabel(latestMeal);

  const [favorites, setFavorites] = useState(DEFAULT_FAVORITES);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [bodyCheckVisible, setBodyCheckVisible] = useState(false);
  const [bodyCheckSaving, setBodyCheckSaving] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    if (route?.params?.focus === "body-check") {
      setBodyCheckVisible(true);
      navigation?.setParams?.({ focus: undefined });
    }
  }, [navigation, route?.params?.focus]);

  useEffect(() => {
    let mounted = true;

    const loadFavorites = async () => {
      try {
        const stored = await secureStorage.getItem(FAVORITES_KEY);
        if (!mounted) return;

        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFavorites(parsed);
          }
        }
      } catch (_) {
        if (mounted) setFavorites(DEFAULT_FAVORITES);
      } finally {
        if (mounted) setFavoritesReady(true);
      }
    };

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!favoritesReady) return;
    secureStorage
      .setItem(FAVORITES_KEY, JSON.stringify(favorites))
      .catch(() => {});
  }, [favorites, favoritesReady]);

  const smartSuggestion = useMemo(() => {
    if (latestMeal) {
      return {
        title: latestMealName,
        body:
          latestMeal?.notes ||
          "This is the last meal Reversia saw in your story, so it can anchor the next suggestion to it.",
        why: "This matters because your next suggestion is sharper when it can compare against the exact last meal you had.",
      };
    }

    return {
      title: "Log your last meal to unlock suggestions",
      body: "Once you add a meal, Reversia can repeat it or compare it with your next log.",
      why: "This matters because smart suggestions become useful only after the app can see what you actually ate.",
    };
  }, [latestMeal, latestMealName]);

  const addLastMeal = () => {
    if (!latestMeal) return;
    const nextFavorite = buildFavoriteFromMeal(latestMeal);
    setFavorites((current) => {
      const normalized = latestMealName.trim().toLowerCase();
      const exists = current.some(
        (item) => item.name.trim().toLowerCase() === normalized
      );
      if (exists) return current;
      return [nextFavorite, ...current];
    });
  };

  const removeFavorite = (id) => {
    setFavorites((current) => current.filter((item) => item.id !== id));
  };

  const voiceAction = () =>
    navigation?.navigate("MealEntry", {
      mealType: latestMeal?.type || "Lunch",
    });
  const photoAction = () =>
    navigation?.navigate("MealEntry", {
      openCamera: true,
      mealType: latestMeal?.type || "Lunch",
    });

  const saveBodyCheck = async () => {
    const mood = selectedMood;
    const uid = auth.currentUser?.uid;

    if (!uid || !mood || bodyCheckSaving) {
      return;
    }

    setBodyCheckSaving(true);
    try {
      await addDoc(collection(db, "users", uid, "logs"), {
        category: "body_check",
        type: "body_check",
        value: mood,
        createdAt: serverTimestamp(),
        source: "manual",
      });
      setBodyCheckVisible(false);
      setSelectedMood(null);
    } finally {
      setBodyCheckSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Modal
        visible={bodyCheckVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBodyCheckVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Body Check
              </Text>
              <TouchableOpacity
                onPress={() => setBodyCheckVisible(false)}
                style={styles.modalClose}
              >
                <SolarIcon
                  name="close"
                  size={18}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalBody, { color: colors.mutedForeground }]}>
              How are you feeling right now?
            </Text>
            <View style={styles.moodGrid}>
              {[
                "Energetic",
                "Tired",
                "Hungry",
                "Craving sugar",
                "Stressed",
                "Normal",
              ].map((mood) => {
                const active = selectedMood === mood;
                return (
                  <TouchableOpacity
                    key={mood}
                    activeOpacity={0.9}
                    onPress={() => setSelectedMood(mood)}
                    style={[
                      styles.moodChip,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.background,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.moodChipText,
                        {
                          color: active
                            ? colors.primaryForeground
                            : colors.foreground,
                        },
                      ]}
                    >
                      {mood}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={saveBodyCheck}
              disabled={!selectedMood || bodyCheckSaving}
              style={[
                styles.modalSave,
                {
                  backgroundColor: selectedMood ? colors.primary : colors.muted,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalSaveText,
                  { color: colors.primaryForeground },
                ]}
              >
                {bodyCheckSaving ? "Saving..." : "Save body check"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 124 },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Nourish your body
          </Text>
          <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
            What are you having right now?
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={voiceAction}
            style={styles.voiceCard}
          >
            <View
              style={[
                styles.actionCircle,
                { backgroundColor: "rgba(216,137,57,0.12)" },
              ]}
            >
              <SolarIcon
                name="microphone-bold-duotone"
                size={22}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.voiceLabel, { color: colors.foreground }]}>
              Voice Log
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.92}
            onPress={photoAction}
            style={styles.voiceCard}
          >
            <View
              style={[
                styles.actionCircle,
                { backgroundColor: "rgba(106,129,106,0.12)" },
              ]}
            >
              <SolarIcon
                name="camera-bold-duotone"
                size={22}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.voiceLabel, { color: colors.foreground }]}>
              Photo Log
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionGap}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Smart Suggestions
            </Text>
            <View style={styles.badge}>
              <Text
                style={[styles.badgeText, { color: colors.mutedForeground }]}
              >
                Based on your story
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.94}
            onPress={voiceAction}
            style={styles.suggestionCard}
          >
            <View style={styles.suggestionInnerRow}>
              <View
                style={[
                  styles.suggestionIcon,
                  { backgroundColor: "rgba(216,137,57,0.14)" },
                ]}
              >
                <SolarIcon
                  name="history-bold-duotone"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.suggestionTextWrap}>
                <Text
                  style={[styles.suggestionTitle, { color: colors.foreground }]}
                >
                  {smartSuggestion.title}
                </Text>
                <Text
                  style={[
                    styles.suggestionBody,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {smartSuggestion.body}
                </Text>
              </View>
              <SolarIcon
                name="alt-arrow-right-linear"
                size={18}
                color={colors.mutedForeground}
              />
            </View>
            <View style={styles.whyBlock}>
              <View style={styles.whyRow}>
                <SolarIcon
                  name="info-circle-bold-duotone"
                  size={18}
                  color={colors.mutedForeground}
                />
                <View style={styles.whyTextWrap}>
                  <Text style={[styles.whyTitle, { color: colors.foreground }]}>
                    Why this matters
                  </Text>
                  <Text
                    style={[styles.whyBody, { color: colors.mutedForeground }]}
                  >
                    {smartSuggestion.why}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionGap}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Local Favorites
            </Text>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={addLastMeal}
              style={styles.addButton}
            >
              <SolarIcon
                name="add-circle-bold"
                size={14}
                color={colors.primary}
              />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>
                Add last meal
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.favoritesGrid}>
            {favorites.map((item) => (
              <FavoriteCard
                key={item.id}
                item={item}
                colors={colors}
                onPress={() =>
                  navigation?.navigate("MealEntry", {
                    mealName: item.name,
                    mealType: item.sourceMealType || item.name,
                  })
                }
                onRemove={() => removeFavorite(item.id)}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation?.navigate("MealEntry")}
          style={styles.searchButton}
        >
          <SolarIcon
            name="magnifer-linear"
            size={18}
            color={colors.foreground}
          />
          <Text style={[styles.searchButtonText, { color: colors.foreground }]}>
            Search other meals
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 22,
  },
  header: { gap: 8 },
  heading: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700",
  },
  subheading: {
    fontSize: 15,
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
  },
  voiceCard: {
    flex: 1,
    backgroundColor: "#2D201C",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 16,
    gap: 12,
    alignItems: "center",
  },
  actionCircle: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionGap: { gap: 14 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "#2D201C",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  suggestionCard: {
    backgroundColor: "#2D201C",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 20,
    gap: 16,
  },
  suggestionInnerRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionTextWrap: {
    flex: 1,
    gap: 6,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  suggestionBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  whyBlock: {
    backgroundColor: "rgba(33,22,19,0.42)",
    borderRadius: 20,
    padding: 15,
  },
  whyRow: {
    flexDirection: "row",
    gap: 10,
  },
  whyTextWrap: { flex: 1 },
  whyTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  whyBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2D201C",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: "700",
  },
  favoritesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  favoriteCard: {
    width: "48%",
    backgroundColor: "#2D201C",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  favoriteMedia: {
    height: 128,
    position: "relative",
  },
  favoriteImage: {
    width: "100%",
    height: "100%",
  },
  favoriteFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  removeChip: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(33,22,19,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeChipText: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "700",
    marginTop: -1,
  },
  favoriteBody: {
    padding: 14,
    gap: 4,
  },
  favoriteTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  favoriteSubtitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  searchButton: {
    backgroundColor: "#3A2A25",
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    marginTop: 4,
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  moodChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  moodChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalSave: {
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
