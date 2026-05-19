/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserLogs } from "../../../hooks/useUserLogs";
import { useTheme } from "../../../theme/ThemeProvider";

const getDateKey = (value) => {
  if (!value) {
    return null;
  }
  const date =
    typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split("T")[0];
};

export default function ActivityTracker({ navigation }) {
  const { logs, loading } = useUserLogs(60);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const todayKey = getDateKey(new Date());
  const todayLogs = useMemo(
    () => logs.filter((l) => getDateKey(l.timestamp) === todayKey),
    [logs, todayKey]
  );
  const exerciseLogs = useMemo(
    () => todayLogs.filter((l) => l.type === "exercise"),
    [todayLogs]
  );

  const totalMinutes = useMemo(
    () => exerciseLogs.reduce((s, l) => s + (Number(l.value) || 0), 0),
    [exerciseLogs]
  );
  const estimatedSteps = Math.round(totalMinutes * 100);
  const estimatedCalories = Math.round(totalMinutes * 5);

  const renderItem = ({ item }) => (
    <View style={[styles.entryRow, { borderColor: colors.border }]}>
      <View style={styles.entryLeft}>
        <MaterialCommunityIcons name="run" size={20} color={colors.primary} />
      </View>
      <View style={styles.entryBody}>
        <Text style={[styles.entryTitle, { color: colors.text }]}>
          {item.title || item.activity || "Exercise"}
        </Text>
        <Text style={[styles.entryMeta, { color: colors.muted }]}>
          {item.value} min •{" "}
          {item.note || item.period || getDateKey(item.timestamp)}
        </Text>
      </View>
      <View style={styles.entryRight}>
        <Text style={[styles.entryValue, { color: colors.text }]}>
          {Math.round(Number(item.value) || 0)}m
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Activity Tracker
        </Text>
        <TouchableOpacity style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>
              Steps
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {estimatedSteps.toLocaleString()}
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>
              Active
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {totalMinutes} min
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>
              Calories
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {estimatedCalories} kcal
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Today's Activities
        </Text>
        {exerciseLogs.length ? (
          <FlatList
            data={exerciseLogs}
            keyExtractor={(i) =>
              i.id || `${i.timestamp?.seconds || i.timestamp}-${Math.random()}`
            }
            renderItem={renderItem}
            style={{ width: "100%" }}
          />
        ) : (
          <View
            style={[
              styles.emptyBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons
              name="run-fast"
              size={40}
              color={colors.muted}
            />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {loading ? "Loading activities..." : "No activities logged today"}
            </Text>
            <TouchableOpacity
              style={[styles.logBtn, { backgroundColor: colors.text }]}
              onPress={() => navigation.navigate("ExerciseEntry")}
            >
              <Text style={styles.logBtnText}>Log Activity</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
    content: { flex: 1, paddingHorizontal: 20 },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
      marginBottom: 16,
    },
    summaryCard: {
      flex: 1,
      marginRight: 8,
      borderRadius: 14,
      padding: 12,
      alignItems: "center",
      borderWidth: 1,
    },
    summaryLabel: { fontSize: 12, fontWeight: "700", color: colors.muted },
    summaryValue: {
      fontSize: 20,
      fontWeight: "800",
      marginTop: 8,
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 10,
      color: colors.text,
    },
    entryRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    entryLeft: { width: 40, alignItems: "center" },
    entryBody: { flex: 1 },
    entryTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
    entryMeta: { fontSize: 12, marginTop: 4, color: colors.muted },
    entryRight: { width: 56, alignItems: "flex-end" },
    entryValue: { fontSize: 13, fontWeight: "800", color: colors.text },
    emptyBox: {
      alignItems: "center",
      padding: 24,
      borderRadius: 12,
      borderWidth: 1,
    },
    emptyText: { marginTop: 8, fontWeight: "700", color: colors.muted },
    logBtn: {
      marginTop: 12,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    logBtnText: { color: colors.background, fontWeight: "800" },
  });
