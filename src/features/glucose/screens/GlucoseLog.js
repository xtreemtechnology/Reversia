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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
          Glucose
        </Text>
        <Text style={{ color: colors.muted, marginTop: 6 }}>
          Log blood glucose (mg/dL)
        </Text>
      </View>

      <View
        style={{
          padding: 16,
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
        }}
      >
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="mg/dL"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          style={{
            flex: 1,
            height: 48,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            paddingHorizontal: 12,
            backgroundColor: colors.card,
            color: colors.text,
          }}
        />
        <TouchableOpacity
          onPress={handleAdd}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 10,
          }}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontWeight: "800", color: colors.text }}>
                {item.mgdl} mg/dL
              </Text>
              <Text style={{ color: colors.muted }}>
                {item.note || new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text style={{ color: colors.muted }}>No glucose logs yet.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
