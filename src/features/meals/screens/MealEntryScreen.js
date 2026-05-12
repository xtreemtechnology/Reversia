// src/features/meals/screens/MealEntryScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import PressableScale from "../../../components/PressableScale";
import AnimatedScreen from "../../../components/AnimatedScreen";
import { useTheme } from "../../../theme/ThemeProvider";
// Imports
import { MEAL_LABELS } from "../utils/mealUtils";
import { logMealEntry } from "../services/mealsService";

export default function MealEntryScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [mealName, setMealName] = useState(route?.params?.mealName ?? "");
  const [selectedTag, setSelectedTag] = useState(
    route?.params?.mealType ?? route?.params?.prefillTag ?? ""
  );
  const [selectedMeal, setSelectedMeal] = useState(
    route?.params?.meal || "breakfast"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSaveMeal = async () => {
    setMessage(null);
    if (!mealName.trim()) {
      setMessage("Please enter what you ate.");
      return;
    }

    setLoading(true);
    try {
      await logMealEntry({
        value: mealName,
        period: selectedTag || "Regular",
        meal: selectedMeal,
      });
      navigation.goBack();
    } catch (error) {
      console.error("Meal Save Error:", error);
      setMessage("Could not save your meal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AnimatedScreen style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Log Meal
            </Text>
            <PressableScale
              onPress={handleSaveMeal}
              disabled={loading}
              style={[
                styles.saveBtn,
                { backgroundColor: colors.primary },
                loading && { opacity: 0.7 },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.saveText}>Log</Text>
              )}
            </PressableScale>
          </View>

          {/* Input Box */}
          <View style={styles.inputBox}>
            <Text style={[styles.label, { color: colors.muted }]}>
              What did you eat?
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. Grilled Chicken & Salad"
              placeholderTextColor={colors.muted}
              value={mealName}
              onChangeText={setMealName}
              multiline={false}
            />
          </View>

          {/* Meal Time Selector */}
          <Text
            style={[styles.sectionLabel, { marginTop: 6, color: colors.text }]}
          >
            Meal time
          </Text>
          <View
            style={{ flexDirection: "row", marginBottom: 12, flexWrap: "wrap" }}
          >
            {["breakfast", "lunch", "snack", "dinner", "other"].map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.tagBtn,
                  { backgroundColor: colors.card },
                  selectedMeal === m && { backgroundColor: colors.primary },
                  {
                    marginRight: 10,
                    marginBottom: 10,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedMeal(m)}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: colors.text },
                    selectedMeal === m && styles.activeTagText,
                  ]}
                >
                  {MEAL_LABELS[m] || m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Add Section */}
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Quick Add
          </Text>
          <View style={styles.quickGrid}>
            {["High Protein", "Low Carb", "Leafy Greens", "Healthy Fats"].map(
              (tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagBtn,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    selectedTag === tag && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setSelectedTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedTag === tag && styles.activeTagText,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Metabolic Tip Card */}
          <View
            style={[
              styles.impactCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons name="leaf" size={24} color="#10B981" />
            <View style={{ marginLeft: 15 }}>
              <Text style={[styles.impactTitle, { color: colors.text }]}>
                Metabolic Tip
              </Text>
              <Text style={[styles.impactDesc, { color: colors.muted }]}>
                Try eating your greens first to blunt the glucose response of
                this meal.
              </Text>
            </View>
          </View>

          {message && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 110 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
    saveBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
    },
    saveText: { color: colors.background, fontWeight: "700" },
    inputBox: { marginBottom: 18 },
    label: { fontSize: 13, color: colors.muted, marginBottom: 8 },
    textInput: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 10,
      marginTop: 6,
    },
    quickGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 18 },
    tagBtn: {
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      marginRight: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tagText: { color: colors.text, fontWeight: "600", fontSize: 13 },
    activeTag: { backgroundColor: colors.primary },
    activeTagText: { color: colors.background },
    impactCard: {
      flexDirection: "row",
      backgroundColor: colors.primary + "15",
      padding: 18,
      borderRadius: 16,
      alignItems: "center",
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    impactTitle: { fontSize: 14, fontWeight: "700", color: colors.primary },
    impactDesc: {
      fontSize: 13,
      color: colors.primary,
      marginTop: 4,
      lineHeight: 18,
      maxWidth: "90%",
    },
    messageBox: {
      backgroundColor: "#FEE2E2",
      padding: 12,
      borderRadius: 12,
      marginTop: 12,
    },
    messageText: { color: "#B91C1C", textAlign: "center" },
  });
