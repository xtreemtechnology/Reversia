import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";

export default function NotificationSettings({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const styles = getStyles(colors, isDark);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [glucoseAlerts, setGlucoseAlerts] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [exerciseReminders, setExerciseReminders] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [tips, setTips] = useState(true);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <SettingToggle
            title="Enable Push Notifications"
            value={pushEnabled}
            onToggle={setPushEnabled}
            colors={colors}
            isDark={isDark}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Alerts</Text>
          <SettingToggle
            title="Glucose Out of Range"
            value={glucoseAlerts}
            onToggle={setGlucoseAlerts}
            description="Alert when glucose levels are abnormal"
            colors={colors}
            isDark={isDark}
          />
          <SettingToggle
            title="Meal Reminders"
            value={mealReminders}
            onToggle={setMealReminders}
            description="Remind me to log meals"
            colors={colors}
            isDark={isDark}
          />
          <SettingToggle
            title="Exercise Reminders"
            value={exerciseReminders}
            onToggle={setExerciseReminders}
            description="Remind me to exercise"
            colors={colors}
            isDark={isDark}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports & Tips</Text>
          <SettingToggle
            title="Weekly Health Report"
            value={weeklyReport}
            onToggle={setWeeklyReport}
            colors={colors}
            isDark={isDark}
            description="Every Monday morning"
            colors={colors}
            isDark={isDark}
          />
          <SettingToggle
            title="Health Tips"
            value={tips}
            onToggle={setTips}
            description="AI-powered personalized tips"
            colors={colors}
            isDark={isDark}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingToggle = ({
  title,
  value,
  onToggle,
  description,
  colors,
  isDark,
}) => {
  const styles = getStyles(colors, isDark);
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDesc}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
        thumbColor={value ? "#10B981" : "#E5E7EB"}
      />
    </View>
  );
};

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    title: { fontSize: 20, fontWeight: "800", color: colors.text },
    content: { paddingHorizontal: 20, paddingVertical: 20 },
    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.muted,
      textTransform: "uppercase",
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.card,
      padding: 14,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingText: { flex: 1 },
    settingTitle: { fontSize: 14, fontWeight: "600", color: colors.text },
    settingDesc: { fontSize: 12, color: colors.muted, marginTop: 4 },
  });

const styles = StyleSheet.create({});
