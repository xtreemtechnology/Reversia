// src/features/meals/screens/MealAnalyser.js
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
/* eslint-disable react-native/no-inline-styles */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../../../config/firebase";
import { analyseWithClaude } from "../services/mealAnalysisService";
import { logAIAnalyzedMeal } from "../services/mealsService";
import { useTheme } from "../../../theme/ThemeProvider";

const MacroPill = ({ label, value, unit, color, iconName }) => {
  const { colors } = useTheme();
  const styles = getMacroStyles(colors);

  return (
    <View style={styles.pill}>
      <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={iconName} size={16} color={color} />
      </View>
      <Text style={[styles.value, { color: colors.text }]}>
        {value}
        <Text style={[styles.unit, { color: colors.muted }]}>{unit}</Text>
      </Text>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
    </View>
  );
};

const GIBadge = ({ level }) => {
  const map = {
    Low: { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
    Medium: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
    High: { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  };
  const c = map[level] || map.Medium;

  return (
    <View style={[badgeStyles.badge, { backgroundColor: c.bg }]}>
      <View style={[badgeStyles.dot, { backgroundColor: c.dot }]} />
      <Text style={[badgeStyles.text, { color: c.text }]}>GI: {level}</Text>
    </View>
  );
};

const ImpactBadge = ({ level }) => {
  const map = {
    Low: { bg: "#D1FAE5", text: "#065F46" },
    Moderate: { bg: "#FEF3C7", text: "#92400E" },
    High: { bg: "#FEE2E2", text: "#991B1B" },
  };
  const c = map[level] || map.Moderate;

  return (
    <View style={[impactStyles.badge, { backgroundColor: c.bg }]}>
      <Text style={[impactStyles.text, { color: c.text }]}>
        💉 Insulin Impact: {level}
      </Text>
    </View>
  );
};

const ScoreRing = ({ score }) => {
  const { colors } = useTheme();
  const styles = getScoreStyles(colors);
  const color = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <View style={[styles.ring, { borderColor: color }]}>
      <Text style={[styles.score, { color }]}>{score}</Text>
      <Text style={styles.label}>Score</Text>
    </View>
  );
};

const ResultCard = ({ result, imageUri, onLog, onRetake, logging }) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const styles = getResultStyles(colors, isDark);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumb} />
        ) : null}
        <View style={styles.summary}>
          <Text style={[styles.status, { color: colors.primary }]}>
            ✓ Identity Confirmed
          </Text>
          <Text style={[styles.foodName, { color: colors.text }]}>
            {result.foodName}
          </Text>
          <Text style={[styles.serving, { color: colors.muted }]}>
            {result.servingSize}
          </Text>
          <View style={styles.badgesRow}>
            <GIBadge level={result.glycemicIndex} />
            <ImpactBadge level={result.insulinImpact} />
          </View>
        </View>
        <ScoreRing score={result.healthScore} />
      </View>

      <View style={styles.macrosRow}>
        <MacroPill
          label="Calories"
          value={result.calories}
          unit=" kcal"
          color="#7C3AED"
          iconName="fire"
        />
        <MacroPill
          label="Protein"
          value={result.protein}
          unit="g"
          color="#10B981"
          iconName="arm-flex"
        />
        <MacroPill
          label="Carbs"
          value={result.carbs}
          unit="g"
          color="#F59E0B"
          iconName="bread-slice"
        />
        <MacroPill
          label="Fats"
          value={result.fats}
          unit="g"
          color="#3B82F6"
          iconName="water"
        />
      </View>

      <View style={[styles.extraRow, { borderColor: colors.border }]}>
        <View style={styles.extraItem}>
          <Text style={[styles.extraLabel, { color: colors.muted }]}>
            Fiber
          </Text>
          <Text style={[styles.extraValue, { color: colors.text }]}>
            {result.fiber}g
          </Text>
        </View>
        <View
          style={[styles.extraDivider, { backgroundColor: colors.border }]}
        />
        <View style={styles.extraItem}>
          <Text style={[styles.extraLabel, { color: colors.muted }]}>
            Sugar
          </Text>
          <Text style={[styles.extraValue, { color: colors.text }]}>
            {result.sugar}g
          </Text>
        </View>
        <View
          style={[styles.extraDivider, { backgroundColor: colors.border }]}
        />
        <View style={styles.extraItem}>
          <Text style={[styles.extraLabel, { color: colors.muted }]}>
            Diabetes Safe
          </Text>
          <Text
            style={[
              styles.extraValue,
              { color: result.diabetesSafe ? "#10B981" : "#EF4444" },
            ]}
          >
            {result.diabetesSafe ? "✓ Yes" : "✗ No"}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.tipBox,
          { backgroundColor: isDark ? "rgba(124,58,237,0.22)" : "#F5F3FF" },
        ]}
      >
        <MaterialCommunityIcons
          name="lightning-bolt"
          size={16}
          color={colors.primary}
        />
        <Text
          style={[styles.tipText, { color: isDark ? "#DDD6FE" : "#5B21B6" }]}
        >
          {result.tip}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.retakeBtn,
            { borderColor: colors.border, backgroundColor: colors.background },
          ]}
          onPress={onRetake}
        >
          <Ionicons name="camera-outline" size={18} color={colors.text} />
          <Text style={[styles.retakeBtnText, { color: colors.text }]}>
            Retake
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.logBtn,
            { backgroundColor: colors.primary },
            logging && { opacity: 0.7 },
          ]}
          onPress={onLog}
          disabled={logging}
        >
          {logging ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={18}
                color="#FFF"
              />
              <Text style={styles.logBtnText}>Log Food</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function MealAnalyser({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const styles = getStyles(colors, isDark);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState(null);
  const [logging, setLogging] = useState(false);
  const [facing, setFacing] = useState("back");
  const [flashOn, setFlashOn] = useState(false);
  const [message, setMessage] = useState(null);

  const cameraRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const viewfinderSize = Math.min(Math.floor(screenWidth * 0.75), 520);
  const viewfinderTop = Math.max(Math.floor(screenHeight * 0.08), 24);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (result) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [fadeAnim, result]);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const runAnalysis = async (base64) => {
    setResult(null);
    setIsAnalysing(true);
    try {
      const data = await analyseWithClaude(base64);
      setResult(data);
    } catch (err) {
      console.error("Analysis error:", err);
      setMessage(
        "Could not analyse this image. Please try a clearer photo of the food."
      );
      handleRetake();
    } finally {
      setIsAnalysing(false);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        exif: false,
      });
      setCapturedUri(photo.uri);
      await runAnalysis(photo.base64);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const pickFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setMessage(
          "Please enable photo library access in your settings to use this feature."
        );
        return;
      }

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.7,
      });

      if (!picked.canceled && picked.assets?.[0]) {
        const asset = picked.assets[0];
        setCapturedUri(asset.uri);
        await runAnalysis(asset.base64);
      }
    } catch (err) {
      console.error("Gallery access error:", err);
      setMessage("Could not access your photo library. Please try again.");
    }
  };

  const handleLog = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("Please log in first.");
      return;
    }

    if (!result) {
      return;
    }

    setLogging(true);
    try {
      await logAIAnalyzedMeal(result, capturedUri);
      setMessage(`${result.foodName} has been added to your meal log.`);
      navigation.goBack();
    } catch (err) {
      setMessage(`Failed to log meal: ${err.message}`);
    } finally {
      setLogging(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setCapturedUri(null);
    setIsAnalysing(false);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <MaterialCommunityIcons
          name="camera-off"
          size={56}
          color={colors.muted}
        />
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permSub}>
          Reversia needs your camera to analyse meals with AI.
        </Text>
        <TouchableOpacity
          style={[styles.permBtn, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
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
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flashOn ? "on" : "off"}
      />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBtn}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI Meal Analyser</Text>
            <Text style={styles.headerSub}>
              Snap your food for instant insights
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setFlashOn((value) => !value)}
            style={[styles.headerBtn, flashOn && styles.headerBtnActive]}
          >
            <Ionicons
              name={flashOn ? "flash" : "flash-off"}
              size={20}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        {message ? (
          <View
            style={[
              styles.messageBox,
              { backgroundColor: isDark ? "#4C1D1D" : "#FEE2E2" },
            ]}
          >
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}

        {!result && !isAnalysing ? (
          <View
            style={[
              styles.frame,
              {
                width: viewfinderSize,
                height: viewfinderSize,
                marginTop: viewfinderTop,
              },
            ]}
          >
            {["topLeft", "topRight", "bottomLeft", "bottomRight"].map(
              (position) => (
                <View
                  key={position}
                  style={[styles.corner, styles[position]]}
                />
              )
            )}
            <Text style={styles.frameHint}>Position food in frame</Text>
          </View>
        ) : null}

        {isAnalysing ? (
          <View style={styles.analysingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.analysingText}>Analysing with AI...</Text>
            <Text style={styles.analysingSubtext}>
              Detecting food & nutrients
            </Text>
          </View>
        ) : null}

        {capturedUri && !isAnalysing ? (
          <Image
            source={{ uri: capturedUri }}
            style={StyleSheet.absoluteFill}
            blurRadius={result ? 6 : 0}
          />
        ) : null}

        {result && !isAnalysing ? (
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            <ResultCard
              result={result}
              imageUri={capturedUri}
              onLog={handleLog}
              onRetake={handleRetake}
              logging={logging}
            />
          </Animated.View>
        ) : null}

        {!result && !isAnalysing ? (
          <View style={styles.controls}>
            <TouchableOpacity style={styles.sideBtn} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={24} color="#FFF" />
              <Text style={styles.sideBtnText}>Gallery</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
                <View style={styles.captureRing}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={28}
                    color="#111827"
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.sideBtn}
              onPress={() =>
                setFacing((value) => (value === "back" ? "front" : "back"))
              }
            >
              <Ionicons name="camera-reverse-outline" size={24} color="#FFF" />
              <Text style={styles.sideBtnText}>Flip</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const getMacroStyles = (colors) =>
  StyleSheet.create({
    pill: {
      flex: 1,
      alignItems: "center",
      borderRadius: 16,
      paddingVertical: 12,
      marginHorizontal: 4,
      borderWidth: 1,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    iconBox: {
      width: 32,
      height: 32,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6,
    },
    value: { fontSize: 16, fontWeight: "800" },
    unit: { fontSize: 10, fontWeight: "500" },
    label: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  });

const badgeStyles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: "800" },
});

const impactStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "700" },
});

const getScoreStyles = (colors) =>
  StyleSheet.create({
    ring: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    score: { fontSize: 18, fontWeight: "800" },
    label: {
      fontSize: 9,
      color: colors.muted,
      fontWeight: "600",
      marginTop: -2,
    },
  });

const getResultStyles = (colors, isDark) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 24,
      margin: 16,
      padding: 16,
      justifyContent: "space-between",
    },
    topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
    thumb: {
      width: 68,
      height: 68,
      borderRadius: 18,
      backgroundColor: colors.background,
    },
    summary: { flex: 1 },
    status: { fontSize: 12, fontWeight: "700" },
    foodName: { fontSize: 22, fontWeight: "800", marginTop: 2 },
    serving: { fontSize: 12, marginTop: 2 },
    badgesRow: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
    macrosRow: { flexDirection: "row", marginTop: 14 },
    extraRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 16,
      padding: 12,
      marginTop: 14,
    },
    extraItem: { flex: 1, alignItems: "center" },
    extraLabel: { fontSize: 11, fontWeight: "600" },
    extraValue: { fontSize: 14, fontWeight: "800", marginTop: 4 },
    extraDivider: { width: 1, alignSelf: "stretch", marginHorizontal: 8 },
    tipBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      borderRadius: 12,
      padding: 12,
      marginTop: 14,
    },
    tipText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: "500" },
    actions: { flexDirection: "row", gap: 10, marginTop: 14 },
    retakeBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flex: 1,
      height: 50,
      borderRadius: 16,
      borderWidth: 1.5,
      justifyContent: "center",
    },
    retakeBtnText: { fontSize: 14, fontWeight: "700" },
    logBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flex: 2,
      height: 50,
      borderRadius: 16,
      justifyContent: "center",
    },
    logBtnText: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  });

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    permissionScreen: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    permTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      marginTop: 20,
      marginBottom: 8,
      textAlign: "center",
    },
    permSub: {
      fontSize: 14,
      color: colors.muted,
      textAlign: "center",
      lineHeight: 21,
      marginBottom: 28,
    },
    permBtn: {
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 20,
      marginBottom: 14,
    },
    permBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
    permBack: { color: colors.muted, fontSize: 14 },
    overlay: { flex: 1 },
    messageBox: {
      marginHorizontal: 16,
      borderRadius: 12,
      padding: 12,
      marginTop: 10,
    },
    messageText: { color: isDark ? "#FCA5A5" : "#B91C1C", textAlign: "center" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    headerBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(255,255,255,0.15)",
      justifyContent: "center",
      alignItems: "center",
    },
    headerBtnActive: { backgroundColor: colors.primary },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 16, fontWeight: "800", color: "#FFF" },
    headerSub: {
      fontSize: 11,
      color: "rgba(255,255,255,0.6)",
      marginTop: 1,
      textAlign: "center",
    },
    frame: {
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    corner: {
      position: "absolute",
      width: 36,
      height: 36,
      borderColor: "#FFF",
      borderWidth: 3,
    },
    topLeft: {
      top: 0,
      left: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderTopLeftRadius: 12,
    },
    topRight: {
      top: 0,
      right: 0,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
      borderTopRightRadius: 12,
    },
    bottomLeft: {
      bottom: 0,
      left: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomLeftRadius: 12,
    },
    bottomRight: {
      bottom: 0,
      right: 0,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      borderBottomRightRadius: 12,
    },
    frameHint: {
      position: "absolute",
      bottom: -30,
      color: "rgba(255,255,255,0.7)",
      fontSize: 13,
      fontWeight: "600",
    },
    analysingBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.65)",
    },
    analysingText: {
      color: "#FFF",
      fontSize: 18,
      fontWeight: "800",
      marginTop: 16,
    },
    analysingSubtext: {
      color: "rgba(255,255,255,0.6)",
      fontSize: 13,
      marginTop: 6,
    },
    controls: {
      position: "absolute",
      bottom: 50,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    sideBtn: { alignItems: "center", gap: 4 },
    sideBtnText: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 11,
      fontWeight: "600",
    },
    captureBtn: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 4,
      borderColor: "#FFF",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
    },
    captureRing: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "#FFF",
      justifyContent: "center",
      alignItems: "center",
    },
  });
