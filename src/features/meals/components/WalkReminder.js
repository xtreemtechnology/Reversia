import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const WalkReminder = ({ completedCount }) => {
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
