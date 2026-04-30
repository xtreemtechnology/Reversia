// src/components/WaterTracker.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WaterTracker({ current, target, onAddPress }) {
  const percentage = (current / target) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Water Intake</Text>
          <Text style={styles.subtitle}>Stay hydrated for better glucose control</Text>
        </View>
        <TouchableOpacity onPress={onAddPress} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={28} color="#6366f1" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.stats}>
        <Text style={styles.currentIntake}>{current}</Text>
        <Text style={styles.targetIntake}>/ {target} cups</Text>
      </View>
      
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
      
      <View style={styles.cupsContainer}>
        {[...Array(target)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.cupIcon,
              i < current && styles.cupIconFilled,
            ]}
          >
            <Ionicons
              name="water-outline"
              size={20}
              color={i < current ? '#ffffff' : '#cbd5e1'}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    padding: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currentIntake: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6366f1',
  },
  targetIntake: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  cupsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cupIcon: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cupIconFilled: {
    backgroundColor: '#6366f1',
  },
});