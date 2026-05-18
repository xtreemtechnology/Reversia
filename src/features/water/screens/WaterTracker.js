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
import { useWaterLogs } from "../hooks/useWaterLogs";
import { addWaterEntry } from "../services/waterService";
import { useTheme } from "../../../theme/ThemeProvider";

export default function WaterTracker() {
  const { colors } = useTheme();
  const { logs, loading } = useWaterLogs(50);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      showNotification({
        type: "warning",
        title: "Invalid amount",
        message: "Enter a valid ml amount",
      });
      return;
    }
    setSaving(true);
    try {
      await addWaterEntry({ ml: num });
      setValue("");
    } catch (err) {
      console.error(err);
      showNotification({
        type: "error",
        title: "Error",
        message: "Could not save water",
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Water</Text>
        <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
          Log water intake (ml)
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="ml"
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
              <Text style={[styles.logValue, { color: colors.text }]}>
                {item.ml} ml
              </Text>
              <Text style={[styles.logMeta, { color: colors.muted }]}>
                {item.note || new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={[styles.logMeta, { color: colors.muted }]}>
                No water logs yet.
              </Text>
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
  logValue: { fontWeight: "800" },
  logMeta: {},
  emptyWrap: { padding: 24, alignItems: "center" },
});
