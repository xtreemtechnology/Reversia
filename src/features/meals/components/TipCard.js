import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DAILY_TIPS = [
  'Eating in the correct order — Fiber → Protein → Carbs — can reduce your glucose spike by up to 75%.',
  'A 10-minute walk after meals can lower post-meal blood sugar by up to 22%.',
  'Chewing slowly activates gut hormones that improve insulin response before the food is even digested.',
  'Vinegar before a carb-heavy meal blunts the glucose curve — try 1 tbsp in water.',
  'Cold or reheated rice has more resistant starch, which feeds gut bacteria and lowers GI.',
  'Starting your meal with vegetables coats the gut and slows glucose absorption significantly.',
  'Staying hydrated before meals improves satiety and reduces overeating by up to 20%.',
];

export const TipCard = ({ dayIndex }) => {
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
