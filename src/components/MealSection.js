// src/components/MealSection.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MealCard from './MealCard';

export default function MealSection() {
  const meals = [
    {
      name: 'Breakfast',
      calories: 420,
      time: '8:30 AM',
      recommended: false,
      items: 'Oatmeal with berries',
    },
    {
      name: 'Lunch',
      calories: 580,
      time: '12:45 PM',
      recommended: true,
      items: 'Grilled chicken salad with quinoa',
    },
    {
      name: 'Dinner',
      calories: 620,
      time: '7:00 PM',
      recommended: false,
      items: 'Planned for later',
    },
  ];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Meals</Text>
        <Text style={styles.subtitle}>Log meals to track carb intake</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {meals.map((meal, index) => (
          <MealCard key={index} {...meal} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  scrollView: {
    paddingLeft: 20,
  },
});