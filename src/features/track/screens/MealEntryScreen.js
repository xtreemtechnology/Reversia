// screens/track/MealEntryScreen.jsx
//
// Redesigned to match the full Reversia design system:
// — Same card/border/radius tokens as Home, Track, Learn, Profile
// — PlusJakartaSans headings, DMSans body
// — Staggered entrance animations
// — Consistent pill selectors, inputs, buttons
//
// Dependencies (already in project):
//   npx expo install expo-camera
//   npx expo install react-native-reanimated
//   npx expo install @expo/vector-icons

import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import { trackEvent } from "../../../utils/analytics";
import secureStorage from "../../../utils/secureStorage";

// ── Constants ─────────────────────────────────────────────────────────────────

const MEAL_TYPES = [
  { label: "Breakfast", icon: "sunny-outline" },
  { label: "Lunch", icon: "restaurant-outline" },
  { label: "Dinner", icon: "moon-outline" },
  { label: "Snack", icon: "leaf-outline" },
];

// ── Animated section wrapper ──────────────────────────────────────────────────

function FadeSlide({ delay = 0, children }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    y.value = withDelay(
      delay,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, [delay, opacity, y]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

// ── Camera permission screen ──────────────────────────────────────────────────

function CameraPermissionScreen({ onGrant, onSkip, colors }) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 13, stiffness: 120 });
    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={cpSt.root}>
      <Animated.View style={[cpSt.inner, animStyle]}>
        {/* Icon */}
        <View
          style={[cpSt.iconWrap, { backgroundColor: colors.primary + "1A" }]}
        >
          <Ionicons name="camera" size={40} color={colors.primary} />
        </View>

        <View style={cpSt.textGroup}>
          <Text style={[cpSt.title, { color: colors.foreground }]}>
            Camera access needed
          </Text>
          <Text style={[cpSt.body, { color: colors.mutedForeground }]}>
            Allow camera access so Reversia can snap your meal and help identify
            it automatically.
          </Text>
        </View>

        <TouchableOpacity
          onPress={onGrant}
          activeOpacity={0.85}
          style={[cpSt.grantBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="camera" size={18} color="#FFFFFF" />
          <Text style={cpSt.grantBtnText}>Enable camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSkip}
          activeOpacity={0.6}
          style={cpSt.skipBtn}
        >
          <Text style={[cpSt.skipText, { color: colors.mutedForeground }]}>
            Continue without camera
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const cpSt = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
  inner: {
    alignItems: "center",
    gap: 20,
    width: "100%",
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  textGroup: {
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
    lineHeight: 23,
    textAlign: "center",
  },
  grantBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 28,
    width: "100%",
    justifyContent: "center",
    marginTop: 8,
  },
  grantBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  skipBtn: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
  },
});

// ── Camera section (live view + capture / retake) ─────────────────────────────

function CameraSection({
  photo,
  cameraRef,
  capturing,
  permission,
  onCapture,
  onRetake,
  colors,
}) {
  return (
    <View style={camSt.wrapper}>
      {/* Viewfinder */}
      <View
        style={[
          camSt.frame,
          { borderColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        {photo?.uri ? (
          <Image
            source={{ uri: photo.uri }}
            style={camSt.preview}
            resizeMode="cover"
          />
        ) : permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={camSt.live}
            facing="back"
            mode="picture"
            ratio="16:9"
          />
        ) : (
          <View
            style={[
              camSt.placeholder,
              { backgroundColor: colors.muted + "40" },
            ]}
          >
            <Ionicons
              name="camera-outline"
              size={32}
              color={colors.mutedForeground}
            />
            <Text
              style={[camSt.placeholderText, { color: colors.mutedForeground }]}
            >
              Camera preview
            </Text>
          </View>
        )}

        {/* AI badge overlay */}
        {!photo?.uri && (
          <View
            style={[
              camSt.aiBadge,
              {
                backgroundColor: colors.card + "E6",
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="sparkles" size={11} color={colors.primary} />
            <Text style={[camSt.aiBadgeText, { color: colors.primary }]}>
              AI Smart Recognition
            </Text>
          </View>
        )}

        {/* Photo captured tick */}
        {photo?.uri && (
          <View
            style={[camSt.capturedBadge, { backgroundColor: "#10B981" + "E6" }]}
          >
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Text style={camSt.capturedText}>Photo captured</Text>
          </View>
        )}
      </View>

      {/* Action button */}
      {!photo?.uri ? (
        <TouchableOpacity
          onPress={onCapture}
          activeOpacity={0.82}
          disabled={capturing || !permission?.granted}
          style={[
            camSt.actionBtn,
            {
              backgroundColor: colors.primary,
              opacity: capturing ? 0.7 : 1,
            },
          ]}
        >
          {capturing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="camera" size={18} color="#FFFFFF" />
              <Text style={camSt.actionBtnText}>Snap photo</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onRetake}
          activeOpacity={0.8}
          style={[
            camSt.actionBtn,
            {
              backgroundColor: "transparent",
              borderWidth: 1.5,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="refresh" size={18} color={colors.foreground} />
          <Text style={[camSt.actionBtnText, { color: colors.foreground }]}>
            Retake photo
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const camSt = StyleSheet.create({
  wrapper: { gap: 12 },
  frame: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
    minHeight: 220,
    position: "relative",
  },
  live: {
    width: "100%",
    height: 220,
  },
  preview: {
    width: "100%",
    height: 220,
  },
  placeholder: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  placeholderText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
  aiBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  aiBadgeText: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },
  capturedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  capturedText: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    color: "#FFFFFF",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    paddingVertical: 14,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
});

// ── Meal type pill ────────────────────────────────────────────────────────────

function MealTypePill({ item, active, onPress, colors }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.93, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 220 })
    );
    onPress();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          mtSt.pill,
          {
            backgroundColor: active ? colors.primary + "1A" : colors.card,
            borderColor: active ? colors.primary : colors.border + "80",
            borderWidth: active ? 1.5 : 1,
          },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={15}
          color={active ? colors.primary : colors.mutedForeground}
        />
        <Text
          style={[
            mtSt.pillText,
            { color: active ? colors.primary : colors.foreground },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const mtSt = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    fontWeight: "500",
  },
});

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children, colors }) {
  return (
    <Text style={[slSt.label, { color: colors.mutedForeground }]}>
      {children}
    </Text>
  );
}

const slSt = StyleSheet.create({
  label: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});

// ── Error banner ──────────────────────────────────────────────────────────────

function ErrorBanner({ message, colors }) {
  if (!message) return null;
  return (
    <View
      style={[
        ebSt.banner,
        { backgroundColor: "#E28A82" + "18", borderColor: "#E28A82" + "40" },
      ]}
    >
      <Ionicons name="warning-outline" size={16} color="#E28A82" />
      <Text style={ebSt.text}>{message}</Text>
    </View>
  );
}

const ebSt = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: "#E28A82",
    lineHeight: 19,
  },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function MealEntryScreen({ navigation, route }) {
  const { colors } = useTheme();

  const prefillMealType = route?.params?.mealType || "Lunch";
  const prefillMealName = route?.params?.mealName || "";
  const startWithCamera = Boolean(route?.params?.openCamera);

  const [permission, requestPermission] = useCameraPermissions();
  const [mealType, setMealType] = useState(prefillMealType);
  const [mealName, setMealName] = useState(prefillMealName);
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(startWithCamera);
  const [saving, setSaving] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState("");

  const cameraRef = useRef(null);
  const notesRef = useRef(null);

  useEffect(() => {
    setMealType(prefillMealType);
  }, [prefillMealType]);

  useEffect(() => {
    setMealName(prefillMealName);
  }, [prefillMealName]);

  const canSave = useMemo(
    () => mealName.trim().length > 0 || Boolean(photo),
    [mealName, photo]
  );

  // ── Permissions ─────────────────────────────────────────────────────────────

  const ensurePermission = async () => {
    if (permission?.granted) return true;
    const result = await requestPermission();
    return result.granted;
  };

  const handleOpenCamera = async () => {
    const granted = await ensurePermission();
    if (!granted) {
      Alert.alert(
        "Camera access needed",
        "Enable camera access in your device settings to snap a meal photo.",
        [{ text: "OK" }]
      );
      return;
    }
    setCameraOpen(true);
  };

  // ── Camera ──────────────────────────────────────────────────────────────────

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.75,
      });
      if (result?.uri) setPhoto(result);
    } catch (err) {
      setError(err?.message || "Could not capture photo.");
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => setPhoto(null);

  // ── Upload + save ───────────────────────────────────────────────────────────

  const uploadPhoto = async (uri, uid) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const path = `users/${uid}/meal-photos/${Date.now()}.jpg`;
    const photoRef = ref(storage, path);
    await uploadBytes(photoRef, blob, { contentType: "image/jpeg" });
    const downloadUrl = await getDownloadURL(photoRef);
    return { downloadUrl, path };
  };

  const handleSave = async () => {
    if (!canSave || saving) return;

    const uid = auth.currentUser?.uid;
    if (!uid) {
      setError("You need to be signed in to save a meal.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const mealLabel = mealName.trim() || `${mealType} meal`;
      let photoDownloadUrl = null;
      let photoStoragePath = null;

      if (photo?.uri) {
        const uploaded = await uploadPhoto(photo.uri, uid);
        photoDownloadUrl = uploaded.downloadUrl;
        photoStoragePath = uploaded.path;
      }

      const payload = {
        type: mealType,
        name: mealLabel,
        notes: notes.trim(),
        source: "manual",
        photoUrl: photoDownloadUrl,
        photoStoragePath,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", uid, "logs"), {
        ...payload,
        category: "meal",
      });

      // Mirror locally for offline access
      const localKey = "@reversia_guest_logs";
      const existing = await secureStorage.getItem(localKey);
      const parsed = existing ? JSON.parse(existing) : [];
      parsed.unshift({
        id: `local-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      });
      await secureStorage.setItem(
        localKey,
        JSON.stringify(parsed.slice(0, 100))
      );

      await trackEvent("meal_logged", {
        userId: uid,
        mealType,
        mealName: mealLabel,
        hasPhoto: Boolean(photoDownloadUrl),
      });

      navigation.goBack();
    } catch (err) {
      setError(
        err?.message || "Could not save meal right now. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Permission gate ─────────────────────────────────────────────────────────

  if (startWithCamera && !permission?.granted && !cameraOpen) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.floatBack, { backgroundColor: colors.card }]}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <CameraPermissionScreen
          onGrant={handleOpenCamera}
          onSkip={() => setCameraOpen(true)}
          colors={colors}
        />
      </SafeAreaView>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <FadeSlide delay={0}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                style={[styles.backBtn, { backgroundColor: colors.card }]}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={colors.foreground}
                />
              </TouchableOpacity>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.preTitle, { color: colors.primary }]}>
                  Log a meal
                </Text>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  What did{"\n"}you eat?
                </Text>
              </View>
            </View>
          </FadeSlide>

          {/* ── Camera section ── */}
          {cameraOpen ? (
            <FadeSlide delay={80}>
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border + "80",
                  },
                ]}
              >
                <CameraSection
                  photo={photo}
                  cameraRef={cameraRef}
                  capturing={capturing}
                  permission={permission}
                  onCapture={handleCapture}
                  onRetake={handleRetake}
                  colors={colors}
                />
              </View>
            </FadeSlide>
          ) : (
            /* ── Camera closed: snap prompt ── */
            <FadeSlide delay={80}>
              <TouchableOpacity
                onPress={handleOpenCamera}
                activeOpacity={0.8}
                style={[
                  styles.snapPrompt,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.primary + "40",
                  },
                ]}
              >
                <View
                  style={[
                    styles.snapIconWrap,
                    { backgroundColor: colors.primary + "1A" },
                  ]}
                >
                  <Ionicons name="camera" size={28} color={colors.primary} />
                </View>
                <View style={{ gap: 3 }}>
                  <Text
                    style={[styles.snapTitle, { color: colors.foreground }]}
                  >
                    Snap your meal
                  </Text>
                  <Text
                    style={[styles.snapSub, { color: colors.mutedForeground }]}
                  >
                    Recognizes Nigerian &amp; African dishes
                  </Text>
                </View>
                <View
                  style={[styles.snapBadge, { backgroundColor: colors.muted }]}
                >
                  <Ionicons name="sparkles" size={11} color={colors.primary} />
                  <Text
                    style={[styles.snapBadgeText, { color: colors.primary }]}
                  >
                    AI
                  </Text>
                </View>
              </TouchableOpacity>
            </FadeSlide>
          )}

          {/* ── Form card ── */}
          <FadeSlide delay={160}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border + "80",
                },
              ]}
            >
              {/* Meal type */}
              <View style={styles.fieldGroup}>
                <SectionLabel colors={colors}>Meal type</SectionLabel>
                <View style={styles.pillsRow}>
                  {MEAL_TYPES.map((item) => (
                    <MealTypePill
                      key={item.label}
                      item={item}
                      active={mealType === item.label}
                      onPress={() => setMealType(item.label)}
                      colors={colors}
                    />
                  ))}
                </View>
              </View>

              {/* Divider */}
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.border + "60" },
                ]}
              />

              {/* Meal name */}
              <View style={styles.fieldGroup}>
                <SectionLabel colors={colors}>Meal name</SectionLabel>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="restaurant-outline"
                    size={17}
                    color={colors.mutedForeground}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={mealName}
                    onChangeText={setMealName}
                    placeholder={
                      photo?.uri
                        ? "Optional when photo is attached"
                        : "Jollof rice with chicken"
                    }
                    placeholderTextColor={colors.mutedForeground + "90"}
                    style={[styles.input, { color: colors.foreground }]}
                    returnKeyType="next"
                    onSubmitEditing={() => notesRef.current?.focus()}
                  />
                </View>
              </View>

              {/* Notes */}
              <View style={styles.fieldGroup}>
                <SectionLabel colors={colors}>Notes</SectionLabel>
                <View
                  style={[
                    styles.inputWrap,
                    styles.textAreaWrap,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="create-outline"
                    size={17}
                    color={colors.mutedForeground}
                    style={[styles.inputIcon, { marginTop: 2 }]}
                  />
                  <TextInput
                    ref={notesRef}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Portion size, how you felt, anything helpful…"
                    placeholderTextColor={colors.mutedForeground + "90"}
                    multiline
                    textAlignVertical="top"
                    style={[styles.textArea, { color: colors.foreground }]}
                  />
                </View>
              </View>

              {/* Error */}
              <ErrorBanner message={error} colors={colors} />

              {/* Save button */}
              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.85}
                disabled={!canSave || saving}
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: canSave ? colors.primary : colors.muted,
                    opacity: saving ? 0.75 : 1,
                  },
                ]}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.saveBtnText}>Save meal</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Helper hint */}
              {!canSave && (
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Add a meal name or snap a photo to save.
                </Text>
              )}
            </View>
          </FadeSlide>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    flexShrink: 0,
  },
  floatBack: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 36,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  preTitle: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 36,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -1,
    lineHeight: 44,
  },

  // Snap prompt (camera closed state)
  snapPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 28,
    padding: 20,
  },
  snapIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  snapTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  snapSub: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
  snapBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: "auto",
  },
  snapBadgeText: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
  },

  // Card
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 18,
  },

  // Form fields
  fieldGroup: { gap: 10 },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  textAreaWrap: {
    alignItems: "flex-start",
    paddingVertical: 12,
    minHeight: 120,
  },
  inputIcon: {
    marginRight: 10,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "DMSans_400Regular",
    height: 50,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    fontFamily: "DMSans_400Regular",
    minHeight: 96,
    lineHeight: 24,
  },

  // Save
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    height: 56,
    marginTop: 4,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    marginTop: -8,
  },
});
