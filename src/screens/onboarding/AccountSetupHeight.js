import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

// 1. FIREBASE IMPORTS
import { auth, db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const TICK_SPACING = 20; 

export default function AccountSetupHeight({ navigation }) {
  const [height, setHeight] = useState(170); // Default to average height
  const [unit, setUnit] = useState('cm');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const minVal = unit === 'cm' ? 100 : 3;
  const maxVal = unit === 'cm' ? 250 : 8;
  const rulerTicks = Array.from({ length: maxVal - minVal + 1 }, (_, i) => i + minVal);

  // 2. INITIAL POSITION
  useEffect(() => {
    const timer = setTimeout(() => {
      const initialOffset = (170 - 100) * TICK_SPACING;
      scrollRef.current?.scrollTo({ x: initialOffset, animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 3. FIREBASE SAVE LOGIC
  const handleContinue = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          height: height,
          heightUnit: unit,
          onboardingStep: 5,
          updatedAt: new Date().toISOString(),
        });
        navigation.navigate('AccountSetupGoal');
      }
    } catch (error) {
      console.log("Error saving height:", error);
      Alert.alert("Error", "Could not save height. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = (newUnit) => {
    if (newUnit === unit) return;

    let newHeight;
    if (newUnit === 'ft') {
      newHeight = Math.round(height / 30.48);
    } else {
      newHeight = Math.round(height * 30.48);
    }

    setUnit(newUnit);
    setHeight(newHeight);

    const currentMin = newUnit === 'cm' ? 100 : 3;
    const offset = (newHeight - currentMin) * TICK_SPACING;
    scrollRef.current?.scrollTo({ x: offset, animated: true });
  };

  const handleScroll = (event) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const currentMin = unit === 'cm' ? 100 : 3;
    const newHeight = Math.round(xOffset / TICK_SPACING) + currentMin;
    
    if (newHeight !== height && newHeight >= currentMin && newHeight <= maxVal) {
      setHeight(newHeight);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.skipButton} />
      </View>

      <View style={styles.content}>
        <Text style={styles.progressText}>
          <Text style={styles.progressActive}>5</Text> / 8
        </Text>

        <Text style={styles.title}>What is your height?</Text>
        <Text style={styles.subtitle}>
          Height is important for calculating your BMI and personalized activity goals.
        </Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleTab, unit === 'ft' && styles.activeTab]} 
            onPress={() => toggleUnit('ft')}
          >
            <Text style={[styles.toggleText, unit === 'ft' && styles.activeToggleText]}>ft</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleTab, unit === 'cm' && styles.activeTab]} 
            onPress={() => toggleUnit('cm')}
          >
            <Text style={[styles.toggleText, unit === 'cm' && styles.activeToggleText]}>cm</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.valueDisplayContainer}>
          <AntDesign name="caretleft" size={24} color="#825CFF" style={styles.indicatorArrow} />
          <View style={styles.valueBox}>
            <Text style={styles.valueText}>{height} <Text style={{fontSize: 20}}>{unit}</Text></Text>
          </View>
        </View>

        <View style={styles.rulerContainer}>
          <ScrollView 
            ref={scrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={TICK_SPACING}
            decelerationRate="fast"
            contentContainerStyle={styles.rulerScroll}
          >
            {rulerTicks.map((tick) => (
              <View key={tick} style={styles.tickWrapper}>
                <View style={[
                  styles.tickLine, 
                  tick % 5 === 0 ? styles.longTick : styles.shortTick,
                  tick === height && styles.activeTickLine
                ]} />
                {tick % 5 === 0 && <Text style={styles.tickLabel}>{tick}</Text>}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

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
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  backButton: { padding: 8 },
  skipButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  skipText: { fontSize: 14, color: '#000', fontWeight: '500' },
  content: { flex: 1, alignItems: 'center', paddingTop: 40 },
  progressText: { fontSize: 16, color: '#9CA3AF', marginBottom: 20, fontWeight: '600' },
  progressActive: { color: '#825CFF' },
  title: { fontSize: 32, fontWeight: '700', color: '#825CFF', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', paddingHorizontal: 40, marginBottom: 30 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 25, width: 120, height: 45, padding: 4, marginBottom: 30 },
  toggleTab: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  activeTab: { backgroundColor: '#825CFF' },
  toggleText: { fontSize: 16, color: '#9CA3AF', fontWeight: '600' },
  activeToggleText: { color: '#FFFFFF' },
  valueDisplayContainer: { alignItems: 'center', marginBottom: 20 },
  indicatorArrow: { transform: [{ rotate: '270deg' }], marginBottom: 5 },
  valueBox: { backgroundColor: '#F3FFFA', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 20 },
  valueText: { fontSize: 48, fontWeight: '700', color: '#825CFF' },
  rulerContainer: { width: '100%', height: 120 },
  rulerScroll: { paddingHorizontal: width / 2 - (TICK_SPACING / 2) },
  tickWrapper: { width: TICK_SPACING, alignItems: 'center' },
  tickLine: { width: 2, backgroundColor: '#E5E7EB', borderRadius: 1 },
  shortTick: { height: 25 },
  longTick: { height: 45, backgroundColor: '#D1D5DB' },
  activeTickLine: { backgroundColor: '#825CFF', width: 3 },
  tickLabel: { marginTop: 10, fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  footer: { paddingHorizontal: 25, paddingBottom: 40 },
  continueButton: { backgroundColor: '#825CFF', height: 65, borderRadius: 35, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  continueText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  icon: { marginLeft: 10 },
});