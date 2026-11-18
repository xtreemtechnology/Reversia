// screens/VoiceLogScreen.js
// Voice meal logging - describe your meal by speaking
// Design: dark warm palette, matching Reversia design system

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { transcribeAudio } from "../services/aiService";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const EXAMPLE_PROMPTS = [
  "I had jollof rice with fried chicken and plantain",
  "Two boiled eggs and a cup of oats with milk",
  "Pounded yam with egusi soup",
  "Moi moi and akara with zobo drink",
];

function WaveBar({ delay, isRecording }) {
  const anim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400 + delay * 2,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 400 + delay * 2,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }

    Animated.timing(anim, {
      toValue: 0.2,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [anim, delay, isRecording]);

  return (
    <Animated.View
      style={[
        wave.bar,
        { transform: [{ scaleY: anim }] },
        isRecording ? wave.active : wave.inactive,
      ]}
    />
  );
}

const wave = StyleSheet.create({
  bar: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  active: { backgroundColor: "#8055E8" },
  inactive: { backgroundColor: "#F0E9FF" },
});

export default function VoiceLogScreen({ navigation, route }) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [mealType, setMealType] = useState(route?.params?.mealType || "Lunch");
  const [seconds, setSeconds] = useState(0);
  const [recordingObj, setRecordingObj] = useState(null);
  const timerRef = useRef(null);

  const BARS = [0, 60, 120, 20, 90, 40, 110, 70, 30, 80, 50, 100];

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Reversia needs microphone permission to record and transcribe your voice logs."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Clear previous states
      setTranscript("");
      setHasRecorded(false);
      setSeconds(0);

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingObj(recording);
      setIsRecording(true);

      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (error) {
      console.error("Failed to start voice recording:", error);
      Alert.alert(
        "Recording Error",
        "Could not start audio recording. Please try again."
      );
    }
  };

  const stopRecording = async () => {
    if (!recordingObj) return;

    setIsRecording(false);
    setTranscribing(true);
    clearInterval(timerRef.current);

    try {
      await recordingObj.stopAndUnloadAsync();
      const uri = recordingObj.getURI();
      setRecordingObj(null);

      const isApiKeySet = Boolean(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
      if (isApiKeySet) {
        const textResult = await transcribeAudio(uri);
        setTranscript(textResult || "Nothing transcribed.");
        setHasRecorded(true);
      } else {
        // Friendly key warning dialog
        Alert.alert(
          "Gemini API Key Missing",
          "EXPO_PUBLIC_GEMINI_API_KEY is not set in your .env file. Showing a simulated transcript for testing.",
          [{ text: "OK" }]
        );
        setTranscript(
          EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)]
        );
        setHasRecorded(true);
      }
    } catch (error) {
      console.error("Failed to stop/transcribe voice recording:", error);
      Alert.alert(
        "Transcription Error",
        "Could not transcribe audio. Please try again."
      );
    } finally {
      setTranscribing(false);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (recordingObj) {
        recordingObj.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recordingObj]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  const canSave = hasRecorded && transcript.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F1FF" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#242033" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Voice Log</Text>
          <Text style={styles.headerSub}>Describe your meal</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <View style={styles.iconBadge}>
              <Ionicons name="restaurant-outline" size={15} color="#756D84" />
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

        <View style={styles.recordCard}>
          <Text style={styles.recordStateLabel}>
            {transcribing
              ? "Analysing speech..."
              : isRecording
              ? "Listening..."
              : hasRecorded
              ? "Recording complete"
              : "Tap the mic to start"}
          </Text>

          {transcribing ? (
            <ActivityIndicator
              size="large"
              color="#8055E8"
              style={{ marginVertical: 22 }}
            />
          ) : (
            <View style={styles.waveRow}>
              {BARS.map((d, i) => (
                <WaveBar key={i} delay={d} isRecording={isRecording} />
              ))}
            </View>
          )}

          <Text
            style={[styles.timerText, isRecording && styles.timerTextActive]}
          >
            {formatTime(seconds)}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={transcribing}
            style={[
              styles.micBtn,
              isRecording && styles.micBtnActive,
              transcribing && { backgroundColor: "#F0E9FF" },
            ]}
          >
            {transcribing ? (
              <ActivityIndicator size="small" color="#8055E8" />
            ) : isRecording ? (
              <Ionicons name="stop" size={28} color="#F5F1FF" />
            ) : (
              <Ionicons
                name="mic"
                size={28}
                color={hasRecorded ? "#242033" : "#F5F1FF"}
              />
            )}
          </TouchableOpacity>

          <Text style={styles.micHint}>
            {transcribing
              ? "Processing audio..."
              : isRecording
              ? "Tap to stop"
              : hasRecorded
              ? "Tap to re-record"
              : "Hold to speak, release to stop"}
          </Text>
        </View>

        {hasRecorded && (
          <View style={styles.transcriptCard}>
            <View style={styles.cardLabelRow}>
              <View style={[styles.iconBadge, styles.iconBadgeMuted]}>
                <Ionicons name="text-outline" size={15} color="#8B75C8" />
              </View>
              <Text style={styles.cardLabel}>What I heard</Text>
              <TouchableOpacity
                onPress={() => {
                  setTranscript("");
                  setHasRecorded(false);
                }}
              >
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.transcriptText}>{transcript}</Text>

            <View style={styles.transcriptHint}>
              <Ionicons
                name="information-circle"
                size={14}
                color="#756D84"
                style={styles.iconMR7}
              />
              <Text style={styles.transcriptHintText}>
                Reversia will analyse this and link it to your health story.
              </Text>
            </View>
          </View>
        )}

        {!hasRecorded && !isRecording && (
          <View style={styles.card}>
            <View style={styles.cardLabelRow}>
              <View style={styles.iconBadge}>
                <Ionicons name="bulb-outline" size={15} color="#756D84" />
              </View>
              <Text style={styles.cardLabel}>Try saying...</Text>
            </View>
            {EXAMPLE_PROMPTS.map((p, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => {
                  setTranscript(p);
                  setHasRecorded(true);
                }}
                style={styles.promptRow}
              >
                <View style={styles.promptDot} />
                <Text style={styles.promptText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          disabled={!canSave}
          onPress={() =>
            navigation?.navigate("MealEntry", {
              mealType,
              mealName: transcript,
              notes: transcript,
              source: "voice_log",
            })
          }
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={canSave ? "#F5F1FF" : "#756D84"}
            style={styles.iconMR8}
          />
          <Text
            style={[styles.saveBtnText, !canSave && styles.saveBtnTextDisabled]}
          >
            {canSave ? `Save ${mealType}` : "Record your meal first"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F1FF" },
  scroll: { paddingBottom: 48 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#242033" },
  headerSub: { fontSize: 12, color: "#756D84", marginTop: 2 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E1F5",
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
  cardLabel: { fontSize: 14, fontWeight: "700", color: "#242033", flex: 1 },
  clearText: { fontSize: 12, color: "#CE6C60", fontWeight: "600" },

  mealTypeRow: { flexDirection: "row", gap: 8 },
  mealTypeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#F0E9FF",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  mealTypeBtnActive: {
    backgroundColor: "rgba(128,85,232,0.14)",
    borderColor: "#8055E8",
  },
  mealTypeBtnText: { fontSize: 12, color: "#756D84", fontWeight: "600" },
  mealTypeBtnTextActive: { color: "#8055E8", fontWeight: "700" },

  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 28,
    marginHorizontal: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E1F5",
    alignItems: "center",
  },
  recordStateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#756D84",
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    height: 44,
  },
  timerText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#242033",
    marginBottom: 28,
    letterSpacing: 1,
  },
  timerTextActive: { color: "#8055E8" },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8055E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#8055E8",
    iconBadgeMuted: { backgroundColor: "rgba(128,85,232,0.12)" },
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  micBtnActive: { backgroundColor: "#CE6C60" },
  micHint: { fontSize: 12, color: "#756D84" },

  transcriptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "rgba(128,85,232,0.22)",
  },
  transcriptText: {
    fontSize: 15,
    color: "#242033",
    lineHeight: 22,
    marginBottom: 14,
  },
  transcriptHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 10,
  },
  transcriptHintText: {
    fontSize: 12,
    color: "#756D84",
    flex: 1,
    lineHeight: 17,
  },

  promptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
  promptDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#8055E8",
    marginTop: 7,
    marginRight: 12,
  },
  promptText: { fontSize: 13, color: "#756D84", flex: 1, lineHeight: 19 },

  saveBtn: {
    backgroundColor: "#8055E8",
    borderRadius: 20,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 4,
  },
  saveBtnDisabled: { backgroundColor: "#F0E9FF" },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#F5F1FF" },
  saveBtnTextDisabled: { color: "#756D84" },
  iconMR7: { marginRight: 7 },
  iconMR8: { marginRight: 8 },
});
