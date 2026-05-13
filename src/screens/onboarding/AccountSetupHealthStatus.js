import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

// 1. FIREBASE IMPORTS
import { auth, db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function AccountSetupHealthStatus({ navigation }) {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const statuses = [
    { id: 'type2', title: 'Type 2 Diabetes' },
    { id: 'pre', title: 'Prediabetes' },
    { id: 'high', title: 'High Blood Sugar Concerns' },
    { id: 'prevent', title: 'Just Want Prevention' },
    { id: 'not_sure', title: 'Not Sure Yet' },
  ];

  // 2. FIREBASE SAVE LOGIC
  const handleContinue = async () => {
    if (!selectedStatus) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          healthStatus: selectedStatus,
          onboardingStep: 7,
          updatedAt: new Date().toISOString(),
        });
        navigation.navigate('AccountSetupReadiness');
      }
    } catch (error) {
      console.log("Error saving health status:", error);
      Alert.alert("Error", "We couldn't save your status. Please check your connection.");
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <Text style={styles.progressText}>
          <Text style={styles.progressActive}>7</Text> / 8
        </Text>

        <Text style={styles.title}>What best describes your current health status?</Text>
        <Text style={styles.subtitle}>
          This helps us tailor our health insights specifically for you.
        </Text>

        {/* Options List */}
        <View style={styles.listContainer}>
          {statuses.map((item) => {
            const isSelected = selectedStatus === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => setSelectedStatus(item.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.selectedCard
                ]}
                disabled={loading}
              >
                <Text style={[
                  styles.optionLabel,
                  isSelected && styles.selectedLabel
                ]}>
                  {item.title}
                </Text>
                
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color="#825CFF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!selectedStatus || loading) && styles.disabledButton
          ]}
          disabled={!selectedStatus || loading}
          onPress={handleContinue} 
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
  content: { paddingHorizontal: 25, paddingTop: 40, paddingBottom: 20 },
  progressText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
    fontWeight: '600',
    textAlign: 'center'
  },
  progressActive: { color: '#825CFF' },
  title: {
    fontSize: 28,
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
    marginBottom: 35,
    paddingHorizontal: 15,
  },
  listContainer: { width: '100%' },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    // Minimal shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    // Minimal elevation for Android
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#825CFF',
    backgroundColor: '#F3F0FF',
    borderWidth: 2,
    elevation: 0, // Remove elevation when selected to look flat
  },
  optionLabel: {
    fontSize: 16,
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
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  continueText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  icon: { marginLeft: 10 },
});