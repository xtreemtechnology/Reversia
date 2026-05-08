// src/features/meals/screens/MealAnalyser.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
  Image,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../../config/firebase';
import { detectMeal } from '../utils/mealUtils';
import { analyseWithClaude } from '../services/mealAnalysisService';
import { logAIAnalyzedMeal } from '../services/mealsService';

// ─── Macro Pill ───────────────────────────────────────────────────────────────
const MacroPill = ({ label, value, unit, color, iconName }) => (
  <View style={pillStyles.pill}>
    <View style={[pillStyles.iconBox, { backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons name={iconName} size={16} color={color} />
    </View>
    <Text style={pillStyles.value}>{value}<Text style={pillStyles.unit}>{unit}</Text></Text>
    <Text style={pillStyles.label}>{label}</Text>
  </View>
);

const pillStyles = StyleSheet.create({
  pill: {
    flex: 1, alignItems: 'center',
    backgroundColor: '#FAFAF9',
    borderRadius: 16, paddingVertical: 12, marginHorizontal: 4,
  },
  iconBox: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  value: { fontSize: 16, fontWeight: '800', color: '#111827' },
  unit:  { fontSize: 10, fontWeight: '500', color: '#9CA3AF' },
  label: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', marginTop: 2 },
});

// ─── GI Badge ─────────────────────────────────────────────────────────────────
const GIBadge = ({ level }) => {
  const map = {
    Low:    { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
    Medium: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
    High:   { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  };
  const c = map[level] || map['Medium'];
  return (
    <View style={[giStyles.badge, { backgroundColor: c.bg }]}>
      <View style={[giStyles.dot, { backgroundColor: c.dot }]} />
      <Text style={[giStyles.text, { color: c.text }]}>GI: {level}</Text>
    </View>
  );
};

const giStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '800' },
});

// ─── Impact Badge ─────────────────────────────────────────────────────────────
const ImpactBadge = ({ level }) => {
  const map = {
    Low:      { bg: '#D1FAE5', text: '#065F46' },
    Moderate: { bg: '#FEF3C7', text: '#92400E' },
    High:     { bg: '#FEE2E2', text: '#991B1B' },
  };
  const c = map[level] || map['Moderate'];
  return (
    <View style={[impactStyles.badge, { backgroundColor: c.bg }]}>
      <Text style={[impactStyles.text, { color: c.text }]}>💉 Insulin Impact: {level}</Text>
    </View>
  );
};

const impactStyles = StyleSheet.create({
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '700' },
});

// ─── Health Score Ring ────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <View style={[scoreStyles.ring, { borderColor: color }]}>
      <Text style={[scoreStyles.score, { color }]}>{score}</Text>
      <Text style={scoreStyles.label}>Score</Text>
    </View>
  );
};

const scoreStyles = StyleSheet.create({
  ring: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 5, justifyContent: 'center', alignItems: 'center',
  },
  score: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 9, color: '#9CA3AF', fontWeight: '600', marginTop: -2 },
});

// ─── Result Card ──────────────────────────────────────────────────────────────
const ResultCard = ({ result, imageUri, onLog, onRetake, logging }) => (
  <View style={resultStyles.card}>
    {/* Food image thumbnail + name row */}
    <View style={resultStyles.topRow}>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={resultStyles.thumb} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={resultStyles.status}>✓ Identity Confirmed</Text>
        <Text style={resultStyles.foodName}>{result.foodName}</Text>
        <Text style={resultStyles.serving}>{result.servingSize}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          <GIBadge level={result.glycemicIndex} />
          <ImpactBadge level={result.insulinImpact} />
        </View>
      </View>
      <ScoreRing score={result.healthScore} />
    </View>

    {/* Macros row */}
    <View style={resultStyles.macrosRow}>
      <MacroPill label="Calories" value={result.calories} unit=" kcal" color="#7C3AED" iconName="fire" />
      <MacroPill label="Protein"  value={result.protein}  unit="g"     color="#10B981" iconName="arm-flex" />
      <MacroPill label="Carbs"    value={result.carbs}    unit="g"     color="#F59E0B" iconName="bread-slice" />
      <MacroPill label="Fats"     value={result.fats}     unit="g"     color="#3B82F6" iconName="water" />
    </View>

    {/* Extra stats */}
    <View style={resultStyles.extraRow}>
      <View style={resultStyles.extraItem}>
        <Text style={resultStyles.extraLabel}>Fiber</Text>
        <Text style={resultStyles.extraValue}>{result.fiber}g</Text>
      </View>
      <View style={resultStyles.extraDivider} />
      <View style={resultStyles.extraItem}>
        <Text style={resultStyles.extraLabel}>Sugar</Text>
        <Text style={resultStyles.extraValue}>{result.sugar}g</Text>
      </View>
      <View style={resultStyles.extraDivider} />
      <View style={resultStyles.extraItem}>
        <Text style={resultStyles.extraLabel}>Diabetes Safe</Text>
        <Text style={[resultStyles.extraValue, { color: result.diabetesSafe ? '#10B981' : '#EF4444' }]}>
          {result.diabetesSafe ? '✓ Yes' : '✗ No'}
        </Text>
      </View>
    </View>

    {/* AI Tip */}
    <View style={resultStyles.tipBox}>
      <MaterialCommunityIcons name="lightning-bolt" size={16} color="#7C3AED" />
      <Text style={resultStyles.tipText}>{result.tip}</Text>
    </View>

    {/* Actions */}
    <View style={resultStyles.actions}>
      <TouchableOpacity style={resultStyles.retakeBtn} onPress={onRetake}>
        <Ionicons name="camera-outline" size={18} color="#374151" />
        <Text style={resultStyles.retakeBtnText}>Retake</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[resultStyles.logBtn, logging && { opacity: 0.7 }]}
        onPress={onLog}
        disabled={logging}
      >
        {logging
          ? <ActivityIndicator color="#FFF" size="small" />
          : <>
              <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFF" />
              <Text style={resultStyles.logBtnText}>Log Food</Text>
            </>
        }
      </TouchableOpacity>
    </View>
  </View>
);

const resultStyles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 110,
    left: 16, right: 16,
    backgroundColor: '#FBFBFD',
    borderRadius: 28,
    padding: 18,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: '#E7EAF0',
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  thumb: { width: 64, height: 64, borderRadius: 14 },
  status: { fontSize: 10, color: '#7C3AED', fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
  foodName: { fontSize: 17, fontWeight: '800', color: '#111827' },
  serving: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  macrosRow: { flexDirection: 'row', marginBottom: 12 },

  extraRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  extraItem: { alignItems: 'center' },
  extraLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', marginBottom: 3 },
  extraValue: { fontSize: 14, fontWeight: '800', color: '#111827' },
  extraDivider: { width: 1, backgroundColor: '#F3F4F6' },

  tipBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#F5F3FF', borderRadius: 12,
    padding: 12, marginBottom: 14,
  },
  tipText: { flex: 1, fontSize: 12, color: '#5B21B6', lineHeight: 17, fontWeight: '500' },

  actions: { flexDirection: 'row', gap: 10 },
  retakeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    flex: 1, height: 50, borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    justifyContent: 'center',
  },
  retakeBtnText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  logBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    flex: 2, height: 50, borderRadius: 16,
    backgroundColor: '#7C3AED', justifyContent: 'center',
  },
  logBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MealAnalyser({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState(null);
  const [capturedBase64, setCapturedBase64] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState(null);
  const [logging, setLogging] = useState(false);
  const [facing, setFacing] = useState('back');
  const [flashOn, setFlashOn] = useState(false);
  const [message, setMessage] = useState(null);

  const cameraRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const viewfinderSize = Math.min(Math.floor(screenWidth * 0.75), 520);
  const viewfinderTop = Math.max(Math.floor(screenHeight * 0.08), 24);

  // Pulse animation on capture button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Fade in result card
  useEffect(() => {
    if (result) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [result]);

  // Request permission on mount
  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        exif: false,
      });
      setCapturedUri(photo.uri);
      setCapturedBase64(photo.base64);
      await runAnalysis(photo.base64);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setMessage('Please enable photo library access in your settings to use this feature.');
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.7,
      });
      if (!picked.canceled && picked.assets[0]) {
        const asset = picked.assets[0];
        setCapturedUri(asset.uri);
        setCapturedBase64(asset.base64);
        await runAnalysis(asset.base64);
      }
    } catch (err) {
      console.error('Gallery access error:', err);
      setMessage('Could not access your photo library. Please try again.');
    }
  };

  const runAnalysis = async (base64) => {
    setResult(null);
    setIsAnalysing(true);
    try {
      const data = await analyseWithClaude(base64);
      setResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setMessage('Could not analyse this image. Please try a clearer photo of the food.');
      handleRetake();
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleLog = async () => {
    const user = auth.currentUser;
    if (!user) { setMessage('Please log in first.'); return; }
    if (!result)  return;

    setLogging(true);
    try {
      await logAIAnalyzedMeal(result, capturedUri);
      setMessage(`${result.foodName} has been added to your meal log.`);
      navigation.goBack();
    } catch (err) {
      setMessage('Failed to log meal: ' + err.message);
    } finally {
      setLogging(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setCapturedUri(null);
    setCapturedBase64(null);
    setIsAnalysing(false);
  };

  // ── No permission ──
  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <MaterialCommunityIcons name="camera-off" size={56} color="#9CA3AF" />
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permSub}>Reversia needs your camera to analyse meals with AI.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Access</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.permBack}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Camera ── */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flashOn ? 'on' : 'off'}
      />

      {/* ── Dark overlay (top) ── */}
      <SafeAreaView style={styles.overlay}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI Meal Analyser</Text>
            <Text style={styles.headerSub}>Snap your food for instant insights</Text>
          </View>
          <TouchableOpacity
            onPress={() => setFlashOn(f => !f)}
            style={[styles.headerBtn, flashOn && styles.headerBtnActive]}
          >
            <Ionicons name={flashOn ? 'flash' : 'flash-off'} size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {message && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        {/* Viewfinder frame */}
        {!result && !isAnalysing && (
          <View style={[styles.frame, { width: viewfinderSize, height: viewfinderSize, marginTop: viewfinderTop }]}>
            {/* Corners */}
            {['topLeft','topRight','bottomLeft','bottomRight'].map(pos => (
              <View key={pos} style={[styles.corner, styles[pos]]} />
            ))}
            <Text style={styles.frameHint}>Position food in frame</Text>
          </View>
        )}

        {/* Analysing overlay */}
        {isAnalysing && (
          <View style={styles.analysingBox}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.analysingText}>Analysing with AI...</Text>
            <Text style={styles.analysingSubtext}>Detecting food & nutrients</Text>
          </View>
        )}

        {/* Captured image preview (behind result card) */}
        {capturedUri && !isAnalysing && (
          <Image
            source={{ uri: capturedUri }}
            style={StyleSheet.absoluteFill}
            blurRadius={result ? 6 : 0}
          />
        )}

        {/* Result Card */}
        {result && !isAnalysing && (
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            <ResultCard
              result={result}
              imageUri={capturedUri}
              onLog={handleLog}
              onRetake={handleRetake}
              logging={logging}
            />
          </Animated.View>
        )}

        {/* Bottom controls */}
        {!result && !isAnalysing && (
          <View style={styles.controls}>
            <TouchableOpacity style={styles.sideBtn} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={24} color="#FFF" />
              <Text style={styles.sideBtnText}>Gallery</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
                <View style={styles.captureRing}>
                  <MaterialCommunityIcons name="camera" size={28} color="#111827" />
                </View>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.sideBtn}
              onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
            >
              <Ionicons name="camera-reverse-outline" size={24} color="#FFF" />
              <Text style={styles.sideBtnText}>Flip</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  // Permission screen
  permissionScreen: {
    flex: 1, backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  permTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 20, marginBottom: 8 },
  permSub:   { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  permBtn: {
    backgroundColor: '#7C3AED', paddingHorizontal: 32,
    paddingVertical: 14, borderRadius: 20, marginBottom: 14,
  },
  permBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  permBack:    { color: '#9CA3AF', fontSize: 14 },

  // Overlay
  overlay: { flex: 1 },

  messageBox: { backgroundColor: '#FEE2E2', marginHorizontal: 16, borderRadius: 12, padding: 12, marginTop: 10 },
  messageText: { color: '#B91C1C', textAlign: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerBtnActive: { backgroundColor: '#7C3AED' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 },

  // Viewfinder
  frame: {
    alignSelf: 'center',
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute', width: 36, height: 36,
    borderColor: '#FFF', borderWidth: 3,
  },
  topLeft:     { top: 0, left: 0,  borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  topRight:    { top: 0, right: 0, borderLeftWidth: 0,  borderBottomWidth: 0, borderTopRightRadius: 12 },
  bottomLeft:  { bottom: 0, left: 0,  borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0,  borderTopWidth: 0, borderBottomRightRadius: 12 },
  frameHint: {
    position: 'absolute', bottom: -30,
    color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600',
  },

  // Analysing
  analysingBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  analysingText:    { color: '#FFF', fontSize: 18, fontWeight: '800', marginTop: 16 },
  analysingSubtext: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6 },

  // Controls
  controls: {
    position: 'absolute', bottom: 50,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  sideBtn: { alignItems: 'center', gap: 4 },
  sideBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  captureBtn: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 4, borderColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  captureRing: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
  },
});
