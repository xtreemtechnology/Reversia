// src/features/onboarding/components/OnboardingProgress.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';

export const OnboardingProgress = ({ current, total = 8 }) => (
  <Text style={styles.progressText}>
    <Text style={styles.progressActive}>{current}</Text> / {total}
  </Text>
);

const styles = StyleSheet.create({
  progressText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
    fontWeight: '600',
  },
  progressActive: {
    color: '#7C3AED',
  },
});
