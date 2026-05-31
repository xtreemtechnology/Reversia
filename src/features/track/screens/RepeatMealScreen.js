import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { useUserLogs } from "../../../hooks/useUserLogs";

const YESTERDAY_MEAL = {
  name: "Grilled Chicken & Rice",
  time: "7:42 PM · Yesterday",
  calories: 620,
  items: [
    {
      name: "Grilled Chicken Breast",
      amount: "150g",
      cal: 248,
      protein: "46g",
      carbs: "0g",
      fat: "5g",
    },
    {
      name: "White Rice",
      amount: "1 cup",
      cal: 206,
      protein: "4g",
      carbs: "45g",
      fat: "0g",
    },
    {
      name: "Steamed Broccoli",
      amount: "80g",
      cal: 28,
      protein: "2g",
      carbs: "5g",
      fat: "0g",
    },
    {
      name: "Olive Oil Drizzle",
      amount: "1 tsp",
      cal: 40,
      protein: "0g",
      carbs: "0g",
      fat: "4.5g",
    },
  ],
};

const MACRO_COLORS = {
  Protein: "#6A816A",
  Carbs: "#D88939",
  Fat: "#E3B372",
};

const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Snack"];

function getLatestMeal(logs) {
  return (logs || []).find((log) => log?.category === "meal") || null;
}

function mealLabel(meal) {
  return meal?.name || meal?.type || YESTERDAY_MEAL.name;
}

function buildMealPreview(meal) {
  if (!meal) {
    return YESTERDAY_MEAL;
  }

  const itemName = meal.name || meal.type || YESTERDAY_MEAL.name;
  return {
    name: itemName,
    time: "Yesterday",
    calories: meal.calories || YESTERDAY_MEAL.calories,
    items: meal.items || YESTERDAY_MEAL.items,
  };
}

export default function RepeatMealScreen({ navigation, route }) {
  const [logged, setLogged] = useState(false);
  const [mealTime, setMealTime] = useState(route?.params?.mealType || "Dinner");
  const { logs } = useUserLogs(20);

  const latestMeal = getLatestMeal(logs);
  const mealPreview = useMemo(() => buildMealPreview(latestMeal), [latestMeal]);

  const totalProtein = mealPreview.items.reduce(
    (sum, item) => sum + Number.parseInt(item.protein, 10),
    0
  );
  const totalCarbs = mealPreview.items.reduce(
    (sum, item) => sum + Number.parseInt(item.carbs, 10),
    0
  );
  const totalFat = mealPreview.items.reduce(
    (sum, item) => sum + Number.parseFloat(item.fat),
    0
  );

  const saveRepeatMeal = async () => {
    const uid = auth.currentUser?.uid;

    if (!uid || logged) {
      return;
    }

    setLogged(true);
    try {
      await addDoc(collection(db, "users", uid, "logs"), {
        category: "meal",
        type: mealTime,
        name: mealLabel(latestMeal),
        source: "repeat_meal",
        createdAt: serverTimestamp(),
      });
      navigation?.goBack();
    } catch (error) {
      setLogged(false);
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
          <Text style={styles.headerTitle}>Repeat Meal</Text>
          <Text style={styles.headerSub}>Yesterday&apos;s dinner</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.mealIconBadge}>
              <Ionicons name="time" size={22} color="#D88939" />
            </View>
            <View style={styles.summaryTextWrap}>
              <Text style={styles.mealName}>{mealPreview.name}</Text>
              <Text style={styles.mealTime}>{mealPreview.time}</Text>
            </View>
            <View style={styles.calBadge}>
              <Text style={styles.calBadgeNum}>{mealPreview.calories}</Text>
              <Text style={styles.calBadgeLabel}>kcal</Text>
            </View>
          </View>

          <View style={styles.macroRow}>
            {[
              {
                label: "Protein",
                value: `${totalProtein}g`,
                color: MACRO_COLORS.Protein,
              },
              {
                label: "Carbs",
                value: `${totalCarbs}g`,
                color: MACRO_COLORS.Carbs,
              },
              { label: "Fat", value: `${totalFat}g`, color: MACRO_COLORS.Fat },
            ].map((macro) => (
              <View
                key={macro.label}
                style={[styles.macroPill, { borderColor: macro.color }]}
              >
                <Text style={[styles.macroPillVal, { color: macro.color }]}>
                  {macro.value}
                </Text>
                <Text style={styles.macroPillLabel}>{macro.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Included Items</Text>
        <View style={styles.card}>
          {mealPreview.items.map((item, index) => (
            <View key={`${item.name}-${index}`}>
              <View style={styles.foodRow}>
                <View style={styles.foodDot} />
                <View style={styles.foodTextWrap}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodAmount}>{item.amount}</Text>
                </View>
                <Text style={styles.foodCal}>{item.cal} kcal</Text>
              </View>
              {index < mealPreview.items.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Log As</Text>
        <View style={styles.card}>
          <View style={styles.mealTimeRow}>
            {MEAL_TIMES.map((time) => {
              const active = mealTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  onPress={() => setMealTime(time)}
                  activeOpacity={0.8}
                  style={[
                    styles.mealTimeBtn,
                    active && styles.mealTimeBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.mealTimeBtnText,
                      active && styles.mealTimeBtnTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.noteBox}>
          <Ionicons
            name="information-circle"
            size={16}
            color="#9A8478"
            style={styles.noteIcon}
          />
          <Text style={styles.noteText}>
            This will be logged as today&apos;s {mealTime.toLowerCase()} with
            the same portions.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.saveBtn, logged && styles.saveBtnLogged]}
          onPress={saveRepeatMeal}
        >
          {logged ? (
            <Ionicons name="checkmark-circle" size={22} color="#211613" />
          ) : (
            <Text style={styles.saveBtnText}>Log This Meal Again</Text>
          )}
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
  summaryCard: {
    backgroundColor: "#2D201C",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  mealIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(216,137,57,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  summaryTextWrap: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F4EAE4",
  },
  mealTime: {
    fontSize: 12,
    color: "#9A8478",
    marginTop: 2,
  },
  calBadge: {
    alignItems: "center",
  },
  calBadgeNum: {
    fontSize: 22,
    fontWeight: "700",
    color: "#D88939",
  },
  calBadgeLabel: {
    fontSize: 10,
    color: "#9A8478",
  },
  macroRow: {
    flexDirection: "row",
    gap: 10,
  },
  macroPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F4EAE4",
    paddingHorizontal: 26,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#2D201C",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  foodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D88939",
    marginRight: 14,
  },
  foodTextWrap: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F4EAE4",
  },
  foodAmount: {
    fontSize: 12,
    color: "#9A8478",
    marginTop: 2,
  },
  foodCal: {
    fontSize: 13,
    color: "#9A8478",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  mealTimeRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
  },
  mealTimeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#3A2A25",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  mealTimeBtnActive: {
    backgroundColor: "rgba(216,137,57,0.15)",
    borderColor: "#D88939",
  },
  mealTimeBtnText: {
    fontSize: 12,
    color: "#9A8478",
    fontWeight: "600",
  },
  mealTimeBtnTextActive: {
    color: "#D88939",
    fontWeight: "700",
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 24,
    marginBottom: 24,
  },
  noteIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  noteText: {
    fontSize: 13,
    color: "#9A8478",
    flex: 1,
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: "#D88939",
    borderRadius: 20,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
  },
  saveBtnLogged: {
    backgroundColor: "#6A816A",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#211613",
  },
});
