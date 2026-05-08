import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import PressableScale from '../components/PressableScale';
import AnimatedScreen from '../components/AnimatedScreen';
// Firebase Imports
import { auth, db } from '../config/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { detectMeal, MEAL_LABELS } from '../utils/mealUtils';

export default function MealEntryScreen({ navigation, route }) {
  const [mealName, setMealName] = useState(route?.params?.mealName ?? '');
  const [selectedTag, setSelectedTag] = useState(route?.params?.mealType ?? route?.params?.prefillTag ?? '');
  const [selectedMeal, setSelectedMeal] = useState(route?.params?.meal || detectMeal(new Date()));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSaveMeal = async () => {
    setMessage(null);
    if (!mealName.trim()) {
      setMessage("Please enter what you ate.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Reference to users/{uid}/logs
        const logsRef = collection(db, "users", user.uid, "logs");
        
        await addDoc(logsRef, {
          type: 'meal',
          value: mealName,       // The text of the meal
          period: selectedTag || 'Regular', // Using the tag as the 'period' for the Log list
          meal: selectedMeal || detectMeal(new Date()),
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString(),
        });

        navigation.goBack();
      }
    } catch (error) {
      console.error("Meal Save Error:", error);
      setMessage("Could not save your meal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Meal</Text>
          <PressableScale onPress={handleSaveMeal} disabled={loading} style={[styles.saveBtn, loading && { opacity: 0.7 }]}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveText}>Log</Text>
            )}
          </PressableScale>
        </View>

        {/* Input Box */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>What did you eat?</Text>
          <TextInput 
            style={styles.textInput} 
            placeholder="e.g. Grilled Chicken & Salad" 
            placeholderTextColor="#94a3b8"
            value={mealName}
            onChangeText={setMealName}
            multiline={false}
          />
        </View>

        {/* Meal Time Selector */}
        <Text style={[styles.sectionLabel, { marginTop: 6 }]}>Meal time</Text>
        <View style={{ flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap' }}>
          {['breakfast','lunch','snack','dinner','other'].map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.tagBtn, selectedMeal === m && styles.activeTag, { marginRight: 10, marginBottom: 10 }]}
              onPress={() => setSelectedMeal(m)}
            >
              <Text style={[styles.tagText, selectedMeal === m && styles.activeTagText]}>{MEAL_LABELS[m] || m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Add Section */}
        <Text style={styles.sectionLabel}>Quick Add</Text>
        <View style={styles.quickGrid}>
          {['High Protein', 'Low Carb', 'Leafy Greens', 'Healthy Fats'].map(tag => (
            <TouchableOpacity 
              key={tag} 
              style={[styles.tagBtn, selectedTag === tag && styles.activeTag]} 
              onPress={() => setSelectedTag(tag)}
            >
              <Text style={[styles.tagText, selectedTag === tag && styles.activeTagText]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Metabolic Tip Card */}
        <View style={styles.impactCard}>
          <MaterialCommunityIcons name="leaf" size={24} color="#10B981" />
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.impactTitle}>Metabolic Tip</Text>
            <Text style={styles.impactDesc}>
              Try eating your greens first to blunt the glucose response of this meal.
            </Text>
          </View>
        </View>

        {message && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

      </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 20, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  saveBtn: { backgroundColor: '#825CFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  saveText: { color: '#FFF', fontWeight: '700' },
  inputBox: { marginBottom: 18 },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  textInput: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#F1F5F9' },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 6 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  tagBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  tagText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  activeTag: { backgroundColor: '#825CFF' },
  activeTagText: { color: '#FFF' },
  impactCard: { flexDirection: 'row', backgroundColor: '#ECFDF5', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  impactTitle: { fontSize: 14, fontWeight: '700', color: '#065F46' },
  impactDesc: { fontSize: 13, color: '#065F46', marginTop: 4, lineHeight: 18, maxWidth: '90%' },
  messageBox: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginTop: 12 },
  messageText: { color: '#B91C1C', textAlign: 'center' },
});