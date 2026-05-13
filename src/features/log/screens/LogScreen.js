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

const logCards = [
  {
    title: "Glucose",
    subtitle: "Record a reading",
    icon: "water",
    color: "#DBEAFE",
    iconColor: "#3B82F6",
  },
  {
    title: "Meal",
    subtitle: "Add food and carbs",
    icon: "food-apple",
    color: "#DCFCE7",
    iconColor: "#10B981",
  },
  {
    title: "Water",
    subtitle: "Track hydration",
    icon: "cup-water",
    color: "#E0F2FE",
    iconColor: "#0EA5E9",
  },
  {
    title: "Exercise",
    subtitle: "Log activity",
    icon: "run",
    color: "#FCE7F3",
    iconColor: "#EC4899",
  },
];

export default function LogScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
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
          dotColor: "#3B82F6",
          label: "Glucose reading",
          statusColor: "#3B82F6",
        };
      case "meal":
        return {
          dotColor: "#10B981",
          label: "Meal log",
          statusColor: "#10B981",
        };
      case "water":
        return {
          dotColor: "#0EA5E9",
          label: "Hydration",
          statusColor: "#0EA5E9",
        };
      default:
        return {
          dotColor: "#825CFF",
          label: "Activity",
          statusColor: "#825CFF",
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
    content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },
    kicker: { fontSize: 13, color: colors.muted, fontWeight: "500" },
    title: {
      fontSize: 30,
      fontWeight: "800",
      color: colors.text,
      marginTop: 2,
    },
    iconBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3.84,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroCard: {
      flexDirection: "row",
      backgroundColor: colors.background === "#FFFFFF" ? "#F8FAFF" : "#2D2A42",
      borderRadius: 24,
      padding: 18,
      marginBottom: 24,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.background === "#FFFFFF" ? "#E7E9FF" : "#4A4563",
    },
    heroIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor:
        colors.background === "#FFFFFF" ? "#ECEBFF" : "rgba(130,92,255,0.24)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    heroTextWrap: { flex: 1 },
    heroTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
    heroText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.muted,
      marginTop: 6,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 14,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 22,
    },
    gridCard: {
      minHeight: 145,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 16,
      marginBottom: 15,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
    cardSubtitle: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 4,
      lineHeight: 16,
    },
    cardAddIcon: { position: "absolute", top: 16, right: 16 },
    recentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    seeAll: { fontSize: 13, fontWeight: "600", color: colors.primary },
    recentList: { gap: 12 },
    recentCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recentLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    recentDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
    recentLabel: { fontSize: 14, fontWeight: "700", color: colors.text },
    recentValue: { fontSize: 13, color: colors.muted, marginTop: 2 },
    recentRight: { alignItems: "flex-end", marginLeft: 10 },
    recentTime: { fontSize: 11, color: colors.muted },
    recentStatus: { fontSize: 11, fontWeight: "700", marginTop: 4 },
    emptyContainer: {
      alignItems: "center",
      marginTop: 20,
      opacity: 0.7,
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingVertical: 22,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: { marginTop: 10, fontSize: 14, color: colors.muted },
    errorBox: {
      backgroundColor: "#FEE2E2",
      borderRadius: 12,
      padding: 10,
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
      borderRadius: 10,
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
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "70%",
      padding: 16,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    modalTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
    image: { width: "100%", height: 160, borderRadius: 12, marginBottom: 12 },
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
