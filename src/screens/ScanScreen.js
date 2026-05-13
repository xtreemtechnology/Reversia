import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Dimensions, 
  Animated, ActivityIndicator, Alert
} from 'react-native';
import { Camera, useCameraPermissions } from 'expo-camera';
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
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [debugStatus, setDebugStatus] = useState({});

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
      // capture a photo for context (best-effort)
      try {
        if (cameraRef.current && cameraRef.current.takePictureAsync) {
          await cameraRef.current.takePictureAsync({ base64: false, quality: 0.5 });
        }
      } catch (e) {
        // ignore capture errors
      }

      // If a barcode was scanned already, perform lookup
      if (!scannedBarcode) {
        Alert.alert('No barcode', 'No barcode detected yet. Point the camera at a barcode and try again.');
        setIsAnalyzing(false);
        return;
      }

      await lookupBarcode(scannedBarcode);
    } catch (error) {
      console.error('Scan error:', error);
      const errorMsg = error.message.includes('Camera')
        ? 'Unable to access camera. Please check permissions.'
        : error.message.includes('timeout')
        ? 'Scan timed out. Please try again.'
        : 'Failed to scan. Please ensure the barcode is visible.';
      Alert.alert('Scan Failed', errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Lookup barcode in common Firestore locations
  const lookupBarcode = async (barcode) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const tryPaths = [
        () => getDoc(doc(db, 'foods', barcode)),
        () => getDoc(doc(db, 'food_items', barcode)),
        () => getDoc(doc(db, 'users', user.uid, 'meals', barcode)),
        () => getDoc(doc(db, 'users', user.uid, 'food_items', barcode)),
      ];

      for (const fn of tryPaths) {
        try {
          const snap = await fn();
          if (snap && snap.exists && snap.exists()) {
            setFoodData(snap.data());
            return;
          }
        } catch (e) {
          // try next
        }
      }

      Alert.alert('Not Found', `This food item (barcode: ${barcode}) is not in our database.`);
      setFoodData(null);
    } catch (err) {
      console.error('Lookup error', err);
      Alert.alert('Lookup Failed', 'Could not lookup barcode.');
    }
  };

  // Handle barcode events from the camera
  const handleBarCodeScanned = async ({ type, data }) => {
    if (!data) return;
    if (scannedBarcode === data) return; // avoid duplicates
    setScannedBarcode(data);
    setIsAnalyzing(true);
    await lookupBarcode(data);
    setIsAnalyzing(false);
    // allow rescanning after short interval
    setTimeout(() => setScannedBarcode(null), 5000);
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

      await addDoc(collection(db, 'users', currentUser.uid, 'logs'), {
        userId: currentUser.uid,
        type: 'meal',
        value: foodData.name,
        foodName: foodData.name,
        netCarbs: foodData.netCarbs,
        barcode: scannedBarcode,
        period: 'Scanned Meal',
        timestamp: serverTimestamp(),
      });

      Alert.alert('Success', 'Added to your meal plan!');
      setFoodData(null);
      setScannedBarcode(null);
    } catch (error) {
      console.error('Add to meal error:', error);
        const addErrorMsg = error.message.includes('permission')
          ? 'You do not have permission to add meals.'
          : error.message.includes('network')
          ? 'Network connection failed. Please try again.'
          : 'Could not save meal. Please try again.';
        Alert.alert('Save Failed', addErrorMsg);
    }
  };

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.7],
  });

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
    // update debug status
    setDebugStatus({ granted: !!permission.granted });
  }, [permission]);

  useEffect(() => {
    const t = setInterval(() => {
      setDebugStatus((s) => ({ ...s, hasRef: !!cameraRef.current }));
    }, 500);
    return () => clearInterval(t);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Food Scanner</Text>
        <Text style={styles.subtitle}>Check Glycemic Impact instantly</Text>
      </View>
      {/* Camera Viewfinder */}
      <View style={styles.scannerContainer}>
        {(!permission || !permission.granted) ? (
          <View style={styles.viewfinder}>
            <MaterialCommunityIcons name="camera-off" size={56} color="#9CA3AF" />
            <Text style={[styles.hintText, { marginTop: 12 }]}>Camera access required</Text>
            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => requestPermission()}>
              <Text style={{ color: '#825CFF', fontWeight: '700' }}>Grant camera access</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.viewfinder}>
            <Camera
              ref={cameraRef}
              style={{ width: '100%', height: '100%' }}
              onBarCodeScanned={handleBarCodeScanned}
              barCodeScannerSettings={{}}
            />
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
          </View>
        )}
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
  resultCard: { backgroundColor: '#FBFBFD', margin: 20, borderRadius: 28, padding: 18, position: 'absolute', bottom: 165, width: width - 40, elevation: 8, borderWidth: 1, borderColor: '#E7EAF0' },
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
  captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F8FAFC' },
});