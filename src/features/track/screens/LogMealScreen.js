import React, { useMemo, useState } from "react";
import {
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
import { auth, db } from "../../../config/firebase";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const RECENT_FOODS = [
  {
    name: "Boiled Egg",
    amount: "2 large",
    cal: 155,
    protein: "13g",
    carbs: "1g",
    fat: "11g",
  },
  {
    name: "Oatmeal",
    amount: "1 cup",
    cal: 166,
    protein: "6g",
    carbs: "28g",
    fat: "3g",
  },
  {
    name: "Banana",
    amount: "1 medium",
    cal: 89,
    protein: "1g",
    carbs: "23g",
    fat: "0g",
  },
  {
    name: "Grilled Chicken",
    amount: "100g",
    cal: 165,
    protein: "31g",
    carbs: "0g",
    fat: "3g",
  },
  {
    name: "Jollof Rice",
    amount: "1 cup",
    cal: 340,
    protein: "7g",
    carbs: "62g",
    fat: "7g",
  },
];

const DRINKS = ["Water", "Tea", "Juice", "Milk", "Soda"];

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

export default function LogMealScreen({ navigation }) {
  const [mealType, setMealType] = useState("Lunch");
  const [search, setSearch] = useState("");
  const [addedFoods, setAddedFoods] = useState([]);
  const [saving, setSaving] = useState(false);

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

  const filteredFoods = RECENT_FOODS.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

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
      await addDoc(collection(db, "users", uid, "logs"), {
        category: "meal",
        type: mealType,
        name: addedFoods.map((food) => food.name).join(", "),
        foods: addedFoods,
        totalCalories: totals.cal,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        source: "manual",
        createdAt: serverTimestamp(),
      });
      navigation?.goBack();
    } catch (error) {
      Alert.alert("Could not save", "Please try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.headerSub}>Food & Drinks</Text>
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
            onChangeText={setSearch}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.8}>
              <Ionicons name="close-circle" size={18} color="#9A8478" />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>
          {search.length > 0 ? "Results" : "Recent Foods"}
        </Text>
        <View style={styles.card}>
          {filteredFoods.map((food, index) => {
            const added = isAdded(food);
            return (
              <View key={food.name}>
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
                {index < filteredFoods.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </View>
            );
          })}
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
