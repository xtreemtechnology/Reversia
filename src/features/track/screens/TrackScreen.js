import React from "react";
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../theme/ThemeProvider";
import { useUserLogs } from "../../../hooks/useUserLogs";
import TrackHeader from "../components/TrackHeader";
import MealSection from "../components/MealSection";
import QuickStatsGrid from "../components/QuickStatsGrid";
import EmotionalWellness from "../components/EmotionalWellness";
import HabitsSection from "../components/HabitsSection";
import LucideIcon from "react-native-vector-icons/Feather";

export default function TrackScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { logs } = useUserLogs(20);
  const recentMeals = (logs || []).filter((log) => log?.category === "meal").slice(0, 4);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <View style={styles.flexOne}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
          <TrackHeader delay={0} />

          {recentMeals.length > 0 ? (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Recent Meals</Text>
                <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>Latest logs</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentMealsRow}>
                {recentMeals.map((meal) => (
                  <TouchableOpacity
                    key={meal.id}
                    activeOpacity={0.85}
                    onPress={() => navigation?.navigate("MealEntry", { mealType: meal.type || "Lunch" })}
                    style={[styles.mealCard, { backgroundColor: colors.card, borderColor: colors.border + "80" }]}
                  >
                    {meal.photoUrl ? (
                      <Image source={{ uri: meal.photoUrl }} style={styles.mealThumb} />
                    ) : (
                      <View style={[styles.mealThumbFallback, { backgroundColor: colors.primary + "14" }]}> 
                        <LucideIcon name="camera" size={18} color={colors.primary} />
                      </View>
                    )}
                    <Text style={[styles.mealCardTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {meal.name || meal.type || "Meal"}
                    </Text>
                    <Text style={[styles.mealCardSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {meal.type || "Meal"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <MealSection navigation={navigation} delay={100} />
          <QuickStatsGrid
            delay={200}
            hydrationLiters={1.2}
            sleepLabel="7h 30m"
            onHydrationPress={() => navigation?.navigate("WaterEntry")}
            onSleepPress={() => navigation?.navigate("SleepEntry")}
          />
          <EmotionalWellness delay={300} initialLevel="balanced" />
          <HabitsSection navigation={navigation} delay={400} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flexOne: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 32,
  },
  sectionContainer: { gap: 16 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionHeading: { fontFamily: "Plus Jakarta Sans", fontSize: 20, fontWeight: "500" },
  sectionHint: { fontFamily: "DM Sans", fontSize: 12 },
  recentMealsRow: { gap: 12, paddingRight: 4 },
  mealCard: {
    width: 132,
    borderRadius: 22,
    padding: 10,
    borderWidth: 1,
    gap: 8,
  },
  mealThumb: { width: "100%", height: 92, borderRadius: 16, backgroundColor: "#231F1C" },
  mealThumbFallback: { width: "100%", height: 92, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  mealCardTitle: { fontFamily: "DM Sans", fontSize: 14, fontWeight: "500" },
  mealCardSub: { fontFamily: "DM Sans", fontSize: 12 },
});
