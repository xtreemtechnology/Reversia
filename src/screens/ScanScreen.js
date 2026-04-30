import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Dimensions, 
  Animated, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function ScanScreen({ navigation }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foodData, setFoodData] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [scanLineAnim] = useState(new Animated.Value(0));

  // Animation for the scanning line
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  // Simulate barcode scan and fetch from Firestore
  const handleScan = async () => {
    setIsAnalyzing(true);
    try {
      // Mock barcode (in real app, would come from camera)
      const mockBarcode = '1234567890';
      console.log('Scanning barcode:', mockBarcode);
      setScannedBarcode(mockBarcode);

      // Fetch from Firestore foods collection
      const docRef = doc(db, 'foods', mockBarcode);
      const docSnap = await getDoc(docRef);
      
      console.log('Document exists:', docSnap.exists());
      console.log('Document data:', docSnap.data());

      if (docSnap.exists()) {
        console.log('Food found, setting data');
        setFoodData(docSnap.data());
      } else {
        // Show not found message
        console.log('Food not found, showing alert');
        Alert.alert(
          'Not Found',
          'This food item (barcode: 1234567890) is not in our database. Please check if it exists in Firestore.',
          [{ text: 'OK', onPress: () => setFoodData(null) }]
        );
      }
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', 'Failed to scan: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add to meal logs in Firestore
  const handleAddToMealPlan = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Please log in first');
        return;
      }

      if (!foodData) {
        Alert.alert('No food data to save');
        return;
      }

      await addDoc(collection(db, 'meal_logs'), {
        userId: currentUser.uid,
        foodName: foodData.name,
        netCarbs: foodData.netCarbs,
        barcode: scannedBarcode,
        timestamp: serverTimestamp(),
        type: 'scanned_meal'
      });

      Alert.alert('Success', 'Added to your meal plan!');
      setFoodData(null);
      setScannedBarcode(null);
    } catch (error) {
      console.error('Add to meal error:', error);
      Alert.alert('Error', 'Failed to add: ' + error.message);
    }
  };

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.7],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Food Scanner</Text>
        <Text style={styles.subtitle}>Check Glycemic Impact instantly</Text>
      </View>

      {/* Camera Viewfinder */}
      <View style={styles.scannerContainer}>
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {/* Animated Scan Line */}
          <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
          
          <MaterialCommunityIcons name="barcode-scan" size={60} color="rgba(255,255,255,0.2)" />
        </View>
        <Text style={styles.hintText}>Center the product label or barcode</Text>
      </View>

      {/* Result Preview (Floating Card) */}
      {(isAnalyzing || foodData) && (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.foodIconBox}>
            <MaterialCommunityIcons 
               name={isAnalyzing ? "magnify" : "corn"} 
               size={24} 
               color="#825CFF" 
            />
          </View>
          <View style={styles.foodNameContainer}>
            <View style={styles.statusRow}>
              {isAnalyzing && <ActivityIndicator size="small" color="#825CFF" style={{marginRight: 5}} />}
              <Text style={styles.scanStatus}>{isAnalyzing ? 'Analyzing...' : 'Identity Confirmed'}</Text>
            </View>
            <Text style={styles.foodName}>{isAnalyzing ? 'Scanning food...' : (foodData?.name || 'Whole Grain Oats')}</Text>
          </View>
          {!isAnalyzing && foodData && (
            <View style={styles.safetyBadge}>
              <Text style={styles.safetyText}>{foodData.score || '9.2'} SCORE</Text>
            </View>
          )}
        </View>

        {!isAnalyzing && (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>INSULIN IMPACT</Text>
                <Text style={styles.statValue}>{foodData?.impact || 'N/A'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>NET CARBS</Text>
                <Text style={styles.statValue}>{foodData?.netCarbs || '0'}g</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>FIBER</Text>
                <Text style={styles.statValue}>{foodData?.fiber || '0'}g</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.logButton}
              onPress={handleAddToMealPlan}
            >
              <Text style={styles.logButtonText}>Add to Meal Plan</Text>
              <Ionicons name="add-circle" size={20} color="#FFF" />
            </TouchableOpacity>
          </>
        )}
      </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="flashlight" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
           style={styles.captureBtn} 
           onPress={handleScan}
           disabled={isAnalyzing}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="images" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, alignItems: 'center', paddingTop: 10 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  scannerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 100 },
  viewfinder: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#825CFF',
    zIndex: 1,
    shadowColor: "#825CFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#825CFF', borderWidth: 4, zIndex: 2 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
  hintText: { color: '#FFF', marginTop: 30, fontSize: 14, opacity: 0.8 },
  resultCard: { backgroundColor: '#FFF', margin: 20, borderRadius: 28, padding: 18, position: 'absolute', bottom: 165, width: width - 40, elevation: 10 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  foodIconBox: { width: 48, height: 48, backgroundColor: '#F3F4FF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  foodNameContainer: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  scanStatus: { fontSize: 10, color: '#825CFF', fontWeight: '800', textTransform: 'uppercase' },
  foodName: { fontSize: 18, fontWeight: '800', color: '#111' },
  safetyBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  safetyText: { color: '#15803D', fontSize: 11, fontWeight: '800' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15, marginBottom: 15 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 9, color: '#9CA3AF', marginBottom: 4, fontWeight: '700' },
  statValue: { fontSize: 13, fontWeight: '800', color: '#111' },
  statDivider: { width: 1, height: 20, backgroundColor: '#F3F4F6', alignSelf: 'center' },
  logButton: { backgroundColor: '#825CFF', borderRadius: 18, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  logButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 110, paddingHorizontal: 30 },
  controlBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },
});