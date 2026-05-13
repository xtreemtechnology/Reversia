// src/components/MealCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MealCard({ name, calories, time, recommended, items }) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.mealName}>{name}</Text>
        {recommended && (
          <View style={styles.recommendedBadge}>
            <Ionicons name="leaf-outline" size={12} color="#10b981" />
            <Text style={styles.recommendedText}>Diabetes-Friendly</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.calories}>{calories} calories</Text>
      <Text style={styles.items}>{items}</Text>
      
      <View style={styles.footer}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={14} color="#9ca3af" />
          <Text style={styles.time}>{time}</Text>
        </View>
        <TouchableOpacity style={styles.logMealButton}>
          <Text style={styles.logMealText}>Log Meal</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  recommendedText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  calories: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 4,
  },
  items: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: '#9ca3af',
  },
  logMealButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logMealText: {
    fontSize: 11,
    color: '#6366f1',
    fontWeight: '600',
  },
});