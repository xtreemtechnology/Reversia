import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AnimatedScreen from '../components/AnimatedScreen';
import { NavigationBar } from '../components/ScreenWithNav';
// Firebase Imports
import { auth, db } from '../config/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function WaterEntryScreen({ navigation }) {
  const [glasses, setGlasses] = useState(4);
  const [loading, setLoading] = useState(false);

  const handleSaveWater = async () => {
    if (glasses === 0) {
      Alert.alert("Hydration", "Please log at least one glass of water.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Path: users/{uid}/logs
        const logsRef = collection(db, "users", user.uid, "logs");
        
        await addDoc(logsRef, {
          type: 'water',
          value: glasses,
          unit: glasses === 1 ? 'glass' : 'glasses',
          period: 'Hydration',
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString(),
        });

        navigation.goBack();
      }
    } catch (error) {
      console.error("Water Save Error:", error);
      Alert.alert("Error", "We couldn't save your progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hydration</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Counter Section */}
        <View style={styles.counterSection}>
          <MaterialCommunityIcons name="water" size={100} color="#0EA5E9" />
          <Text style={styles.waterCount}>
            {glasses} <Text style={styles.waterSub}>{glasses === 1 ? 'Glass' : 'Glasses'}</Text>
          </Text>
          
          <View style={styles.controls}>
            <TouchableOpacity 
              onPress={() => setGlasses(Math.max(0, glasses - 1))} 
              style={styles.roundBtn}
            >
              <Ionicons name="remove" size={30} color="#111827" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setGlasses(glasses + 1)} 
              style={[styles.roundBtn, { backgroundColor: '#0EA5E9' }]}
            >
              <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.finishBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSaveWater}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.finishText}>Save Progress</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.hintText}>
          Logging {glasses} glasses will contribute to your daily hydration goal.
        </Text>
      </View>
      </AnimatedScreen>
      <NavigationBar activeScreen="Log" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 24, flex: 1, justifyContent: 'center', paddingBottom: 110 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    position: 'absolute', 
    top: 50, 
    left: 24, 
    right: 24 
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  counterSection: { alignItems: 'center', marginBottom: 40 },
  waterCount: { fontSize: 48, fontWeight: '800', color: '#0EA5E9', marginTop: 12 },
  waterSub: { fontSize: 18, fontWeight: '600', color: '#0EA5E9' },
  controls: { flexDirection: 'row', marginTop: 30, gap: 24 },
  roundBtn: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  finishBtn: { 
    backgroundColor: '#0EA5E9', 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  finishText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  hintText: { 
    textAlign: 'center', 
    color: '#94a3b8', 
    fontSize: 13, 
    marginTop: 20, 
    lineHeight: 18 
  }
});