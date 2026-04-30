import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function BMICalculator({ navigation, showHeader = true, onSaved }) {
  const [weight, setWeight] = useState('75');
  const [height, setHeight] = useState('175');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState({ label: '-', color: '#9CA3AF' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;

    if (w > 0 && h > 0) {
      const score = (w / (h * h)).toFixed(1);
      setBmi(score);

      if (score < 18.5) setCategory({ label: 'Underweight', color: '#3B82F6' });
      else if (score < 25) setCategory({ label: 'Healthy Weight', color: '#10B981' });
      else if (score < 30) setCategory({ label: 'Overweight', color: '#F59E0B' });
      else setCategory({ label: 'Obese', color: '#EF4444' });
    } else {
      setBmi(null);
      setCategory({ label: '-', color: '#9CA3AF' });
    }
  }, [weight, height]);

  const handleSaveBMI = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be signed in to update your profile.');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        latestBMI: bmi,
        weight,
        height,
        bmiCategory: category.label,
        lastUpdated: serverTimestamp(),
      });

      if (typeof onSaved === 'function') {
        onSaved({ bmi, weight, height, category: category.label });
      } else {
        Alert.alert('Success', 'Your health metrics have been updated.');
      }

      if (navigation?.canGoBack?.()) {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Could not save metrics.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.resultContainer}>
        <Text style={styles.bmiValue}>{bmi || '--'}</Text>
        <Text style={[styles.categoryLabel, { color: category.color }]}>{category.label}</Text>
        <Text style={styles.bmiSubtext}>Body Mass Index</Text>
      </View>

      <View style={styles.inputCard}>
        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="weight-kilogram" size={24} color="#825CFF" />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        <View style={[styles.inputGroup, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 20, marginTop: 20 }]}>
          <MaterialCommunityIcons name="human-male-height" size={24} color="#825CFF" />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.inputLabel}>Height (cm)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Glucose Connection</Text>
        <Text style={styles.infoText}>
          A healthy BMI improves insulin sensitivity. Higher body fat can make it harder for your cells to respond to insulin, leading to higher glucose spikes.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, loading && { opacity: 0.7 }]}
        onPress={handleSaveBMI}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Update Profile</Text>}
      </TouchableOpacity>
    </ScrollView>
  );

  if (!showHeader) {
    return content;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Body Composition</Text>
        <View style={{ width: 24 }} />
      </View>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  content: { padding: 20 },
  resultContainer: { backgroundColor: '#FFF', borderRadius: 30, padding: 40, alignItems: 'center', marginBottom: 20, elevation: 2 },
  bmiValue: { fontSize: 64, fontWeight: '900', color: '#111827' },
  categoryLabel: { fontSize: 18, fontWeight: '800', marginBottom: 5 },
  bmiSubtext: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  inputCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20 },
  inputGroup: { flexDirection: 'row', alignItems: 'center' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  textInput: { fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 5 },
  infoCard: { backgroundColor: '#F5F3FF', borderRadius: 24, padding: 20, marginBottom: 30 },
  infoTitle: { fontSize: 15, fontWeight: '800', color: '#5B21B6', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#5B21B6', lineHeight: 20, opacity: 0.8 },
  saveBtn: { backgroundColor: '#825CFF', borderRadius: 20, padding: 20, alignItems: 'center' },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});