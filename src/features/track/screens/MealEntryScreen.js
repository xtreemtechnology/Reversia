import React, { useMemo, useRef, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import secureStorage from "../../../utils/secureStorage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import { trackEvent } from "../../../utils/analytics";

const DEFAULT_MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function MealEntryScreen({ navigation, route }) {
  const { colors } = useTheme();
  const prefillMealType = route?.params?.mealType || "Lunch";
  const startWithCamera = Boolean(route?.params?.openCamera);
  const [permission, requestPermission] = useCameraPermissions();
  const [mealType, setMealType] = useState(prefillMealType);
  const [mealName, setMealName] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [cameraReady, setCameraReady] = useState(startWithCamera);
  const [saving, setSaving] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState("");
  const cameraRef = useRef(null);

  const canSave = useMemo(
    () => mealName.trim().length > 0 || Boolean(photo),
    [mealName, photo]
  );

  const ensurePermission = async () => {
    if (permission?.granted) return true;
    const result = await requestPermission();
    return result.granted;
  };

  const handleOpenCamera = async () => {
    const granted = await ensurePermission();
    if (!granted) {
      Alert.alert(
        "Camera permission needed",
        "Enable camera access to snap a meal photo."
      );
      return;
    }
    setCameraReady(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.75 });
      if (result?.uri) {
        setPhoto(result);
      }
    } catch (captureError) {
      setError(captureError?.message || "Could not capture photo.");
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => setPhoto(null);

  const uploadPhoto = async (photoUri, uid) => {
    const response = await fetch(photoUri);
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

      const localKey = "@reversia_guest_logs";
      const existing = await secureStorage.getItem(localKey);
      const parsed = existing ? JSON.parse(existing) : [];
      parsed.unshift({
        id: `local-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
        photoUrl: photoDownloadUrl,
      });
      await secureStorage.setItem(localKey, JSON.stringify(parsed.slice(0, 100)));

      await trackEvent("meal_logged", {
        userId: uid,
        mealType,
        mealName: mealLabel,
        hasPhoto: Boolean(photoDownloadUrl),
      });

      navigation.goBack();
    } catch (err) {
      setError(err?.message || "Could not save meal right now.");
    } finally {
      setSaving(false);
    }
  };

  if (!permission?.granted && startWithCamera && !cameraReady) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.permissionState}>
          <Ionicons name="camera" size={44} color={colors.primary} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera access needed</Text>
          <Text style={[styles.permissionText, { color: colors.mutedForeground }]}>Allow camera access to snap your meal.</Text>
          <TouchableOpacity onPress={handleOpenCamera} activeOpacity={0.85} style={[styles.permissionBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.permissionBtnText}>Enable camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCameraReady(true)} activeOpacity={0.7} style={styles.permissionLink}>
            <Text style={[styles.permissionLinkText, { color: colors.mutedForeground }]}>Continue without camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.preTitle, { color: colors.primary }]}>Log a meal</Text>
              <Text style={[styles.title, { color: colors.text }]}>What did you eat?</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            {(cameraReady || startWithCamera) && (
              <View style={styles.cameraSection}>
                <View style={[styles.cameraFrame, { borderColor: colors.border, backgroundColor: colors.background }]}> 
                  {photo?.uri ? (
                    <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                  ) : permission?.granted ? (
                    <CameraView
                      ref={cameraRef}
                      style={styles.camera}
                      facing="back"
                      mode="picture"
                      ratio="16:9"
                    />
                  ) : (
                    <View style={styles.cameraPlaceholder}>
                      <Ionicons name="camera" size={28} color={colors.mutedForeground} />
                      <Text style={[styles.cameraPlaceholderText, { color: colors.mutedForeground }]}>Camera preview will appear here.</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cameraActionsRow}>
                  {!photo?.uri ? (
                    <TouchableOpacity onPress={handleCapture} activeOpacity={0.8} style={[styles.cameraActionBtn, { backgroundColor: colors.primary }]}>
                      <Ionicons name="camera" size={18} color="#FFFFFF" />
                      <Text style={styles.cameraActionText}>{capturing ? "Capturing…" : "Snap photo"}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={handleRetake} activeOpacity={0.8} style={[styles.cameraActionBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                      <Ionicons name="refresh" size={18} color={colors.text} />
                      <Text style={[styles.cameraActionText, { color: colors.text }]}>Retake</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Meal type</Text>
            <View style={styles.pillsRow}>
              {DEFAULT_MEAL_TYPES.map((item) => {
                const active = item === mealType;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setMealType(item)}
                    activeOpacity={0.75}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: active ? colors.primary + "22" : colors.background,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.pillText, { color: active ? colors.primary : colors.text }]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Meal name</Text>
            <TextInput
              value={mealName}
              onChangeText={setMealName}
              placeholder={photo?.uri ? "Meal name (optional when photo is attached)" : "Jollof rice with chicken"}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything helpful about this meal?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
              style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={!canSave || saving}
              style={[
                styles.saveBtn,
                { backgroundColor: canSave ? colors.primary : colors.muted, opacity: saving ? 0.8 : 1 },
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save meal</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flexOne: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: { flex: 1, gap: 4 },
  preTitle: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 32,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    gap: 14,
  },
  cameraSection: {
    gap: 12,
  },
  cameraFrame: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
    minHeight: 220,
  },
  camera: {
    width: "100%",
    height: 220,
  },
  photoPreview: {
    width: "100%",
    height: 220,
  },
  cameraPlaceholder: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
  },
  cameraPlaceholderText: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
  cameraActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  cameraActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
  },
  cameraActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  permissionState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
  },
  permissionText: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  permissionBtn: {
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  permissionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  permissionLink: {
    paddingVertical: 8,
  },
  permissionLinkText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
  label: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "DMSans_400Regular",
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "DMSans_400Regular",
  },
  errorText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: "#E28A82",
  },
  saveBtn: {
    marginTop: 4,
    borderRadius: 999,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
