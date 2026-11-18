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

export default function ProteinEnergyScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { logs } = useUserLogs(30);
  const [applied, setApplied] = useState(false);

  const breakfastLogs = (logs || []).filter(
    (l) => l?.category === "meal" && l?.type?.toLowerCase() === "breakfast"
  );
  const bfStat =
    breakfastLogs.length > 0
      ? `You've logged ${breakfastLogs.length} breakfast${
          breakfastLogs.length !== 1 ? "s" : ""
        } recently.`
      : "No breakfast logs yet — add one today to start the pattern.";

  const foods = [
    { name: "Boiled Eggs", protein: "13g", per: "2 eggs", color: "#8055E8" },
    { name: "Greek Yoghurt", protein: "17g", per: "1 cup", color: "#8B75C8" },
    { name: "Akara", protein: "10g", per: "3 pieces", color: "#CE6C60" },
    { name: "Moi Moi", protein: "8g", per: "1 wrap", color: "#A78BFA" },
    { name: "Groundnuts", protein: "7g", per: "handful", color: "#8055E8" },
    { name: "Sardines", protein: "20g", per: "1 tin", color: "#8B75C8" },
  ];

  const timeline = [
    {
      time: "7:30 AM",
      label: "Breakfast with protein",
      color: "#8B75C8",
      desc: "Energy curve starts flat and stable",
    },
    {
      time: "9:30 AM",
      label: "Steady energy window",
      color: "#8055E8",
      desc: "No early cravings, focus is easier",
    },
    {
      time: "12:00 PM",
      label: "Moderate hunger by noon",
      color: "#A78BFA",
      desc: "Appetite regulated — less likely to overeat",
    },
    {
      time: "3:00 PM",
      label: "Afternoon energy maintained",
      color: "#8B75C8",
      desc: "No crash compared to carb-only breakfast",
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
            Protein & Energy
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
              backgroundColor: "rgba(128,85,232,0.10)",
              borderColor: "rgba(128,85,232,0.18)",
            },
          ]}
        >
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: "rgba(128,85,232,0.18)" },
            ]}
          >
            <Ionicons name="barbell-outline" size={28} color="#8B75C8" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Protein & Sustained Energy
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Why a protein anchor at breakfast changes your entire afternoon.
          </Text>
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: "rgba(128,85,232,0.08)",
                borderColor: "rgba(128,85,232,0.18)",
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={13}
              color="#8B75C8"
              style={{ marginRight: 7 }}
            />
            <Text style={[styles.statText, { color: "#8B75C8" }]}>
              {bfStat}
            </Text>
          </View>
        </View>

        <View style={styles.block}>
          <SectionLabel text="The Science" />
          <Text style={[styles.bodyText, { color: colors.foreground }]}>
            Protein digests more slowly than carbohydrates. When you include it
            in your first meal, it creates what nutritionists call a{" "}
            <Text style={{ color: "#8B75C8", fontWeight: "700" }}>
              "protein anchor"
            </Text>{" "}
            — a stable base that prevents the blood sugar spike-and-crash
            pattern that causes afternoon fatigue.
          </Text>
          <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
            Without this anchor, a carb-heavy breakfast causes a rapid rise in
            blood sugar followed by a drop — which often shows up as sugar
            cravings and low energy by 2–4 PM.
          </Text>
        </View>

        <View style={styles.block}>
          <SectionLabel text="Your Day With a Protein Breakfast" />
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {timeline.map((item, i) => (
              <View key={i} style={styles.tlRow}>
                <View style={styles.tlSpine}>
                  <View
                    style={[styles.tlDot, { backgroundColor: item.color }]}
                  />
                  {i < timeline.length - 1 && (
                    <View
                      style={[
                        styles.tlLine,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.tlContent}>
                  <View style={styles.tlHeader}>
                    <Text style={[styles.tlTime, { color: item.color }]}>
                      {item.time}
                    </Text>
                    <Text
                      style={[styles.tlLabel, { color: colors.foreground }]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Text
                    style={[styles.tlDesc, { color: colors.mutedForeground }]}
                  >
                    {item.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <SectionLabel text="Easy Protein Sources" />
          <View style={styles.foodsGrid}>
            {foods.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.foodCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={[styles.foodDot, { backgroundColor: f.color }]} />
                <Text style={[styles.foodName, { color: colors.foreground }]}>
                  {f.name}
                </Text>
                <Text style={[styles.foodProtein, { color: f.color }]}>
                  {f.protein}
                </Text>
                <Text
                  style={[styles.foodPer, { color: colors.mutedForeground }]}
                >
                  {f.per}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <View
            style={[styles.whyBox, { backgroundColor: "rgba(33,22,19,0.42)" }]}
          >
            <View style={styles.whyRow}>
              <Ionicons
                name="information-circle"
                size={16}
                color={colors.primary}
                style={{ marginRight: 9, marginTop: 1 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.whyTitle, { color: colors.foreground }]}>
                  Why this matters for you
                </Text>
                <Text
                  style={[styles.whyBody, { color: colors.mutedForeground }]}
                >
                  Reversia tracks your body check-in moods after meals. Once you
                  have enough breakfast logs, it can compare protein vs
                  no-protein days and show you the actual difference in how you
                  felt.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            setApplied(true);
            navigation?.navigate("LogMeal");
          }}
          style={[styles.ctaBtn, applied && styles.ctaBtnDone]}
        >
          <Ionicons
            name={applied ? "checkmark-circle" : "restaurant-outline"}
            size={18}
            color="#F5F1FF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.ctaBtnText}>
            {applied ? "Meal logged!" : "Log today's breakfast"}
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
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  tlRow: { flexDirection: "row", paddingVertical: 14 },
  tlSpine: { alignItems: "center", width: 16, marginRight: 14 },
  tlDot: { width: 8, height: 8, borderRadius: 4 },
  tlLine: { width: 1.5, flex: 1, marginTop: 4 },
  tlContent: { flex: 1 },
  tlHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 4,
  },
  tlTime: { fontSize: 11, fontWeight: "700" },
  tlLabel: { fontSize: 13, fontWeight: "700", flex: 1 },
  tlDesc: { fontSize: 12, lineHeight: 17 },
  foodsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  foodCard: {
    width: "47%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  foodDot: { width: 6, height: 6, borderRadius: 3 },
  foodName: { fontSize: 13, fontWeight: "700" },
  foodProtein: { fontSize: 17, fontWeight: "700" },
  foodPer: { fontSize: 11 },
  whyBox: { borderRadius: 16, padding: 14 },
  whyRow: { flexDirection: "row" },
  whyTitle: { fontSize: 13, fontWeight: "600", marginBottom: 5 },
  whyBody: { fontSize: 13, lineHeight: 19 },
  ctaBtn: {
    backgroundColor: "#8B75C8",
    borderRadius: 20,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
  },
  ctaBtnDone: { backgroundColor: "#8055E8" },
  ctaBtnText: { fontSize: 16, fontWeight: "700", color: "#F5F1FF" },
});
