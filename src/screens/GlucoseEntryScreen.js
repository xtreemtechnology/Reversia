import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function GlucoseEntryScreen({ navigation }) {
  const [glucose, setGlucose] = useState('98');
  const [selectedState, setSelectedState] = useState('Fasting');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ label: 'Normal', color: '#10B981', bg: '#ECFDF5' });

  const states = ['Fasting', 'Pre-Meal', 'Post-Meal', 'Bedtime'];

  // Automatically update the status badge as the user types
  useEffect(() => {
    const val = parseFloat(glucose);
    if (!val) return;
    
    if (val < 70) {
      setStatus({ label: 'Low (Hypo)', color: '#EF4444', bg: '#FEF2F2' });
    } else if (val >= 70 && val <= 140) {
      setStatus({ label: 'Optimal Range', color: '#10B981', bg: '#ECFDF5' });
    } else if (val > 140 && val <= 180) {
      setStatus({ label: 'Elevated', color: '#F59E0B', bg: '#FFFBEB' });
    } else {
      setStatus({ label: 'High (Hyper)', color: '#EF4444', bg: '#FEF2F2' });
    }
  }, [glucose]);

  const handleSave = async () => {
    if (!glucose || isNaN(glucose)) {
      Alert.alert("Error", "Please enter a valid numeric reading.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const logsRef = collection(db, "users", user.uid, "logs");
        await addDoc(logsRef, {
          type: 'glucose',
          value: parseFloat(glucose),
          unit: 'mg/dL',
          period: selectedState,
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString(),
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "Failed to save. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingBottom: 90 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Glucose Entry</Text>
          <TouchableOpacity 
            style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Input Section */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter Reading</Text>
            <View style={styles.valueRow}>
              <TextInput
                style={styles.mainInput}
                value={glucose}
                onChangeText={setGlucose}
                keyboardType="decimal-pad"
                maxLength={3}
                placeholder="000"
                placeholderTextColor="#E5E7EB"
              />
              <Text style={styles.unit}>mg/dL</Text>
            </View>
            
            {/* Dynamic Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <View style={[styles.dot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          {/* Timing Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Reading Timing</Text>
            <View style={styles.chipRow}>
              {states.map((state) => (
                <TouchableOpacity 
                  key={state}
                  onPress={() => setSelectedState(state)}
                  style={[styles.chip, selectedState === state && styles.activeChip]}
                >
                  <Text style={[styles.chipText, selectedState === state && styles.activeChipText]}>
                    {state}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Education Card */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
               <Ionicons name="bulb" size={20} color="#825CFF" />
               <Text style={styles.tipTitle}>Why this matters</Text>
            </View>
            <Text style={styles.tipText}>
              Keeping your blood sugar between 70-140 mg/dL helps minimize long-term inflammation and protects your energy levels.
            </Text>
          </View>
        </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  saveBtn: { backgroundColor: '#825CFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
  saveText: { color: '#FFF', fontWeight: '700' },
  content: { padding: 24 },
  inputContainer: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 30, 
    padding: 30, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    marginBottom: 30 
  },
  inputLabel: { fontSize: 13, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 10 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  mainInput: { fontSize: 84, fontWeight: '900', color: '#111827', textAlign: 'center', minWidth: 140 },
  unit: { fontSize: 20, fontWeight: '700', color: '#9CA3AF', marginLeft: 5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 15 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 14, fontWeight: '800' },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 15 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16, backgroundColor: '#F3F4F6' },
  activeChip: { backgroundColor: '#825CFF' },
  chipText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  activeChipText: { color: '#FFF' },
  tipCard: { backgroundColor: '#F5F3FF', padding: 20, borderRadius: 24 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tipTitle: { fontSize: 14, fontWeight: '800', color: '#5B21B6' },
  tipText: { fontSize: 14, color: '#5B21B6', lineHeight: 22, opacity: 0.8 }
});