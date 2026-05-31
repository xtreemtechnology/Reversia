import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import secureStorage from "../../../utils/secureStorage";
import { trackEvent } from "../../../utils/analytics";

export default function HydrationEntryScreen({ navigation }) {
  const { colors } = useTheme();
  const [liters, setLiters] = useState("0.5");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const amount = Number(liters);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid water amount in liters.");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      setError("You need to be signed in to save hydration.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        category: "hydration",
        liters: amount,
        notes: notes.trim(),
        source: "manual",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", uid, "logs"), payload);

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

      await trackEvent("hydration_logged", { userId: uid, liters: amount });
      navigation.goBack();
    } catch (saveError) {
      setError(saveError?.message || "Could not save hydration right now.");
      Alert.alert(
        "Save failed",
        saveError?.message || "Could not save hydration right now."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.preTitle, { color: colors.primary }]}>
              Log hydration
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              How much water did you drink?
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Liters
          </Text>
          <TextInput
            value={liters}
            onChangeText={setLiters}
            keyboardType="decimal-pad"
            placeholder="0.5"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Notes
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              styles.notesInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            multiline
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={[
              styles.saveBtn,
              { backgroundColor: colors.primary, opacity: saving ? 0.8 : 1 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save hydration</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 24, gap: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerTextWrap: { flex: 1 },
  preTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: { fontSize: 24, fontWeight: "700", marginTop: 4 },
  card: { borderRadius: 24, borderWidth: 1, padding: 18, gap: 14 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  notesInput: { minHeight: 90, textAlignVertical: "top" },
  errorText: { color: "#C0392B", fontSize: 13 },
  saveBtn: { borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
