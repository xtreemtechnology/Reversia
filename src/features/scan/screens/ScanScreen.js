import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../../../config/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useTheme } from "../../../theme/ThemeProvider";

export default function ScanScreen({ navigation }) {
  const { colors } = useTheme();
  const isDark = colors.background !== "#FFFFFF";
  const { width: screenWidth } = useWindowDimensions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foodData, setFoodData] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [scanLineAnim] = useState(new Animated.Value(0));
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [debugStatus, setDebugStatus] = useState({});
  const [message, setMessage] = useState(null);
  const styles = getStyles(colors, isDark);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const handleScan = async () => {
    setIsAnalyzing(true);
    setMessage(null);
    try {
      try {
        if (cameraRef.current && cameraRef.current.takePictureAsync) {
          await cameraRef.current.takePictureAsync({
            base64: false,
            quality: 0.5,
          });
        }
      } catch (e) {
        // ignore capture errors
      }

      if (!scannedBarcode) {
        setMessage(
          "No barcode detected yet. Point the camera at a barcode and try again."
        );
        setIsAnalyzing(false);
        return;
      }

      await lookupBarcode(scannedBarcode);
    } catch (error) {
      console.error("Scan error:", error);
      const errorMsg = error.message.includes("Camera")
        ? "Unable to access camera. Please check permissions."
        : error.message.includes("timeout")
        ? "Scan timed out. Please try again."
        : "Failed to scan. Please ensure the barcode is visible.";
      setMessage(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const lookupBarcode = async (barcode) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const tryPaths = [
        () => getDoc(doc(db, "foods", barcode)),
        () => getDoc(doc(db, "food_items", barcode)),
        () => getDoc(doc(db, "users", user.uid, "meals", barcode)),
        () => getDoc(doc(db, "users", user.uid, "food_items", barcode)),
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

      setMessage(
        `This food item (barcode: ${barcode}) is not in our database.`
      );
      setFoodData(null);
    } catch (err) {
      console.error("Lookup error", err);
      setMessage("Could not lookup barcode.");
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (!data || scannedBarcode === data) {
      return;
    }
    setScannedBarcode(data);
    setIsAnalyzing(true);
    await lookupBarcode(data);
    setIsAnalyzing(false);
    setTimeout(() => setScannedBarcode(null), 5000);
  };

  const handleAddToMealPlan = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setMessage("Please log in first.");
        return;
      }

      if (!foodData) {
        setMessage("No food data to save.");
        return;
      }

      await addDoc(collection(db, "users", currentUser.uid, "logs"), {
        userId: currentUser.uid,
        type: "meal",
        value: foodData.name,
        foodName: foodData.name,
        netCarbs: foodData.netCarbs,
        barcode: scannedBarcode,
        period: "Scanned Meal",
        timestamp: serverTimestamp(),
      });

      setMessage("Added to your meal plan!");
      setFoodData(null);
      setScannedBarcode(null);
    } catch (error) {
      console.error("Add to meal error:", error);
      const addErrorMsg = error.message.includes("permission")
        ? "You do not have permission to add meals."
        : error.message.includes("network")
        ? "Network connection failed. Please try again."
        : "Could not save meal. Please try again.";
      setMessage(addErrorMsg);
    }
  };

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenWidth * 0.7],
  });

  useEffect(() => {
    if (!permission) {
      return;
    }
    if (!permission.granted) {
      requestPermission();
    }
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

      {message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

      <View style={styles.scannerContainer}>
        {!permission || !permission.granted ? (
          <View style={styles.viewfinder}>
            <MaterialCommunityIcons
              name="camera-off"
              size={56}
              color={colors.muted}
            />
            <Text style={[styles.hintText, { marginTop: 12 }]}>
              Camera access required
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={() => requestPermission()}
            >
              <Text style={styles.permissionButtonText}>
                Grant camera access
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.viewfinder}>
            <CameraView
              ref={cameraRef}
              style={styles.cameraView}
              onBarCodeScanned={handleBarCodeScanned}
              barCodeScannerSettings={{}}
              facing="environment"
            />
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY }] }]}
            />
          </View>
        )}
        <Text style={styles.hintText}>Center the product label or barcode</Text>
      </View>

      {(isAnalyzing || foodData) && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.foodIconBox}>
              <MaterialCommunityIcons
                name={isAnalyzing ? "magnify" : "corn"}
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.foodNameContainer}>
              <View style={styles.statusRow}>
                {isAnalyzing && (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={styles.loadingIcon}
                  />
                )}
                <Text style={styles.scanStatus}>
                  {isAnalyzing ? "Analyzing..." : "Identity Confirmed"}
                </Text>
              </View>
              <Text style={styles.foodName}>
                {isAnalyzing
                  ? "Scanning food..."
                  : foodData?.name || "Whole Grain Oats"}
              </Text>
            </View>
            {!isAnalyzing && foodData && (
              <View style={styles.safetyBadge}>
                <Text style={styles.safetyText}>
                  {foodData.score || "9.2"} SCORE
                </Text>
              </View>
            )}
          </View>

          {!isAnalyzing && (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>INSULIN IMPACT</Text>
                  <Text style={styles.statValue}>
                    {foodData?.impact || "N/A"}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>NET CARBS</Text>
                  <Text style={styles.statValue}>
                    {foodData?.netCarbs || "0"}g
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>FIBER</Text>
                  <Text style={styles.statValue}>
                    {foodData?.fiber || "0"}g
                  </Text>
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

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 20, alignItems: "center", paddingTop: 10 },
    title: { fontSize: 22, fontWeight: "800", color: colors.text },
    subtitle: { fontSize: 14, color: colors.muted, marginTop: 4 },
    messageBox: {
      backgroundColor: isDark ? "#3B1D1D" : "#FEE2E2",
      marginHorizontal: 20,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    messageText: { color: isDark ? "#FCA5A5" : "#B91C1C", textAlign: "center" },
    permissionButton: { marginTop: 12 },
    permissionButtonText: { color: colors.primary, fontWeight: "700" },
    scannerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 80,
      paddingBottom: 20,
    },
    viewfinder: {
      width: "70%",
      aspectRatio: 1,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    },
    cameraView: { width: "100%", height: "100%" },
    scanLine: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: colors.primary,
      zIndex: 1,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
    },
    corner: {
      position: "absolute",
      width: 40,
      height: 40,
      borderColor: colors.primary,
      borderWidth: 4,
      zIndex: 2,
    },
    topLeft: {
      top: 0,
      left: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderTopLeftRadius: 20,
    },
    topRight: {
      top: 0,
      right: 0,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
      borderTopRightRadius: 20,
    },
    bottomLeft: {
      bottom: 0,
      left: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomLeftRadius: 20,
    },
    bottomRight: {
      bottom: 0,
      right: 0,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      borderBottomRightRadius: 20,
    },
    hintText: { color: colors.text, marginTop: 30, fontSize: 14, opacity: 0.8 },
    loadingIcon: { marginRight: 5 },
    resultCard: {
      backgroundColor: colors.card,
      margin: 20,
      borderRadius: 28,
      padding: 18,
      position: "absolute",
      bottom: 90,
      width: "auto",
      left: 0,
      right: 0,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    foodIconBox: {
      width: 48,
      height: 48,
      backgroundColor: isDark ? "#312E81" : "#F3F4FF",
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    foodNameContainer: { flex: 1 },
    statusRow: { flexDirection: "row", alignItems: "center" },
    scanStatus: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    foodName: { fontSize: 18, fontWeight: "800", color: colors.text },
    safetyBadge: {
      backgroundColor: isDark ? "#14532D" : "#DCFCE7",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    safetyText: { color: "#15803D", fontSize: 11, fontWeight: "800" },
    statsRow: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 15,
      marginBottom: 15,
    },
    statItem: { flex: 1, alignItems: "center" },
    statLabel: {
      fontSize: 9,
      color: colors.muted,
      marginBottom: 4,
      fontWeight: "700",
    },
    statValue: { fontSize: 13, fontWeight: "800", color: colors.text },
    statDivider: {
      width: 1,
      height: 20,
      backgroundColor: colors.border,
      alignSelf: "center",
    },
    logButton: {
      backgroundColor: colors.primary,
      borderRadius: 18,
      padding: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    logButtonText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
    controls: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingBottom: 80,
      paddingHorizontal: 30,
    },
    controlBtn: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.1)"
        : "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    captureBtn: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 4,
      borderColor: isDark ? colors.card : "#FFF",
      justifyContent: "center",
      alignItems: "center",
    },
    captureInner: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.background,
    },
  });
