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
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

// 1. FIREBASE IMPORTS
import { auth, db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function AccountSetupReadiness({ navigation }) {
  const [selectedReadiness, setSelectedReadiness] = useState(null);
  const [loading, setLoading] = useState(false);

  const options = [
    { 
      id: 'starting', 
      title: 'Just Starting', 
      icon: <MaterialCommunityIcons name="seed-outline" size={28} color="#4ADE80" />,
      desc: 'I am taking my first steps toward health.'
    },
    { 
      id: 'momentum', 
      title: 'Building Momentum', 
      icon: <MaterialCommunityIcons name="speedometer" size={28} color="#FBBF24" />,
      desc: 'I am already making some changes.'
    },
    { 
      id: 'committed', 
      title: 'Fully Committed', 
      icon: <MaterialCommunityIcons name="fire" size={28} color="#EF4444" />,
      desc: 'I am ready to do whatever it takes.'
    },
  ];

  // 2. FIREBASE SAVE LOGIC
  const handleFinish = async () => {
    if (!selectedReadiness) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          readinessLevel: selectedReadiness,
          onboardingStep: 8,
          isOnboardingComplete: true, // Flag to indicate they're done
          updatedAt: new Date().toISOString(),
        });
        // Navigate to your generation/loading screen
        navigation.navigate('SetupGenerating');
      }
    } catch (error) {
      console.error("Error finalizing setup:", error);
      Alert.alert("Error", "Something went wrong saving your final step. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const user = auth.currentUser;
    if (!user) {
      navigation.replace('Login');
      return;
    }

    handleFinish();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.skipButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.progressText}>
          <Text style={styles.progressActive}>8</Text> / 8
        </Text>

        <Text style={styles.title}>How ready are you to improve your health?</Text>
        <Text style={styles.subtitle}>
          This helps us set the right pace for your daily goals.
        </Text>

        <View style={styles.listContainer}>
          {options.map((item) => {
            const isSelected = selectedReadiness === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => setSelectedReadiness(item.id)}
                style={[
                  styles.readinessCard,
                  isSelected && styles.selectedCard
                ]}
                disabled={loading}
              >
                <View style={styles.iconContainer}>
                  {item.icon}
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.optionTitle, isSelected && styles.selectedText]}>
                    {item.title}
                  </Text>
                  <Text style={styles.optionDesc}>{item.desc}</Text>
                </View>
                
                <View style={[styles.radioCircle, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!selectedReadiness || loading) && styles.disabledButton
          ]}
          disabled={!selectedReadiness || loading}
          onPress={handleFinish} 
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueText}>Finish Setup</Text>
              <AntDesign name="check" size={20} color="#FFF" style={styles.icon} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  backButton: { padding: 8 },
  skipButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  skipText: { fontSize: 14, color: '#000', fontWeight: '500' },
  content: { paddingHorizontal: 25, paddingTop: 40 },
  progressText: { fontSize: 16, color: '#9CA3AF', marginBottom: 20, fontWeight: '600', textAlign: 'center' },
  progressActive: { color: '#825CFF' },
  title: { fontSize: 28, fontWeight: '700', color: '#825CFF', textAlign: 'center', marginBottom: 15 },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 35 },
  listContainer: { width: '100%' },
  readinessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  selectedCard: { borderColor: '#825CFF', backgroundColor: '#F3F0FF', borderWidth: 2, elevation: 0 },
  iconContainer: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textContainer: { flex: 1 },
  optionTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 4 },
  optionDesc: { fontSize: 13, color: '#9CA3AF' },
  selectedText: { color: '#825CFF' },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#825CFF' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#825CFF' },
  footer: { paddingHorizontal: 25, paddingBottom: 40 },
  continueButton: { backgroundColor: '#825CFF', height: 65, borderRadius: 35, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#D1D5DB' },
  continueText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  icon: { marginLeft: 10 },
});