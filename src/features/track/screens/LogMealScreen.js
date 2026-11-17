import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../../../config/firebase";
import { normalizeMealForFirestore } from "../../../utils/mealNormalizer";
import { enqueueFailedWrite } from "../../../utils/offlineQueue";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

// ---------------------------------------------------------------------------
// Local Nigerian foods database (estimated macros per typical serving)
// ---------------------------------------------------------------------------
const NIGERIAN_FOODS = [
  { name: "Jollof Rice", amount: "1 cup (200g)", cal: 340, protein: "7g", carbs: "62g", fat: "7g" },
  { name: "Fried Rice", amount: "1 cup (200g)", cal: 360, protein: "8g", carbs: "58g", fat: "10g" },
  { name: "Pounded Yam", amount: "1 wrap (250g)", cal: 295, protein: "3g", carbs: "68g", fat: "1g" },
  { name: "Egusi Soup", amount: "1 bowl (200g)", cal: 310, protein: "14g", carbs: "8g", fat: "24g" },
  { name: "Ofe Onugbu (Bitter Leaf Soup)", amount: "1 bowl (200g)", cal: 240, protein: "12g", carbs: "6g", fat: "18g" },
  { name: "Banga Soup", amount: "1 bowl (200g)", cal: 280, protein: "11g", carbs: "7g", fat: "22g" },
  { name: "Afang Soup", amount: "1 bowl (200g)", cal: 260, protein: "13g", carbs: "5g", fat: "20g" },
  { name: "Edikang Ikong", amount: "1 bowl (200g)", cal: 270, protein: "14g", carbs: "5g", fat: "21g" },
  { name: "Okra Soup", amount: "1 bowl (200g)", cal: 190, protein: "10g", carbs: "10g", fat: "13g" },
  { name: "Ogbono Soup", amount: "1 bowl (200g)", cal: 300, protein: "12g", carbs: "7g", fat: "24g" },
  { name: "Moi Moi", amount: "1 wrap (150g)", cal: 180, protein: "11g", carbs: "18g", fat: "6g" },
  { name: "Akara", amount: "3 pieces (90g)", cal: 220, protein: "10g", carbs: "20g", fat: "11g" },
  { name: "Fried Plantain (Dodo)", amount: "5 slices (100g)", cal: 220, protein: "1g", carbs: "36g", fat: "9g" },
  { name: "Suya", amount: "1 stick (100g)", cal: 240, protein: "26g", carbs: "4g", fat: "13g" },
  { name: "Chicken Stew", amount: "1 serving (200g)", cal: 290, protein: "24g", carbs: "8g", fat: "17g" },
  { name: "Tomato Stew", amount: "1 serving (150g)", cal: 130, protein: "3g", carbs: "12g", fat: "8g" },
  { name: "Yam Porridge", amount: "1 bowl (250g)", cal: 310, protein: "5g", carbs: "64g", fat: "5g" },
  { name: "Beans (Ewa)", amount: "1 cup (200g)", cal: 230, protein: "15g", carbs: "38g", fat: "2g" },
  { name: "Eba/Garri", amount: "1 wrap (200g)", cal: 330, protein: "2g", carbs: "80g", fat: "1g" },
  { name: "Fufu", amount: "1 wrap (250g)", cal: 280, protein: "2g", carbs: "68g", fat: "1g" },
  { name: "Amala", amount: "1 wrap (200g)", cal: 290, protein: "3g", carbs: "70g", fat: "1g" },
  { name: "Tuwo Shinkafa", amount: "1 wrap (250g)", cal: 310, protein: "4g", carbs: "72g", fat: "1g" },
  { name: "Semovita", amount: "1 wrap (200g)", cal: 300, protein: "8g", carbs: "65g", fat: "1g" },
  { name: "Wheat Meal", amount: "1 wrap (200g)", cal: 290, protein: "10g", carbs: "60g", fat: "2g" },
  { name: "Ofada Rice", amount: "1 cup (200g)", cal: 320, protein: "6g", carbs: "66g", fat: "3g" },
  { name: "Basmati Rice", amount: "1 cup (186g)", cal: 240, protein: "5g", carbs: "53g", fat: "1g" },
  { name: "Boiled Yam", amount: "1 slice (150g)", cal: 177, protein: "2g", carbs: "42g", fat: "0g" },
  { name: "Boiled Plantain", amount: "1 medium (150g)", cal: 175, protein: "1g", carbs: "44g", fat: "0g" },
  { name: "Pepper Soup", amount: "1 bowl (300g)", cal: 160, protein: "18g", carbs: "4g", fat: "7g" },
  { name: "Oha Soup", amount: "1 bowl (200g)", cal: 250, protein: "12g", carbs: "6g", fat: "19g" },
  { name: "Groundnut Soup", amount: "1 bowl (200g)", cal: 320, protein: "14g", carbs: "9g", fat: "26g" },
  { name: "Miyan Kuka", amount: "1 bowl (200g)", cal: 180, protein: "9g", carbs: "8g", fat: "12g" },
  { name: "Zobo (Hibiscus Tea)", amount: "1 glass (250ml)", cal: 40, protein: "0g", carbs: "10g", fat: "0g" },
  { name: "Kunu", amount: "1 glass (250ml)", cal: 110, protein: "2g", carbs: "24g", fat: "1g" },
  { name: "Palm Wine", amount: "1 glass (250ml)", cal: 100, protein: "1g", carbs: "18g", fat: "0g" },
  { name: "Malt Drink", amount: "1 bottle (330ml)", cal: 170, protein: "3g", carbs: "38g", fat: "0g" },
  { name: "Chapman", amount: "1 glass (350ml)", cal: 140, protein: "0g", carbs: "35g", fat: "0g" },
  { name: "Fanta", amount: "1 bottle (350ml)", cal: 148, protein: "0g", carbs: "39g", fat: "0g" },
  { name: "Coke", amount: "1 bottle (350ml)", cal: 140, protein: "0g", carbs: "39g", fat: "0g" },
  // Extra common foods kept from original list
  { name: "Boiled Egg", amount: "2 large", cal: 155, protein: "13g", carbs: "1g", fat: "11g" },
  { name: "Oatmeal", amount: "1 cup", cal: 166, protein: "6g", carbs: "28g", fat: "3g" },
  { name: "Banana", amount: "1 medium", cal: 89, protein: "1g", carbs: "23g", fat: "0g" },
  { name: "Grilled Chicken", amount: "100g", cal: 165, protein: "31g", carbs: "0g", fat: "3g" },
];

const DRINKS = ["Water", "Tea", "Juice", "Milk", "Soda"];

const OFFLINE_LOGS_KEY = "@reversia_offline_logs";

function buildDrinkFood(drink) {
  return {
    name: drink,
    amount: "1 glass",
    cal: drink === "Water" ? 0 : 60,
    protein: "0g",
    carbs: drink === "Water" ? "0g" : "15g",
    fat: "0g",
  };
}

// ---------------------------------------------------------------------------
// Map an Open Food Facts product to our internal food shape
// ---------------------------------------------------------------------------
function mapOffProduct(product) {
  const n = product.nutriments || {};
  const cal = Math.round(n["energy-kcal_100g"] ?? 0);
  const protein = Math.round(n["proteins_100g"] ?? 0);
  const carbs = Math.round(n["carbohydrates_100g"] ?? 0);
  const fat = Math.round(n["fat_100g"] ?? 0);
  const name = product.product_name?.trim() || "Unknown";
  const serving = product.serving_size || "100g";
  return {
    name,
    amount: serving,
    cal,
    protein: `${protein}g`,
    carbs: `${carbs}g`,
    fat: `${fat}g`,
  };
}

// ---------------------------------------------------------------------------
// Open Food Facts search
// ---------------------------------------------------------------------------
async function fetchOpenFoodFacts(query) {
  const encoded = encodeURIComponent(query);
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}` +
    `&search_simple=1&action=process&json=1&page_size=20` +
    `&fields=product_name,nutriments,serving_size,brands`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`OFF responded with ${response.status}`);
  const data = await response.json();
  return (data.products || [])
    .filter((p) => p.product_name?.trim())
    .map(mapOffProduct);
}

// ---------------------------------------------------------------------------
// Merge local + remote results, dedup by lowercase name
// ---------------------------------------------------------------------------
function mergeResults(local, remote) {
  const seen = new Set(local.map((f) => f.name.toLowerCase()));
  const deduped = remote.filter((f) => {
    const key = f.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...local, ...deduped];
}

export default function LogMealScreen({ navigation }) {
  const [mealType, setMealType] = useState("Lunch");
  const [search, setSearch] = useState("");
  const [addedFoods, setAddedFoods] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searchResults, setSearchResults] = useState(NIGERIAN_FOODS);
  const [searching, setSearching] = useState(false);

  const debounceTimer = useRef(null);

  // -------------------------------------------------------------------------
  // Debounced search handler
  // -------------------------------------------------------------------------
  const handleSearch = useCallback((text) => {
    setSearch(text);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      const q = text.trim();

      // Filter local list
      const localMatches =
        q.length === 0
          ? NIGERIAN_FOODS
          : NIGERIAN_FOODS.filter((f) =>
              f.name.toLowerCase().includes(q.toLowerCase())
            );

      if (q.length < 2) {
        setSearchResults(localMatches);
        setSearching(false);
        return;
      }

      // Show local results immediately while remote fetch is in-flight
      setSearchResults(localMatches);
      setSearching(true);

      try {
        const remoteResults = await fetchOpenFoodFacts(q);
        setSearchResults(mergeResults(localMatches, remoteResults));
      } catch (_err) {
        // Graceful fallback — local results already set above
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const toggleFood = (food) => {
    setAddedFoods((current) =>
      current.find((item) => item.name === food.name)
        ? current.filter((item) => item.name !== food.name)
        : [...current, food]
    );
  };

  const isAdded = (food) => addedFoods.some((item) => item.name === food.name);

  const totals = useMemo(
    () => ({
      cal: addedFoods.reduce((sum, food) => sum + food.cal, 0),
      protein: addedFoods.reduce(
        (sum, food) => sum + Number.parseInt(food.protein, 10),
        0
      ),
      carbs: addedFoods.reduce(
        (sum, food) => sum + Number.parseInt(food.carbs, 10),
        0
      ),
      fat: addedFoods.reduce(
        (sum, food) => sum + Number.parseFloat(food.fat),
        0
      ),
    }),
    [addedFoods]
  );

  // -------------------------------------------------------------------------
  // Save meal to Firestore + mirror to AsyncStorage offline cache
  // -------------------------------------------------------------------------
  const saveMeal = async () => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      Alert.alert("Sign in required", "Please sign in before logging a meal.");
      return;
    }

    if (addedFoods.length === 0 || saving) {
      return;
    }

    setSaving(true);
    try {
      const mealData = normalizeMealForFirestore({
        name: addedFoods.map((food) => food.name).join(", "),
        mealType,
        calories: totals.cal,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        source: "search",
        date: new Date().toISOString().slice(0, 10),
      });

      const logPayload = {
        ...mealData,
        category: "meal",
        // preserve the per-food breakdown for display purposes
        foods: addedFoods,
        uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", uid, "logs"), logPayload);

      // Mirror to AsyncStorage for offline access
      try {
        const existing = await AsyncStorage.getItem(OFFLINE_LOGS_KEY);
        const offlineLogs = existing ? JSON.parse(existing) : [];
        const offlineEntry = {
          ...logPayload,
          createdAt: new Date().toISOString(), // serverTimestamp not serialisable
          _offlineUid: uid,
        };
        offlineLogs.push(offlineEntry);
        await AsyncStorage.setItem(OFFLINE_LOGS_KEY, JSON.stringify(offlineLogs));
      } catch (_storageErr) {
        // Offline mirroring failure must not block the user
      }
      navigation?.goBack();
    } catch (error) {
      try {
        const mealData = normalizeMealForFirestore({
          name: addedFoods.map((food) => food.name).join(", "),
          mealType,
          calories: totals.cal,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          source: "search",
          date: new Date().toISOString().slice(0, 10),
        });
        await enqueueFailedWrite({
          path: `users/${uid}/logs`,
          data: {
            ...mealData,
            category: "meal",
            foods: addedFoods,
            uid,
          },
        });
        Alert.alert(
          "Saved Offline",
          "Your meal was saved locally and will automatically sync once online."
        );
        navigation?.goBack();
      } catch (_) {
        Alert.alert("Could not save", "Please try again in a moment.");
      }
    } finally {
      setSaving(false);
    }
  };

  const displayedFoods = searchResults;
  const sectionLabel = search.length > 0 ? "Results" : "Recent Foods";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#211613" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#F4EAE4" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Log Meal</Text>
          <Text style={styles.headerSub}>Food &amp; Drinks</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <View style={styles.iconBadge}>
              <Ionicons name="restaurant-outline" size={16} color="#9A8478" />
            </View>
            <Text style={styles.cardLabel}>Meal Type</Text>
          </View>
          <View style={styles.mealTypeRow}>
            {MEAL_TYPES.map((type) => {
              const active = mealType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setMealType(type)}
                  activeOpacity={0.8}
                  style={[
                    styles.mealTypeBtn,
                    active && styles.mealTypeBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.mealTypeBtnText,
                      active && styles.mealTypeBtnTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {addedFoods.length > 0 ? (
          <View style={styles.macroCard}>
            <View style={styles.macroTopRow}>
              <Text style={styles.macroCalText}>{totals.cal}</Text>
              <Text style={styles.macroCalLabel}> kcal total</Text>
            </View>
            <View style={styles.macroRow}>
              {[
                {
                  label: "Protein",
                  value: `${totals.protein}g`,
                  color: "#6A816A",
                },
                { label: "Carbs", value: `${totals.carbs}g`, color: "#D88939" },
                { label: "Fat", value: `${totals.fat}g`, color: "#E3B372" },
              ].map((macro) => (
                <View key={macro.label} style={styles.macroPill}>
                  <Text style={[styles.macroPillVal, { color: macro.color }]}>
                    {macro.value}
                  </Text>
                  <Text style={styles.macroPillLabel}>{macro.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.searchWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#9A8478"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food or drink..."
            placeholderTextColor="#9A8478"
            value={search}
            onChangeText={handleSearch}
          />
          {searching ? (
            <ActivityIndicator size="small" color="#D88939" />
          ) : search.length > 0 ? (
            <TouchableOpacity
              onPress={() => handleSearch("")}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={18} color="#9A8478" />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>{sectionLabel}</Text>
        <View style={styles.card}>
          {displayedFoods.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          ) : (
            displayedFoods.map((food, index) => {
              const added = isAdded(food);
              return (
                <View key={`${food.name}-${index}`}>
                  <View style={styles.foodRow}>
                    <View style={styles.foodTextWrap}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodMeta}>
                        {food.amount} · {food.cal} kcal · {food.protein} protein
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleFood(food)}
                      activeOpacity={0.8}
                      style={[styles.addBtn, added && styles.addBtnActive]}
                    >
                      <Ionicons
                        name={added ? "checkmark" : "add"}
                        size={18}
                        color={added ? "#211613" : "#D88939"}
                      />
                    </TouchableOpacity>
                  </View>
                  {index < displayedFoods.length - 1 ? (
                    <View style={styles.divider} />
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <View style={[styles.iconBadge, styles.drinkBadge]}>
              <Ionicons name="water-outline" size={16} color="#E3B372" />
            </View>
            <Text style={styles.cardLabel}>Add a drink?</Text>
          </View>
          <View style={styles.drinkRow}>
            {DRINKS.map((drink) => {
              const added = addedFoods.some((food) => food.name === drink);
              return (
                <TouchableOpacity
                  key={drink}
                  onPress={() => toggleFood(buildDrinkFood(drink))}
                  activeOpacity={0.8}
                  style={[styles.drinkChip, added && styles.drinkChipActive]}
                >
                  <Text
                    style={[
                      styles.drinkChipText,
                      added && styles.drinkChipTextActive,
                    ]}
                  >
                    {drink}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.saveBtn,
            addedFoods.length === 0 && styles.saveBtnDisabled,
          ]}
          disabled={addedFoods.length === 0 || saving}
          onPress={saveMeal}
        >
          <Text style={styles.saveBtnText}>
            {saving
              ? "Saving..."
              : addedFoods.length === 0
              ? "Add food to log"
              : `Save ${mealType} (${addedFoods.length} item${
                  addedFoods.length > 1 ? "s" : ""
                })`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#211613",
  },
  scroll: {
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2D201C",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F4EAE4",
  },
  headerSub: {
    fontSize: 12,
    color: "#9A8478",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#2D201C",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(154,132,120,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  drinkBadge: {
    backgroundColor: "rgba(227,179,114,0.15)",
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F4EAE4",
  },
  mealTypeRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 14,
  },
  mealTypeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#3A2A25",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  mealTypeBtnActive: {
    backgroundColor: "rgba(216,137,57,0.15)",
    borderColor: "#D88939",
  },
  mealTypeBtnText: {
    fontSize: 12,
    color: "#9A8478",
    fontWeight: "600",
  },
  mealTypeBtnTextActive: {
    color: "#D88939",
    fontWeight: "700",
  },
  macroCard: {
    backgroundColor: "rgba(216,137,57,0.10)",
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(216,137,57,0.20)",
  },
  macroTopRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  macroCalText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#D88939",
  },
  macroCalLabel: {
    fontSize: 14,
    color: "#9A8478",
  },
  macroRow: {
    flexDirection: "row",
    gap: 10,
  },
  macroPill: {
    flex: 1,
    backgroundColor: "rgba(33,22,19,0.40)",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  macroPillVal: {
    fontSize: 15,
    fontWeight: "700",
  },
  macroPillLabel: {
    fontSize: 10,
    color: "#9A8478",
    marginTop: 2,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D201C",
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#F4EAE4",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9A8478",
    paddingHorizontal: 26,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  emptyRow: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9A8478",
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  foodTextWrap: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F4EAE4",
  },
  foodMeta: {
    fontSize: 12,
    color: "#9A8478",
    marginTop: 2,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(216,137,57,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnActive: {
    backgroundColor: "#D88939",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  drinkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 14,
  },
  drinkChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#3A2A25",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  drinkChipActive: {
    backgroundColor: "rgba(227,179,114,0.15)",
    borderColor: "#E3B372",
  },
  drinkChipText: {
    fontSize: 13,
    color: "#9A8478",
    fontWeight: "500",
  },
  drinkChipTextActive: {
    color: "#E3B372",
    fontWeight: "700",
  },
  saveBtn: {
    backgroundColor: "#D88939",
    borderRadius: 20,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
  },
  saveBtnDisabled: {
    backgroundColor: "#3A2A25",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#211613",
  },
});
