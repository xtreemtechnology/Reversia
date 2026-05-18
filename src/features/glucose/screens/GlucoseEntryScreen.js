import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTheme } from "../../../theme/ThemeProvider";

export default function GlucoseEntryScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [glucose, setGlucose] = useState("98");
  const [selectedState, setSelectedState] = useState("Fasting");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    label: "Normal",
    color: "#10B981",
    bg: "#ECFDF5",
  });
  const [message, setMessage] = useState(null);

  const states = ["Fasting", "Pre-Meal", "Post-Meal", "Bedtime"];

  // Helper to produce subtle badge background from a hex color
  const hexToRgba = (hex, alpha = 0.12) => {
    const normalized = hex.replace("#", "");
    const fullHex =
      normalized.length === 3
        ? normalized
            .split("")
            .map((char) => char + char)
            .join("")
        : normalized;

    if (fullHex.length !== 6) {
      return `rgba(0, 0, 0, ${alpha})`;
    }

    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);

    if ([r, g, b].some(Number.isNaN)) {
      return `rgba(0, 0, 0, ${alpha})`;
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    const val = parseFloat(glucose);
    if (!val && val !== 0) {
      return;
    }

    if (val < 70) {
      const color = "#EF4444";
      setStatus({ label: "Low (Hypo)", color, bg: hexToRgba(color, 0.08) });
    } else if (val >= 70 && val <= 140) {
      const color = "#10B981";
      setStatus({ label: "Optimal Range", color, bg: hexToRgba(color, 0.08) });
    } else if (val > 140 && val <= 180) {
      const color = "#F59E0B";
      setStatus({ label: "Elevated", color, bg: hexToRgba(color, 0.08) });
    } else {
      const color = "#EF4444";
      setStatus({ label: "High (Hyper)", color, bg: hexToRgba(color, 0.08) });
    }
  }, [glucose]);

  const handleSave = async () => {
    setMessage(null);
    if (!glucose || isNaN(glucose)) {
      setMessage("Please enter a valid numeric reading.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const logsRef = collection(db, "users", user.uid, "logs");
        await addDoc(logsRef, {
          type: "glucose",
          value: parseFloat(glucose),
          unit: "mg/dL",
          period: selectedState,
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString(),
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error("Save Error:", error);
      setMessage("Failed to save. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexOne}
      >
        <View style={styles.contentWrap}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Glucose Entry
            </Text>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                loading && styles.saveBtnLoading,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.inputLabel, { color: colors.muted }]}>
                Enter Reading
              </Text>
              <View style={styles.valueRow}>
                <TextInput
                  style={[styles.mainInput, { color: colors.text }]}
                  value={glucose}
                  onChangeText={setGlucose}
                  keyboardType="decimal-pad"
                  maxLength={3}
                  placeholder="000"
                  placeholderTextColor={colors.muted}
                />
                <Text style={[styles.unit, { color: colors.muted }]}>
                  mg/dL
                </Text>
              </View>
              <View
                style={[styles.statusBadge, { backgroundColor: status.bg }]}
              >
                <View style={[styles.dot, { backgroundColor: status.color }]} />
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Reading Timing
              </Text>
              <View style={styles.chipRow}>
                {states.map((state) => (
                  <TouchableOpacity
                    key={state}
                    onPress={() => setSelectedState(state)}
                    style={[
                      styles.chip,
                      selectedState === state
                        ? { backgroundColor: colors.primary }
                        : { backgroundColor: colors.card },
                      selectedState === state && styles.activeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedState === state
                          ? styles.activeChipText
                          : { color: colors.muted },
                      ]}
                    >
                      {state}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb" size={20} color={colors.primary} />
                <Text style={[styles.tipTitle, { color: colors.primary }]}>
                  Why this matters
                </Text>
              </View>
              <Text style={[styles.tipText, { color: colors.text }]}>
                Keeping your blood sugar between 70-140 mg/dL helps minimize
                long-term inflammation and protects your energy levels.
              </Text>
            </View>

            {message && (
              <View
                style={[
                  styles.messageBox,
                  { backgroundColor: hexToRgba("#EF4444", 0.08) },
                ]}
              >
                <Text style={styles.messageText}>{message}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flexOne: { flex: 1 },
    contentWrap: { flex: 1, paddingBottom: 90 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text },
    saveBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 14,
    },
    saveBtnLoading: { opacity: 0.7 },
    saveText: { color: colors.background, fontWeight: "700" },
    content: { padding: 24 },
    inputContainer: {
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 30,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 30,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.muted,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
    },
    mainInput: {
      fontSize: 84,
      fontWeight: "900",
      color: colors.text,
      textAlign: "center",
      minWidth: 140,
    },
    unit: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.muted,
      marginLeft: 5,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 15,
    },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusText: { fontSize: 14, fontWeight: "800" },
    section: { marginBottom: 30 },
    sectionLabel: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 15,
    },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: colors.border,
    },
    activeChip: { backgroundColor: colors.primary },
    chipText: { fontSize: 14, fontWeight: "700", color: colors.muted },
    activeChipText: { color: colors.background },
    tipCard: {
      backgroundColor: colors.primary + "15",
      padding: 20,
      borderRadius: 24,
    },
    tipHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    tipTitle: { fontSize: 14, fontWeight: "800", color: colors.primary },
    tipText: {
      fontSize: 14,
      color: colors.primary,
      lineHeight: 22,
      opacity: 0.8,
    },
    messageBox: {
      backgroundColor: colors.border,
      padding: 12,
      borderRadius: 12,
      marginTop: 12,
    },
    messageText: { color: "#B91C1C", textAlign: "center" },
  });
