import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { showNotification } from "../../../components/Notification";
import { useWeightLogs } from "../hooks/useWeightLogs";
import { addWeightEntry } from "../services/weightService";
import { useTheme } from "../../../theme/ThemeProvider";

export default function LogWeight() {
  const { colors } = useTheme();
  const { logs, loading } = useWeightLogs(50);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      showNotification({
        type: "warning",
        title: "Invalid weight",
        message: "Enter a valid weight in kg",
      });
      return;
    }
    setSaving(true);
    try {
      await addWeightEntry({ weightKg: num });
      setValue("");
    } catch (err) {
      console.error("Weight save error", err);
      showNotification({
        type: "error",
        title: "Error",
        message: "Could not save weight",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Weight</Text>
        <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
          Log your body weight
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="kg"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              color: colors.text,
            },
          ]}
        />
        <TouchableOpacity
          onPress={handleAdd}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.logItem, { borderColor: colors.border }]}>
              <Text style={[styles.logWeight, { color: colors.text }]}>
                {item.weight} kg
              </Text>
              <Text style={[styles.logMeta, { color: colors.muted }]}>
                {item.note || new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={{ color: colors.muted }}>No weight logs yet.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSubtitle: { marginTop: 6 },
  inputRow: { padding: 16, flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  addButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  addButtonText: { color: "#fff", fontWeight: "700" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { padding: 16 },
  logItem: { paddingVertical: 12, borderBottomWidth: 1 },
  logWeight: { fontWeight: "800" },
  logMeta: {},
  emptyWrap: { padding: 24, alignItems: "center" },
});
