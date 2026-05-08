import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

// 1. FIREBASE IMPORTS
import { auth, db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ITEM_WIDTH = 70; // Adjusted for better spacing

export default function AccountSetupAge({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();
  const isNarrow = screenWidth < 380;
  const listPadding = Math.max(8, screenWidth / 2 - ITEM_WIDTH / 2);
  const [selectedAge, setSelectedAge] = useState(27);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  
  // Generate ages from 18 to 99
  const ages = Array.from({ length: 82 }, (_, i) => i + 18);

  // 2. FIREBASE SAVE LOGIC
  const handleContinue = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          age: selectedAge,
          onboardingStep: 3,
          updatedAt: new Date().toISOString(),
        });
        navigation.navigate('AccountSetupWeight');
      }
    } catch (error) {
      console.log("Error saving age:", error);
      setError("Could not save your age. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  // 3. SCROLL LOGIC FOR ARROWS
  const scroll = (direction) => {
    const nextIndex = direction === 'left' 
      ? ages.indexOf(selectedAge) - 1 
      : ages.indexOf(selectedAge) + 1;

    if (nextIndex >= 0 && nextIndex < ages.length) {
      const nextAge = ages[nextIndex];
      setSelectedAge(nextAge);
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true, viewPosition: 0.5 });
    }
  };

  const renderAgeItem = ({ item }) => {
    const isSelected = item === selectedAge;
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => {
          setSelectedAge(item);
          flatListRef.current.scrollToIndex({ 
            index: ages.indexOf(item), 
            animated: true, 
            viewPosition: 0.5 
          });
        }}
        style={[
          styles.ageItem,
          isSelected && styles.selectedAgeContainer
        ]}
      >
        <Text style={[
          styles.ageText,
          isSelected && styles.selectedAgeText
        ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
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
          <Text style={styles.progressActive}>3</Text> / 8
        </Text>

        <Text style={styles.title}>How old are you?</Text>
        <Text style={styles.subtitle}>
          To give you a better experience we need to know your age
        </Text>

        <View style={styles.pickerContainer}>
          <View style={[styles.pickerWrapper, { width: Math.min(screenWidth, 420) }]}>
            <TouchableOpacity onPress={() => scroll('left')} style={styles.arrowButton}>
              <Ionicons name="chevron-back" size={30} color="#825CFF" />
            </TouchableOpacity>
            
            <FlatList
              ref={flatListRef}
              data={ages}
              renderItem={renderAgeItem}
              keyExtractor={(item) => item.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH}
              decelerationRate="fast"
              contentContainerStyle={[styles.listContent, { paddingHorizontal: listPadding }]}
              initialScrollIndex={ages.indexOf(27)}
              getItemLayout={(data, index) => (
                { length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index }
              )}
            />

            <TouchableOpacity onPress={() => scroll('right')} style={styles.arrowButton}>
              <Ionicons name="chevron-forward" size={30} color="#825CFF" />
            </TouchableOpacity>
          </View>
          {/* Active Indicator Line */}
          <View style={styles.activeIndicator} />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  progressText: { fontSize: 16, color: '#9CA3AF', marginBottom: 20, fontWeight: '600' },
  progressActive: { color: '#825CFF' },
  title: { fontSize: 32, fontWeight: '700', color: '#825CFF', textAlign: 'center', marginBottom: 15 },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 60, paddingHorizontal: 20 },
  pickerContainer: { height: 120, alignItems: 'center', justifyContent: 'center' },
  pickerWrapper: { flexDirection: 'row', alignItems: 'center' },
  listContent: {},
  ageItem: { width: ITEM_WIDTH, height: 80, justifyContent: 'center', alignItems: 'center' },
  selectedAgeContainer: { backgroundColor: '#F3F4FF', borderRadius: 20 },
  ageText: { fontSize: 24, color: '#D1D5DB', fontWeight: '600' },
  selectedAgeText: { color: '#825CFF', fontSize: 36, fontWeight: '800' },
  arrowButton: { padding: 10, zIndex: 10 },
  activeIndicator: { width: 40, height: 4, backgroundColor: '#825CFF', borderRadius: 2, marginTop: 10 },
  footer: { paddingHorizontal: 25, paddingBottom: 40 },
  errorBox: {
    width: '100%',
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
  },
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