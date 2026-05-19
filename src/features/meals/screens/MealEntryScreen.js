import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Vibration,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { logMealEntry } from "../services/mealsService";
/* eslint-disable react-native/no-inline-styles */

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  BG: "#F2F0E8",
  CARD: "#FFFFFF",
  PRIMARY: "#22422F",
  PRIMARY_LIGHT: "rgba(34,66,47,0.08)",
  AMBER: "#ECA143",
  AMBER_LIGHT: "rgba(236,161,67,0.10)",
  MUTED: "#7A8F82",
  TEXT: "#1A2E22",
  BORDER: "#E8E4D8",
  SAGE: "#DCE8DF",
  WHITE: "#FFFFFF",
  GREEN: "#10B981",
  RED: "#EF4444",
  BLUE: "#0284C7",
};

// ─── Meal timing config ───────────────────────────────────────────────────────
const MEAL_TIMES = [
  {
    id: "breakfast",
    label: "Breakfast",
    icon: "weather-sunset-up",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.10)",
    emoji: "🌅",
    time: "7–9 AM",
  },
  {
    id: "lunch",
    label: "Lunch",
    icon: "weather-sunny",
    color: T.GREEN,
    bg: "rgba(16,185,129,0.10)",
    emoji: "☀️",
    time: "12–2 PM",
  },
  {
    id: "snack",
    label: "Snack",
    icon: "fruit-watermelon",
    color: "#825CFF",
    bg: "rgba(130,92,255,0.10)",
    emoji: "🍎",
    time: "3–5 PM",
  },
  {
    id: "dinner",
    label: "Dinner",
    icon: "weather-night",
    color: T.BLUE,
    bg: "rgba(2,132,199,0.10)",
    emoji: "🌙",
    time: "6–8 PM",
  },
  {
    id: "other",
    label: "Other",
    icon: "clock-outline",
    color: T.MUTED,
    bg: "rgba(122,143,130,0.10)",
    emoji: "⏰",
    time: "Any time",
  },
];

// ─── Meal profile tags ────────────────────────────────────────────────────────
const PROFILE_TAGS = [
  {
    id: "High Protein",
    icon: "arm-flex",
    color: T.GREEN,
    bg: "rgba(16,185,129,0.10)",
  },
  {
    id: "Low Carb",
    icon: "grain",
    color: T.AMBER,
    bg: "rgba(236,161,67,0.10)",
  },
  { id: "Leafy Greens", icon: "leaf", color: T.PRIMARY, bg: T.PRIMARY_LIGHT },
  {
    id: "Healthy Fats",
    icon: "water",
    color: T.BLUE,
    bg: "rgba(2,132,199,0.10)",
  },
  {
    id: "High Fibre",
    icon: "sprout",
    color: "#059669",
    bg: "rgba(5,150,105,0.10)",
  },
  {
    id: "Low GI",
    icon: "chart-line-variant",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.10)",
  },
];

// ─── Quick-fill suggestions ───────────────────────────────────────────────────
const SUGGESTIONS = [
  "Oat Porridge",
  "Grilled Chicken & Salad",
  "Ofada Rice + Okra Soup",
  "Garden Egg & Groundnut",
  "Grilled Fish + Veg",
  "Boiled Plantain",
  "Greek Yogurt",
  "Brown Rice & Beans",
  "Smoothie Bowl",
  "Avocado Toast",
];

// ─── Metabolic tips per meal ──────────────────────────────────────────────────
const TIPS = {
  breakfast: {
    icon: "weather-sunset-up",
    color: "#F59E0B",
    title: "Breakfast tip",
    body: "Start with protein or healthy fat before carbs to prevent a morning glucose spike.",
  },
  lunch: {
    icon: "food-apple",
    color: T.GREEN,
    title: "Lunch tip",
    body: "Eat your vegetables and protein first, then add the carb portion last.",
  },
  snack: {
    icon: "fruit-watermelon",
    color: "#825CFF",
    title: "Snack tip",
    body: "Pair any fruit snack with a handful of nuts to slow glucose absorption.",
  },
  dinner: {
    icon: "weather-night",
    color: T.BLUE,
    title: "Dinner tip",
    body: "Keep dinner lighter on carbs. Your metabolism slows in the evening.",
  },
  other: {
    icon: "leaf",
    color: T.PRIMARY,
    title: "Metabolic tip",
    body: "Try eating greens first to blunt the glucose response of this meal.",
  },
};

// ─── GI estimator (simple keyword scan) ──────────────────────────────────────
const estimateGI = (name) => {
  const low = [
    "egg",
    "fish",
    "chicken",
    "salad",
    "avocado",
    "nut",
    "seed",
    "bean",
    "veg",
    "broccoli",
    "spinach",
  ];
  const high = [
    "rice",
    "bread",
    "pasta",
    "potato",
    "juice",
    "sugar",
    "cake",
    "biscuit",
    "fries",
    "sweet",
  ];
  const n = name.toLowerCase();
  if (high.some((w) => n.includes(w)))
    return { label: "High GI", color: T.RED, icon: "trending-up" };
  if (low.some((w) => n.includes(w)))
    return { label: "Low GI", color: T.GREEN, icon: "trending-down" };
  return { label: "Est. GI", color: T.AMBER, icon: "minus" };
};

// ─── Error box ────────────────────────────────────────────────────────────────
const ErrorBox = ({ msg }) =>
  msg ? (
    <View style={misc.errorBox}>
      <Ionicons name="alert-circle-outline" size={16} color={T.RED} />
      <Text style={misc.errorText}>{msg}</Text>
    </View>
  ) : null;

const misc = StyleSheet.create({
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.08)",
    padding: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  errorText: { color: T.RED, fontSize: 13, fontWeight: "600", flex: 1 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function MealEntryScreen({ navigation, route }) {
  const [mealName, setMealName] = useState(route?.params?.mealName ?? "");
  const [selectedTag, setSelectedTag] = useState(
    route?.params?.mealType ?? route?.params?.prefillTag ?? ""
  );
  const [selectedMeal, setSelectedMeal] = useState(
    route?.params?.meal ?? "breakfast"
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const gi = mealName.trim().length > 2 ? estimateGI(mealName) : null;
  const tip = TIPS[selectedMeal] || TIPS.other;
  const activeMealTime = MEAL_TIMES.find((m) => m.id === selectedMeal);

  const handleSave = async () => {
    setError(null);
    if (!mealName.trim()) {
      setError("Please enter what you ate before saving.");
      return;
    }
    setLoading(true);
    try {
      await logMealEntry({
        value: mealName.trim(),
        period: selectedTag || "Regular",
        meal: selectedMeal,
      });
      setSaved(true);
      if (Platform.OS !== "web") Vibration.vibrate(80);
      setTimeout(() => navigation.goBack(), 800);
    } catch (err) {
      console.error("Meal Save Error:", err);
      setError(
        "Could not save your meal. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestions = SUGGESTIONS.filter(
    (s) =>
      mealName.trim().length > 0 &&
      s.toLowerCase().includes(mealName.toLowerCase()) &&
      s.toLowerCase() !== mealName.toLowerCase()
  );

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBtn}
            >
              <Ionicons name="chevron-down" size={22} color={T.TEXT} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={[styles.headerEmoji]}>{activeMealTime?.emoji}</Text>
              <Text style={styles.headerTitle}>
                Log {activeMealTime?.label}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading || saved || !mealName.trim()}
              style={[
                styles.saveBtn,
                (!mealName.trim() || saved) && { opacity: 0.4 },
                saved && { backgroundColor: T.GREEN },
              ]}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={T.WHITE} />
              ) : saved ? (
                <Ionicons name="checkmark" size={18} color={T.WHITE} />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Meal name input ── */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>What did you eat?</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons
                  name="food-fork-drink"
                  size={20}
                  color={T.MUTED}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={mealName}
                  onChangeText={(t) => {
                    setMealName(t);
                    setError(null);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  placeholder="e.g. Grilled Chicken & Salad"
                  placeholderTextColor={T.MUTED}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
                {mealName.length > 0 && (
                  <TouchableOpacity onPress={() => setMealName("")}>
                    <Ionicons name="close-circle" size={18} color={T.MUTED} />
                  </TouchableOpacity>
                )}
              </View>

              {/* GI badge */}
              {gi && (
                <View
                  style={[styles.giBadge, { backgroundColor: gi.color + "14" }]}
                >
                  <MaterialCommunityIcons
                    name={gi.icon}
                    size={14}
                    color={gi.color}
                  />
                  <Text style={[styles.giText, { color: gi.color }]}>
                    {gi.label} — estimated from meal name
                  </Text>
                </View>
              )}

              {/* Autocomplete suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <View style={styles.suggestBox}>
                  {filteredSuggestions.slice(0, 4).map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => {
                        setMealName(s);
                        setShowSuggestions(false);
                      }}
                      style={styles.suggestItem}
                    >
                      <MaterialCommunityIcons
                        name="magnify"
                        size={14}
                        color={T.MUTED}
                      />
                      <Text style={styles.suggestText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* ── Quick-fill chips ── */}
            <Text style={styles.sectionLabel}>Quick fill</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickScroll}
            >
              <View style={styles.quickRow}>
                {SUGGESTIONS.slice(0, 7).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setMealName(s)}
                    style={[
                      styles.quickChip,
                      mealName === s && {
                        backgroundColor: T.PRIMARY,
                        borderColor: T.PRIMARY,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        mealName === s && { color: T.WHITE },
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* ── Meal timing ── */}
            <Text style={styles.sectionLabel}>Meal timing</Text>
            <View style={styles.mealTimeGrid}>
              {MEAL_TIMES.map((mt) => {
                const sel = selectedMeal === mt.id;
                return (
                  <TouchableOpacity
                    key={mt.id}
                    onPress={() => setSelectedMeal(mt.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.mealTimeCard,
                      sel && {
                        borderColor: mt.color,
                        borderWidth: 2,
                        backgroundColor: mt.bg,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.mealTimeIcon,
                        { backgroundColor: sel ? mt.bg : T.BG },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={mt.icon}
                        size={20}
                        color={sel ? mt.color : T.MUTED}
                      />
                    </View>
                    <Text
                      style={[styles.mealTimeLabel, sel && { color: mt.color }]}
                    >
                      {mt.label}
                    </Text>
                    <Text style={styles.mealTimeHour}>{mt.time}</Text>
                    {sel && (
                      <View
                        style={[
                          styles.mealTimeCheck,
                          { backgroundColor: mt.color },
                        ]}
                      >
                        <Ionicons name="checkmark" size={10} color={T.WHITE} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Profile tags ── */}
            <Text style={styles.sectionLabel}>Meal profile</Text>
            <View style={styles.tagGrid}>
              {PROFILE_TAGS.map((tag) => {
                const sel = selectedTag === tag.id;
                return (
                  <TouchableOpacity
                    key={tag.id}
                    onPress={() => setSelectedTag(sel ? "" : tag.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.profileTag,
                      sel && {
                        borderColor: tag.color,
                        borderWidth: 2,
                        backgroundColor: tag.bg,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={tag.icon}
                      size={16}
                      color={sel ? tag.color : T.MUTED}
                    />
                    <Text
                      style={[
                        styles.profileTagText,
                        sel && { color: tag.color },
                      ]}
                    >
                      {tag.id}
                    </Text>
                    {sel && (
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={tag.color}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Metabolic tip ── */}
            <View
              style={[styles.tipCard, { backgroundColor: tip.color + "12" }]}
            >
              <View
                style={[
                  styles.tipIconWrap,
                  { backgroundColor: tip.color + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name={tip.icon}
                  size={20}
                  color={tip.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipTitle, { color: tip.color }]}>
                  {tip.title}
                </Text>
                <Text style={styles.tipBody}>{tip.body}</Text>
              </View>
            </View>

            <ErrorBox msg={error} />

            {/* ── Eating sequence reminder ── */}
            <View style={styles.sequenceCard}>
              <Text style={styles.sequenceTitle}>Optimal eating order</Text>
              <View style={styles.sequenceSteps}>
                {[
                  {
                    step: "1",
                    label: "Vegetables first",
                    icon: "leaf",
                    color: T.GREEN,
                  },
                  {
                    step: "2",
                    label: "Protein & fats",
                    icon: "arm-flex",
                    color: T.BLUE,
                  },
                  {
                    step: "3",
                    label: "Carbs last",
                    icon: "grain",
                    color: T.AMBER,
                  },
                ].map((s) => (
                  <View key={s.step} style={styles.sequenceRow}>
                    <View
                      style={[
                        styles.sequenceDot,
                        { backgroundColor: s.color + "18" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={s.icon}
                        size={16}
                        color={s.color}
                      />
                    </View>
                    <Text style={styles.sequenceLabel}>{s.label}</Text>
                    <View
                      style={[
                        styles.stepBadge,
                        { backgroundColor: s.color + "14" },
                      ]}
                    >
                      <Text style={[styles.stepNum, { color: s.color }]}>
                        {s.step}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Big save button ── */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading || saved || !mealName.trim()}
              style={[
                styles.bigSaveBtn,
                (!mealName.trim() || saved) && { opacity: 0.4 },
                saved && { backgroundColor: T.GREEN },
              ]}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={T.WHITE} />
              ) : saved ? (
                <>
                  <Ionicons name="checkmark-circle" size={22} color={T.WHITE} />
                  <Text style={styles.bigSaveBtnText}>Meal Logged!</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="content-save-outline"
                    size={20}
                    color={T.WHITE}
                  />
                  <Text style={styles.bigSaveBtnText}>Log Meal</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.BG },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.BORDER,
    backgroundColor: T.BG,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.CARD,
    borderWidth: 1,
    borderColor: T.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerEmoji: { fontSize: 18 },
  headerTitle: { fontSize: 16, fontWeight: "800", color: T.TEXT },
  saveBtn: {
    backgroundColor: T.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: T.WHITE, fontWeight: "800", fontSize: 14 },

  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: T.MUTED,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  // Input card
  inputCard: {
    backgroundColor: T.CARD,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: T.BORDER,
    marginBottom: 22,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: T.MUTED,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.BG,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: T.TEXT,
  },
  giBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  giText: { fontSize: 12, fontWeight: "700" },
  suggestBox: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.BORDER,
    overflow: "hidden",
  },
  suggestItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.BORDER,
    backgroundColor: T.CARD,
  },
  suggestText: { fontSize: 14, color: T.TEXT, fontWeight: "600" },

  // Quick fill
  quickScroll: { marginBottom: 22 },
  quickRow: { flexDirection: "row", gap: 8, paddingRight: 4 },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: T.CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  quickChipText: { fontSize: 13, fontWeight: "700", color: T.TEXT },

  // Meal timing
  mealTimeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  mealTimeCard: {
    width: "30%",
    flex: 1,
    minWidth: 90,
    backgroundColor: T.CARD,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: T.BORDER,
    position: "relative",
  },
  mealTimeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  mealTimeLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: T.TEXT,
    textAlign: "center",
  },
  mealTimeHour: { fontSize: 10, color: T.MUTED, fontWeight: "600" },
  mealTimeCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  // Profile tags
  tagGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 22 },
  profileTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: T.CARD,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: T.BORDER,
  },
  profileTagText: { fontSize: 13, fontWeight: "700", color: T.TEXT },

  // Tip card
  tipCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  tipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipTitle: { fontSize: 13, fontWeight: "800", marginBottom: 4 },
  tipBody: { fontSize: 13, color: T.MUTED, lineHeight: 19 },

  // Sequence
  sequenceCard: {
    backgroundColor: T.CARD,
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  sequenceTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: T.TEXT,
    marginBottom: 14,
  },
  sequenceSteps: { gap: 10 },
  sequenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sequenceDot: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sequenceLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: T.TEXT },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 13, fontWeight: "800" },

  // Big save button
  bigSaveBtn: {
    backgroundColor: T.PRIMARY,
    height: 58,
    borderRadius: 29,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  bigSaveBtnText: { color: T.WHITE, fontSize: 16, fontWeight: "800" },
});
