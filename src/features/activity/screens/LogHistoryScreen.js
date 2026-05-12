import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import { useUserLogs } from "../../../hooks/useUserLogs";
import { MEAL_LABELS } from "../../../features/meals/utils/mealUtils";
import { getButtonAccessibility } from "../../../utils/accessibility";
import { useTheme } from "../../../theme/ThemeProvider";

const getLogConfig = (type) => {
  switch (type) {
    case "glucose":
      return {
        dotColor: "#3B82F6",
        label: "Glucose reading",
        icon: "water",
        iconColor: "#3B82F6",
      };
    case "meal":
      return {
        dotColor: "#10B981",
        label: "Meal log",
        icon: "food-apple",
        iconColor: "#10B981",
      };
    case "water":
      return {
        dotColor: "#0EA5E9",
        label: "Hydration",
        icon: "cup-water",
        iconColor: "#0EA5E9",
      };
    default:
      return {
        dotColor: "#825CFF",
        label: "Activity",
        icon: "run",
        iconColor: "#825CFF",
      };
  }
};

export default function LogHistoryScreen({ navigation }) {
  const { logs, loading, error } = useUserLogs(50);
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState({});
  const styles = getStyles(colors);

  const toggleMeal = (dayKey, mealId) => {
    const k = `${dayKey}::${mealId}`;
    setExpanded((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => navigation.goBack()}
          {...getButtonAccessibility("backButton")}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>All entries</Text>
          <Text style={styles.title}>Log History</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Loading your history...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateBox}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={42}
            color="#EF4444"
          />
          <Text style={styles.stateTitle}>Could not load logs</Text>
          <Text style={styles.stateText}>{error.message || String(error)}</Text>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.stateBox}>
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={42}
            color={colors.muted}
          />
          <Text style={styles.stateTitle}>No logs yet</Text>
          <Text style={styles.stateText}>
            Start tracking meals, water, glucose, or exercise to see them here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {(() => {
            const byDay = {};
            const orderedMeals = [
              "breakfast",
              "lunch",
              "snack",
              "dinner",
              "other",
            ];

            logs
              .slice()
              .sort((a, b) => {
                const ta = a.timestamp ? a.timestamp.toDate().getTime() : 0;
                const tb = b.timestamp ? b.timestamp.toDate().getTime() : 0;
                return tb - ta;
              })
              .forEach((item) => {
                const dayKey = item.timestamp
                  ? moment(item.timestamp.toDate()).format("YYYY-MM-DD")
                  : moment().format("YYYY-MM-DD");
                byDay[dayKey] = byDay[dayKey] || {
                  label: moment(dayKey).format("MMMM D, YYYY"),
                  meals: {},
                };
                const mealKey = (
                  item.meal ||
                  item.period ||
                  "other"
                ).toLowerCase();
                byDay[dayKey].meals[mealKey] =
                  byDay[dayKey].meals[mealKey] || [];
                byDay[dayKey].meals[mealKey].push(item);
              });

            return Object.keys(byDay).map((dayKey) => (
              <View key={dayKey}>
                <Text style={styles.dayHeader}>{byDay[dayKey].label}</Text>
                {orderedMeals.map((mealId) => {
                  const items = byDay[dayKey].meals[mealId];
                  if (!items || !items.length) {
                    return null;
                  }

                  const key = `${dayKey}::${mealId}`;
                  const isOpen = !!expanded[key];
                  const count = items.length;
                  const calories = items.reduce(
                    (s, it) => s + (Number(it.calories) || 0),
                    0
                  );

                  return (
                    <View key={mealId} style={styles.mealSection}>
                      <TouchableOpacity
                        style={styles.mealHeaderRow}
                        onPress={() => toggleMeal(dayKey, mealId)}
                      >
                        <Text style={styles.mealHeader}>
                          {MEAL_LABELS[mealId] || mealId}
                        </Text>
                        <View style={styles.mealMetaRow}>
                          <Text style={styles.mealMeta}>
                            {count} item{count > 1 ? "s" : ""}
                          </Text>
                          {calories > 0 && (
                            <Text style={[styles.mealMeta, { marginLeft: 12 }]}>
                              {calories} kcal
                            </Text>
                          )}
                          <Text style={styles.mealToggle}>
                            {isOpen ? "▾" : "▸"}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {isOpen &&
                        items.map((item) => {
                          const config = getLogConfig(item.type);
                          return (
                            <View
                              key={item.id}
                              style={[
                                styles.card,
                                {
                                  backgroundColor: colors.card,
                                  borderColor: colors.border,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  styles.iconWrap,
                                  { backgroundColor: `${config.iconColor}18` },
                                ]}
                              >
                                <MaterialCommunityIcons
                                  name={config.icon}
                                  size={22}
                                  color={config.iconColor}
                                />
                              </View>
                              <View style={styles.cardBody}>
                                <Text style={styles.label}>{config.label}</Text>
                                <Text style={styles.value} numberOfLines={1}>
                                  {item.value} {item.unit || ""}
                                </Text>
                                <Text style={styles.meta}>
                                  {item.period || ""} •{" "}
                                  {item.timestamp
                                    ? moment(item.timestamp.toDate()).format(
                                        "h:mm A"
                                      )
                                    : "Just now"}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                    </View>
                  );
                })}
              </View>
            ));
          })()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
      gap: 12,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },
    kicker: {
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: colors.muted,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      marginTop: 2,
      color: colors.text,
    },
    list: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
    dayHeader: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
      marginTop: 8,
      marginBottom: 8,
    },
    mealSection: {
      marginBottom: 14,
    },
    mealHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
    },
    mealHeader: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.text,
    },
    mealMetaRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    mealMeta: {
      fontSize: 12,
      color: colors.muted,
    },
    mealToggle: {
      fontSize: 14,
      color: colors.muted,
      marginLeft: 12,
    },
    card: {
      flexDirection: "row",
      gap: 12,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      elevation: 1,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    cardBody: { flex: 1 },
    label: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      color: colors.muted,
    },
    value: {
      fontSize: 16,
      fontWeight: "800",
      marginTop: 4,
      color: colors.text,
    },
    meta: { fontSize: 12, marginTop: 4, color: colors.muted },
    stateBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    stateTitle: {
      fontSize: 18,
      fontWeight: "800",
      marginTop: 12,
      textAlign: "center",
      color: colors.text,
    },
    stateText: {
      fontSize: 13,
      marginTop: 8,
      textAlign: "center",
      lineHeight: 18,
      color: colors.muted,
    },
  });
