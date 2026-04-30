import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function MealPlanScreen({ navigation }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedMeals, setCompletedMeals] = useState([]); // Track eaten meals

  const toggleMeal = (id) => {
    if (completedMeals.includes(id)) {
      setCompletedMeals(completedMeals.filter(m => m !== id));
    } else {
      setCompletedMeals([...completedMeals, id]);
      // Logic to trigger the "10-min Walk" timer on Home would go here
    }
  };

  const meals = [
    {
      id: 1,
      type: 'Breakfast',
      title: 'Oat Porridge with Seeds',
      fiber: '8g Fiber',
      gi: 'Low GI',
      giColor: '#BBF7D0',
      sequence: 'Seeds first → Oats',
      isCEORecommended: true, // Addy's Choice
      icon: 'bowl-mix'
    },
    {
      id: 2,
      type: 'Lunch',
      title: 'Ofada Rice + Okra Soup',
      fiber: '12g Fiber',
      gi: 'Med GI',
      giColor: '#FEF3C7',
      sequence: 'Okra soup first → Rice',
      isCEORecommended: false,
      icon: 'food-variant'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 1. WATER BALANCE PROGRESS (Added) */}
        <View style={styles.waterTracker}>
          <View style={styles.waterInfo}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <MaterialCommunityIcons name="water" size={20} color="#0EA5E9" />
              <Text style={styles.waterTitle}>Hydration Balance</Text>
            </View>
            <Text style={styles.waterCount}>5 / 8 Glasses</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '62.5%' }]} />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Meal Plan</Text>
          <TouchableOpacity style={styles.calBtn}>
            <Ionicons name="calendar" size={20} color="#825CFF" />
          </TouchableOpacity>
        </View>

        {/* Reversal Menu Section */}
        <Text style={styles.sectionTitle}>Reversal Menu</Text>

        {meals.map((meal) => {
          const isDone = completedMeals.includes(meal.id);
          return (
            <TouchableOpacity 
              key={meal.id} 
              style={[styles.mealCard, isDone && styles.completedCard]}
              onPress={() => toggleMeal(meal.id)}
            >
              {/* 2. CEO RECOMMENDATION BADGE (Added) */}
              {meal.isCEORecommended && (
                <View style={styles.ceoBadge}>
                  <MaterialCommunityIcons name="star-decagram" size={14} color="#FFF" />
                  <Text style={styles.ceoText}>ADDY'S CHOICE</Text>
                </View>
              )}

              <View style={styles.mealHeader}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{meal.type}</Text>
                </View>
                {/* 3. INTERACTIVE CHECK-OFF (Added) */}
                <Ionicons 
                  name={isDone ? "checkmark-circle" : "ellipse-outline"} 
                  size={28} 
                  color={isDone ? "#10B981" : "#E5E7EB"} 
                />
              </View>

              <View style={styles.mealBody}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name={meal.icon} size={32} color={isDone ? "#9CA3AF" : "#825CFF"} />
                </View>
                <View style={styles.mealInfo}>
                  <Text style={[styles.mealTitle, isDone && styles.strikeText]}>{meal.title}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.fiberText}>{meal.fiber}</Text>
                    <View style={[styles.giBadge, { backgroundColor: meal.giColor }]}>
                      <Text style={styles.giText}>{meal.gi}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* 4. METABOLIC SEQUENCING (Added) */}
              <View style={styles.sequenceBox}>
                <Text style={styles.sequenceLabel}>METABOLIC ORDER:</Text>
                <Text style={styles.sequenceValue}>{meal.sequence}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Reversal Secret Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Reversal Secret</Text>
          <Text style={styles.tipText}>
            Eating in the correct order (Fiber → Protein → Carbs) can reduce your glucose spike by up to 75%.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20, paddingBottom: 110 },
  waterTracker: { backgroundColor: '#FFF', padding: 16, borderRadius: 24, marginBottom: 25, borderWidth: 1, borderColor: '#E0F2FE' },
  waterInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  waterTitle: { fontSize: 14, fontWeight: '700', color: '#0369A1', marginLeft: 6 },
  waterCount: { fontSize: 13, fontWeight: '800', color: '#0EA5E9' },
  progressBarBg: { height: 8, backgroundColor: '#F0F9FF', borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: '#0EA5E9', borderRadius: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  calBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 15 },
  mealCard: { backgroundColor: '#FFF', borderRadius: 28, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6', elevation: 2, position: 'relative', overflow: 'hidden' },
  completedCard: { opacity: 0.8, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  ceoBadge: { position: 'absolute', top: 0, left: 0, backgroundColor: '#FFB02E', paddingHorizontal: 12, paddingVertical: 4, borderBottomRightRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 4 },
  ceoText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  typeBadge: { backgroundColor: '#F3F4FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { color: '#825CFF', fontSize: 11, fontWeight: '800' },
  mealBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  mealTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  strikeText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  fiberText: { fontSize: 12, color: '#10B981', fontWeight: '700', marginRight: 10 },
  giBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  giText: { fontSize: 10, fontWeight: '800' },
  sequenceBox: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15 },
  sequenceLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', marginBottom: 2 },
  sequenceValue: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  tipCard: { backgroundColor: '#EEF2FF', borderRadius: 24, padding: 20, marginTop: 10 },
  tipTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#4338CA', lineHeight: 20 }
});