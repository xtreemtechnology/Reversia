import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

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
  YELLOW: "#F59E0B",
  RED: "#EF4444",
  BLUE: "#0284C7",
};

// ─── Static data ──────────────────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

const MEALS = [
  {
    id: 1,
    type: "Breakfast",
    title: "Oat Porridge with Seeds",
    desc: "Rolled oats, flaxseeds, pumpkin seeds, cinnamon",
    fiber: "8g Fiber",
    gi: "Low GI",
    giAccent: T.GREEN,
    calories: 320,
    protein: 12,
    carbs: 48,
    fats: 9,
    sequence: "Seeds first → Oats → Fruit topping",
    icon: "bowl-mix",
    iconColor: T.AMBER,
    iconBg: T.AMBER_LIGHT,
    time: "7:30 AM",
  },
  {
    id: 2,
    type: "Lunch",
    title: "Ofada Rice + Okra Soup",
    desc: "Ofada rice, okra, assorted fish, leafy greens",
    fiber: "12g Fiber",
    gi: "Med GI",
    giAccent: T.YELLOW,
    calories: 520,
    protein: 28,
    carbs: 64,
    fats: 14,
    sequence: "Okra soup first → Rice → Fish",
    icon: "food-variant",
    iconColor: T.GREEN,
    iconBg: "rgba(16,185,129,0.10)",
    time: "1:00 PM",
  },
  {
    id: 3,
    type: "Snack",
    title: "Garden Egg + Groundnut",
    desc: "Fresh garden eggs, raw groundnuts, cucumber slices",
    fiber: "5g Fiber",
    gi: "Low GI",
    giAccent: T.GREEN,
    calories: 180,
    protein: 8,
    carbs: 12,
    fats: 10,
    sequence: "Groundnuts first → Garden egg",
    icon: "fruit-watermelon",
    iconColor: "#825CFF",
    iconBg: "rgba(130,92,255,0.10)",
    time: "4:00 PM",
  },
  {
    id: 4,
    type: "Dinner",
    title: "Grilled Fish + Vegetable Soup",
    desc: "Tilapia, pumpkin leaves, tomatoes, light pepper soup",
    fiber: "9g Fiber",
    gi: "Low GI",
    giAccent: T.GREEN,
    calories: 410,
    protein: 38,
    carbs: 22,
    fats: 11,
    sequence: "Soup first → Fish → Small portion starch",
    icon: "fish",
    iconColor: T.BLUE,
    iconBg: "rgba(2,132,199,0.10)",
    time: "7:00 PM",
  },
];

const TIPS = [
  "Eat fibre-rich foods (vegetables, legumes) first to slow glucose absorption.",
  "A 10–15 min walk after your largest meal can cut post-meal glucose by ~30%.",
  "Cinnamon in your breakfast helps improve insulin sensitivity over time.",
  "Hydration keeps blood viscosity healthy. Aim for 8 glasses between meals.",
  "Pair carbs with protein and fat to blunt the glycaemic spike.",
  "Intermittent fasting windows (e.g. 14:10) can lower fasting glucose.",
  "Colour your plate — aim for 3+ different vegetable colours per main meal.",
];

const CALORIE_GOAL = 2600;
const WATER_GOAL = 8;
const TOTAL_CALS = MEALS.reduce((s, m) => s + m.calories, 0);

// ─── Inline: DaySummary ───────────────────────────────────────────────────────
const DaySummary = ({ completed }) => {
  const eaten = MEALS.filter((m) => completed.includes(m.id));
  const cals = eaten.reduce((s, m) => s + m.calories, 0);
  const protein = eaten.reduce((s, m) => s + m.protein, 0);
  const carbs = eaten.reduce((s, m) => s + m.carbs, 0);
  const fats = eaten.reduce((s, m) => s + m.fats, 0);
  const pct = Math.min(100, Math.round((cals / CALORIE_GOAL) * 100));

  const macros = [
    { label: "Protein", val: protein, target: 120, color: T.GREEN },
    { label: "Carbs", val: carbs, target: 260, color: T.AMBER },
    { label: "Fats", val: fats, target: 80, color: T.BLUE },
  ];

  return (
    <View style={summaryStyles.card}>
      {/* Calorie ring row */}
      <View style={summaryStyles.topRow}>
        <View style={summaryStyles.ringArea}>
          {/* Simple arc using border trick */}
          <View style={[summaryStyles.ringOuter, { borderColor: T.BORDER }]}>
            <View
              style={[
                summaryStyles.ringFill,
                {
                  borderColor:
                    pct > 90 ? T.RED : pct > 60 ? T.AMBER : T.PRIMARY,
                },
              ]}
            />
            <View style={summaryStyles.ringInner}>
              <Text style={summaryStyles.ringVal}>{cals}</Text>
              <Text style={summaryStyles.ringUnit}>kcal</Text>
            </View>
          </View>
          <Text style={summaryStyles.ringLabel}>of {CALORIE_GOAL} goal</Text>
        </View>

        {/* Stat column */}
        <View style={summaryStyles.statsCol}>
          <View style={summaryStyles.statRow}>
            <MaterialCommunityIcons name="fire" size={16} color={T.AMBER} />
            <Text style={summaryStyles.statLabel}>Remaining</Text>
            <Text style={summaryStyles.statVal}>
              {Math.max(0, CALORIE_GOAL - cals)} kcal
            </Text>
          </View>
          <View style={[summaryStyles.statRow, { marginTop: 10 }]}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={16}
              color={T.GREEN}
            />
            <Text style={summaryStyles.statLabel}>Logged</Text>
            <Text style={summaryStyles.statVal}>
              {eaten.length}/{MEALS.length} meals
            </Text>
          </View>
          <View style={[summaryStyles.statRow, { marginTop: 10 }]}>
            <MaterialCommunityIcons
              name="percent"
              size={16}
              color={T.PRIMARY}
            />
            <Text style={summaryStyles.statLabel}>Progress</Text>
            <Text style={summaryStyles.statVal}>{pct}%</Text>
          </View>
        </View>
      </View>

      {/* Macro bars */}
      <View style={summaryStyles.macroSection}>
        {macros.map((m) => {
          const mpct = Math.min(100, Math.round((m.val / m.target) * 100));
          return (
            <View key={m.label} style={summaryStyles.macroRow}>
              <Text style={summaryStyles.macroLabel}>{m.label}</Text>
              <View style={summaryStyles.macroTrack}>
                <View
                  style={[
                    summaryStyles.macroFill,
                    { width: `${mpct}%`, backgroundColor: m.color },
                  ]}
                />
              </View>
              <Text style={summaryStyles.macroVal}>{m.val}g</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const summaryStyles = StyleSheet.create({
  card: {
    backgroundColor: T.CARD,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  topRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  ringArea: { alignItems: "center" },
  ringOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringFill: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 8,
    borderColor: T.PRIMARY,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    transform: [{ rotate: "-45deg" }],
  },
  ringInner: { alignItems: "center" },
  ringVal: { fontSize: 20, fontWeight: "800", color: T.TEXT, lineHeight: 22 },
  ringUnit: { fontSize: 10, color: T.MUTED, fontWeight: "600" },
  ringLabel: { fontSize: 11, color: T.MUTED, fontWeight: "600", marginTop: 6 },
  statsCol: { flex: 1 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statLabel: { flex: 1, fontSize: 12, color: T.MUTED, fontWeight: "600" },
  statVal: { fontSize: 13, fontWeight: "800", color: T.TEXT },
  macroSection: { gap: 10 },
  macroRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  macroLabel: { width: 52, fontSize: 11, fontWeight: "700", color: T.MUTED },
  macroTrack: {
    flex: 1,
    height: 7,
    backgroundColor: T.BORDER,
    borderRadius: 4,
    overflow: "hidden",
  },
  macroFill: { height: "100%", borderRadius: 4 },
  macroVal: {
    width: 36,
    fontSize: 12,
    fontWeight: "800",
    color: T.TEXT,
    textAlign: "right",
  },
});

// ─── Inline: WaterTracker ─────────────────────────────────────────────────────
const WaterTracker = ({ glasses, setGlasses, goal }) => {
  const pct = Math.round((glasses / goal) * 100);
  return (
    <View style={waterStyles.card}>
      <View style={waterStyles.header}>
        <View style={waterStyles.iconWrap}>
          <MaterialCommunityIcons name="cup-water" size={20} color={T.BLUE} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={waterStyles.title}>Hydration</Text>
          <Text style={waterStyles.sub}>
            {glasses} of {goal} glasses · {pct}%
          </Text>
        </View>
        <View style={waterStyles.controls}>
          <TouchableOpacity
            onPress={() => setGlasses((g) => Math.max(0, g - 1))}
            style={waterStyles.adjBtn}
          >
            <Ionicons name="remove" size={16} color={T.TEXT} />
          </TouchableOpacity>
          <Text style={waterStyles.count}>{glasses}</Text>
          <TouchableOpacity
            onPress={() => setGlasses((g) => Math.min(goal, g + 1))}
            style={[waterStyles.adjBtn, waterStyles.adjBtnPlus]}
          >
            <Ionicons name="add" size={16} color={T.WHITE} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Glasses row */}
      <View style={waterStyles.glassRow}>
        {Array.from({ length: goal }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setGlasses(i < glasses ? i : i + 1)}
            style={[waterStyles.glass, i < glasses && waterStyles.glassFilled]}
          >
            <MaterialCommunityIcons
              name={i < glasses ? "cup-water" : "cup-outline"}
              size={18}
              color={i < glasses ? T.BLUE : T.BORDER}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Track bar */}
      <View style={waterStyles.track}>
        <View style={[waterStyles.trackFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
};

const waterStyles = StyleSheet.create({
  card: {
    backgroundColor: T.CARD,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.BORDER,
    gap: 14,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(2,132,199,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "800", color: T.TEXT },
  sub: { fontSize: 12, color: T.MUTED, marginTop: 1 },
  controls: { flexDirection: "row", alignItems: "center", gap: 10 },
  adjBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  adjBtnPlus: { backgroundColor: T.BLUE, borderColor: T.BLUE },
  count: {
    fontSize: 18,
    fontWeight: "800",
    color: T.TEXT,
    minWidth: 22,
    textAlign: "center",
  },
  glassRow: { flexDirection: "row", gap: 6 },
  glass: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: T.BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  glassFilled: { backgroundColor: "rgba(2,132,199,0.08)", borderColor: T.BLUE },
  track: {
    height: 5,
    backgroundColor: T.BORDER,
    borderRadius: 3,
    overflow: "hidden",
  },
  trackFill: { height: "100%", backgroundColor: T.BLUE, borderRadius: 3 },
});

// ─── Inline: TipCard ─────────────────────────────────────────────────────────
const TipCard = ({ dayIndex }) => (
  <View style={tipStyles.card}>
    <View style={tipStyles.iconWrap}>
      <MaterialCommunityIcons name="leaf" size={22} color={T.PRIMARY} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={tipStyles.eyebrow}>Daily Reversal Tip</Text>
      <Text style={tipStyles.body}>{TIPS[dayIndex % TIPS.length]}</Text>
    </View>
  </View>
);

const tipStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: T.SAGE,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: T.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: T.PRIMARY,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  body: { fontSize: 13, color: T.TEXT, lineHeight: 19 },
});

// ─── Inline: WalkReminder ─────────────────────────────────────────────────────
const WalkReminder = ({ completedCount }) => {
  if (completedCount === 0) return null;
  return (
    <View style={walkStyles.card}>
      <View style={walkStyles.iconWrap}>
        <MaterialCommunityIcons name="walk" size={22} color={T.AMBER} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={walkStyles.title}>Time for a walk! 🚶</Text>
        <Text style={walkStyles.sub}>
          A 10–15 min walk after your meal lowers post-meal glucose by up to
          30%.
        </Text>
      </View>
    </View>
  );
};

const walkStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: T.AMBER_LIGHT,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(236,161,67,0.25)",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(236,161,67,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "800", color: T.TEXT, marginBottom: 3 },
  sub: { fontSize: 12, color: T.MUTED, lineHeight: 18 },
});

// ─── Inline: MealCard ─────────────────────────────────────────────────────────
const MealCard = ({ meal, isDone, onToggle, onNavigate }) => {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toVal = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.spring(anim, {
      toValue: toVal,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  };

  const expandH = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 110],
  });

  return (
    <View style={[mealStyles.card, isDone && mealStyles.cardDone]}>
      {/* Top row */}
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.85}
        style={mealStyles.topRow}
      >
        {/* Icon */}
        <View style={[mealStyles.iconWrap, { backgroundColor: meal.iconBg }]}>
          <MaterialCommunityIcons
            name={meal.icon}
            size={22}
            color={meal.iconColor}
          />
        </View>

        {/* Info */}
        <View style={mealStyles.info}>
          <View style={mealStyles.typeRow}>
            <Text style={mealStyles.mealType}>{meal.type}</Text>
            <Text style={mealStyles.time}>{meal.time}</Text>
          </View>
          <Text
            style={[
              mealStyles.title,
              isDone && { textDecorationLine: "line-through", color: T.MUTED },
            ]}
          >
            {meal.title}
          </Text>
          <Text style={mealStyles.desc} numberOfLines={1}>
            {meal.desc}
          </Text>

          {/* Tags */}
          <View style={mealStyles.tagRow}>
            <View
              style={[
                mealStyles.tag,
                { backgroundColor: meal.giAccent + "18" },
              ]}
            >
              <View
                style={[mealStyles.tagDot, { backgroundColor: meal.giAccent }]}
              />
              <Text style={[mealStyles.tagText, { color: meal.giAccent }]}>
                {meal.gi}
              </Text>
            </View>
            <View style={mealStyles.tag}>
              <MaterialCommunityIcons
                name="leaf-circle-outline"
                size={12}
                color={T.GREEN}
              />
              <Text style={[mealStyles.tagText, { color: T.GREEN }]}>
                {meal.fiber}
              </Text>
            </View>
            <View style={mealStyles.tag}>
              <MaterialCommunityIcons name="fire" size={12} color={T.AMBER} />
              <Text style={[mealStyles.tagText, { color: T.AMBER }]}>
                {meal.calories} kcal
              </Text>
            </View>
          </View>
        </View>

        {/* Check + chevron */}
        <View style={mealStyles.rightCol}>
          <TouchableOpacity
            onPress={onToggle}
            style={[mealStyles.checkBtn, isDone && mealStyles.checkBtnDone]}
          >
            {isDone ? (
              <Ionicons name="checkmark" size={16} color={T.WHITE} />
            ) : (
              <View style={mealStyles.checkEmpty} />
            )}
          </TouchableOpacity>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={T.MUTED}
            style={{ marginTop: 8 }}
          />
        </View>
      </TouchableOpacity>

      {/* Expandable detail */}
      <Animated.View
        style={[
          mealStyles.expandWrap,
          { maxHeight: expandH, overflow: "hidden" },
        ]}
      >
        <View style={mealStyles.expandInner}>
          {/* Macro row */}
          <View style={mealStyles.macroRow}>
            {[
              { label: "Protein", val: `${meal.protein}g`, color: T.GREEN },
              { label: "Carbs", val: `${meal.carbs}g`, color: T.AMBER },
              { label: "Fats", val: `${meal.fats}g`, color: T.BLUE },
            ].map((m) => (
              <View
                key={m.label}
                style={[
                  mealStyles.macroPill,
                  { backgroundColor: m.color + "14" },
                ]}
              >
                <Text style={[mealStyles.macroVal, { color: m.color }]}>
                  {m.val}
                </Text>
                <Text style={mealStyles.macroLbl}>{m.label}</Text>
              </View>
            ))}
          </View>

          {/* Sequence */}
          <View style={mealStyles.seqRow}>
            <MaterialCommunityIcons
              name="order-numeric-ascending"
              size={14}
              color={T.PRIMARY}
            />
            <Text style={mealStyles.seqText}>{meal.sequence}</Text>
          </View>

          {/* Log button */}
          <TouchableOpacity onPress={onNavigate} style={mealStyles.logBtn}>
            <MaterialCommunityIcons
              name="pencil-plus-outline"
              size={14}
              color={T.PRIMARY}
            />
            <Text style={mealStyles.logBtnText}>Log this meal</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const mealStyles = StyleSheet.create({
  card: {
    backgroundColor: T.CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.BORDER,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardDone: {
    borderColor: T.GREEN + "44",
    backgroundColor: "rgba(16,185,129,0.03)",
  },
  topRow: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  info: { flex: 1 },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  mealType: {
    fontSize: 11,
    fontWeight: "800",
    color: T.MUTED,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  time: { fontSize: 11, color: T.MUTED, fontWeight: "600" },
  title: { fontSize: 15, fontWeight: "800", color: T.TEXT, marginBottom: 3 },
  desc: { fontSize: 12, color: T.MUTED, lineHeight: 16, marginBottom: 8 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.BG,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagText: { fontSize: 10, fontWeight: "700" },
  rightCol: { alignItems: "center", flexShrink: 0 },
  checkBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: T.BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.WHITE,
  },
  checkBtnDone: { backgroundColor: T.GREEN, borderColor: T.GREEN },
  checkEmpty: { width: 10, height: 10, borderRadius: 5 },
  expandWrap: {},
  expandInner: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: T.BORDER,
    paddingTop: 12,
  },
  macroRow: { flexDirection: "row", gap: 8 },
  macroPill: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  macroVal: { fontSize: 15, fontWeight: "800" },
  macroLbl: { fontSize: 10, color: T.MUTED, fontWeight: "600", marginTop: 2 },
  seqRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: T.PRIMARY_LIGHT,
    padding: 10,
    borderRadius: 12,
  },
  seqText: {
    flex: 1,
    fontSize: 12,
    color: T.PRIMARY,
    fontWeight: "600",
    lineHeight: 17,
  },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: T.PRIMARY_LIGHT,
    borderRadius: 14,
  },
  logBtnText: { fontSize: 12, fontWeight: "800", color: T.PRIMARY },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function MealPlanScreen({ navigation }) {
  const { width: sw } = useWindowDimensions();
  const [selectedDay, setSelectedDay] = useState(TODAY_IDX);
  const [completedMeals, setCompletedMeals] = useState([]);
  const [glasses, setGlasses] = useState(3);

  const toggleMeal = (id) =>
    setCompletedMeals((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Meal Plan</Text>
            <Text style={styles.dateStr}>{dateStr}</Text>
          </View>
          <View style={styles.headerBtns}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate("MealAnalyser")}
            >
              <MaterialCommunityIcons
                name="camera-outline"
                size={20}
                color={T.PRIMARY}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={() => navigation.navigate("MealAnalyser")}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="robot-outline"
                size={16}
                color={T.WHITE}
              />
              <Text style={styles.aiBtnText}>AI Scan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Day strip ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dayStrip}
          contentContainerStyle={{ paddingRight: 4 }}
        >
          {DAYS.map((day, i) => {
            const isSel = selectedDay === i;
            const isToday = i === TODAY_IDX;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(i)}
                activeOpacity={0.8}
                style={[styles.dayPill, isSel && styles.dayPillSel]}
              >
                <Text
                  style={[styles.dayPillText, isSel && styles.dayPillTextSel]}
                >
                  {day}
                </Text>
                {isToday && (
                  <View style={[styles.dayDot, isSel && styles.dayDotSel]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Progress bar ── */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>Today's Meals</Text>
            <Text style={styles.progressCount}>
              {completedMeals.length}/{MEALS.length} logged
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedMeals.length / MEALS.length) * 100}%` },
              ]}
            />
          </View>
          {/* Meal time dots */}
          <View style={styles.timelineRow}>
            {MEALS.map((m) => (
              <View key={m.id} style={styles.timelineDot}>
                <View
                  style={[
                    styles.timelineMark,
                    completedMeals.includes(m.id) && {
                      backgroundColor: T.GREEN,
                    },
                  ]}
                />
                <Text style={styles.timelineLabel}>{m.type.slice(0, 3)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Daily summary ── */}
        <DaySummary completed={completedMeals} />

        {/* ── Water ── */}
        <WaterTracker
          glasses={glasses}
          setGlasses={setGlasses}
          goal={WATER_GOAL}
        />

        {/* ── Walk reminder ── */}
        <WalkReminder completedCount={completedMeals.length} />

        {/* ── Tip ── */}
        <TipCard dayIndex={selectedDay} />

        {/* ── Meals ── */}
        <View style={styles.mealsHeader}>
          <Text style={styles.sectionTitle}>Reversal Menu</Text>
          <View style={styles.caloriesBadge}>
            <MaterialCommunityIcons name="fire" size={13} color={T.AMBER} />
            <Text style={styles.caloriesText}>{TOTAL_CALS} kcal total</Text>
          </View>
        </View>

        {MEALS.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            isDone={completedMeals.includes(meal.id)}
            onToggle={() => toggleMeal(meal.id)}
            onNavigate={() => navigation.navigate("MealEntry", { meal })}
          />
        ))}

        {/* ── Add custom meal ── */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("MealEntry")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={20}
            color={T.PRIMARY}
          />
          <Text style={styles.addBtnText}>Add a custom meal</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.BG },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: T.TEXT,
    letterSpacing: -0.5,
  },
  dateStr: { fontSize: 13, color: T.MUTED, fontWeight: "600", marginTop: 3 },
  headerBtns: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: T.CARD,
    borderWidth: 1,
    borderColor: T.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  aiBtnText: { color: T.WHITE, fontSize: 13, fontWeight: "800" },

  // Day strip
  dayStrip: { marginBottom: 18 },
  dayPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: T.CARD,
    alignItems: "center",
    marginRight: 8,
    minWidth: 50,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  dayPillSel: { backgroundColor: T.PRIMARY, borderColor: T.PRIMARY },
  dayPillText: { fontSize: 12, fontWeight: "700", color: T.MUTED },
  dayPillTextSel: { color: T.WHITE },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: T.PRIMARY,
    marginTop: 4,
  },
  dayDotSel: { backgroundColor: T.WHITE },

  // Progress
  progressCard: {
    backgroundColor: T.CARD,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: { fontSize: 13, fontWeight: "800", color: T.TEXT },
  progressCount: { fontSize: 13, fontWeight: "700", color: T.PRIMARY },
  progressTrack: {
    height: 8,
    backgroundColor: T.BORDER,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: { height: "100%", backgroundColor: T.PRIMARY, borderRadius: 4 },
  timelineRow: { flexDirection: "row", justifyContent: "space-around" },
  timelineDot: { alignItems: "center", gap: 4 },
  timelineMark: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: T.BORDER,
  },
  timelineLabel: { fontSize: 10, color: T.MUTED, fontWeight: "700" },

  // Meals header
  mealsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: T.TEXT },
  caloriesBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.AMBER_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  caloriesText: { fontSize: 12, fontWeight: "800", color: T.AMBER },

  // Add meal
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: T.PRIMARY,
    backgroundColor: T.PRIMARY_LIGHT,
    marginTop: 4,
  },
  addBtnText: { fontSize: 14, fontWeight: "800", color: T.PRIMARY },
});
