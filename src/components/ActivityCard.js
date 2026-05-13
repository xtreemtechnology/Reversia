// src/components/ActivityCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ActivityCard({ type, title, duration, calories, icon }) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={28} color="#6366f1" />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={14} color="#9ca3af" />
          <Text style={styles.statText}>{duration}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="flame-outline" size={14} color="#9ca3af" />
          <Text style={styles.statText}>{calories} cal</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    width: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  stats: {
    gap: 4,
    marginBottom: 12,
    width: '100%',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  startButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
});