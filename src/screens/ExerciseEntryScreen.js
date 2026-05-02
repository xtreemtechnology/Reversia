import React, { useState } from 'react';
import { limits } from '../constants/index';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AnimatedScreen from '../components/AnimatedScreen';
// Firebase Imports
import { auth, db } from '../config/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ExerciseEntryScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState('HIIT');
  const [duration, setDuration] = useState(15); 
  const [loading, setLoading] = useState(false);

  // Updated for Home Workout types
  const activities = [
    { name: 'HIIT', icon: 'lightning-bolt', guide: 'High intensity keeps your metabolism high for hours.' },
    { name: 'Stretching', icon: 'human-stretching', guide: 'Perfect for flexibility and cooling down after a meal.' },
    { name: 'Plank', icon: 'floor-lamp', guide: 'Core stability helps improve overall insulin sensitivity.' },
    { name: 'Pushups', icon: 'arm-flex', guide: 'Great for building muscle mass, which stores glucose.' },
    { name: 'Squats', icon: 'human-handsup', guide: 'Leg muscles are your largest glucose "sinks".' },
    { name: 'Yoga', icon: 'yoga', guide: 'Reduces cortisol, which helps stabilize blood sugar.' }
  ];

  const currentActivity = activities.find(a => a.name === selectedType);

  const handleSaveExercise = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const logsRef = collection(db, "users", user.uid, "logs");
        
        await addDoc(logsRef, {
          type: 'exercise',
          value: selectedType,
          period: `${duration} mins`,
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString(),
        });

        navigation.goBack();
      }
    } catch (error) {
      console.error("Exercise Save Error:", error);
      Alert.alert("Error", "Could not log your activity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Home Workout</Text>
          <TouchableOpacity 
            style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSaveExercise}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Select Home Workout</Text>
        <View style={styles.activityGrid}>
          {activities.map(item => (
            <TouchableOpacity 
              key={item.name} 
              style={[styles.activityCard, selectedType === item.name && styles.activeCard]}
              onPress={() => setSelectedType(item.name)}
            >
              <MaterialCommunityIcons 
                name={item.icon} 
                size={28} 
                color={selectedType === item.name ? '#FFF' : '#825CFF'} 
              />
              <Text style={[styles.activityName, selectedType === item.name && { color: '#FFF' }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Duration Picker */}
        <View style={styles.durationBox}>
          <Text style={styles.label}>Workout Duration</Text>
          <View style={styles.timerRow}>
            <TouchableOpacity 
              onPress={() => setDuration(prev => Math.max(limits.minExerciseDuration, prev - 5))} 
              style={styles.adjustBtn}
            >
              <Ionicons name="remove" size={24} color="#111827" />
            </TouchableOpacity>
            
            <View style={styles.durationDisplay}>
                <Text style={styles.durationValue}>{duration}</Text>
                <Text style={styles.durationUnit}>min</Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => setDuration(prev => Math.min(prev + 5, limits.maxExerciseDuration))} 
              style={styles.adjustBtn}
            >
              <Ionicons name="add" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Activity Guide */}
        <Text style={styles.label}>Workout Guide</Text>
        <View style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#825CFF" />
            <Text style={styles.guideTitle}>{selectedType} Tips</Text>
          </View>
          <Text style={styles.guideText}>
            {currentActivity?.guide}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="flash" size={20} color="#825CFF" />
          <Text style={styles.infoText}>
            Engaging large muscle groups (like squats) is the fastest way to pull glucose from your bloodstream.
          </Text>
        </View>

      </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F8' },
  content: { padding: 20, paddingBottom: 110 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  saveBtn: { backgroundColor: '#825CFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
  saveText: { color: '#FFF', fontWeight: '700' },
  label: { fontSize: 13, color: '#9CA3AF', marginBottom: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  activityCard: { width: '31%', backgroundColor: '#FBFBFD', borderWidth: 1, borderColor: '#E7EAF0', borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  activeCard: { backgroundColor: '#825CFF', borderColor: '#825CFF', elevation: 4, shadowColor: '#825CFF', shadowOpacity: 0.3, shadowRadius: 5, shadowOffset: { width: 0, height: 4 } },
  activityName: { marginTop: 6, fontWeight: '700', fontSize: 12, color: '#4B5563' },
  durationBox: { backgroundColor: '#F9FAFB', padding: 20, borderRadius: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 25 },
  adjustBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FBFBFD', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  durationDisplay: { alignItems: 'center' },
  durationValue: { fontSize: 36, fontWeight: '900', color: '#111827' },
  durationUnit: { fontSize: 12, color: '#9CA3AF', fontWeight: '700', marginTop: -5 },
  guideCard: { backgroundColor: '#FBFBFD', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E7EAF0', marginBottom: 20 },
  guideHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  guideTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  guideText: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  infoCard: { flexDirection: 'row', padding: 16, backgroundColor: '#F5F3FF', borderRadius: 16, alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 10, fontSize: 13, color: '#5B21B6', lineHeight: 18, fontWeight: '500' }
});