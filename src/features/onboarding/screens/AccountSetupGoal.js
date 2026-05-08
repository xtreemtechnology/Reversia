// src/features/onboarding/screens/AccountSetupGoal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { OnboardingHeader } from '../components/OnboardingHeader';
import { OnboardingProgress } from '../components/OnboardingProgress';
import { ContinueButton } from '../components/ContinueButton';
import { saveHealthGoal } from '../services/onboardingService';

export default function AccountSetupGoal({ navigation }) {
  const [selectedGoal, setSelectedGoal] = useState('prevent');
  const [loading, setLoading] = useState(false);

  const goals = [
    {
      id: 'reverse',
      title: 'Reverse Diabetes Naturally',
      icon: <MaterialCommunityIcons name="leaf" size={28} color="#FF5C5C" />,
    },
    {
      id: 'prevent',
      title: 'Prevent Diabetes Early',
      icon: <FontAwesome5 name="dumbbell" size={24} color="#7C3AED" />,
    },
    {
      id: 'healthy',
      title: 'Stay Healthy Daily',
      icon: <Ionicons name="heart" size={28} color="#3AB0FF" />,
    },
  ];

  const handleContinue = async () => {
    try {
      setLoading(true);
      await saveHealthGoal(selectedGoal);
      navigation.navigate('AccountSetupHealthStatus');
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <OnboardingProgress current={6} />
        <Text style={styles.title}>What is your main goal?</Text>
        <Text style={styles.subtitle}>
          We'll tailor your Reversia protocol to match this priority.
        </Text>

        <View style={styles.listContainer}>
          {goals.map((item) => {
            const isSelected = selectedGoal === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => setSelectedGoal(item.id)}
                style={[
                  styles.goalCard,
                  isSelected && styles.selectedCard
                ]}
                disabled={loading}
              >
                <View style={styles.goalInfo}>
                  <View style={styles.iconWrapper}>
                    {item.icon}
                  </View>
                  <Text style={[styles.goalLabel, isSelected && styles.selectedLabel]}>
                    {item.title}
                  </Text>
                </View>
                
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color="#7C3AED" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <ContinueButton onPress={handleContinue} loading={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 25, paddingTop: 40 },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  listContainer: { width: '100%' },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F0FF',
    borderWidth: 2,
  },
  goalInfo: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  goalLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4B5563',
  },
  selectedLabel: {
    color: '#7C3AED',
  },
  footer: { paddingHorizontal: 25, paddingBottom: 40 },
});
