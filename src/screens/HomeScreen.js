import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  G,
} from 'react-native-svg';
import AIInsightModal from '../components/AIInsightModal';
import AnimatedScreen from '../components/AnimatedScreen';
import PressableScale from '../components/PressableScale';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUserLogs } from '../hooks/useUserLogs';

const { width } = Dimensions.get('window');

// ─── Health Score Ring ────────────────────────────────────────────────────────
const HealthScoreRing = ({ score = 78, label = 'Good' }) => {
  const SIZE = 110;
  const STROKE = 10;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const progress = (score / 100) * CIRC;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#34D399" />
            <Stop offset="1" stopColor="#059669" />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="#E5E7EB"
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="url(#ringGrad)"
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${progress} ${CIRC}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={ringStyles.score}>{score}</Text>
        <Text style={ringStyles.label}>{label}</Text>
      </View>
    </View>
  );
};

const ringStyles = StyleSheet.create({
  score: { fontSize: 22, fontWeight: '800', color: '#111827' },
  label: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: -2 },
});

const getDateKey = (value) => {
  if (!value) return null;
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
};

const buildTrendPath = (values, widthValue, heightValue) => {
  if (!values.length) return null;
  if (values.length === 1) {
    const centerY = heightValue / 2;
    return `M0,${centerY} L${widthValue},${centerY}`;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * widthValue;
    const y = heightValue - ((value - min) / spread) * (heightValue - 12) - 6;
    return { x, y };
  });

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ');
};

const getHealthSummary = (glucoseValues) => {
  if (!glucoseValues.length) {
    return { score: null, label: 'No data', inRangeText: 'Add a glucose reading' };
  }

  const inRangeCount = glucoseValues.filter((value) => value >= 70 && value <= 180).length;
  const inRangePercent = Math.round((inRangeCount / glucoseValues.length) * 100);
  const average = Math.round(glucoseValues.reduce((sum, value) => sum + value, 0) / glucoseValues.length);
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round((inRangePercent * 0.7) + (average >= 70 && average <= 140 ? 30 : average <= 180 ? 18 : 10))
    )
  );

  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs work';

  return {
    score,
    label,
    inRangeText: `${inRangePercent}% in range`,
  };
};

const getConsecutiveLogDays = (logs) => {
  const uniqueDays = new Set(logs.map((log) => getDateKey(log.timestamp)).filter(Boolean));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const cursor = new Date(today);

  while (streak < uniqueDays.size + 1) {
    const key = cursor.toISOString().split('T')[0];
    if (!uniqueDays.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

// ─── Category Tab ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'overview', icon: 'view-dashboard', label: 'Overview' },
  { key: 'sleep',    icon: 'sleep',           label: 'Sleep'    },
  { key: 'nutrition',icon: 'food-apple',       label: 'Nutrition'},
  { key: 'glucose',  icon: 'diabetes',         label: 'Glucose'  },
  { key: 'activity', icon: 'run',              label: 'Activity' },
  { key: 'bmi',      icon: 'scale-bathroom',   label: 'BMI'      },
];

const CategoryTabs = ({ active, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ marginBottom: 20 }}
    contentContainerStyle={{ paddingHorizontal: 2 }}
  >
    {CATEGORIES.map(({ key, icon, label }) => {
      const isActive = key === active;
      return (
        <TouchableOpacity
          key={key}
          onPress={() => onSelect(key)}
          style={[tabStyles.tab, isActive && tabStyles.tabActive]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={isActive ? '#FFF' : '#9CA3AF'}
          />
          <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const tabStyles = StyleSheet.create({
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    gap: 5,
  },
  tabActive: { backgroundColor: '#111827' },
  label: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  labelActive: { color: '#FFF' },
});

// ─── Macro Bar ────────────────────────────────────────────────────────────────
const MacroBar = ({ label, percent, color }) => (
  <View style={macroStyles.row}>
    <Text style={macroStyles.label}>{label}</Text>
    <View style={macroStyles.track}>
      <View style={[macroStyles.fill, { width: `${percent}%`, backgroundColor: color }]} />
    </View>
    <Text style={macroStyles.pct}>{percent}%</Text>
  </View>
);

const macroStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { width: 80, fontSize: 12, color: '#6B7280', fontWeight: '600' },
  track: { flex: 1, height: 6, backgroundColor: '#F3F4F6', borderRadius: 4, marginHorizontal: 8 },
  fill: { height: 6, borderRadius: 4 },
  pct: { width: 32, fontSize: 12, color: '#374151', fontWeight: '700', textAlign: 'right' },
});

// ─── Mini Stat Card ───────────────────────────────────────────────────────────
const MiniStatCard = ({ icon, iconColor, iconBg, title, value, sub, onPress }) => (
  <TouchableOpacity onPress={onPress} style={miniStyles.card}>
    <View style={[miniStyles.iconBox, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
    </View>
    <Text style={miniStyles.title}>{title}</Text>
    <Text style={miniStyles.value}>{value}</Text>
    <Text style={miniStyles.sub}>{sub}</Text>
  </TouchableOpacity>
);

const miniStyles = StyleSheet.create({
  card: {
    width: (width - 56) / 3,
    backgroundColor: '#FBFBFD',
    borderRadius: 20,
    padding: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E7EAF0',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 3 },
  value: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
});

// ─── Plan Item ────────────────────────────────────────────────────────────────
const PlanItem = ({ text, done = false }) => (
  <View style={planStyles.item}>
    <View style={[planStyles.check, done && planStyles.checkDone]}>
      {done && <Ionicons name="checkmark" size={12} color="#FFF" />}
    </View>
    <Text style={[planStyles.text, done && planStyles.textDone]}>{text}</Text>
  </View>
);

const planStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  check: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#D1D5DB',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  checkDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  text: { color: '#374151', flex: 1, fontSize: 14 },
  textDone: { color: '#9CA3AF', textDecorationLine: 'line-through' },
});

// ─── Action Card ──────────────────────────────────────────────────────────────
const ActionCard = ({ title, desc, icon, color, iconColor, onPress }) => (
  <PressableScale onPress={onPress} style={actionStyles.card}>
    <View style={[actionStyles.iconBox, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={26} color={iconColor} />
    </View>
    <Text style={actionStyles.title}>{title}</Text>
    <Text style={actionStyles.desc}>{desc}</Text>
    <Ionicons name="chevron-forward-circle" size={20} color="#E5E7EB" style={actionStyles.arrow} />
  </PressableScale>
);

const actionStyles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#FBFBFD',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7EAF0',
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  title: { fontSize: 14, fontWeight: '700', color: '#111827' },
  desc: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  arrow: { position: 'absolute', top: 14, right: 14 },
});

// ─── Date Navigator ───────────────────────────────────────────────────────────
const DateNavigator = () => {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = today.getDate();
  const month = today.toLocaleDateString('en-US', { month: 'short' });

  return (
    <View style={dateStyles.row}>
      <TouchableOpacity style={dateStyles.arrow}>
        <Ionicons name="chevron-back" size={16} color="#6B7280" />
      </TouchableOpacity>
      <View style={dateStyles.pill}>
        <Ionicons name="calendar-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
        <Text style={dateStyles.text}>Today, {dayNum} {dayName}</Text>
      </View>
      <TouchableOpacity style={[dateStyles.arrow, { opacity: 0.3 }]}>
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
};

const dateStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  arrow: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  pill: {
    flex: 1, marginHorizontal: 10,
    height: 40, borderRadius: 20,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 14, fontWeight: '600', color: '#374151' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { userData } = useUserProfile();
  const { logs, loading: logsLoading } = useUserLogs(60);
  const [showAIInsight, setShowAIInsight] = useState(false);
  const [activeCategory, setActiveCategory] = useState('overview');
  const insets = useSafeAreaInsets();

  const chartWidth = width - 88;
  const chartHeight = 100;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning 👋';
    if (h < 17) return 'Good afternoon 👋';
    return 'Good evening 👋';
  };

  const glucoseLogs = useMemo(
    () => logs.filter((log) => log.type === 'glucose').slice(0, 7),
    [logs]
  );
  const glucoseValues = useMemo(
    () => [...glucoseLogs].reverse().map((log) => Number(log.value)).filter((value) => Number.isFinite(value)),
    [glucoseLogs]
  );
  const latestGlucose = glucoseLogs[0] || null;
  const healthSummary = useMemo(() => getHealthSummary(glucoseValues), [glucoseValues]);
  const trendPath = useMemo(
    () => buildTrendPath(glucoseValues, chartWidth * 0.48, chartHeight * 0.8),
    [glucoseValues, chartWidth, chartHeight]
  );
  const todayLogs = useMemo(
    () => logs.filter((log) => getDateKey(log.timestamp) === getDateKey(new Date())),
    [logs]
  );
  const progressPercent = Math.min(100, todayLogs.length * 25);
  const logStreak = useMemo(() => getConsecutiveLogDays(logs), [logs]);
  const mealLogs = useMemo(
    () => logs.filter((log) => log.type === 'meal').slice(0, 20),
    [logs]
  );
  const mealTotals = useMemo(
    () => mealLogs.reduce(
      (totals, log) => ({
        calories: totals.calories + (Number(log.calories) || 0),
        protein: totals.protein + (Number(log.protein) || 0),
        carbs: totals.carbs + (Number(log.carbs) || 0),
        fats: totals.fats + (Number(log.fats) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    ),
    [mealLogs]
  );

  // Sleep data from logs
  const sleepLogs = useMemo(
    () => logs.filter((log) => log.type === 'sleep').slice(0, 10),
    [logs]
  );
  const todaysSleepLog = useMemo(
    () => sleepLogs.find((log) => getDateKey(log.timestamp) === getDateKey(new Date())),
    [sleepLogs]
  );
  const lastSleepLog = sleepLogs[0] || null;
  const sleepDurationMinutes = lastSleepLog?.value || 0;
  const sleepHours = Math.floor(sleepDurationMinutes / 60);
  const sleepMinutes = sleepDurationMinutes % 60;
  const sleepFormatted = sleepHours > 0 ? `${sleepHours}h ${sleepMinutes}m` : `${sleepMinutes}m`;
  const sleepEfficiency = lastSleepLog?.efficiency || 86;
  const sleepStatus = lastSleepLog?.status || (lastSleepLog?.value ? 'Good' : 'No data');
  const sleepBedTime = lastSleepLog?.bedTime || '11:33 PM';
  const sleepWakeTime = lastSleepLog?.wakeTime || '08:38 AM';

  // Activity data from exercise logs
  const exerciseLogs = useMemo(
    () => logs.filter((log) => log.type === 'exercise').slice(0, 20),
    [logs]
  );
  const activitySteps = useMemo(() => {
    // Estimate steps: 1 min activity ≈ 100 steps (average pace)
    const totalMinutes = exerciseLogs.reduce((total, log) => {
      const duration = Number(log.value) || 0;
      return total + duration;
    }, 0);
    return Math.round(totalMinutes * 100);
  }, [exerciseLogs]);

  // BMI calculation from user profile
  const bmiValue = useMemo(() => {
    if (!userData?.currentWeight || !userData?.height) return null;
    const weight = Number(userData.currentWeight) || 0;
    const heightM = (Number(userData.height) || 0) / 100; // Convert cm to meters
    if (heightM <= 0 || weight <= 0) return null;
    return (weight / (heightM * heightM)).toFixed(1);
  }, [userData?.currentWeight, userData?.height]);

  const getBMIStatus = (bmi) => {
    if (!bmi) return 'Not set';
    bmi = Number(bmi);
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Healthy range';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const calorieTarget = 2600;
  const proteinTarget = 120;
  const carbTarget = 275;
  const fatTarget = 80;
  const isLogLoading = logsLoading && !logs.length;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setActiveCategory('overview');
    });

    return unsubscribe;
  }, [navigation]);

  const handleCategorySelect = (key) => {
    setActiveCategory(key);

    if (key === 'overview') return;

    if (key === 'sleep') {
      navigation.navigate('SleepInsights');
      return;
    }

    if (key === 'nutrition') {
      navigation.navigate('NutritionInsights');
      return;
    }

    if (key === 'glucose') {
      navigation.navigate('GlucoseMonitor');
      return;
    }

    if (key === 'activity') {
      navigation.navigate('ActivityTracker');
      return;
    }

    if (key === 'bmi') {
      navigation.navigate('BodyComposition');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 18 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{userData?.firstName || 'Daniel'}</Text>
            </View>
            <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={24} color="#111827" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(userData?.firstName?.[0] || 'D') + (userData?.lastName?.[0] || 'N')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Date Navigator ── */}
          <DateNavigator navigation={navigation} />

          {/* ── Category Tabs ── */}
          <CategoryTabs active={activeCategory} onSelect={handleCategorySelect} />

          {/* ── Health Score + Glucose Chart Row ── */}
          <View style={styles.scoreRow}>
            {/* Health Score Card */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardTitle}>Health Score</Text>
              <HealthScoreRing score={healthSummary.score ?? 0} label={healthSummary.label} />
              <TouchableOpacity style={styles.shareBtn}>
                <Ionicons name="share-social-outline" size={14} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.scoreMotivation}>
                {isLogLoading ? 'Loading your saved records...' : healthSummary.inRangeText}
              </Text>
            </View>

            {/* Glucose Trend Card */}
            <TouchableOpacity
              style={styles.chartCard}
              onPress={() => navigation.navigate('GlucoseMonitor')}
            >
              <Text style={styles.chartTitle}>Metabolic Trend</Text>
              <Text style={styles.chartSub}>{isLogLoading ? 'Syncing your glucose logs...' : healthSummary.inRangeText}</Text>

              {trendPath ? (
                <Svg width={chartWidth * 0.48} height={chartHeight * 0.8}>
                  <Defs>
                    <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#825CFF" stopOpacity="0.3" />
                      <Stop offset="1" stopColor="#825CFF" stopOpacity="0.02" />
                    </LinearGradient>
                  </Defs>
                  <Path
                    d={trendPath}
                    stroke="#825CFF"
                    strokeWidth="3"
                    fill="none"
                  />
                  <Path
                    d={`${trendPath} L${chartWidth * 0.48},${chartHeight * 0.8} L0,${chartHeight * 0.8} Z`}
                    fill="url(#fade)"
                  />
                  <Circle cx={chartWidth * 0.48} cy="28" r="5" fill="#825CFF" />
                </Svg>
              ) : (
                <View style={styles.emptyTrendCard}>
                  <MaterialCommunityIcons name="chart-line" size={28} color="#C4B5FD" />
                  <Text style={styles.emptyTrendText}>{isLogLoading ? 'Loading glucose records...' : 'Add a glucose reading to see your trend.'}</Text>
                </View>
              )}

              <View style={styles.glucoseValueRow}>
                <Text style={styles.glucoseValue}>{latestGlucose ? Math.round(Number(latestGlucose.value)) : '--'}</Text>
                <Text style={styles.glucoseUnit}>{latestGlucose?.unit || 'mg/dL'}</Text>
              </View>
              <Text style={styles.chartSub}>
                {latestGlucose ? `Last reading • ${latestGlucose.period || 'Logged'}` : 'No glucose readings yet'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Quick Action Buttons ── */}
          <View style={styles.mainActions}>
            <TouchableOpacity
              style={styles.darkBtn}
              onPress={() => navigation.navigate('GlucoseEntry')}
            >
              <MaterialCommunityIcons name="diabetes" size={20} color="#FFF" />
              <Text style={styles.darkBtnText}>Log Glucose</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.lightBtn}
              onPress={() => setShowAIInsight(true)}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={18} color="#7C3AED" />
              <Text style={styles.lightBtnText}>AI Insight</Text>
            </TouchableOpacity>
          </View>

          {/* ── Mini Stats Row ── */}
          <Text style={styles.sectionTitle}>Today's Stats</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 24 }}
            contentContainerStyle={{ paddingRight: 4 }}
          >
            <MiniStatCard
              icon="sleep"
              iconColor="#6D28D9"
              iconBg="#EDE9FE"
              title="Sleep"
              value={lastSleepLog ? sleepFormatted : '--'}
              sub={lastSleepLog ? `${sleepEfficiency}% efficiency` : 'Log sleep data'}
              onPress={() => navigation.navigate('SleepInsights')}
            />
            <MiniStatCard
              icon="food-apple"
              iconColor="#D97706"
              iconBg="#FEF3C7"
              title="Calories"
              value={mealTotals.calories || '--'}
              sub={mealTotals.calories ? ` of ${calorieTarget} kcal` : 'Log meals'}
              onPress={() => navigation.navigate('NutritionInsights')}
            />
            <MiniStatCard
              icon="run"
              iconColor="#0284C7"
              iconBg="#E0F2FE"
              title="Activity"
              value={activitySteps || '0'}
              sub="steps today"
              onPress={() => navigation.navigate('ActivityTracker')}
            />
            <MiniStatCard
              icon="scale-bathroom"
              iconColor="#059669"
              iconBg="#D1FAE5"
              title="BMI"
              value={bmiValue ?? '--'}
              sub={getBMIStatus(bmiValue)}
              onPress={() => navigation.navigate('BodyComposition')}
            />
          </ScrollView>

          {/* ── Nutrition Summary ── */}
          <TouchableOpacity
            style={styles.nutritionCard}
            onPress={() => navigation.navigate('NutritionInsights')}
          >
            <View style={styles.nutritionHeader}>
              <View>
                <Text style={styles.nutritionTitle}>Nutrition</Text>
                <Text style={styles.nutritionSub}>Your health summary for the day</Text>
              </View>
              <TouchableOpacity
                style={styles.logFoodBtn}
                onPress={() => navigation.navigate('MealEntry')}
              >
                <MaterialCommunityIcons name="plus" size={14} color="#FFF" />
                <Text style={styles.logFoodText}>Log Food</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calRow}>
              <MaterialCommunityIcons name="fire" size={18} color="#F59E0B" />
              <Text style={styles.calText}>{mealTotals.calories || '--'}</Text>
              <Text style={styles.calOf}>{mealTotals.calories ? ` of ${calorieTarget} kcal eaten` : ' Log meals to see calories'}</Text>
            </View>

            <View style={{ marginTop: 14 }}>
              <MacroBar label="Protein" percent={Math.min(100, Math.round((mealTotals.protein / proteinTarget) * 100) || 0)} color="#10B981" />
              <MacroBar label="Carbohydrates" percent={Math.min(100, Math.round((mealTotals.carbs / carbTarget) * 100) || 0)} color="#F59E0B" />
              <MacroBar label="Fats" percent={Math.min(100, Math.round((mealTotals.fats / fatTarget) * 100) || 0)} color="#3B82F6" />
            </View>
          </TouchableOpacity>

          {/* ── Sleep Summary ── */}
          <TouchableOpacity
            style={styles.sleepCard}
            onPress={() => navigation.navigate('SleepInsights')}
          >
            <View style={styles.sleepHeader}>
              <MaterialCommunityIcons name="sleep" size={20} color="#6D28D9" />
              <Text style={styles.sleepTitle}>Sleep Insights</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
            </View>

            {/* Sleep Stages Bar */}
            {lastSleepLog && (lastSleepLog.lightPercent || lastSleepLog.remPercent) ? (
              <View style={styles.stagesBar}>
                <View style={[styles.stage, { flex: lastSleepLog.lightPercent || 8, backgroundColor: '#60A5FA' }]} />
                <View style={[styles.stage, { flex: lastSleepLog.deepPercent || 45, backgroundColor: '#86EFAC' }]} />
                <View style={[styles.stage, { flex: lastSleepLog.remPercent || 25, backgroundColor: '#818CF8' }]} />
              </View>
            ) : (
              <View style={styles.stagesBar}>
                <View style={[styles.stage, { flex: 1, backgroundColor: '#E5E7EB' }]} />
              </View>
            )}

            <View style={styles.sleepTimes}>
              <Text style={styles.sleepTime}>🛏 {lastSleepLog?.bedTime || '--:-- --'}</Text>
              <Text style={styles.sleepTime}>☀️ {lastSleepLog?.wakeTime || '--:-- --'}</Text>
            </View>

            <View style={styles.sleepStatsRow}>
              <View style={styles.sleepStat}>
                <Text style={styles.sleepStatValue}>{lastSleepLog ? sleepFormatted : '--'}</Text>
                <Text style={styles.sleepStatLabel}>Total Sleep</Text>
              </View>
              <View style={styles.sleepDivider} />
              <View style={styles.sleepStat}>
                <Text style={styles.sleepStatValue}>{lastSleepLog?.efficiency || '--'}%</Text>
                <Text style={styles.sleepStatLabel}>Efficiency</Text>
              </View>
              <View style={styles.sleepDivider} />
              <View style={styles.sleepStat}>
                <Text style={[styles.sleepStatValue, { color: lastSleepLog ? '#10B981' : '#9CA3AF' }]}>
                  {lastSleepLog?.status || 'No data'}
                </Text>
                <Text style={styles.sleepStatLabel}>Status</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* ── AI Tip ── */}
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <MaterialCommunityIcons name="lightning-bolt" size={22} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Optimal Window</Text>
              <Text style={styles.insightDesc}>
                A 10-minute walk now may improve insulin sensitivity by up to 20%.
              </Text>
            </View>
          </View>

          {/* ── Progress + Streak ── */}
          <View style={styles.progressCard}>
            <View>
              <Text style={styles.progressSmall}>Today's Progress</Text>
              <Text style={styles.progressBig}>{progressPercent}% Complete</Text>
              <Text style={styles.progressSub}>{todayLogs.length} log{todayLogs.length === 1 ? '' : 's'} saved today</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <View style={styles.streakWrap}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{logStreak} Day Streak</Text>
            </View>
          </View>

          {/* ── Daily Plan ── */}
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Your Plan Today</Text>
            <PlanItem text="15 min walk after lunch" done />
            <PlanItem text="Drink 4 more glasses of water" />
            <PlanItem text="Balanced low-sugar dinner" />
            <PlanItem text="Sleep before 11 PM" />
          </View>

          {/* ── Quick Access Grid ── */}
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.grid}>
            <ActionCard
              title="Academy"
              desc="Reversal lessons"
              icon="school"
              color="#FEF3FF"
              iconColor="#8B5CF6"
              onPress={() => navigation.navigate('Education')}
            />
            <ActionCard
              title="AI Meal Scan"
              desc="Snap & analyse"
              icon="camera"
              color="#FFF7ED"
              iconColor="#C2410C"
              onPress={() => navigation.navigate('MealAnalyser')}
            />
            <ActionCard
              title="Glucose"
              desc="View full chart"
              icon="chart-line"
              color="#EDE9FE"
              iconColor="#7C3AED"
              onPress={() => navigation.navigate('GlucoseMonitor')}
            />
            <ActionCard
              title="Body Comp"
              desc="Weight & BMI"
              icon="scale-bathroom"
              color="#D1FAE5"
              iconColor="#059669"
              onPress={() => navigation.navigate('BodyComposition')}
            />
            <ActionCard
              title="Health Sync"
              desc="Google Fit"
              icon="sync"
              color="#E0F2FE"
              iconColor="#0284C7"
              onPress={() => navigation.navigate('HealthIntegration')}
            />
            <ActionCard
              title="Smart Meals"
              desc="Log & track"
              icon="food-apple"
              color="#F0FDF4"
              iconColor="#166534"
              onPress={() => navigation.navigate('MealEntry')}
            />
            <ActionCard
              title="Exercise"
              desc="12 min walk"
              icon="run"
              color="#EFF6FF"
              iconColor="#1D4ED8"
              onPress={() => navigation.navigate('ExerciseEntry')}
            />
          </View>
        </ScrollView>
      </AnimatedScreen>

      <AIInsightModal
        visible={showAIInsight}
        onClose={() => setShowAIInsight(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F8' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 120 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14, color: '#6B7280' },
  userName: { fontSize: 28, fontWeight: '800', color: '#111827', marginTop: 2 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  notificationBtn: { marginRight: 14 },
  notificationDot: {
    position: 'absolute', top: 1, right: 1,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#6D28D9', fontWeight: '800' },

  // Score + Chart Row
  scoreRow: { flexDirection: 'row', marginBottom: 20, gap: 12 },

  scoreCard: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7E9FF',
  },
  scoreCardTitle: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 10 },
  shareBtn: { position: 'absolute', top: 12, left: 12 },
  scoreMotivation: { fontSize: 11, color: '#6B7280', marginTop: 8 },

  chartCard: {
    flex: 1,
    backgroundColor: '#FBFBFD',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E7EAF0',
  },
  emptyTrendCard: {
    flex: 1,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F5F3FF',
    borderRadius: 18,
    padding: 12,
  },
  emptyTrendText: { fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 16 },
  chartTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  chartSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2, marginBottom: 8 },
  glucoseValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6 },
  glucoseValue: { fontSize: 22, fontWeight: '800', color: '#825CFF' },
  glucoseUnit: { fontSize: 12, color: '#9CA3AF' },

  // Buttons
  mainActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  darkBtn: {
    width: '48%', height: 52, borderRadius: 26,
    backgroundColor: '#111827', flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  darkBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  lightBtn: {
    width: '48%', height: 52, borderRadius: 26,
    backgroundColor: '#F3E8FF', borderWidth: 1.5, borderColor: '#DDD6FE',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  lightBtnText: { fontWeight: '700', color: '#7C3AED', fontSize: 14 },

  // Section title
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 14 },

  // Nutrition Card
  nutritionCard: {
    backgroundColor: '#FBFBFD', borderRadius: 24, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#E7EAF0',
  },
  nutritionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  nutritionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  nutritionSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  logFoodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#111827', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  logFoodText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  calRow: { flexDirection: 'row', alignItems: 'center' },
  calText: { fontSize: 18, fontWeight: '800', color: '#111827', marginLeft: 6 },
  calOf: { fontSize: 13, color: '#9CA3AF' },

  // Sleep Card
  sleepCard: {
    backgroundColor: '#FBFBFD', borderRadius: 24, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#E7EAF0',
  },
  sleepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  sleepTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  stagesBar: {
    flexDirection: 'row', height: 18, borderRadius: 10, overflow: 'hidden', marginBottom: 8,
  },
  stage: { height: '100%', marginRight: 2 },
  sleepTimes: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  sleepTime: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  sleepStatsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  sleepStat: { alignItems: 'center' },
  sleepStatValue: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sleepStatLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  sleepDivider: { width: 1, height: 36, backgroundColor: '#F3F4F6' },

  // AI Insight
  insightCard: {
    flexDirection: 'row', backgroundColor: '#F8FAFF', borderRadius: 24,
    padding: 18, marginBottom: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#E7E9FF',
  },
  insightIcon: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  insightTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  insightDesc: { marginTop: 4, color: '#6B7280', lineHeight: 18, fontSize: 13 },

  // Progress
  progressCard: {
    backgroundColor: '#111827', borderRadius: 28, padding: 20, marginBottom: 16,
  },
  progressSmall: { color: '#9CA3AF', fontSize: 13 },
  progressBig: { color: '#FFF', fontSize: 26, fontWeight: '800', marginTop: 4 },
  progressSub: { color: '#D1D5DB', marginTop: 4, fontSize: 13 },
  progressBarTrack: {
    height: 6, backgroundColor: '#374151', borderRadius: 3, marginTop: 14,
  },
  progressBarFill: { height: 6, backgroundColor: '#10B981', borderRadius: 3 },
  streakWrap: { marginTop: 14, flexDirection: 'row', alignItems: 'center' },
  streakEmoji: { fontSize: 18, marginRight: 6 },
  streakText: { color: '#FBBF24', fontWeight: '700' },

  // Plan
  planCard: {
    backgroundColor: '#FBFBFD', borderRadius: 28, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: '#E7EAF0',
  },
  planTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 14 },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});