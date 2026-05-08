// src/features/meals/screens/MealPlanScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { MealCard } from '../components/MealCard';
import { WaterTracker } from '../components/WaterTracker';
import { DaySummary } from '../components/DaySummary';
import { TipCard } from '../components/TipCard';
import { WalkReminder } from '../components/WalkReminder';

// ─── Data ─────────────────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TODAY_INDEX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

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
  pillSelected: { backgroundColor: '#7C3AED' },
  dayText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  dayTextSelected: { color: '#FFF' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#7C3AED', marginTop: 3 },
  dotSelected: { backgroundColor: '#FFF' },
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
              <Ionicons name="calendar-outline" size={20} color="#7C3AED" />
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
        <DaySummary meals={MEALS_DATA} completed={completedMeals} calorieGoal={CALORIE_GOAL} />

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
          <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#7C3AED" />
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
    backgroundColor: '#FAFAF9', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#7C3AED', paddingHorizontal: 14,
    paddingVertical: 9, borderRadius: 16,
  },
  aiBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 14 },

  addMealBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FAFAF9',
    borderRadius: 20, height: 52,
    borderWidth: 1.5, borderColor: '#EDE9FE',
    marginTop: 4,
  },
  addMealText: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
});
