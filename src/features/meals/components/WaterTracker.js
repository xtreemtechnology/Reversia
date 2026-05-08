import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const WaterTracker = ({ glasses, goal, onTap }) => (
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
    backgroundColor: '#FAFAF9', borderRadius: 24,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: '#E0F2FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
