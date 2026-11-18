import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../theme/ThemeProvider";
import { useUserLogs } from "../../../hooks/useUserLogs";

function SectionLabel({ text }) {
  return <Text style={sl.t}>{text.toUpperCase()}</Text>;
}

const sl = StyleSheet.create({
  t: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#756D84",
    marginBottom: 10,
  },
});

export default function SleepRecoveryScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { logs } = useUserLogs(30);
  const [logged, setLogged] = useState(false);

  const bodyChecks = (logs || []).filter((l) => l?.category === "body_check");
  const tiredChecks = bodyChecks.filter((l) =>
    ["tired", "low"].includes(l?.value?.toLowerCase())
  );
  const totalChecks = bodyChecks.length;

  const sleepStat =
    totalChecks > 0
      ? `${tiredChecks.length} of your ${totalChecks} body check-ins were "Tired" or "Low energy".`
      : "Log body check-ins to see how your sleep connects to how you feel.";

  const stages = [
    {
      label: "Light Sleep",
      pct: 50,
      color: "#756D84",
      desc: "Processing memories, muscle repair begins",
    },
    {
      label: "Deep Sleep",
      pct: 20,
      color: "#8B75C8",
      desc: "Full body repair, immune strengthening",
    },
    {
      label: "REM Sleep",
      pct: 25,
      color: "#8055E8",
      desc: "Emotional processing, mental clarity",
    },
    {
      label: "Awake",
      pct: 5,
      color: "#CE6C60",
      desc: "Brief wakes between cycles (normal)",
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Sleep & Recovery
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Recommended Read
          </Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: "rgba(206,108,96,0.10)",
              borderColor: "rgba(206,108,96,0.20)",
            },
          ]}
        >
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: "rgba(206,108,96,0.15)" },
            ]}
          >
            <Ionicons name="moon" size={28} color="#CE6C60" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Sleep & Recovery Peaks
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Why you wake up "Normal" vs "Tired" — and what your logs reveal.
          </Text>
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: "rgba(206,108,96,0.08)",
                borderColor: "rgba(206,108,96,0.20)",
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={13}
              color="#CE6C60"
              style={{ marginRight: 7 }}
            />
            <Text style={[styles.statText, { color: "#CE6C60" }]}>
              {sleepStat}
            </Text>
          </View>
        </View>

        <View style={styles.block}>
          <SectionLabel text="Why Sleep Quality Matters" />
          <Text style={[styles.bodyText, { color: colors.foreground }]}>
            Sleep isn't just rest — it's when your body runs its most important
            repair processes. What you eat, when you eat, and how stressed you
            are all affect how deeply you recover overnight.
          </Text>
          <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
            The difference between waking up "Normal" and "Tired" is often
            determined in the{" "}
            <Text style={{ color: "#8055E8", fontWeight: "700" }}>
              last 2 hours before bed
            </Text>{" "}
            — what you ate, your screen exposure, and your hydration level.
          </Text>
        </View>

        <View style={styles.block}>
          <SectionLabel text="The Sleep Cycle" />
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {stages.map((s, i) => (
              <View
                key={i}
                style={[
                  styles.stageRow,
                  i < stages.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(255,255,255,0.04)",
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.stageLabelRow}>
                    <Text
                      style={[styles.stageLabel, { color: colors.foreground }]}
                    >
                      {s.label}
                    </Text>
                    <Text style={[styles.stagePct, { color: s.color }]}>
                      {s.pct}%
                    </Text>
                  </View>
                  <View style={styles.stageTrack}>
                    <View
                      style={[
                        styles.stageFill,
                        { width: `${s.pct}%`, backgroundColor: s.color },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.stageDesc,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {s.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <SectionLabel text="What Disrupts Your Recovery" />
          {[
            {
              icon: "restaurant-outline",
              color: "#8055E8",
              text: "Eating a heavy meal within 2 hours of sleep raises body temperature and delays deep sleep entry.",
            },
            {
              icon: "water-outline",
              color: "#A78BFA",
              text: "Low daytime hydration increases cortisol, which makes it harder to reach deep sleep stages.",
            },
            {
              icon: "phone-portrait-outline",
              color: "#CE6C60",
              text: "Blue light after 9 PM suppresses melatonin production by up to 50%.",
            },
          ].map((item, i) => (
            <View
              key={i}
              style={[
                styles.disruptRow,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.disruptIcon,
                  { backgroundColor: `${item.color}18` },
                ]}
              >
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text
                style={[styles.disruptText, { color: colors.mutedForeground }]}
              >
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.block}>
          <SectionLabel text="Tonight's Checklist" />
          {[
            "Finish eating 2 hours before bed",
            "Drink one glass of water before 8 PM",
            "Log a body check-in when you wake up",
            "Note your mood — Reversia will track the pattern",
          ].map((step, i) => (
            <View
              key={i}
              style={[
                styles.checkRow,
                i < 3 && {
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255,255,255,0.04)",
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#8B75C8"
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.checkText, { color: colors.foreground }]}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            setLogged(true);
            navigation?.navigate("BodyCheck");
          }}
          style={[styles.ctaBtn, logged && styles.ctaBtnDone]}
        >
          <Ionicons
            name={logged ? "checkmark-circle" : "happy-outline"}
            size={18}
            color="#F5F1FF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.ctaBtnText}>
            {logged ? "Body check logged!" : "Log tomorrow's wake-up mood"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 2 },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    marginHorizontal: 24,
    marginBottom: 8,
    borderWidth: 1,
    gap: 10,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 22, fontWeight: "700", lineHeight: 28 },
  heroSub: { fontSize: 14, lineHeight: 20 },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  statText: { fontSize: 12, fontWeight: "600", flex: 1 },
  block: { paddingHorizontal: 24, marginBottom: 22 },
  bodyText: { fontSize: 14, lineHeight: 22, marginBottom: 10 },
  card: { borderRadius: 20, borderWidth: 1 },
  stageRow: { padding: 16 },
  stageLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stageLabel: { fontSize: 14, fontWeight: "700" },
  stagePct: { fontSize: 14, fontWeight: "700" },
  stageTrack: {
    height: 4,
    backgroundColor: "#F0E9FF",
    borderRadius: 2,
    marginBottom: 6,
    overflow: "hidden",
  },
  stageFill: { height: "100%", borderRadius: 2 },
  stageDesc: { fontSize: 12, lineHeight: 17 },
  disruptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  disruptIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  disruptText: { fontSize: 13, lineHeight: 19, flex: 1 },
  checkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13 },
  checkText: { fontSize: 14, flex: 1 },
  ctaBtn: {
    backgroundColor: "#CE6C60",
    borderRadius: 20,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
  },
  ctaBtnDone: { backgroundColor: "#8B75C8" },
  ctaBtnText: { fontSize: 16, fontWeight: "700", color: "#F5F1FF" },
});
