import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export const MealCard = ({ meal, isDone, onToggle, onNavigate }) => (
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
        <MaterialCommunityIcons name="swap-vertical" size={14} color="#7C3AED" />
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
        <MaterialCommunityIcons name="pencil-plus" size={14} color="#7C3AED" />
        <Text style={mealStyles.logBtnText}>Log</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const mealStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FAFAF9', borderRadius: 28,
    padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
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
  typeText:  { color: '#7C3AED', fontSize: 11, fontWeight: '800' },
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
  seqLabel: { fontSize: 9, fontWeight: '900', color: '#7C3AED', letterSpacing: 0.8 },
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
  logBtnText: { fontSize: 13, fontWeight: '700', color: '#7C3AED' },
});
