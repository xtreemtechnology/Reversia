import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { showNotification } from "../../../components/Notification";
import { useGlucoseLogs } from "../hooks/useGlucoseLogs";
import { addGlucoseEntry } from "../services/glucoseService";
import { useTheme } from "../../../theme/ThemeProvider";

export default function GlucoseLog() {
  const { logs, loading } = useGlucoseLogs(50);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const { colors } = useTheme();

  const handleAdd = async () => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      showNotification({
        type: "warning",
        title: "Invalid value",
        message: "Enter a valid mg/dL value",
      });
      return;
    }
    setSaving(true);
    try {
      await addGlucoseEntry({ mgdl: num });
      setValue("");
    } catch (err) {
      console.error(err);
      showNotification({
        type: "error",
        title: "Error",
        message: "Could not save glucose",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Glucose
        </Text>
        <Text style={[styles.headerSub, { color: colors.muted }]}>
          Log blood glucose (mg/dL)
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="mg/dL"
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
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addBtnText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <GlucoseListItem item={item} colors={colors} />
          )}
          ListEmptyComponent={GlucoseEmpty}
        />
      )}
    </SafeAreaView>
  );
}

const GlucoseListItem = ({ item, colors }) => (
  <View style={[listStyles.itemRow, { borderColor: colors.border }]}>
    <Text style={[listStyles.itemTitle, { color: colors.text }]}>
      {item.mgdl} mg/dL
    </Text>
    <Text style={[listStyles.itemSub, { color: colors.muted }]}>
      {item.note || new Date(item.createdAt).toLocaleString()}
    </Text>
  </View>
);

const listStyles = StyleSheet.create({
  itemRow: { paddingVertical: 12, borderBottomWidth: 1 },
  itemTitle: { fontWeight: "800" },
  itemSub: {},
});

const GlucoseEmpty = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { color: colors.muted }]}>
        No glucose logs yet.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { marginTop: 6 },
  inputRow: { padding: 16, flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  addBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  addBtnText: { color: "#fff", fontWeight: "700" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContainer: { padding: 16 },
  empty: { padding: 24, alignItems: "center" },
  emptyText: {},
});
