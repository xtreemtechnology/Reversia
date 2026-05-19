/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useActivityLogs } from "../hooks/useActivityLogs";
import { useTheme } from "../../../theme/ThemeProvider";

export default function ActivityList({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { logs, loading } = useActivityLogs(50);

  const renderItem = ({ item }) => (
    <View style={styles.entryRow}>
      <Text style={[styles.entryTitle, { color: colors.text }]}>
        {item.activity || item.title || "Exercise"}
      </Text>
      <Text style={styles.entryMeta}>
        {item.value} {item.value ? "min" : ""} •{" "}
        {item.note || item.period || ""}
      </Text>
    </View>
  );

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
          Activity
        </Text>
        <Text style={{ color: colors.muted, marginTop: 6 }}>
          Your recent workouts
        </Text>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={() => (
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text style={{ color: colors.muted }}>
                No activity logged yet.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("ExerciseEntry")}
                style={{
                  marginTop: 12,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "700" }}>
                  Log Activity
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => ({
  entryRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  entryTitle: { fontWeight: "700" },
  entryMeta: { color: colors.muted },
});
