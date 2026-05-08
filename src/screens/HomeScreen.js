import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useWindowDimensions,
  Animated,
  PanResponder,
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

const getActivityLabel = (level) => {
  const labels = {
    sedentary: 'Sedentary',
    'lightly active': 'Lightly active',
    'moderately active': 'Moderately active',
    'very active': 'Very active',
  };
  return labels[String(level || '').toLowerCase()] || 'Activity not set';
};

const getCalorieTarget = (userData = {}) => {
  const level = String(userData.level || '').toLowerCase();
  if (level.includes('very active')) return 2900;
  if (level.includes('moderately active')) return 2600;
  if (level.includes('lightly active')) return 2350;
  if (level.includes('sedentary')) return 2100;
  return 2600;
};

const getProfileFocus = (userData = {}) => {
  const condition = userData.diabetesType || userData.healthStatus || 'Profile incomplete';
  const activity = getActivityLabel(userData.level);
  const readiness = userData.readinessLevel || '';
  const region = userData.region || '';

  const chips = [condition, activity, readiness, region]
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 3);

  let message = 'We will tailor reminders and insights using your saved profile.';
  if (userData.diabetesType) {
    message = `${userData.diabetesType} selected. Guidance will lean toward glucose-friendly meals and reminders.`;
  }
  if (userData.level) {
    message = `${message} Activity level: ${activity}.`;
  }

  return { chips, message };
};

const getDailyPlanItems = (userData = {}, hasGlucoseData = false) => {
  const items = [];
  const condition = String(userData.diabetesType || userData.healthStatus || '').toLowerCase();
  const activity = String(userData.level || '').toLowerCase();
  const readiness = String(userData.readinessLevel || '').toLowerCase();
  const frequency = String(userData.checkFrequency || '').toLowerCase();

  if (condition.includes('type 2')) {
    items.push('Keep carbs balanced at lunch and dinner');
  } else if (condition.includes('prediabetes')) {
    items.push('Swap one refined carb for a fiber-rich option');
  } else if (condition.includes('type 1')) {
    items.push('Review your glucose checks before your next meal');
  } else {
    items.push('Log your next meal to keep your plan accurate');
  }

  if (activity.includes('sedentary')) {
    items.push('Take a 10-minute walk after your biggest meal');
  } else if (activity.includes('lightly active')) {
    items.push('Add one extra movement break today');
  } else if (activity.includes('moderately active') || activity.includes('very active')) {
    items.push('Use your activity window for a post-meal check-in');
  }

  if (frequency) {
    items.push(`Set a ${frequency} glucose reminder`);
  } else {
    items.push('Set a glucose reminder for today');
  }

  if (readiness.includes('starting')) {
    items.push('Focus on one small win before dinner');
  } else if (readiness.includes('momentum')) {
    items.push('Keep today’s streak alive with one more log');
  } else if (readiness.includes('committed')) {
    items.push('Review your progress and plan tomorrow early');
  }

  if (!hasGlucoseData) {
    items.unshift('Log your first glucose reading when ready');
  }

  return items.slice(0, 4);
};

const getInsightMessage = (userData = {}, latestGlucose = null) => {
  const condition = String(userData.diabetesType || userData.healthStatus || '').toLowerCase();
  const activity = String(userData.level || '').toLowerCase();
  const glucoseValue = Number(latestGlucose?.value);

  if (!Number.isFinite(glucoseValue)) {
    if (condition.includes('prediabetes') || condition.includes('type 2')) {
      return 'Your profile is saved. Logging a glucose reading will let us time advice around meals and movement.';
    }
    return 'Log a glucose reading to unlock meal and movement advice that matches your profile.';
  }

  if (glucoseValue >= 180) {
    return 'Your reading is elevated. A short walk and a water break can help bring the trend down.';
  }

  if (glucoseValue >= 70 && glucoseValue <= 140) {
    if (activity.includes('sedentary')) {
      return 'Your glucose is in a good range. Use this window for a short walk or an easy stretch break.';
    }
    return 'Your glucose is in a good range. Keep the momentum with your next planned meal or movement block.';
  }

  if (condition.includes('type 1')) {
    return 'Your profile suggests closer check-ins. Use your next reminder to stay ahead of the trend.';
  }

  return 'Keep following your plan. Small actions now help keep your day steady.';
};

const getNutritionSummary = (userData = {}, mealTotals = {}, calorieTarget = 2600) => {
  const condition = String(userData.diabetesType || userData.healthStatus || '').toLowerCase();
  const activity = String(userData.level || '').toLowerCase();
  const calories = Number(mealTotals?.calories) || 0;
  const caloriesLeft = Math.max(calorieTarget - calories, 0);

  if (!calories) {
    if (condition.includes('prediabetes') || condition.includes('type 2')) {
      return 'Log your next meal to keep carbs and calories aligned with your glucose goals.';
    }
    return 'Log a meal to see how today’s food fits your profile.';
  }

  if (calories >= calorieTarget) {
    return 'You are at or above your target. Keep the next meal lighter and add more fiber and water.';
  }

  if (activity.includes('very active') || activity.includes('moderately active')) {
    return `${caloriesLeft} kcal left. Your activity level gives you room for a balanced meal or snack.`;
  }

  return `${caloriesLeft} kcal left. Favor slower carbs and protein to stay steadier through the day.`;
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
  tabActive: { backgroundColor: '#7C3AED' },
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

// ─── Top Switcher (animated small slide for top area only) ──────────────
const TopSwitcher = ({
  activeCategory,
  isCompactScreen,
  chartWidth,
  chartHeight,
  healthSummary,
  trendPath,
  latestGlucose,
  mealTotals,
  nutritionSummary,
  calorieTarget,
  proteinTarget,
  carbTarget,
  fatTarget,
  lastSleepLog,
  sleepFormatted,
  sleepEfficiency,
  sleepStatus,
  sleepBedTime,
  sleepWakeTime,
  exerciseLogs,
  activitySteps,
  bmiValue,
  userWeight,
  navigation,
  isLogLoading,
  screenWidth,
  onSwipe,
}) => {
  const dragX = React.useRef(new Animated.Value(0)).current;
  const transition = React.useRef(new Animated.Value(1)).current;
  const previousCategoryRef = React.useRef(activeCategory);
  const transitionDirectionRef = React.useRef(1);
  const [displayCategory, setDisplayCategory] = useState(activeCategory);
  const [previousCategory, setPreviousCategory] = useState(null);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const { dx, dy } = gestureState;
          return Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy);
        },
        onPanResponderGrant: () => {
          dragX.setValue(0);
        },
        onPanResponderMove: Animated.event([null, { dx: dragX }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -40) {
            Animated.timing(dragX, {
              toValue: -screenWidth,
              duration: 160,
              useNativeDriver: false,
            }).start(() => onSwipe?.('next'));
          } else if (gestureState.dx > 40) {
            Animated.timing(dragX, {
              toValue: screenWidth,
              duration: 160,
              useNativeDriver: false,
            }).start(() => onSwipe?.('prev'));
          } else {
            Animated.spring(dragX, {
              toValue: 0,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [dragX, onSwipe, screenWidth]
  );

  useEffect(() => {
    if (activeCategory === displayCategory) return;

    const currentIndex = CATEGORIES.findIndex((category) => category.key === displayCategory);
    const nextIndex = CATEGORIES.findIndex((category) => category.key === activeCategory);
    transitionDirectionRef.current = nextIndex >= currentIndex ? 1 : -1;
    previousCategoryRef.current = displayCategory;
    setPreviousCategory(displayCategory);
    setDisplayCategory(activeCategory);
    dragX.setValue(0);
    transition.setValue(0);

    Animated.spring(transition, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 11,
    }).start(() => {
      setPreviousCategory(null);
      previousCategoryRef.current = activeCategory;
    });
  }, [activeCategory, displayCategory, dragX, transition]);

  const scale = dragX.interpolate({
    inputRange: [-screenWidth, -screenWidth * 0.35, 0, screenWidth * 0.35, screenWidth],
    outputRange: [0.94, 0.975, 1, 0.975, 0.94],
    extrapolate: 'clamp',
  });
  const rotate = dragX.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: ['-3deg', '0deg', '3deg'],
    extrapolate: 'clamp',
  });
  const dragOpacity = dragX.interpolate({
    inputRange: [-screenWidth * 0.6, 0, screenWidth * 0.6],
    outputRange: [0.86, 1, 0.86],
    extrapolate: 'clamp',
  });

  const renderOverview = () => (
    <View style={[styles.scoreRow, isCompactScreen && styles.scoreRowCompact]}>
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

      <TouchableOpacity style={styles.chartCard} onPress={() => navigation.navigate('GlucoseMonitor')}>
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
            <Path d={trendPath} stroke="#825CFF" strokeWidth="3" fill="none" />
            <Path
              d={`${trendPath} L${chartWidth * 0.48},${chartHeight * 0.8} L0,${chartHeight * 0.8} Z`}
              fill="url(#fade)"
            />
            <Circle cx={chartWidth * 0.48} cy="28" r="5" fill="#825CFF" />
          </Svg>
        ) : (
          <View style={styles.emptyTrendCard}>
            <MaterialCommunityIcons name="chart-line" size={28} color="#C4B5FD" />
            <Text style={styles.emptyTrendText}>
              {isLogLoading ? 'Loading glucose records...' : 'Add a glucose reading to see your trend.'}
            </Text>
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
  );

  const renderGlucose = () => (
    <TouchableOpacity style={styles.chartCard} onPress={() => navigation.navigate('GlucoseMonitor')}>
      <Text style={styles.chartTitle}>Glucose Monitor</Text>
      <Text style={styles.chartSub}>Your glucose trend and readings</Text>

      {trendPath ? (
        <Svg width={chartWidth * 0.8} height={chartHeight}>
          <Defs>
            <LinearGradient id="glucoseFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#825CFF" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#825CFF" stopOpacity="0.02" />
            </LinearGradient>
          </Defs>
          <Path d={trendPath} stroke="#825CFF" strokeWidth="3" fill="none" />
          <Path d={`${trendPath} L${chartWidth * 0.8},${chartHeight} L0,${chartHeight} Z`} fill="url(#glucoseFade)" />
        </Svg>
      ) : (
        <View style={styles.emptyTrendCard}>
          <MaterialCommunityIcons name="chart-line" size={28} color="#C4B5FD" />
          <Text style={styles.emptyTrendText}>Add a glucose reading to see your trend.</Text>
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
  );

  const renderSleep = () => (
    <TouchableOpacity style={styles.sleepCard} onPress={() => navigation.navigate('SleepInsights')}>
      <View style={styles.sleepHeader}>
        <MaterialCommunityIcons name="sleep" size={20} color="#6D28D9" />
        <Text style={styles.sleepTitle}>Sleep Insights</Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
      </View>

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
        <Text style={styles.sleepTime}>🛏 {sleepBedTime}</Text>
        <Text style={styles.sleepTime}>☀️ {sleepWakeTime}</Text>
      </View>

      <View style={styles.sleepStatsRow}>
        <View style={styles.sleepStat}>
          <Text style={styles.sleepStatValue}>{lastSleepLog ? sleepFormatted : '--'}</Text>
          <Text style={styles.sleepStatLabel}>Total Sleep</Text>
        </View>
        <View style={styles.sleepDivider} />
        <View style={styles.sleepStat}>
          <Text style={styles.sleepStatValue}>{lastSleepLog?.efficiency || sleepEfficiency || '--'}%</Text>
          <Text style={styles.sleepStatLabel}>Efficiency</Text>
        </View>
        <View style={styles.sleepDivider} />
        <View style={styles.sleepStat}>
          <Text style={[styles.sleepStatValue, { color: lastSleepLog ? '#10B981' : '#9CA3AF' }]}>
            {lastSleepLog?.status || sleepStatus || 'No data'}
          </Text>
          <Text style={styles.sleepStatLabel}>Status</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActivity = () => (
    <View style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <MaterialCommunityIcons name="run" size={20} color="#0284C7" />
        <Text style={styles.activityTitle}>Activity Tracker</Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
      </View>
      <View style={styles.activityStatsRow}>
        <View style={styles.activityStat}>
          <Text style={styles.activityStatValue}>{activitySteps || '0'}</Text>
          <Text style={styles.activityStatLabel}>Steps Today</Text>
        </View>
        <View style={styles.activityDivider} />
        <View style={styles.activityStat}>
          <Text style={styles.activityStatValue}>{exerciseLogs.length || '0'}</Text>
          <Text style={styles.activityStatLabel}>Activities</Text>
        </View>
        <View style={styles.activityDivider} />
        <View style={styles.activityStat}>
          <Text style={styles.activityStatValue}>{exerciseLogs.reduce((sum, log) => sum + (Number(log.value) || 0), 0) || '0'}</Text>
          <Text style={styles.activityStatLabel}>Minutes</Text>
        </View>
      </View>
    </View>
  );

  const renderBMI = () => (
    <View style={styles.bmiCard}>
      <View style={styles.bmiHeader}>
        <MaterialCommunityIcons name="scale-bathroom" size={20} color="#059669" />
        <Text style={styles.bmiTitle}>Body Composition</Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
      </View>
      <View style={styles.bmiStatsRow}>
        <View style={styles.bmiStat}>
          <Text style={styles.bmiStatValue}>{bmiValue ?? '--'}</Text>
          <Text style={styles.bmiStatLabel}>BMI</Text>
        </View>
        <View style={styles.bmiDivider} />
        <View style={styles.bmiStat}>
          <Text style={styles.bmiStatValue}>{'--'}</Text>
          <Text style={styles.bmiStatLabel}>Weight (kg)</Text>
        </View>
        <View style={styles.bmiDivider} />
        <View style={styles.bmiStat}>
          <Text style={[styles.bmiStatValue, { fontSize: 14 }]}>{getBMIStatus(bmiValue)}</Text>
          <Text style={styles.bmiStatLabel}>Status</Text>
        </View>
      </View>
    </View>
  );

  const renderCategory = (category) => {
    switch (category) {
      case 'overview': return renderOverview();
      case 'glucose': return renderGlucose();
      case 'sleep': return renderSleep();
      case 'activity': return renderActivity();
      case 'bmi': return renderBMI();
      case 'nutrition':
      default:
        return (
          <TouchableOpacity style={styles.nutritionCard} onPress={() => navigation.navigate('NutritionInsights')}>
            <View style={[styles.nutritionHeader, isCompactScreen && styles.nutritionHeaderCompact]}>
              <View>
                <Text style={styles.nutritionTitle}>Nutrition</Text>
                <Text style={styles.nutritionSub}>{nutritionSummary}</Text>
              </View>
              <TouchableOpacity
                style={[styles.logFoodBtn, isCompactScreen && styles.logFoodBtnCompact]}
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
        );
    }
  };

  const incomingTranslateX = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [transitionDirectionRef.current * 22, 0],
  });
  const incomingOpacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const outgoingTranslateX = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -transitionDirectionRef.current * 18],
  });
  const outgoingOpacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const outgoingDimOpacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.14],
  });
  const outgoingShadowOpacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.02],
  });

  return (
    <Animated.View style={{ transform: [{ translateX: dragX }, { scale }, { rotate }], opacity: dragOpacity }} {...panResponder.panHandlers}>
      <View style={styles.topSwitchStage}>
        {previousCategory && previousCategory !== displayCategory && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.topSwitchLayer,
              {
                opacity: outgoingOpacity,
                transform: [{ translateX: outgoingTranslateX }],
                shadowOpacity: outgoingShadowOpacity,
                zIndex: 0,
              },
            ]}
          >
            <Animated.View pointerEvents="none" style={[styles.topSwitchDim, { opacity: outgoingDimOpacity }]} />
            {renderCategory(previousCategory)}
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.topSwitchLayer,
            {
              opacity: incomingOpacity,
              transform: [{ translateX: incomingTranslateX }],
              shadowOpacity: 0.08,
              zIndex: 1,
            },
          ]}
        >
          <View pointerEvents="none" style={styles.topSwitchDim} />
          {renderCategory(displayCategory)}
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// ─── Mini Stat Card ───────────────────────────────────────────────────────────
const MiniStatCard = ({ icon, iconColor, iconBg, title, value, sub, onPress, style }) => (
  <TouchableOpacity onPress={onPress} style={[miniStyles.card, style]}>
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
    backgroundColor: '#FAFAF9',
    borderRadius: 20,
    padding: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E7EAF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
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
const ActionCard = ({ title, desc, icon, color, iconColor, onPress, style }) => (
  <PressableScale onPress={onPress} style={[actionStyles.card, style]}>
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
    backgroundColor: '#FAFAF9',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7EAF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
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
  const { logs: rawLogs, loading: logsLoading } = useUserLogs(60);
  const [showAIInsight, setShowAIInsight] = useState(false);
  const [activeCategory, setActiveCategory] = useState('overview');
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isCompactScreen = screenWidth < 390;
  const isWideScreen = screenWidth >= 768;

  // Ensure logs is always an array to prevent crashes
  const logs = Array.isArray(rawLogs) ? rawLogs : [];

  const chartWidth = screenWidth - (isCompactScreen ? 72 : 88);
  const chartHeight = 100;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning 👋';
    if (h < 17) return 'Good afternoon 👋';
    return 'Good evening 👋';
  };

  const glucoseLogs = useMemo(
    () => {
      if (!Array.isArray(logs)) return [];
      return logs.filter((log) => log?.type === 'glucose').slice(0, 7);
    },
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
    () => {
      if (!Array.isArray(logs)) return [];
      return logs.filter((log) => log?.timestamp && getDateKey(log.timestamp) === getDateKey(new Date()));
    },
    [logs]
  );
  const progressPercent = Math.min(100, todayLogs.length * 25);
  const logStreak = useMemo(() => getConsecutiveLogDays(logs), [logs]);
  const mealLogs = useMemo(
    () => {
      if (!Array.isArray(logs)) return [];
      return logs.filter((log) => log?.type === 'meal').slice(0, 20);
    },
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
    () => {
      if (!Array.isArray(logs)) return [];
      return logs.filter((log) => log?.type === 'sleep').slice(0, 10);
    },
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
    () => {
      if (!Array.isArray(logs)) return [];
      return logs.filter((log) => log?.type === 'exercise').slice(0, 20);
    },
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

  const profileFocus = useMemo(() => getProfileFocus(userData || {}), [userData]);
  const calorieTarget = useMemo(() => getCalorieTarget(userData || {}), [userData]);
  const dailyPlanItems = useMemo(
    () => getDailyPlanItems(userData || {}, Boolean(glucoseValues.length)),
    [userData, glucoseValues.length]
  );
  const insightMessage = useMemo(
    () => getInsightMessage(userData || {}, latestGlucose),
    [userData, latestGlucose]
  );
  const nutritionSummary = useMemo(
    () => getNutritionSummary(userData || {}, mealTotals, calorieTarget),
    [userData, mealTotals, calorieTarget]
  );

  const getBMIStatus = (bmi) => {
    if (!bmi) return 'Not set';
    bmi = Number(bmi);
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Healthy range';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

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
  };

  const handleTopSwipe = (direction) => {
    const categoryKeys = CATEGORIES.map((category) => category.key);
    const currentIndex = categoryKeys.indexOf(activeCategory);
    const nextIndex = direction === 'next'
      ? Math.min(currentIndex + 1, categoryKeys.length - 1)
      : Math.max(currentIndex - 1, 0);

    if (nextIndex !== currentIndex) {
      setActiveCategory(categoryKeys[nextIndex]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 18,
              paddingHorizontal: isCompactScreen ? 16 : 20,
            },
          ]}
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

          {/* ── Top area: slides between categories but keeps lower content intact ── */}
          <TopSwitcher
            activeCategory={activeCategory}
            isCompactScreen={isCompactScreen}
            chartWidth={chartWidth}
            chartHeight={chartHeight}
            healthSummary={healthSummary}
            trendPath={trendPath}
            latestGlucose={latestGlucose}
            mealTotals={mealTotals}
            nutritionSummary={nutritionSummary}
            calorieTarget={calorieTarget}
            proteinTarget={proteinTarget}
            carbTarget={carbTarget}
            fatTarget={fatTarget}
            lastSleepLog={lastSleepLog}
            sleepFormatted={sleepFormatted}
            sleepEfficiency={sleepEfficiency}
            sleepStatus={sleepStatus}
            sleepBedTime={sleepBedTime}
            sleepWakeTime={sleepWakeTime}
            exerciseLogs={exerciseLogs}
            activitySteps={activitySteps}
            bmiValue={bmiValue}
            userWeight={userData?.currentWeight}
            navigation={navigation}
            isLogLoading={isLogLoading}
            screenWidth={screenWidth}
            onSwipe={handleTopSwipe}
          />

          {/* ── Quick Action Buttons ── */}
          <View style={[styles.mainActions, isCompactScreen && styles.mainActionsCompact]}>
            <TouchableOpacity
              style={[styles.darkBtn, isCompactScreen && styles.fullWidthBtn]}
              onPress={() => navigation.navigate('GlucoseEntry')}
            >
              <MaterialCommunityIcons name="diabetes" size={20} color="#FFF" />
              <Text style={styles.darkBtnText}>Log Glucose</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.lightBtn, isCompactScreen && styles.fullWidthBtn]}
              onPress={() => setShowAIInsight(true)}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={18} color="#7C3AED" />
              <Text style={styles.lightBtnText}>AI Insight</Text>
            </TouchableOpacity>
          </View>
          

          {/* ── Mini Stats Row ── */}
          <View>
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
              style={{ width: isCompactScreen ? (screenWidth - 48) / 2 : (screenWidth - 56) / 3 }}
              onPress={() => navigation.navigate('SleepInsights')}
            />
            <MiniStatCard
              icon="food-apple"
              iconColor="#D97706"
              iconBg="#FEF3C7"
              title="Calories"
              value={mealTotals.calories || '--'}
              sub={mealTotals.calories ? ` of ${calorieTarget} kcal` : 'Log meals'}
              style={{ width: isCompactScreen ? (screenWidth - 48) / 2 : (screenWidth - 56) / 3 }}
              onPress={() => navigation.navigate('NutritionInsights')}
            />
            <MiniStatCard
              icon="run"
              iconColor="#0284C7"
              iconBg="#E0F2FE"
              title="Activity"
              value={activitySteps || '0'}
              sub="steps today"
              style={{ width: isCompactScreen ? (screenWidth - 48) / 2 : (screenWidth - 56) / 3 }}
              onPress={() => navigation.navigate('ActivityTracker')}
            />
            <MiniStatCard
              icon="scale-bathroom"
              iconColor="#059669"
              iconBg="#D1FAE5"
              title="BMI"
              value={bmiValue ?? '--'}
              sub={getBMIStatus(bmiValue)}
              style={{ width: isCompactScreen ? (screenWidth - 48) / 2 : (screenWidth - 56) / 3 }}
              onPress={() => navigation.navigate('BodyComposition')}
            />
          </ScrollView>
          </View>

          {/* ── Nutrition Summary ── */}
           {activeCategory === 'nutrition' && (
          <TouchableOpacity
            style={styles.nutritionCard}
            onPress={() => navigation.navigate('NutritionInsights')}
          >
            <View style={[styles.nutritionHeader, isCompactScreen && styles.nutritionHeaderCompact]}>
              <View>
                <Text style={styles.nutritionTitle}>Nutrition</Text>
                <Text style={styles.nutritionSub}>{nutritionSummary}</Text>
              </View>
              <TouchableOpacity
                style={[styles.logFoodBtn, isCompactScreen && styles.logFoodBtnCompact]}
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
           )}

          {/* ── Sleep Summary ── */}
           {activeCategory === 'sleep' && (
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
           )}

          {/* ── AI Tip ── */}
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <MaterialCommunityIcons name="lightning-bolt" size={22} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Optimal Window</Text>
              <Text style={styles.insightDesc}>{insightMessage}</Text>
            </View>
          </View>

          {/* ── Personalized Setup Summary ── */}
          <View style={styles.profileSummaryCard}>
            <View style={styles.profileSummaryHeader}>
              <View style={styles.profileSummaryIcon}>
                <MaterialCommunityIcons name="account-heart" size={22} color="#825CFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileSummaryTitle}>Your setup at a glance</Text>
                <Text style={styles.profileSummaryText}>{profileFocus.message}</Text>
              </View>
            </View>
            <View style={styles.profileChipsRow}>
              {profileFocus.chips.length ? (
                profileFocus.chips.map((item) => (
                  <View key={item} style={styles.profileChip}>
                    <Text style={styles.profileChipText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.profileSummaryMuted}>Complete setup to unlock personalized guidance.</Text>
              )}
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
            {dailyPlanItems.map((text, index) => (
              <PlanItem key={text} text={text} done={index === 0} />
            ))}
          </View>

          {/* ── Quick Access Grid ── */}
                   
           {activeCategory === 'overview' && (
          <View>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={[styles.grid, isCompactScreen && styles.gridCompact, isWideScreen && styles.gridWide]}>
            <ActionCard
              title="Academy"
              desc="Reversal lessons"
              icon="school"
              color="#FEF3FF"
              iconColor="#8B5CF6"
              style={{ width: isCompactScreen ? '100%' : '48%' }}
              onPress={() => navigation.navigate('Education')}
            />
            <ActionCard
              title="AI Meal Scan"
              desc="Snap & analyse"
              icon="camera"
              color="#FFF7ED"
              iconColor="#C2410C"
              style={{ width: isCompactScreen ? '100%' : '48%' }}
              onPress={() => navigation.navigate('MealAnalyser')}
            />
            <ActionCard
              title="Glucose"
              desc="View full chart"
              icon="chart-line"
              color="#EDE9FE"
              iconColor="#7C3AED"
              style={{ width: isCompactScreen ? '100%' : '48%' }}
              onPress={() => navigation.navigate('GlucoseMonitor')}
            />
            <ActionCard
              title="Body Comp"
              desc="Weight & BMI"
              icon="scale-bathroom"
              color="#D1FAE5"
              iconColor="#059669"
              style={{ width: isCompactScreen ? '100%' : '48%' }}
              onPress={() => navigation.navigate('BodyComposition')}
            />
            <ActionCard
              title="Health Sync"
              desc="Google Fit"
              icon="sync"
              color="#E0F2FE"
              iconColor="#0284C7"
              style={{ width: isCompactScreen ? '100%' : '48%' }}
              onPress={() => navigation.navigate('HealthIntegration')}
            />
            <ActionCard
              title="Smart Meals"
              desc="Log & track"
              icon="food-apple"
              color="#F0FDF4"
              iconColor="#166534"
              style={{ width: isCompactScreen ? '100%' : '48%' }}
              onPress={() => navigation.navigate('MealEntry')}
            />
            <ActionCard
              title="Exercise"
              desc="12 min walk"
              icon="run"
              color="#EFF6FF"
              iconColor="#1D4ED8"
              style={{ width: isCompactScreen ? '100%' : '48%' }}
              onPress={() => navigation.navigate('ExerciseEntry')}
            />
          </View>
          </View>
           )}
        </ScrollView>
      </AnimatedScreen>

      <AIInsightModal
        visible={showAIInsight}
        onClose={() => setShowAIInsight(false)}
        userData={userData}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAE9F0' },
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
  scoreRowCompact: { flexDirection: 'column' },

  scoreCard: {
    flex: 1,
    backgroundColor: '#FAFAF9',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7E9FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreCardTitle: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 10 },
  shareBtn: { position: 'absolute', top: 12, left: 12 },
  scoreMotivation: { fontSize: 11, color: '#6B7280', marginTop: 8 },

  chartCard: {
    flex: 1,
    backgroundColor: '#FAFAF9',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
  mainActionsCompact: { flexDirection: 'column', marginBottom: 20 },
  darkBtn: {
    width: '48%', height: 52, borderRadius: 26,
    backgroundColor: '#7C3AED', flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  fullWidthBtn: { width: '100%', marginBottom: 10 },
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
    backgroundColor: '#FAFAF9', borderRadius: 24, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#E7EAF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  nutritionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  nutritionHeaderCompact: { flexDirection: 'column', alignItems: 'flex-start', gap: 10 },
  nutritionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  nutritionSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  logFoodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#7C3AED', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  logFoodBtnCompact: { alignSelf: 'stretch', justifyContent: 'center' },
  logFoodText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  calRow: { flexDirection: 'row', alignItems: 'center' },
  calText: { fontSize: 18, fontWeight: '800', color: '#111827', marginLeft: 6 },
  calOf: { fontSize: 13, color: '#9CA3AF' },

  // Sleep Card
  sleepCard: {
    backgroundColor: '#FAFAF9', borderRadius: 24, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#E7EAF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    flexDirection: 'row', backgroundColor: '#FAFAF9', borderRadius: 24,
    padding: 18, marginBottom: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#E7E9FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  insightIcon: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  insightTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  insightDesc: { marginTop: 4, color: '#6B7280', lineHeight: 18, fontSize: 13 },

  profileSummaryCard: {
    backgroundColor: '#FAFAF9',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E7EAF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  profileSummaryHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  profileSummaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSummaryTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  profileSummaryText: { fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 17 },
  profileChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  profileChip: {
    backgroundColor: '#F5F3FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  profileChipText: { fontSize: 12, color: '#6D28D9', fontWeight: '700' },
  profileSummaryMuted: { fontSize: 12, color: '#9CA3AF' },

  // Progress
  progressCard: {
    backgroundColor: '#7C3AED', borderRadius: 28, padding: 20, marginBottom: 16,
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
    backgroundColor: '#FAFAF9', borderRadius: 28, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: '#E7EAF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  planTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 14 },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCompact: { justifyContent: 'flex-start' },
  gridWide: { justifyContent: 'space-between' },
  topSwitchStage: {
    position: 'relative',
    minHeight: 230,
    marginBottom: 20,
  },
  topSwitchLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: '#FAFAF9',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  topSwitchDim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: '#EAE9F0',
  },

  // Activity Card
  activityCard: {
    backgroundColor: '#FAFAF9', borderRadius: 24, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: '#E7EAF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  activityTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  activityStatsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  activityStat: { alignItems: 'center' },
  activityStatValue: { fontSize: 16, fontWeight: '800', color: '#111827' },
  activityStatLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  activityDivider: { width: 1, height: 36, backgroundColor: '#F3F4F6' },

  // BMI Card
  bmiCard: {
    backgroundColor: '#FAFAF9', borderRadius: 24, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: '#E7EAF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  bmiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  bmiTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  bmiStatsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  bmiStat: { alignItems: 'center' },
  bmiStatValue: { fontSize: 16, fontWeight: '800', color: '#111827' },
  bmiStatLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  bmiDivider: { width: 1, height: 36, backgroundColor: '#F3F4F6' },
});