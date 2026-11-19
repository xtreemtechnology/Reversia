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
import { T, FONTS } from "../../../theme/tokens";
import FadeIn from "../../home/components/FadeIn";

const MACRO_COLORS = {
  Protein: T.SECONDARY,
  Carbs: T.PRIMARY,
  Fat: T.AMBER,
};

const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Snack"];

function getLatestMeal(logs) {
  return (logs || []).find((log) => log?.category === "meal") || null;
}

function mealLabel(meal) {
  return meal?.name || meal?.type || null;
}

function buildMealPreview(meal) {
  if (!meal) {
    return null;
  }

  const itemName = meal.name || meal.type || "Unknown meal";
  return {
    name: itemName,
    time: "Yesterday",
    calories: meal.calories || null,
    items: meal.items || [],
  };
}

export default function RepeatMealScreen({ navigation, route }) {
  const [logged, setLogged] = useState(false);
  const [mealTime, setMealTime] = useState(route?.params?.mealType || "Dinner");
  const { logs } = useUserLogs(20);

  const latestMeal = getLatestMeal(logs);
  const mealPreview = useMemo(() => buildMealPreview(latestMeal), [latestMeal]);

  const totalProtein = (mealPreview?.items || []).reduce(
    (sum, item) => sum + Number.parseInt(item.protein, 10),
    0
  );
  const totalCarbs = (mealPreview?.items || []).reduce(
    (sum, item) => sum + Number.parseInt(item.carbs, 10),
    0
  );
  const totalFat = (mealPreview?.items || []).reduce(
    (sum, item) => sum + Number.parseFloat(item.fat),
    0
  );

  const saveRepeatMeal = async () => {
    const uid = auth.currentUser?.uid;

    if (!uid || logged || !latestMeal) {
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

  // No meals logged yet — show friendly empty state
  if (!mealPreview) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={T.BG} />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.backBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color={T.TEXT} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Repeat Meal</Text>
            <Text style={styles.headerSub}>No meals yet</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.emptyStateWrap}>
          <Ionicons
            name="restaurant-outline"
            size={48}
            color={T.MUTED}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No meals logged yet</Text>
          <Text style={styles.emptyBody}>
            No meals logged yet — try logging your first meal
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.BG} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color={T.TEXT} />
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
        <FadeIn delay={0}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={styles.mealIconBadge}>
                <Ionicons name="time" size={22} color={T.PRIMARY} />
              </View>
              <View style={styles.summaryTextWrap}>
                <Text style={styles.mealName}>{mealPreview.name}</Text>
                <Text style={styles.mealTime}>{mealPreview.time}</Text>
              </View>
              {mealPreview.calories != null && (
                <View style={styles.calBadge}>
                  <Text style={styles.calBadgeNum}>{mealPreview.calories}</Text>
                  <Text style={styles.calBadgeLabel}>kcal</Text>
                </View>
              )}
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
                {
                  label: "Fat",
                  value: `${totalFat}g`,
                  color: MACRO_COLORS.Fat,
                },
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
        </FadeIn>

        <FadeIn delay={60}>
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
        </FadeIn>

        <FadeIn delay={120}>
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
        </FadeIn>

        <FadeIn delay={180}>
          <View style={styles.noteBox}>
            <Ionicons
              name="information-circle"
              size={16}
              color={T.MUTED}
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
              <Ionicons name="checkmark-circle" size={22} color={T.WHITE} />
            ) : (
              <Text style={styles.saveBtnText}>Log This Meal Again</Text>
            )}
          </TouchableOpacity>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.BG,
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
    backgroundColor: T.SURFACE,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: 17,
    fontWeight: "700",
    color: T.TEXT,
  },
  headerSub: {
    fontSize: 12,
    color: T.MUTED,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: T.SURFACE,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: T.BORDER,
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
    backgroundColor: "rgba(139,195,74,0.14)",
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
    color: T.TEXT,
  },
  mealTime: {
    fontSize: 12,
    color: T.MUTED,
    marginTop: 2,
  },
  calBadge: {
    alignItems: "center",
  },
  calBadgeNum: {
    fontFamily: FONTS.display,
    fontSize: 22,
    fontWeight: "700",
    color: T.PRIMARY,
  },
  calBadgeLabel: {
    fontSize: 10,
    color: T.MUTED,
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
    backgroundColor: T.PRIMARY_LIGHT,
  },
  macroPillVal: {
    fontSize: 15,
    fontWeight: "700",
  },
  macroPillLabel: {
    fontSize: 10,
    color: T.MUTED,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: T.TEXT,
    paddingHorizontal: 26,
    marginBottom: 10,
  },
  card: {
    backgroundColor: T.SURFACE,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: T.BORDER,
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
    backgroundColor: T.PRIMARY,
    marginRight: 14,
  },
  foodTextWrap: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: "600",
    color: T.TEXT,
  },
  foodAmount: {
    fontSize: 12,
    color: T.MUTED,
    marginTop: 2,
  },
  foodCal: {
    fontSize: 13,
    color: T.MUTED,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: T.BORDER,
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
    backgroundColor: T.PRIMARY_LIGHT,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  mealTimeBtnActive: {
    backgroundColor: "rgba(139,195,74,0.14)",
    borderColor: T.PRIMARY,
  },
  mealTimeBtnText: {
    fontSize: 12,
    color: T.MUTED,
    fontWeight: "600",
  },
  mealTimeBtnTextActive: {
    color: T.PRIMARY,
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
    color: T.MUTED,
    flex: 1,
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: T.PRIMARY,
    borderRadius: 20,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
  },
  saveBtnLogged: {
    backgroundColor: T.SECONDARY,
  },
  saveBtnText: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: "700",
    color: T.WHITE,
  },
});
