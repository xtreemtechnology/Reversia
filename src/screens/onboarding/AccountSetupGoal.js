import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, AntDesign, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

// 1. FIREBASE IMPORTS
import { auth, db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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
      icon: <FontAwesome5 name="dumbbell" size={24} color="#825CFF" />,
    },
    {
      id: 'healthy',
      title: 'Stay Healthy Daily',
      icon: <Ionicons name="heart" size={28} color="#3AB0FF" />,
    },
  ];

  // 2. FIREBASE SAVE LOGIC
  const handleContinue = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          mainGoal: selectedGoal,
          onboardingStep: 6,
          updatedAt: new Date().toISOString(),
        });
        navigation.navigate('AccountSetupHealthStatus');
      }
    } catch (error) {
      console.log("Error saving goal:", error);
      Alert.alert("Error", "We couldn't save your goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.skipButton} />
      </View>

      <View style={styles.content}>
        {/* Progress Indicator */}
        <Text style={styles.progressText}>
          <Text style={styles.progressActive}>6</Text> / 8
        </Text>

        <Text style={styles.title}>What is your main goal?</Text>
        <Text style={styles.subtitle}>
          We’ll tailor your Reversia protocol to match this priority.
        </Text>

        {/* Goal Selection List */}
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
                  <Ionicons name="checkmark-circle" size={24} color="#825CFF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, loading && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueText}>Continue</Text>
              <AntDesign name="arrowright" size={20} color="#FFF" style={styles.icon} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: { padding: 8 },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skipText: { fontSize: 14, color: '#000', fontWeight: '500' },
  content: { flex: 1, paddingHorizontal: 25, paddingTop: 40 },
  progressText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
    fontWeight: '600',
    textAlign: 'center'
  },
  progressActive: { color: '#825CFF' },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#825CFF',
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  selectedCard: {
    borderColor: '#825CFF',
    backgroundColor: '#F3F0FF',
    borderWidth: 2,
    elevation: 0,
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
    color: '#825CFF',
  },
  footer: { paddingHorizontal: 25, paddingBottom: 40 },
  continueButton: {
    backgroundColor: '#825CFF',
    height: 65,
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  continueText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  icon: { marginLeft: 10 },
});