// src/screens/GlucoseScreen.js
import React, { useState, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUserLogs } from '../hooks/useUserLogs';

const { width } = Dimensions.get("window");

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  accent: "#4F46E5",
  accentDark: "#3730A3",
  accentLight: "#EEF2FF",
  bg: "#F5F5F7",
  card: "#FFFFFF",
  textPrimary: "#0A0A0F",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  green: "#059669",
  greenLight: "#ECFDF5",
  red: "#DC2626",
  redLight: "#FEF2F2",
  orange: "#D97706",
  orangeLight: "#FFF7ED",
  blue: "#0284C7",
  blueLight: "#E0F2FE",
  border: "#E5E7EB",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getGlucoseStatus = (value) => {
  if (value < 70)  return { label: "Too Low",     color: "#0284C7", bg: "#E0F2FE", tip: "Eat fast-acting sugar immediately." };
  if (value <= 99) return { label: "Normal",      color: "#059669", bg: "#ECFDF5", tip: "Your blood sugar is in a healthy range." };
  if (value <= 139)return { label: "Pre-meal OK", color: "#D97706", bg: "#FFFBEB", tip: "Acceptable before a meal. Monitor after eating." };
  if (value <= 199)return { label: "Elevated",    color: "#EA580C", bg: "#FFF7ED", tip: "Above target. Consider light activity or water." };
  return               { label: "Too High",    color: "#DC2626", bg: "#FEF2F2", tip: "Please consult your doctor if this persists." };
};

// Data now comes from user's Firestore logs via hook

const MEALS = ["Fasting", "Before Breakfast", "After Breakfast", "Before Lunch", "After Lunch", "Before Dinner", "After Dinner", "Bedtime"];

const TABS = ["Log", "History", "Reminders"];

// ─── Mini Bar Chart ────────────────────────────────────────────────────────────
const BarChart = () => {
  const max = Math.max(...WEEK.map((d) => d.val));
  const chartHeight = 80;
  return (
    <View style={chart.wrap}>
      {WEEK.map((d, i) => {
        const st = getGlucoseStatus(d.val);
        const barH = (d.val / max) * chartHeight;
        return (
          <View key={i} style={chart.col}>
            <View style={chart.barBg}>
              <View
                style={[
                  chart.bar,
                  { height: barH, backgroundColor: st.color },
                ]}
              />
            </View>
            <Text style={chart.dayLabel}>{d.day}</Text>
            <Text style={[chart.valLabel, { color: st.color }]}>{d.val}</Text>
          </View>
        );
      })}
    </View>
  );
};

const chart = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 8,
  },
  col: {
    alignItems: "center",
    gap: 4,
  },
  barBg: {
    width: 28,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 8,
  },
  dayLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  valLabel: {
    fontSize: 9,
    fontWeight: "700",
  },
});

// ─── Reminders Data ────────────────────────────────────────────────────────────
const REMINDERS = [
  { icon: "sunny-outline",    label: "Morning Fasting",  time: "7:00 AM",  on: true  },
  { icon: "restaurant-outline", label: "After Breakfast", time: "9:30 AM",  on: true  },
  { icon: "partly-sunny-outline", label: "After Lunch",   time: "2:00 PM",  on: false },
  { icon: "moon-outline",      label: "Before Bedtime",  time: "9:00 PM",  on: true  },
];

export default function GlucoseScreen() {
  const [activeTab, setActiveTab] = useState("Log");
  const { logs } = useUserLogs(100);
  // derive glucose logs
  const glucoseLogs = useMemo(() => logs.filter((l) => l.type === 'glucose').sort((a,b) => {
    const ta = a.timestamp?.seconds || new Date(a.timestamp).getTime();
    const tb = b.timestamp?.seconds || new Date(b.timestamp).getTime();
    return tb - ta;
  }), [logs]);

  const latestGlucose = glucoseLogs[0] || null;
  const [glucoseValue, setGlucoseValue] = useState(latestGlucose ? Number(latestGlucose.value) : 112);
  const [selectedMeal, setSelectedMeal] = useState(latestGlucose?.meal || "Fasting");
  const [saved, setSaved] = useState(false);
  const [reminders, setReminders] = useState(REMINDERS);
  const [remindersOn, setRemindersOn] = useState(true);

  const status = getGlucoseStatus(Number(glucoseValue));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleAdjust = (delta) => {
    setGlucoseValue((v) => Math.max(20, Math.min(500, v + delta)));
  };

  const toggleReminder = (i) => {
    setReminders((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, on: !r.on } : r))
    );
  };

  // Group history by date from logs
  const grouped = useMemo(() => {
    const map = {};
    glucoseLogs.forEach((r, idx) => {
      const ts = typeof r.timestamp?.toDate === 'function' ? r.timestamp.toDate() : new Date(r.timestamp);
      const date = ts.toDateString();
      const time = ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const entry = { id: r.id || idx, date, time, value: Number(r.value), meal: r.meal || r.period || '' };
      (map[date] = map[date] || []).push(entry);
    });
    return map;
  }, [glucoseLogs]);

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={["#0A0A23", "#1E1B4B", "#3730A3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSub}>Monitoring</Text>
            <Text style={styles.headerTitle}>Blood Glucose</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="water" size={22} color={COLORS.accent} />
          </View>
        </View>

        {/* Latest reading summary */}
        <View style={styles.latestCard}>
          <View>
            <Text style={styles.latestLabel}>Latest Reading</Text>
            <View style={styles.latestValueRow}>
              <Text style={styles.latestValue}>{latestGlucose ? Math.round(Number(latestGlucose.value)) : '--'}</Text>
              <Text style={styles.latestUnit}>{latestGlucose?.unit || 'mg/dL'}</Text>
            </View>
            <View style={[styles.latestBadge, { backgroundColor: latestGlucose && getGlucoseStatus(Number(latestGlucose.value)).bg || "rgba(16,185,129,0.08)" }]}>
              <View style={[styles.badgeDot, { backgroundColor: latestGlucose ? getGlucoseStatus(Number(latestGlucose.value)).color : '#10B981' }]} />
              <Text style={[styles.badgeText, { color: latestGlucose ? (getGlucoseStatus(Number(latestGlucose.value)).color === '#10B981' ? '#6EE7B7' : '#374151') : '#6EE7B7' }]}>
                {latestGlucose ? getGlucoseStatus(Number(latestGlucose.value)).label : 'No data'}
              </Text>
            </View>
          </View>
          <View style={styles.latestStats}>
            {[{ l: "Low", v: "95" }, { l: "High", v: "172" }].map((s, i) => (
              <View key={i} style={styles.latestStat}>
                <Text style={styles.latestStatVal}>{s.v}</Text>
                <Text style={styles.latestStatLabel}>{s.l} today</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ════════════════════════════════════════════════════════════════════
            LOG TAB
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "Log" && (
          <>
            {/* Big number input */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Enter Your Reading</Text>

              {/* Value display */}
              <View style={styles.valueDisplay}>
                <Text style={[styles.bigValue, { color: status.color }]}>
                  {glucoseValue}
                </Text>
                <Text style={styles.bigUnit}>mg/dL</Text>
              </View>

              {/* Status badge */}
              <View style={styles.statusBadgeWrap}>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text style={[styles.statusText, { color: status.color }]}>
                    {status.label}
                  </Text>
                </View>
              </View>

              {/* +/- Controls */}
              <View style={styles.controls}>
                {[
                  { label: "−10", delta: -10, large: true },
                  { label: "−1",  delta: -1,  large: false },
                  { label: "+1",  delta: 1,   large: false },
                  { label: "+10", delta: 10,  large: true },
                ].map((btn) => (
                  <TouchableOpacity
                    key={btn.label}
                    onPress={() => handleAdjust(btn.delta)}
                    activeOpacity={0.75}
                    style={[
                      styles.controlBtn,
                      btn.large && styles.controlBtnLarge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.controlBtnText,
                        btn.large && styles.controlBtnTextLarge,
                      ]}
                    >
                      {btn.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tip */}
              <View style={[styles.tipBox, { backgroundColor: status.bg }]}>
                <Ionicons name="bulb-outline" size={16} color={status.color} />
                <Text style={[styles.tipText, { color: status.color }]}>
                  {status.tip}
                </Text>
              </View>
            </View>

            {/* Meal context */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardSectionLabel}>When was this reading?</Text>
              <View style={styles.mealGrid}>
                {MEALS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setSelectedMeal(m)}
                    activeOpacity={0.8}
                    style={[
                      styles.mealPill,
                      selectedMeal === m && styles.mealPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.mealPillText,
                        selectedMeal === m && styles.mealPillTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Range reference */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardSectionLabel}>Target Ranges</Text>
              {[
                { label: "Too Low",     range: "< 70",      color: "#0284C7" },
                { label: "Normal",      range: "70 – 99",   color: "#059669" },
                { label: "Pre-meal",    range: "100 – 139", color: "#D97706" },
                { label: "Elevated",    range: "140 – 199", color: "#EA580C" },
                { label: "Too High",    range: "≥ 200",     color: "#DC2626" },
              ].map((r) => (
                <View key={r.label} style={styles.rangeRow}>
                  <View style={styles.rangeLeft}>
                    <View style={[styles.rangeDot, { backgroundColor: r.color }]} />
                    <Text style={styles.rangeLabel}>{r.label}</Text>
                  </View>
                  <Text style={[styles.rangeValue, { color: r.color }]}>{r.range} mg/dL</Text>
                </View>
              ))}
            </View>

            {/* Save button */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
            >
              <LinearGradient
                colors={saved ? ["#059669", "#047857"] : [COLORS.accent, COLORS.accentDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                <Ionicons
                  name={saved ? "checkmark-circle" : "save-outline"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.saveBtnText}>
                  {saved ? "Reading Saved!" : "Save Reading"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            HISTORY TAB
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "History" && (
          <>
            {/* 7-day chart */}
            <View style={styles.sectionCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.cardSectionLabel}>7-Day Trend</Text>
                <View style={styles.chartLegend}>
                  {[
                    { color: "#059669", label: "Normal" },
                    { color: "#D97706", label: "Pre-high" },
                    { color: "#DC2626", label: "High" },
                  ].map((l) => (
                    <View key={l.label} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                      <Text style={styles.legendText}>{l.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <BarChart />
            </View>

            {/* Stat cards */}
            <View style={styles.statRow}>
              {[
                { label: "7d Average", value: "119", unit: "mg/dL", color: COLORS.accent },
                { label: "Lowest",     value: "95",  unit: "mg/dL", color: COLORS.green },
                { label: "Highest",    value: "172", unit: "mg/dL", color: COLORS.red },
              ].map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statUnit}>{s.unit}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Grouped history list */}
            {Object.entries(grouped).map(([date, readings]) => (
              <View key={date} style={styles.historyGroup}>
                <Text style={styles.historyDate}>{date}</Text>
                {readings.map((r) => {
                  const st = getGlucoseStatus(r.value);
                  return (
                    <View key={r.id} style={styles.historyRow}>
                      <View style={[styles.historyValueBox, { backgroundColor: st.bg }]}>
                        <Text style={[styles.historyValue, { color: st.color }]}>
                          {r.value}
                        </Text>
                        <Text style={[styles.historyUnit, { color: st.color }]}>mg/dL</Text>
                      </View>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyMeal}>{r.meal}</Text>
                        <Text style={styles.historyTime}>{r.time}</Text>
                      </View>
                      <View style={[styles.historyBadge, { backgroundColor: st.bg }]}>
                        <Text style={[styles.historyBadgeText, { color: st.color }]}>
                          {st.label}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            REMINDERS TAB
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "Reminders" && (
          <>
            {/* Master toggle */}
            <View style={styles.masterToggleCard}>
              <View style={styles.masterToggleLeft}>
                <View style={styles.masterToggleIcon}>
                  <Ionicons name="notifications" size={20} color={COLORS.accent} />
                </View>
                <View>
                  <Text style={styles.masterToggleTitle}>Glucose Reminders</Text>
                  <Text style={styles.masterToggleSub}>
                    Get notified to check your blood sugar
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setRemindersOn((r) => !r)}
                activeOpacity={0.8}
                style={[
                  styles.toggle,
                  remindersOn ? styles.toggleOn : styles.toggleOff,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    remindersOn ? styles.toggleThumbOn : styles.toggleThumbOff,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Individual reminders */}
            {reminders.map((r, i) => (
              <View
                key={i}
                style={[styles.reminderCard, !remindersOn && styles.reminderCardDisabled]}
              >
                <View style={[styles.reminderIcon, r.on && remindersOn && styles.reminderIconActive]}>
                  <Ionicons
                    name={r.icon}
                    size={20}
                    color={r.on && remindersOn ? COLORS.accent : COLORS.textMuted}
                  />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{r.label}</Text>
                  <Text style={styles.reminderTime}>{r.time} · Every day</Text>
                </View>
                <TouchableOpacity
                  disabled={!remindersOn}
                  onPress={() => toggleReminder(i)}
                  activeOpacity={0.8}
                  style={[
                    styles.smallToggle,
                    r.on && remindersOn ? styles.toggleOn : styles.toggleOff,
                  ]}
                >
                  <View
                    style={[
                      styles.smallToggleThumb,
                      r.on && remindersOn ? styles.smallThumbOn : styles.smallThumbOff,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add custom */}
            <TouchableOpacity style={styles.addReminderBtn} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.accent} />
              <Text style={styles.addReminderText}>Add Custom Reminder</Text>
            </TouchableOpacity>

            {/* Tip */}
            <View style={styles.reminderTip}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.accent} />
              <Text style={styles.reminderTipText}>
                Checking at the same time daily helps you and your doctor spot patterns more easily.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  headerSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 4,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  latestCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  latestLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  latestValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginBottom: 10,
  },

  latestValue: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 52,
  },

  latestUnit: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    fontWeight: "600",
    paddingBottom: 6,
  },

  latestBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  latestStats: {
    gap: 12,
    alignItems: "flex-end",
  },

  latestStat: {
    alignItems: "flex-end",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  latestStatVal: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  latestStatLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 1,
  },

  // ── Tab Bar ───────────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },

  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  // ── Log Tab ───────────────────────────────────────────────────────────────────
  inputCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 16,
    textAlign: "center",
  },

  valueDisplay: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  bigValue: {
    fontSize: 88,
    fontWeight: "900",
    letterSpacing: -3,
    lineHeight: 88,
  },

  bigUnit: {
    fontSize: 18,
    color: COLORS.textMuted,
    fontWeight: "600",
    paddingBottom: 12,
  },

  statusBadgeWrap: {
    alignItems: "center",
    marginBottom: 24,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },

  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },

  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.accentLight,
    justifyContent: "center",
    alignItems: "center",
  },

  controlBtnLarge: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
  },

  controlBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.accent,
  },

  controlBtnTextLarge: {
    color: "#fff",
    fontSize: 15,
  },

  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 14,
    borderRadius: 14,
  },

  tipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },

  sectionCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  cardSectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
  },

  mealGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  mealPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  mealPillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },

  mealPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  mealPillTextActive: {
    color: "#fff",
  },

  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  rangeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  rangeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  rangeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  rangeValue: {
    fontSize: 13,
    fontWeight: "700",
  },

  saveBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  saveBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },

  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // ── History Tab ───────────────────────────────────────────────────────────────
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },

  chartLegend: {
    flexDirection: "row",
    gap: 10,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  legendText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  statRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  statUnit: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginTop: 1,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: "500",
  },

  historyGroup: {
    marginTop: 16,
    paddingHorizontal: 20,
  },

  historyDate: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  historyValueBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  historyValue: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  historyUnit: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 1,
  },

  historyInfo: {
    flex: 1,
  },

  historyMeal: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },

  historyTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  historyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Reminders Tab ─────────────────────────────────────────────────────────────
  masterToggleCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  masterToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  masterToggleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.accentLight,
    justifyContent: "center",
    alignItems: "center",
  },

  masterToggleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },

  masterToggleSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  toggleOn: {
    backgroundColor: COLORS.accent,
  },

  toggleOff: {
    backgroundColor: COLORS.border,
  },

  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  toggleThumbOn: {
    alignSelf: "flex-end",
  },

  toggleThumbOff: {
    alignSelf: "flex-start",
  },

  reminderCard: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  reminderCardDisabled: {
    opacity: 0.4,
  },

  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  reminderIconActive: {
    backgroundColor: COLORS.accentLight,
  },

  reminderInfo: {
    flex: 1,
  },

  reminderTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },

  reminderTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  smallToggle: {
    width: 42,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 2,
  },

  smallToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  smallThumbOn: {
    alignSelf: "flex-end",
  },

  smallThumbOff: {
    alignSelf: "flex-start",
  },

  addReminderBtn: {
    marginHorizontal: 20,
    marginTop: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.accentLight,
  },

  addReminderText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.accent,
  },

  reminderTip: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: COLORS.accentLight,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  reminderTipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: "600",
    lineHeight: 19,
  },
});