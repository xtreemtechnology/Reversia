// src/components/GlucoseCard.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function GlucoseCard({ value, unit, status, lastReading, trend, onLogPress }) {
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(1);
  
  const getStatusColor = () => {
    switch(status) {
      case 'Normal': return '#10b981';
      case 'High': return '#f59e0b';
      case 'Low': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  const getTrendIcon = () => {
    switch(trend) {
      case 'up': return 'arrow-up-outline';
      case 'down': return 'arrow-down-outline';
      default: return 'remove-outline';
    }
  };
  
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
      <View style={styles.gradientCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Blood Glucose</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>{status}</Text>
          </View>
        </View>
        
        <View style={styles.glucoseValueContainer}>
          <Text style={styles.glucoseValue}>{value}</Text>
          <Text style={styles.glucoseUnit}>{unit}</Text>
          <Ionicons name={getTrendIcon()} size={32} color={getStatusColor()} />
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.lastReading}>
            <Ionicons name="time-outline" size={16} color="#9ca3af" />
            <Text style={styles.lastReadingText}>Last reading: {lastReading}</Text>
          </View>
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onLogPress ? onLogPress : () => navigation.navigate('GlucoseEntry')}
            style={styles.logButton}
            activeOpacity={0.8}
          >
            <Text style={styles.logButtonText}>Log Reading</Text>
            <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  glucoseValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 24,
  },
  glucoseValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#111827',
  },
  glucoseUnit: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: '500',
    marginRight: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  lastReading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastReadingText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  logButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});