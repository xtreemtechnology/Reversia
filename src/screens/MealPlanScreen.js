// src/screens/MealPlanScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TODAY_INDEX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

const DAILY_TIPS = [
  'Eating in the correct order — Fiber → Protein → Carbs — can reduce your glucose spike by up to 75%.',
  'A 10-minute walk after meals can lower post-meal blood sugar by up to 22%.',
  'Chewing slowly activates gut hormones that improve insulin response before the food is even digested.',
  'Vinegar before a carb-heavy meal blunts the glucose curve — try 1 tbsp in water.',
  'Cold or reheated rice has more resistant starch, which feeds gut bacteria and lowers GI.',
  'Starting your meal with vegetables coats the gut and slows glucose absorption significantly.',
  'Staying hydrated before meals improves satiety and reduces overeating by up to 20%.',
];

const MEALS_DATA = [
  {
    id: 1,
    type: 'Breakfast',
    title: 'Oat Porridge with Seeds',
    desc: 'Rolled oats, flaxseeds, pumpkin seeds, cinnamon',
    fiber: '8g Fiber',
    gi: 'Low GI',
    giColor: '#D1FAE5',
    giTextColor: '#065F46',
    calories: 320,
    protein: 12,
    carbs: 48,
    sequence: 'Seeds first → Oats → Fruit topping',
    isChoice: true,
    icon: 'bowl-mix',
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    time: '7:30 AM',
  },
  {
    id: 2,
    type: 'Lunch',
    title: 'Ofada Rice + Okra Soup',
    desc: 'Ofada rice, okra, assorted fish, leafy greens',
    fiber: '12g Fiber',
    gi: 'Med GI',
    giColor: '#FEF3C7',
    giTextColor: '#92400E',
    calories: 520,
    protein: 28,
    carbs: 64,
    sequence: 'Okra soup first → Rice → Fish',
    isChoice: false,
    icon: 'food-variant',
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    time: '1:00 PM',
  },
  {
    id: 3,
    type: 'Snack',
    title: 'Garden Egg + Groundnut',
    desc: 'Fresh garden eggs, raw groundnuts, cucumber slices',
    fiber: '5g Fiber',
    gi: 'Low GI',
    giColor: '#D1FAE5',
    giTextColor: '#065F46',
    calories: 180,
    protein: 8,
    carbs: 12,
    sequence: 'Groundnuts first → Garden egg',
    isChoice: false,
    icon: 'fruit-watermelon',
    iconColor: '#825CFF',
    iconBg: '#EDE9FE',
    time: '4:00 PM',
  },
  {
    id: 4,
    type: 'Dinner',
    title: 'Grilled Fish + Vegetable Soup',
    desc: 'Tilapia, pumpkin leaves, tomatoes, light pepper soup',
    fiber: '9g Fiber',
    gi: 'Low GI',
    giColor: '#D1FAE5',
    giTextColor: '#065F46',
    calories: 410,
    protein: 38,
    carbs: 22,
    sequence: 'Soup first → Fish → Small portion starch',
    isChoice: false,
    icon: 'fish',
    iconColor: '#0284C7',
    iconBg: '#E0F2FE',
    time: '7:00 PM',
  },
];

const TOTAL_CALORIES = MEALS_DATA.reduce((s, m) => s + m.calories, 0);
const CALORIE_GOAL   = 2600;
const WATER_GOAL     = 8;

// ─── Day Pill ─────────────────────────────────────────────────────────────────
const DayPill = ({ day, index, selected, onPress }) => {
  const isToday = index === TODAY_INDEX;
  return (
    <TouchableOpacity
      onPress={() => onPress(index)}
      style={[
        dayStyles.pill,
        selected && dayStyles.pillSelected,
      ]}
    >
      <Text style={[dayStyles.dayText, selected && dayStyles.dayTextSelected]}>{day}</Text>
      {isToday && <View style={[dayStyles.dot, selected && dayStyles.dotSelected]} />}
    </TouchableOpacity>
  );
};

const dayStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 16, backgroundColor: '#F3F4F6',
    alignItems: 'center', marginRight: 8, minWidth: 46,
  },
  pillSelected: { backgroundColor: '#111827' },
  dayText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  dayTextSelected: { color: '#FFF' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#825CFF', marginTop: 3 },
  dotSelected: { backgroundColor: '#FFF' },
});

// ─── Water Tracker ────────────────────────────────────────────────────────────
const WaterTracker = ({ glasses, goal, onTap }) => (
  <View style={waterStyles.card}>
    <View style={waterStyles.headerRow}>
      <View style={waterStyles.titleRow}>
        <MaterialCommunityIcons name="water" size={18} color="#0EA5E9" />
        <Text style={waterStyles.title}>Hydration</Text>
      </View>
      <Text style={waterStyles.count}>
        <Text style={waterStyles.countNum}>{glasses}</Text> / {goal} glasses
      </Text>
    </View>

    {/* Tap-to-fill glass icons */}
    <View style={waterStyles.glassesRow}>
      {Array.from({ length: goal }).map((_, i) => (
        <TouchableOpacity key={i} onPress={() => onTap(i + 1)}>
          <MaterialCommunityIcons
            name={i < glasses ? 'cup' : 'cup-outline'}
            size={26}
            color={i < glasses ? '#0EA5E9' : '#E5E7EB'}
          />
        </TouchableOpacity>
      ))}
    </View>

    {/* Progress bar */}
    <View style={waterStyles.track}>
      <View style={[waterStyles.fill, { width: `${(glasses / goal) * 100}%` }]} />
    </View>
    <Text style={waterStyles.tip}>
      {goal - glasses > 0
        ? `${goal - glasses} more glasses to reach your goal 💧`
        : 'Hydration goal reached! 🎉'}
    </Text>
  </View>
);

const waterStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', borderRadius: 24,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: '#E0F2FE',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  titleRow:  { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title:     { fontSize: 15, fontWeight: '800', color: '#0369A1' },
  count:     { fontSize: 13, color: '#9CA3AF' },
  countNum:  { fontWeight: '800', color: '#0EA5E9', fontSize: 16 },
  glassesRow:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  track: { height: 6, backgroundColor: '#E0F2FE', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  fill:  { height: '100%', backgroundColor: '#0EA5E9', borderRadius: 3 },
  tip:   { fontSize: 11, color: '#0369A1', fontWeight: '600' },
});

// ─── Daily Macro Summary ──────────────────────────────────────────────────────
const DaySummary = ({ meals, completed }) => {
  const eatenCals = meals
    .filter(m => completed.includes(m.id))
    .reduce((s, m) => s + m.calories, 0);
  const totalCals  = meals.reduce((s, m) => s + m.calories, 0);
  const totalProt  = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const pct = Math.round((eatenCals / CALORIE_GOAL) * 100);

  return (
    <View style={summaryStyles.card}>
      <View style={summaryStyles.headerRow}>
        <View>
          <Text style={summaryStyles.title}>Today's Nutrition</Text>
          <Text style={summaryStyles.sub}>{eatenCals} of {CALORIE_GOAL} kcal eaten</Text>
        </View>
        <View style={summaryStyles.pctBadge}>
          <Text style={summaryStyles.pctText}>{pct}%</Text>
        </View>
      </View>

      {/* Calorie bar */}
      <View style={summaryStyles.track}>
        <View style={[summaryStyles.fill, { width: `${Math.min(pct, 100)}%` }]} />
      </View>

      {/* Macro chips */}
      <View style={summaryStyles.macros}>
        {[
          { label: 'Plan Calories', value: `${totalCals} kcal`, color: '#825CFF', icon: 'fire' },
          { label: 'Protein',       value: `${totalProt}g`,     color: '#10B981', icon: 'arm-flex' },
          { label: 'Carbs',         value: `${totalCarbs}g`,    color: '#F59E0B', icon: 'bread-slice' },
        ].map(m => (
          <View key={m.label} style={summaryStyles.macroChip}>
            <MaterialCommunityIcons name={m.icon} size={14} color={m.color} />
            <Text style={[summaryStyles.macroVal, { color: m.color }]}>{m.value}</Text>
            <Text style={summaryStyles.macroLabel}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const summaryStyles = StyleSheet.create({
  card: { backgroundColor: '#111827', borderRadius: 24, padding: 20, marginBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  title: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  sub:   { fontSize: 12, color: '#9CA3AF', marginTop: 3 },
  pctBadge: { backgroundColor: '#1F2937', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  pctText:  { color: '#825CFF', fontWeight: '800', fontSize: 14 },
  track: { height: 6, backgroundColor: '#374151', borderRadius: 3, overflow: 'hidden', marginBottom: 16 },
  fill:  { height: '100%', backgroundColor: '#825CFF', borderRadius: 3 },
  macros: { flexDirection: 'row', justifyContent: 'space-between' },
  macroChip: { alignItems: 'center', gap: 3 },
  macroVal:  { fontSize: 14, fontWeight: '800' },
  macroLabel:{ fontSize: 10, color: '#6B7280', fontWeight: '600' },
});

// ─── Meal Card ────────────────────────────────────────────────────────────────
const MealCard = ({ meal, isDone, onToggle, onNavigate }) => (
  <View style={[mealStyles.card, isDone && mealStyles.cardDone]}>
    {/* Addy's Choice badge */}
    {meal.isChoice && (
      <View style={mealStyles.choiceBadge}>
        <MaterialCommunityIcons name="star-decagram" size={12} color="#FFF" />
        <Text style={mealStyles.choiceText}>ADDY'S CHOICE</Text>
      </View>
    )}

    {/* Header row */}
    <View style={[mealStyles.headerRow, meal.isChoice && { marginTop: 28 }]}>
      <View style={mealStyles.leftHeader}>
        <View style={mealStyles.typeBadge}>
          <Text style={mealStyles.typeText}>{meal.type}</Text>
        </View>
        <Text style={mealStyles.timeText}>{meal.time}</Text>
      </View>
      <TouchableOpacity onPress={onToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons
          name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={isDone ? '#10B981' : '#E5E7EB'}
        />
      </TouchableOpacity>
    </View>

    {/* Meal body */}
    <View style={mealStyles.body}>
      <View style={[mealStyles.iconBox, { backgroundColor: meal.iconBg }]}>
        <MaterialCommunityIcons
          name={meal.icon}
          size={28}
          color={isDone ? '#9CA3AF' : meal.iconColor}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[mealStyles.title, isDone && mealStyles.titleDone]}>{meal.title}</Text>
        <Text style={mealStyles.desc} numberOfLines={1}>{meal.desc}</Text>
        <View style={mealStyles.metaRow}>
          <Text style={mealStyles.fiberText}>{meal.fiber}</Text>
          <View style={[mealStyles.giBadge, { backgroundColor: meal.giColor }]}>
            <Text style={[mealStyles.giText, { color: meal.giTextColor }]}>{meal.gi}</Text>
          </View>
          <Text style={mealStyles.calsText}>{meal.calories} kcal</Text>
        </View>
      </View>
    </View>

    {/* Metabolic sequence */}
    <View style={mealStyles.seqBox}>
      <View style={mealStyles.seqLeft}>
        <MaterialCommunityIcons name="swap-vertical" size={14} color="#825CFF" />
        <Text style={mealStyles.seqLabel}>METABOLIC ORDER</Text>
      </View>
      <Text style={mealStyles.seqValue}>{meal.sequence}</Text>
    </View>

    {/* Macro mini row */}
    <View style={mealStyles.macroRow}>
      {[
        { label: 'Protein', value: `${meal.protein}g`, color: '#10B981' },
        { label: 'Carbs',   value: `${meal.carbs}g`,   color: '#F59E0B' },
      ].map(m => (
        <View key={m.label} style={mealStyles.macroItem}>
          <Text style={[mealStyles.macroVal, { color: m.color }]}>{m.value}</Text>
          <Text style={mealStyles.macroLabel}>{m.label}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={mealStyles.logBtn}
        onPress={onNavigate}
      >
        <MaterialCommunityIcons name="pencil-plus" size={14} color="#825CFF" />
        <Text style={mealStyles.logBtnText}>Log</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const mealStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', borderRadius: 28,
    padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: '#F3F4F6',
    elevation: 1, overflow: 'hidden',
  },
  cardDone: { opacity: 0.75, backgroundColor: '#F9FAFB' },

  choiceBadge: {
    position: 'absolute', top: 0, left: 0,
    backgroundColor: '#FFB02E',
    paddingHorizontal: 12, paddingVertical: 5,
    borderBottomRightRadius: 16,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  choiceText: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  leftHeader:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText:  { color: '#825CFF', fontSize: 11, fontWeight: '800' },
  timeText:  { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },

  body: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  iconBox: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  title:     { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 3 },
  titleDone: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  desc:      { fontSize: 12, color: '#9CA3AF', marginBottom: 6 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fiberText: { fontSize: 12, color: '#10B981', fontWeight: '700' },
  giBadge:   { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  giText:    { fontSize: 10, fontWeight: '800' },
  calsText:  { fontSize: 12, color: '#6B7280', fontWeight: '600' },

  seqBox: {
    backgroundColor: '#F8FAFC', borderRadius: 14,
    padding: 12, marginBottom: 14,
  },
  seqLeft:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  seqLabel: { fontSize: 9, fontWeight: '900', color: '#825CFF', letterSpacing: 0.8 },
  seqValue: { fontSize: 13, color: '#374151', fontWeight: '600' },

  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  macroItem: { alignItems: 'center' },
  macroVal:  { fontSize: 14, fontWeight: '800' },
  macroLabel:{ fontSize: 10, color: '#9CA3AF', fontWeight: '600', marginTop: 1 },
  logBtn: {
    marginLeft: 'auto',
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: '#EDE9FE',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12,
  },
  logBtnText: { fontSize: 13, fontWeight: '700', color: '#825CFF' },
});

// ─── Tip Card ─────────────────────────────────────────────────────────────────
const TipCard = ({ dayIndex }) => {
  const tip = DAILY_TIPS[dayIndex % DAILY_TIPS.length];
  return (
    <View style={tipStyles.card}>
      <View style={tipStyles.iconBox}>
        <MaterialCommunityIcons name="lightning-bolt" size={20} color="#7C3AED" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={tipStyles.title}>Reversal Secret 💡</Text>
        <Text style={tipStyles.text}>{tip}</Text>
      </View>
    </View>
  );
};

const tipStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: '#F5F3FF', borderRadius: 24,
    padding: 18, marginBottom: 14,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  title: { fontSize: 14, fontWeight: '800', color: '#4C1D95', marginBottom: 5 },
  text:  { fontSize: 13, color: '#5B21B6', lineHeight: 19 },
});

// ─── Walk Reminder ────────────────────────────────────────────────────────────
const WalkReminder = ({ completedCount }) => {
  if (completedCount === 0) return null;
  return (
    <View style={walkStyles.card}>
      <MaterialCommunityIcons name="walk" size={24} color="#10B981" />
      <View style={{ flex: 1 }}>
        <Text style={walkStyles.title}>Time for a walk! 🚶</Text>
        <Text style={walkStyles.text}>
          You've eaten {completedCount} meal{completedCount > 1 ? 's' : ''}. A 10-minute walk now can lower your glucose spike by up to 22%.
        </Text>
      </View>
      <TouchableOpacity style={walkStyles.btn}>
        <Text style={walkStyles.btnText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
};

const walkStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F0FDF4', borderRadius: 22,
    padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  title: { fontSize: 14, fontWeight: '800', color: '#065F46' },
  text:  { fontSize: 12, color: '#059669', lineHeight: 17, marginTop: 2 },
  btn: {
    backgroundColor: '#10B981', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 12,
  },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MealPlanScreen({ navigation }) {
  const [selectedDay,    setSelectedDay]    = useState(TODAY_INDEX);
  const [completedMeals, setCompletedMeals] = useState([]);
  const [glasses,        setGlasses]        = useState(5);

  const toggleMeal = (id) => {
    setCompletedMeals(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleWaterTap = (glassNum) => {
    // Tap filled glass to unfill, tap empty to fill up to that number
    setGlasses(prev => prev === glassNum ? glassNum - 1 : glassNum);
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Meal Plan</Text>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="calendar-outline" size={20} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={() => navigation.navigate('MealAnalyser')}
            >
              <MaterialCommunityIcons name="camera" size={16} color="#FFF" />
              <Text style={styles.aiBtnText}>AI Scan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Day selector ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ paddingRight: 4 }}
        >
          {DAYS.map((day, i) => (
            <DayPill
              key={day}
              day={day}
              index={i}
              selected={selectedDay === i}
              onPress={setSelectedDay}
            />
          ))}
        </ScrollView>

        {/* ── Daily Nutrition Summary ── */}
        <DaySummary meals={MEALS_DATA} completed={completedMeals} />

        {/* ── Water Tracker ── */}
        <WaterTracker
          glasses={glasses}
          goal={WATER_GOAL}
          onTap={handleWaterTap}
        />

        {/* ── Walk Reminder (shows after eating) ── */}
        <WalkReminder completedCount={completedMeals.length} />

        {/* ── Reversal Tip ── */}
        <TipCard dayIndex={selectedDay} />

        {/* ── Meals ── */}
        <Text style={styles.sectionTitle}>Reversal Menu</Text>
        {MEALS_DATA.map(meal => (
          <MealCard
            key={meal.id}
            meal={meal}
            isDone={completedMeals.includes(meal.id)}
            onToggle={() => toggleMeal(meal.id)}
            onNavigate={() => navigation.navigate('MealEntry', { meal: meal })}
          />
        ))}

        {/* ── Add custom meal ── */}
        <TouchableOpacity
          style={styles.addMealBtn}
          onPress={() => navigation.navigate('MealEntry')}
        >
          <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#825CFF" />
          <Text style={styles.addMealText}>Add a custom meal</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content:   { padding: 16, paddingBottom: 110 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  title:    { fontSize: 28, fontWeight: '800', color: '#111827' },
  dateText: { fontSize: 13, color: '#9CA3AF', marginTop: 3, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#111827', paddingHorizontal: 14,
    paddingVertical: 9, borderRadius: 16,
  },
  aiBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 14 },

  addMealBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FFF',
    borderRadius: 20, height: 52,
    borderWidth: 1.5, borderColor: '#EDE9FE',
    marginTop: 4,
  },
  addMealText: { fontSize: 14, fontWeight: '700', color: '#825CFF' },
});