import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserLogs } from "../../../hooks/useUserLogs";
import moment from "moment";
import { getButtonAccessibility } from "../../../utils/accessibility";
import { useTheme } from "../../../theme/ThemeProvider";

const getLogCards = (isDark) => [
  {
    title: "Glucose",
    subtitle: "Record a reading",
    icon: "water",
    color: isDark ? "rgba(34, 66, 47, 0.15)" : "rgba(34, 66, 47, 0.08)",
    iconColor: "#22422F",
  },
  {
    title: "Meal",
    subtitle: "Add food and carbs",
    icon: "food-apple",
    color: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.08)",
    iconColor: "#10B981",
  },
  {
    title: "Water",
    subtitle: "Track hydration",
    icon: "cup-water",
    color: isDark ? "rgba(2, 132, 199, 0.15)" : "rgba(2, 132, 199, 0.08)",
    iconColor: "#0284C7",
  },
  {
    title: "Exercise",
    subtitle: "Log activity",
    icon: "run",
    color: isDark ? "rgba(236, 161, 67, 0.15)" : "rgba(236, 161, 67, 0.08)",
    iconColor: "#ECA143",
  },
];

export default function LogScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const logCards = getLogCards(isDark);
  const [refreshToken, setRefreshToken] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const isNarrow = screenWidth < 640;
  const gridCardWidth = isNarrow ? "100%" : "48%";
  const styles = getStyles(colors);
  const modalStyles = getModalStyles(colors);
  // Fetch real-time logs from Firestore
  const { logs, loading, error } = useUserLogs(15, refreshToken);

  const handleLogPress = (title) => {
    switch (title) {
      case "Glucose":
        navigation.navigate("GlucoseEntry");
        break;
      case "Meal":
        navigation.navigate("MealEntry");
        break;
      case "Water":
        navigation.navigate("WaterEntry");
        break;
      case "Exercise":
        navigation.navigate("ExerciseEntry");
        break;
      default:
        break;
    }
  };

  const [selectedLog, setSelectedLog] = useState(null);

  const openRecent = (item) => {
    if (item.type === "meal") {
      setSelectedLog(item);
      return;
    }
    // fallback: navigate to appropriate entry screen
    if (item.type === "glucose") return navigation.navigate("GlucoseEntry");
    if (item.type === "water") return navigation.navigate("WaterEntry");
    return navigation.navigate("ExerciseEntry");
  };

  const handleRetry = () => {
    setRefreshToken((value) => value + 1);
  };

  const logAccessibilityKey = {
    Glucose: "logGlucose",
    Meal: "logMeal",
    Water: "logWater",
    Exercise: "logExercise",
  };

  // Dynamic style helper
  const getLogConfig = (type) => {
    switch (type) {
      case "glucose":
        return {
          dotColor: "#22422F",
          label: "Glucose reading",
          statusColor: "#22422F",
        };
      case "meal":
        return {
          dotColor: "#10B981",
          label: "Meal log",
          statusColor: "#10B981",
        };
      case "water":
        return {
          dotColor: "#0284C7",
          label: "Hydration",
          statusColor: "#0284C7",
        };
      default:
        return {
          dotColor: "#ECA143",
          label: "Activity",
          statusColor: "#ECA143",
        };
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.kicker, { color: colors.muted }]}>
              Quick logging
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Log Section
            </Text>
          </View>
          <View
            style={[
              styles.iconBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            accessibilityElementsHidden
          >
            <Ionicons name="calendar-outline" size={22} color={colors.text} />
          </View>
        </View>

        {/* Hero Card */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.heroIconWrap,
              { backgroundColor: isDark ? "rgba(130,92,255,0.24)" : "#ECEBFF" },
            ]}
          >
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={28}
              color={colors.primary}
            />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              Track Your Reversal
            </Text>
            <Text style={[styles.heroText, { color: colors.muted }]}>
              Consistent logging is the fastest way to master your insulin
              response.
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          What do you want to log?
        </Text>

        {/* Grid of Log Options */}
        <View style={styles.grid}>
          {logCards.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.gridCard,
                {
                  width: gridCardWidth,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleLogPress(item.title)}
              {...getButtonAccessibility(logAccessibilityKey[item.title])}
            >
              <View
                style={[
                  styles.cardIcon,
                  {
                    backgroundColor: isDark
                      ? `${item.iconColor}24`
                      : item.color,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={26}
                  color={item.iconColor}
                />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
                {item.subtitle}
              </Text>
              <Ionicons
                name="add-circle"
                size={20}
                color={colors.border}
                style={styles.cardAddIcon}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity List */}
        <View style={styles.recentHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Logs
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("LogHistory")}
            {...getButtonAccessibility("expandButton", "deepLink")}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See All
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {error ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: isDark ? "#4C1D1D" : "#FEF2F2",
                borderColor: isDark ? "#7F1D1D" : "#FECACA",
              },
            ]}
          >
            <Text
              style={[
                styles.errorText,
                { color: isDark ? "#FCA5A5" : "#B91C1C" },
              ]}
            >
              Error loading logs: {error.message || String(error)}
            </Text>
            <TouchableOpacity
              style={[
                styles.retryBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: isDark ? "#B91C1C" : "#FCA5A5",
                },
              ]}
              onPress={handleRetry}
              {...getButtonAccessibility("confirmButton")}
            >
              <Text
                style={[
                  styles.retryText,
                  { color: isDark ? "#FCA5A5" : "#B91C1C" },
                ]}
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.recentList}>
          {loading ? (
            <View
              style={[
                styles.emptyContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Loading your recent logs...
              </Text>
            </View>
          ) : logs.length === 0 ? (
            <View
              style={[
                styles.emptyContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={40}
                color={colors.border}
              />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                No logs found for today.
              </Text>
            </View>
          ) : (
            logs.map((item) => {
              const config = getLogConfig(item.type);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.recentCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => openRecent(item)}
                  {...getButtonAccessibility("expandButton", "deepLink")}
                >
                  <View style={styles.recentLeft}>
                    <View
                      style={[
                        styles.recentDot,
                        { backgroundColor: config.dotColor },
                      ]}
                    />
                    <View>
                      <Text
                        style={[styles.recentLabel, { color: colors.text }]}
                      >
                        {config.label}
                      </Text>
                      <Text
                        style={[styles.recentValue, { color: colors.muted }]}
                      >
                        {item.value} {item.unit || ""}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.recentRight}>
                    <Text style={[styles.recentTime, { color: colors.muted }]}>
                      {item.timestamp
                        ? moment(item.timestamp.toDate()).format("h:mm A")
                        : "Just now"}
                    </Text>
                    <Text
                      style={[
                        styles.recentStatus,
                        { color: config.statusColor },
                      ]}
                    >
                      {item.meal || item.period || "Logged"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        {/* Meal detail modal */}
        <Modal visible={!!selectedLog} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={() => setSelectedLog(null)}>
            <View style={modalStyles.backdrop}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={[modalStyles.sheet, { backgroundColor: colors.card }]}
                >
                  <View style={modalStyles.headerRow}>
                    <Text
                      style={[modalStyles.modalTitle, { color: colors.text }]}
                    >
                      Log detail
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedLog(null)}>
                      <Ionicons name="close" size={22} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  {selectedLog && (
                    <ScrollView>
                      {selectedLog.imageUri && (
                        <Image
                          source={{ uri: selectedLog.imageUri }}
                          style={modalStyles.image}
                        />
                      )}
                      <Text
                        style={[
                          modalStyles.fieldLabel,
                          { color: colors.muted },
                        ]}
                      >
                        Food
                      </Text>
                      <Text
                        style={[modalStyles.fieldValue, { color: colors.text }]}
                      >
                        {selectedLog.value}
                      </Text>
                      {selectedLog.calories !== undefined && (
                        <>
                          <Text
                            style={[
                              modalStyles.fieldLabel,
                              { color: colors.muted },
                            ]}
                          >
                            Calories
                          </Text>
                          <Text
                            style={[
                              modalStyles.fieldValue,
                              { color: colors.text },
                            ]}
                          >
                            {selectedLog.calories} kcal
                          </Text>
                        </>
                      )}
                      {selectedLog.servingSize && (
                        <>
                          <Text
                            style={[
                              modalStyles.fieldLabel,
                              { color: colors.muted },
                            ]}
                          >
                            Serving
                          </Text>
                          <Text
                            style={[
                              modalStyles.fieldValue,
                              { color: colors.text },
                            ]}
                          >
                            {selectedLog.servingSize}
                          </Text>
                        </>
                      )}
                      <Text
                        style={[
                          modalStyles.fieldLabel,
                          { color: colors.muted },
                        ]}
                      >
                        Logged
                      </Text>
                      <Text
                        style={[modalStyles.fieldValue, { color: colors.text }]}
                      >
                        {selectedLog.timestamp
                          ? moment(selectedLog.timestamp.toDate()).format(
                              "MMM D, h:mm A"
                            )
                          : "Just now"}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 48 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    kicker: {
      fontSize: 12,
      color: colors.muted,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.text,
      marginTop: 4,
      lineHeight: 36,
    },
    iconBtn: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background === "#FFFFFF" ? "#F8F6F0" : "#1C2621",
      borderRadius: 24,
      padding: 18,
      marginBottom: 24,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.background === "#FFFFFF" ? "#EBE7DD" : "#2C3B33",
    },
    heroIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor:
        colors.background === "#FFFFFF"
          ? "rgba(34, 66, 47, 0.08)"
          : "rgba(34, 66, 47, 0.20)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    heroTextWrap: { flex: 1 },
    heroTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 22,
    },
    heroText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.muted,
      marginTop: 7,
    },
    sectionTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 16,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    gridCard: {
      minHeight: 152,
      backgroundColor: colors.card,
      borderRadius: 26,
      padding: 18,
      marginBottom: 14,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05,
      shadowRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardIcon: {
      width: 52,
      height: 52,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 14,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
    cardSubtitle: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 5,
      lineHeight: 18,
    },
    cardAddIcon: { position: "absolute", top: 16, right: 16, opacity: 0.7 },
    recentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    seeAll: { fontSize: 13, fontWeight: "600", color: colors.primary },
    recentList: { gap: 10 },
    recentCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 15,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recentLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    recentDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
    recentLabel: { fontSize: 15, fontWeight: "700", color: colors.text },
    recentValue: { fontSize: 12, color: colors.muted, marginTop: 3 },
    recentRight: { alignItems: "flex-end", marginLeft: 10 },
    recentTime: { fontSize: 11, color: colors.muted },
    recentStatus: { fontSize: 11, fontWeight: "700", marginTop: 4 },
    emptyContainer: {
      alignItems: "center",
      marginTop: 20,
      opacity: 0.7,
      backgroundColor: colors.card,
      borderRadius: 22,
      paddingVertical: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: { marginTop: 10, fontSize: 14, color: colors.muted },
    errorBox: {
      backgroundColor: "#FEE2E2",
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#FECACA",
    },
    errorText: { color: "#B91C1C", fontSize: 13 },
    retryBtn: {
      marginTop: 10,
      alignSelf: "flex-start",
      backgroundColor: colors.card,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#FCA5A5",
    },
    retryText: { color: "#B91C1C", fontSize: 13, fontWeight: "700" },
  });

const getModalStyles = (colors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: "#FFF",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "72%",
      padding: 18,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    modalTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
    image: { width: "100%", height: 170, borderRadius: 14, marginBottom: 12 },
    fieldLabel: {
      fontSize: 12,
      color: "#6B7280",
      fontWeight: "700",
      marginTop: 8,
    },
    fieldValue: {
      fontSize: 16,
      color: colors.text,
    },
  });
