// src/screens/NutritionInsights.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useUserLogs } from '../hooks/useUserLogs';

const { width } = Dimensions.get('window');

// ─── Helper to get date key ──────────────────────────────────────────────────
const getDateKey = (value) => {
  if (!value) return null;
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
};

// ─── Calorie Ring ─────────────────────────────────────────────────────────────
const CalorieRing = ({ consumed, target }) => {
  const SIZE   = 150;
  const STROKE = 13;
  const R      = (SIZE - STROKE) / 2;
  const CIRC   = 2 * Math.PI * R;
  const pct    = Math.min(consumed / target, 1);
  const filled = pct * CIRC;
  const remaining = target - consumed;

  return (
    <View style={{ alignItems: 'center', marginVertical: 6 }}>
      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id="calGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#825CFF" />
              <Stop offset="1" stopColor="#6D28D9" />
            </LinearGradient>
          </Defs>
          {/* Track */}
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            stroke="#F3F4F6" strokeWidth={STROKE} fill="none"
          />
          {/* Progress */}
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            stroke="url(#calGrad)" strokeWidth={STROKE} fill="none"
            strokeDasharray={`${filled} ${CIRC}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        {/* Inner text */}
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          <Text style={ringStyles.consumed}>{consumed.toLocaleString()}</Text>
          <Text style={ringStyles.unit}>kcal eaten</Text>
          <Text style={ringStyles.target}>of {target.toLocaleString()}</Text>
        </View>
      </View>
      {/* Remaining callout */}
      <View style={ringStyles.remainingBadge}>
        <Text style={ringStyles.remainingText}>
          {remaining > 0
            ? `${remaining.toLocaleString()} kcal remaining`
            : 'Daily goal reached! 🎉'}
        </Text>
      </View>
    </View>
  );
};

const ringStyles = StyleSheet.create({
  consumed: { fontSize: 26, fontWeight: '800', color: '#111827' },
  unit:     { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  target:   { fontSize: 11, color: '#9CA3AF' },
  remainingBadge: {
    marginTop: 10,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20,
  },
  remainingText: { fontSize: 12, fontWeight: '700', color: '#7C3AED' },
});

// ─── Macro Bar ────────────────────────────────────────────────────────────────
const MacroBar = ({ label, consumed, target, color }) => {
  const pct = Math.min((consumed / target) * 100, 100);
  const gRemaining = target - consumed;

  return (
    <View style={macroStyles.row}>
      <View style={macroStyles.labelRow}>
        <View style={[macroStyles.dot, { backgroundColor: color }]} />
        <Text style={macroStyles.label}>{label}</Text>
        <Text style={macroStyles.values}>{consumed}g <Text style={macroStyles.of}>/ {target}g</Text></Text>
        <Text style={[macroStyles.pct, { color }]}>{Math.round(pct)}%</Text>
      </View>
      <View style={macroStyles.track}>
        <View style={[macroStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={macroStyles.remaining}>{gRemaining > 0 ? `${gRemaining}g left` : 'Goal reached ✓'}</Text>
    </View>
  );
};

const macroStyles = StyleSheet.create({
  row: { marginBottom: 18 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', flex: 1 },
  values: { fontSize: 13, fontWeight: '700', color: '#111827', marginRight: 8 },
  of: { fontWeight: '400', color: '#9CA3AF' },
  pct: { fontSize: 13, fontWeight: '800', minWidth: 36, textAlign: 'right' },
  track: {
    height: 8, backgroundColor: '#F3F4F6',
    borderRadius: 4, overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
  remaining: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
});

// ─── Meal Row ─────────────────────────────────────────────────────────────────
const MealRow = ({ meal, onPress }) => {
  const hasData = meal.items.length > 0;

  return (
    <TouchableOpacity onPress={onPress} style={mealStyles.row}>
      <View style={[mealStyles.iconBox, { backgroundColor: meal.iconBg }]}>
        <MaterialCommunityIcons name={meal.icon} size={20} color={meal.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={mealStyles.topRow}>
          <Text style={mealStyles.mealType}>{meal.type}</Text>
          {hasData
            ? <Text style={mealStyles.kcal}>{meal.kcal} kcal</Text>
            : <Text style={mealStyles.addText}>+ Add meal</Text>
          }
        </View>
        {hasData
          ? <Text style={mealStyles.items}>{meal.items.join(' · ')}</Text>
          : <Text style={mealStyles.emptyText}>Nothing logged yet</Text>
        }
        {meal.time ? <Text style={mealStyles.time}>{meal.time}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
};

const mealStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  iconBox: {
    width: 42, height: 42, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  mealType: { fontSize: 14, fontWeight: '700', color: '#111827' },
  kcal: { fontSize: 14, fontWeight: '700', color: '#111827' },
  addText: { fontSize: 13, fontWeight: '600', color: '#825CFF' },
  items: { fontSize: 12, color: '#9CA3AF', lineHeight: 16 },
  emptyText: { fontSize: 12, color: '#D1D5DB', fontStyle: 'italic' },
  time: { fontSize: 11, color: '#C4B5FD', marginTop: 2 },
});

// ─── Insight Card ─────────────────────────────────────────────────────────────
const InsightCard = ({ icon, iconColor, iconBg, text }) => (
  <View style={insightStyles.card}>
    <View style={[insightStyles.iconBox, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
    </View>
    <Text style={insightStyles.text}>{text}</Text>
  </View>
);

const insightStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FAFAFA', borderRadius: 16,
    padding: 14, marginBottom: 10,
  },
  iconBox: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, flexShrink: 0,
  },
  text: { flex: 1, color: '#374151', fontSize: 13, lineHeight: 19 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NutritionInsights({ navigation }) {
  const [activeTab, setActiveTab] = useState('today');
  const { logs, loading } = useUserLogs(60);

  // Extract meal logs
  const mealLogs = useMemo(
    () => logs.filter((log) => log.type === 'meal').slice(0, 50),
    [logs]
  );

  // Get today's meals
  const todayMeals = useMemo(
    () => mealLogs.filter((log) => getDateKey(log.timestamp) === getDateKey(new Date())),
    [mealLogs]
  );

  // Calculate totals
  const totals = useMemo(() => ({
    calories: todayMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0),
    protein: todayMeals.reduce((s, m) => s + (Number(m.protein) || 0), 0),
    carbs: todayMeals.reduce((s, m) => s + (Number(m.carbs) || 0), 0),
    fat: todayMeals.reduce((s, m) => s + (Number(m.fats) || 0), 0),
  }), [todayMeals]);

  // Build meals UI data with real logs
  const meals = useMemo(() => {
    const mealTypes = [
      { type: 'Breakfast', icon: 'weather-sunset-up', iconColor: '#F59E0B', iconBg: '#FEF3C7' },
      { type: 'Lunch', icon: 'food', iconColor: '#10B981', iconBg: '#D1FAE5' },
      { type: 'Snack', icon: 'fruit-cherries', iconColor: '#6D28D9', iconBg: '#EDE9FE' },
      { type: 'Dinner', icon: 'silverware-fork-knife', iconColor: '#0284C7', iconBg: '#E0F2FE' },
    ];

    return mealTypes.map((mt, i) => {
      const mealLogs_filtered = todayMeals.filter((m) => m.mealType === mt.type);
      const kcal = mealLogs_filtered.reduce((s, m) => s + (Number(m.calories) || 0), 0);
      const time = mealLogs_filtered[0]?.timestamp 
        ? new Date(typeof mealLogs_filtered[0].timestamp.toDate === 'function' 
            ? mealLogs_filtered[0].timestamp.toDate() 
            : mealLogs_filtered[0].timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';
      return {
        id: i,
        type: mt.type,
        icon: mt.icon,
        iconColor: mt.iconColor,
        iconBg: mt.iconBg,
        items: mealLogs_filtered.map(m => m.value || m.name || 'Food'),
        kcal,
        time,
      };
    });
  }, [todayMeals]);

  const calories = { consumed: totals.calories, target: 2600 };
  const macros = {
    protein: { consumed: totals.protein, target: 130, color: '#10B981', label: 'Protein' },
    carbs: { consumed: totals.carbs, target: 260, color: '#F59E0B', label: 'Carbs' },
    fat: { consumed: totals.fat, target: 87, color: '#3B82F6', label: 'Fats' },
  };
  const totalMealKcal = totals.calories;

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition</Text>
        <TouchableOpacity
          style={styles.logBtn}
          onPress={() => navigation.navigate('MealEntry')}
        >
          <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
          <Text style={styles.logBtnText}>Log Food</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Tab Switch ── */}
        <View style={styles.tabs}>
          {['today', 'week'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'today' ? "Today" : "This Week"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Calorie Ring Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Calorie Goal</Text>
              <Text style={styles.cardSub}>Your health summary for the day</Text>
            </View>
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>
                {Math.round((calories.consumed / calories.target) * 100)}% reached
              </Text>
            </View>
          </View>
          <CalorieRing consumed={calories.consumed} target={calories.target} />
        </View>

        {/* ── Macros Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Macronutrients</Text>
          <Text style={[styles.cardSub, { marginBottom: 20 }]}>Daily breakdown</Text>
          {Object.values(macros).map(m => (
            <MacroBar
              key={m.label}
              label={m.label}
              consumed={m.consumed}
              target={m.target}
              color={m.color}
            />
          ))}
        </View>

        {/* ── Meals Today ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Meals Today</Text>
              <Text style={styles.cardSub}>{totalMealKcal} kcal logged</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('MealAnalyser')}>
              <View style={styles.scanBtn}>
                <MaterialCommunityIcons name="camera" size={15} color="#825CFF" />
                <Text style={styles.scanText}>AI Scan</Text>
              </View>
            </TouchableOpacity>
          </View>
          {meals.map(meal => (
            <MealRow
              key={meal.id}
              meal={meal}
              onPress={() => navigation.navigate('MealEntry', { mealType: meal.type })}
            />
          ))}
        </View>

        {/* ── Insights ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nutritional Insights</Text>
          <Text style={[styles.cardSub, { marginBottom: 14 }]}>Personalised tips for today</Text>
          <InsightCard
            icon="food-apple"
            iconColor="#166534"
            iconBg="#D1FAE5"
            text="Your protein intake is on track. Keep it up — adequate protein helps maintain muscle and supports glucose regulation."
          />
          <InsightCard
            icon="chart-bar"
            iconColor="#D97706"
            iconBg="#FEF3C7"
            text="Carbohydrate intake is lower than usual. Consider adding complex carbs like sweet potato or legumes at dinner."
          />
          <InsightCard
            icon="clock-outline"
            iconColor="#0284C7"
            iconBg="#E0F2FE"
            text="You haven't logged dinner yet. Eating before 8 PM can significantly improve overnight glucose stability."
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  logBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#111827', paddingHorizontal: 14,
    paddingVertical: 9, borderRadius: 20,
  },
  logBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  content: { padding: 16, paddingBottom: 40 },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14, padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1, paddingVertical: 9,
    borderRadius: 11, alignItems: 'center',
  },
  tabActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#111827' },

  // Card
  card: {
    backgroundColor: '#FFF', borderRadius: 24,
    padding: 20, marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  cardSub:   { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  goalBadge: {
    backgroundColor: '#F3E8FF', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 12,
  },
  goalBadgeText: { fontSize: 11, fontWeight: '700', color: '#7C3AED' },

  scanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: '#DDD6FE',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  scanText: { fontSize: 12, fontWeight: '700', color: '#825CFF' },
});