// screens/PhotoLogScreen.js
// Photo meal logging - snap or pick a photo, AI analyses the meal
// Design: dark warm palette, matching Reversia design system

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { analyzeMealImage } from "../services/aiService";
import SolarIcon from "../../../components/SolarIcon";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const MOCK_ANALYSIS = {
  name: "Jollof Rice with Fried Chicken",
  items: [
    {
      name: "Jollof Rice",
      amount: "1 cup",
      cal: 340,
      protein: "7g",
      carbs: "62g",
      fat: "7g",
    },
    {
      name: "Fried Chicken",
      amount: "1 piece",
      cal: 290,
      protein: "25g",
      carbs: "8g",
      fat: "18g",
    },
    {
      name: "Fried Plantain",
      amount: "3 slices",
      cal: 120,
      protein: "1g",
      carbs: "27g",
      fat: "3g",
    },
  ],
  totalCal: 750,
  confidence: 82,
};

function StepIndicator({ step }) {
  const steps = ["Photo", "Review", "Confirm"];
  return (
    <View style={si.row}>
      {steps.map((s, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <React.Fragment key={s}>
            <View style={si.stepCol}>
              <View
                style={[si.dot, done && si.dotDone, current && si.dotCurrent]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={10} color="#211613" />
                ) : (
                  <Text style={[si.dotNum, current && { color: "#D88939" }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text style={[si.label, current && si.labelActive]}>{s}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[si.line, done && si.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const si = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  stepCol: { alignItems: "center", gap: 4 },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#3A2A25",
    borderWidth: 1.5,
    borderColor: "#402E29",
    alignItems: "center",
    justifyContent: "center",
  },
  dotCurrent: { borderColor: "#D88939" },
  dotDone: { backgroundColor: "#D88939", borderColor: "#D88939" },
  dotNum: { fontSize: 11, color: "#9A8478", fontWeight: "700" },
  label: { fontSize: 10, color: "#9A8478", fontWeight: "600" },
  labelActive: { color: "#D88939" },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: "#3A2A25",
    marginHorizontal: 6,
    marginBottom: 14,
  },
  lineDone: { backgroundColor: "#D88939" },
});

export default function PhotoLogScreen({ navigation, route }) {
  const [step, setStep] = useState(0);
  const [photoUri, setPhotoUri] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [mealType, setMealType] = useState(route?.params?.mealType || "Lunch");

  const handlePhotoSelection = async (result) => {
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }
    const asset = result.assets[0];
    setPhotoUri(asset.uri);
    setStep(1);
    setAnalysing(true);

    try {
      const isApiKeySet = Boolean(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
      if (isApiKeySet) {
        const resultData = await analyzeMealImage(asset.uri, asset.base64);
        setAnalysis(resultData);
      } else {
        // Warning + Fallback
        Alert.alert(
          "Gemini API Key Missing",
          "EXPO_PUBLIC_GEMINI_API_KEY is not set in your .env file. Showing a simulated meal analysis for testing.",
          [{ text: "OK" }]
        );
        setAnalysis(MOCK_ANALYSIS);
      }
    } catch (err) {
      console.error("AI Photo analysis failed:", err);
      Alert.alert(
        "Analysis Error",
        "Failed to analyze photo: " + (err.message || err)
      );
      setAnalysis(MOCK_ANALYSIS);
    } finally {
      setAnalysing(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Reversia needs camera permission to snap photos of your meals."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      await handlePhotoSelection(result);
    } catch (error) {
      console.error("Failed to take photo:", error);
      Alert.alert("Camera Error", "Could not capture image. Please try again.");
    }
  };

  const choosePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      await handlePhotoSelection(result);
    } catch (error) {
      console.error("Failed to choose photo:", error);
      Alert.alert("Gallery Error", "Could not choose image. Please try again.");
    }
  };

  const retake = () => {
    setPhotoUri(null);
    setAnalysis(null);
    setAnalysing(false);
    setStep(0);
  };

  const confirm = () => {
    setStep(2);
    setTimeout(() => {
      const notes = analysis?.items
        ?.map((item) => `${item.name} (${item.amount}, ${item.cal} kcal)`)
        .join("; ");

      navigation?.navigate("MealEntry", {
        mealType,
        mealName: analysis?.name || "",
        notes: notes || "Photo analysis result",
        source: "photo_log",
      });
    }, 900);
  };

  const totalProtein =
    analysis?.items.reduce((a, i) => a + parseInt(i.protein, 10), 0) ?? 0;
  const totalCarbs =
    analysis?.items.reduce((a, i) => a + parseInt(i.carbs, 10), 0) ?? 0;
  const totalFat =
    analysis?.items.reduce((a, i) => a + parseFloat(i.fat), 0) ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#211613" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#F4EAE4" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Photo Log</Text>
          <Text style={styles.headerSub}>Snap your plate</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.stepWrap}>
        <StepIndicator step={step} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {step === 0 && (
          <>
            <View style={styles.card}>
              <View style={styles.cardLabelRow}>
                <View style={styles.iconBadge}>
                  <Ionicons
                    name="restaurant-outline"
                    size={15}
                    color="#9A8478"
                  />
                </View>
                <Text style={styles.cardLabel}>Meal Type</Text>
              </View>
              <View style={styles.mealTypeRow}>
                {MEAL_TYPES.map((t) => {
                  const active = mealType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setMealType(t)}
                      activeOpacity={0.8}
                      style={[
                        styles.mealTypeBtn,
                        active && styles.mealTypeBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.mealTypeBtnText,
                          active && styles.mealTypeBtnTextActive,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.pickRow}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={takePhoto}
                style={styles.pickCard}
              >
                <View style={[styles.pickIconCircle, styles.pickIconPrimary]}>
                  <Ionicons name="camera" size={32} color="#D88939" />
                </View>
                <Text style={styles.pickLabel}>Take Photo</Text>
                <Text style={styles.pickSub}>Point at your plate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={choosePhoto}
                style={styles.pickCard}
              >
                <View style={[styles.pickIconCircle, styles.pickIconMuted]}>
                  <Ionicons name="images" size={32} color="#6A816A" />
                </View>
                <Text style={styles.pickLabel}>Choose Photo</Text>
                <Text style={styles.pickSub}>From your gallery</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tipBox}>
              <Ionicons
                name="bulb-outline"
                size={15}
                color="#9A8478"
                style={styles.iconMR9}
              />
              <Text style={styles.tipText}>
                Best results when the plate is well-lit and all food items are
                visible.
              </Text>
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <View style={styles.photoPreviewCard}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <TouchableOpacity onPress={retake} style={styles.retakeBtn}>
                <Ionicons
                  name="refresh"
                  size={15}
                  color="#F4EAE4"
                  style={styles.iconMR6}
                />
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
            </View>

            {analysing ? (
              <View style={styles.analysingCard}>
                <ActivityIndicator
                  size="large"
                  color="#D88939"
                  style={styles.activityMB16}
                />
                <Text style={styles.analysingTitle}>
                  Analysing your plate...
                </Text>
                <Text style={styles.analysingBody}>
                  Reversia is identifying the food items and estimating
                  portions.
                </Text>
                <View style={styles.shimmerRow}>
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      style={[styles.shimmerDot, { opacity: 0.4 + i * 0.2 }]}
                    />
                  ))}
                </View>
              </View>
            ) : analysis ? (
              <>
                <View style={styles.confidenceBanner}>
                  <Ionicons
                    name="sparkles-outline"
                    size={14}
                    color="#D88939"
                    style={styles.iconMR7}
                  />
                  <Text style={styles.confidenceText}>
                    AI confidence: {analysis.confidence}% - Review items below
                  </Text>
                </View>

                <View style={styles.card}>
                  <View style={styles.cardLabelRow}>
                    <View style={[styles.iconBadge, styles.iconBadgePrimary]}>
                      <SolarIcon
                        name="plate-bold-duotone"
                        size={15}
                        color="#D88939"
                      />
                    </View>
                    <Text style={styles.cardLabel}>{analysis.name}</Text>
                    <View style={styles.calBadge}>
                      <Text style={styles.calBadgeText}>
                        {analysis.totalCal} kcal
                      </Text>
                    </View>
                  </View>

                  <View style={styles.macroRow}>
                    {[
                      {
                        label: "Protein",
                        val: `${totalProtein}g`,
                        color: "#6A816A",
                      },
                      {
                        label: "Carbs",
                        val: `${totalCarbs}g`,
                        color: "#D88939",
                      },
                      { label: "Fat", val: `${totalFat}g`, color: "#E3B372" },
                    ].map((m) => (
                      <View
                        key={m.label}
                        style={[
                          styles.macroPill,
                          { borderColor: `${m.color}40` },
                        ]}
                      >
                        <Text style={[styles.macroPillVal, { color: m.color }]}>
                          {m.val}
                        </Text>
                        <Text style={styles.macroPillLabel}>{m.label}</Text>
                      </View>
                    ))}
                  </View>

                  {analysis.items.map((item, i) => (
                    <View key={item.name}>
                      <View style={styles.foodRow}>
                        <View style={styles.foodDot} />
                        <View style={styles.foodGrow}>
                          <Text style={styles.foodName}>{item.name}</Text>
                          <Text style={styles.foodMeta}>
                            {item.amount} - {item.cal} kcal
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.editItemBtn}
                          onPress={() => {
                            Alert.prompt(
                              "Edit food name",
                              `Current: ${item.name}`,
                              (newName) => {
                                if (newName && newName.trim()) {
                                  setAnalysis((prev) => ({
                                    ...prev,
                                    items: prev.items.map((it, idx) =>
                                      idx === i ? { ...it, name: newName.trim() } : it
                                    ),
                                  }));
                                }
                              },
                              "plain-text",
                              item.name
                            );
                          }}
                        >
                          <Ionicons
                            name="pencil-outline"
                            size={13}
                            color="#9A8478"
                          />
                        </TouchableOpacity>
                      </View>
                      {i < analysis.items.length - 1 && (
                        <View style={styles.divider} />
                      )}
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.saveBtn}
                  onPress={confirm}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#211613"
                    style={styles.iconMR8}
                  />
                  <Text style={styles.saveBtnText}>
                    Confirm and Save {mealType}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={retake}
                  style={styles.retakeTextBtn}
                >
                  <Text style={styles.retakeTextBtnText}>
                    Photo does not look right? Retake
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </>
        )}

        {step === 2 && (
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={52} color="#6A816A" />
            </View>
            <Text style={styles.successTitle}>Meal saved</Text>
            <Text style={styles.successBody}>
              {analysis?.name ?? "Your meal"} has been added to your story.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#211613" },
  scroll: { paddingBottom: 48 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2D201C",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#F4EAE4" },
  headerSub: { fontSize: 12, color: "#9A8478", marginTop: 2 },
  stepWrap: { paddingHorizontal: 40 },

  card: {
    backgroundColor: "#2D201C",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(154,132,120,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardLabel: { fontSize: 14, fontWeight: "700", color: "#F4EAE4", flex: 1 },
  calBadge: {
    backgroundColor: "rgba(216,137,57,0.15)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  calBadgeText: { fontSize: 12, fontWeight: "700", color: "#D88939" },

  mealTypeRow: { flexDirection: "row", gap: 8 },
  mealTypeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#3A2A25",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  mealTypeBtnActive: {
    backgroundColor: "rgba(216,137,57,0.15)",
    borderColor: "#D88939",
  },
  mealTypeBtnText: { fontSize: 12, color: "#9A8478", fontWeight: "600" },
  mealTypeBtnTextActive: { color: "#D88939", fontWeight: "700" },

  pickRow: {
    flexDirection: "row",
    gap: 14,
    marginHorizontal: 24,
    marginBottom: 14,
  },
  pickCard: {
    flex: 1,
    backgroundColor: "#2D201C",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  pickIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pickLabel: { fontSize: 15, fontWeight: "700", color: "#F4EAE4" },
  pickSub: { fontSize: 12, color: "#9A8478", textAlign: "center" },

  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 24,
    marginBottom: 14,
    backgroundColor: "#2D201C",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  tipText: { fontSize: 13, color: "#9A8478", flex: 1, lineHeight: 18 },

  photoPreviewCard: {
    marginHorizontal: 24,
    marginBottom: 14,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  photoPreview: { width: "100%", height: 240 },
  retakeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(33,22,19,0.80)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  retakeBtnText: { fontSize: 12, color: "#F4EAE4", fontWeight: "600" },

  analysingCard: {
    backgroundColor: "#2D201C",
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 24,
    marginBottom: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  analysingTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F4EAE4",
    marginBottom: 8,
  },
  analysingBody: {
    fontSize: 13,
    color: "#9A8478",
    textAlign: "center",
    lineHeight: 19,
  },
  shimmerRow: { flexDirection: "row", gap: 8, marginTop: 20 },
  shimmerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D88939",
  },

  confidenceBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: "rgba(216,137,57,0.10)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(216,137,57,0.20)",
  },
  confidenceText: { fontSize: 12, color: "#D88939", fontWeight: "600" },

  macroRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  macroPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  macroPillVal: { fontSize: 14, fontWeight: "700" },
  macroPillLabel: { fontSize: 10, color: "#9A8478", marginTop: 2 },

  foodRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  foodDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D88939",
    marginRight: 12,
  },
  foodGrow: { flex: 1 },
  foodName: { fontSize: 14, fontWeight: "600", color: "#F4EAE4" },
  foodMeta: { fontSize: 12, color: "#9A8478", marginTop: 2 },
  editItemBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3A2A25",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.04)" },

  saveBtn: {
    backgroundColor: "#D88939",
    borderRadius: 20,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginBottom: 12,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#211613" },

  retakeTextBtn: { alignItems: "center", paddingVertical: 10 },
  retakeTextBtnText: { fontSize: 13, color: "#9A8478" },

  successCard: {
    backgroundColor: "#2D201C",
    borderRadius: 28,
    padding: 40,
    marginHorizontal: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(106,129,106,0.20)",
  },
  successIcon: { marginBottom: 8 },
  successTitle: { fontSize: 22, fontWeight: "700", color: "#F4EAE4" },
  successBody: {
    fontSize: 14,
    color: "#9A8478",
    textAlign: "center",
    lineHeight: 20,
  },
  pickIconPrimary: { backgroundColor: "rgba(216,137,57,0.12)" },
  pickIconMuted: { backgroundColor: "rgba(106,129,106,0.12)" },
  iconMR9: { marginRight: 9 },
  iconMR6: { marginRight: 6 },
  activityMB16: { marginBottom: 16 },
  iconMR7: { marginRight: 7 },
  iconMR8: { marginRight: 8 },
  iconBadgePrimary: { backgroundColor: "rgba(216,137,57,0.15)" },
});
