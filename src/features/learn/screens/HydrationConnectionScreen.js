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
import { T, FONTS } from "../../../theme/tokens";
import FadeIn from "../../../home/components/FadeIn";
import { useUserLogs } from "../../../hooks/useUserLogs";

function SectionLabel({ text }) {
  return <Text style={sl.text}>{text.toUpperCase()}</Text>;
}

const sl = StyleSheet.create({
  text: {
    fontFamily: FONTS.body,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: T.MUTED,
    marginBottom: 10,
  },
});

function KeyPoint({ icon, iconColor, iconBg, title, body, colors }) {
  return (
    <View
      style={[
        kp.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[kp.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[kp.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[kp.body, { color: colors.mutedForeground }]}>{body}</Text>
    </View>
  );
}

const kp = StyleSheet.create({
  card: { borderRadius: 20, padding: 18, borderWidth: 1, gap: 10 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15, fontWeight: "700" },
  body: { fontSize: 13, lineHeight: 20 },
});

export default function HydrationConnectionScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { logs } = useUserLogs(30);
  const [applied, setApplied] = useState(false);

  const waterLogs = (logs || []).filter(
    (l) => l?.category === "water" || l?.category === "hydration"
  );
  const waterCount = waterLogs.length;
  const userStat =
    waterCount > 0
      ? `You've logged water ${waterCount} time${
          waterCount !== 1 ? "s" : ""
        } recently.`
      : "You haven't logged any water yet — start today to build your picture.";

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
            Hydration & Mood
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
        <FadeIn delay={0}>
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: "rgba(139,195,74,0.12)",
                borderColor: "rgba(139,195,74,0.20)",
              },
            ]}
          >
            <View
              style={[
                styles.heroIcon,
                { backgroundColor: "rgba(139,195,74,0.16)" },
              ]}
            >
              <Ionicons name="water" size={28} color={T.PRIMARY} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              The Hydration-Mood Connection
            </Text>
            <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
              How 2 extra glasses can improve your focus and energy.
            </Text>
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: "rgba(139,195,74,0.08)",
                  borderColor: "rgba(139,195,74,0.20)",
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={13}
                color={T.PRIMARY}
                style={{ marginRight: 7 }}
              />
              <Text style={styles.statText}>{userStat}</Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={60}>
          <View style={styles.block}>
            <SectionLabel text="The Connection" />
            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              Your brain is roughly{" "}
              <Text style={styles.emphasis}>75% water.</Text> When you're even
              mildly dehydrated — as little as 1–2% below optimal — it starts to
              affect your ability to concentrate, regulate mood, and maintain
              energy.
            </Text>
            <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
              Most people don't feel thirsty until they're already at that
              threshold. By then, the dip in focus and mood has already begun.
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <View style={styles.block}>
            <SectionLabel text="What Changes With Better Hydration" />
            <View style={styles.pointsCol}>
              <KeyPoint
                icon="flash-outline"
                iconColor={T.PRIMARY}
                iconBg="rgba(139,195,74,0.14)"
                title="Energy before noon"
                body="Drinking 1–2 glasses before 10 AM is consistently linked to more stable energy through the morning, especially before meals."
                colors={colors}
              />
              <KeyPoint
                icon="partly-sunny-outline"
                iconColor={T.SECONDARY}
                iconBg="rgba(139,195,74,0.12)"
                title="Mood and irritability"
                body="Even mild dehydration has been shown to increase feelings of tension, anxiety, and fatigue — independent of sleep quality."
                colors={colors}
              />
              <KeyPoint
                icon="eye-outline"
                iconColor={T.PRIMARY}
                iconBg="rgba(139,195,74,0.16)"
                title="Focus and clarity"
                body="Hydration affects blood flow to the brain. Two extra glasses across the morning is often enough to notice a difference in concentration by afternoon."
                colors={colors}
              />
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={180}>
          <View style={styles.block}>
            <SectionLabel text="Your Pattern" />
            <View
              style={[
                styles.patternCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.patternRow}>
                <View
                  style={[styles.patternDot, { backgroundColor: T.PRIMARY }]}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.patternLabel, { color: colors.foreground }]}
                  >
                    Water logs this period
                  </Text>
                  <Text style={[styles.patternVal, { color: T.PRIMARY }]}>
                    {waterCount} entries
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.patternRow,
                  { borderTopWidth: 1, borderTopColor: T.BORDER },
                ]}
              >
                <View
                  style={[styles.patternDot, { backgroundColor: T.SECONDARY }]}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.patternLabel, { color: colors.foreground }]}
                  >
                    Daily goal
                  </Text>
                  <Text style={[styles.patternVal, { color: T.SECONDARY }]}>
                    8 glasses
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.whyBox, { backgroundColor: T.PRIMARY_LIGHT }]}>
              <Ionicons
                name="information-circle"
                size={15}
                color={colors.primary}
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <Text
                style={[
                  styles.whyText,
                  { color: colors.mutedForeground, flex: 1 },
                ]}
              >
                Reversia will start connecting your water logs to your body
                check-in moods once you have at least 5 water entries.
              </Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={240}>
          <View style={styles.block}>
            <SectionLabel text="Try This" />
            {[
              "Drink one glass before your first meal each day.",
              "Log it in Reversia — even a single glass counts.",
              "Check your body check-in mood at 11 AM.",
              "Do this for 5 days and compare the pattern.",
            ].map((step, i) => (
              <View
                key={i}
                style={[
                  styles.stepRow,
                  { borderBottomColor: T.BORDER },
                  i < 3 && { borderBottomWidth: 1 },
                ]}
              >
                <View
                  style={[
                    styles.stepNum,
                    { backgroundColor: "rgba(139,195,74,0.16)" },
                  ]}
                >
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.foreground }]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </FadeIn>

        <FadeIn delay={300}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              setApplied(true);
              navigation?.navigate("LogWater");
            }}
            style={[styles.ctaBtn, applied && styles.ctaBtnDone]}
          >
            {applied ? (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={T.WHITE}
                style={{ marginRight: 8 }}
              />
            ) : (
              <Ionicons
                name="water-outline"
                size={18}
                color={T.WHITE}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={styles.ctaBtnText}>
              {applied ? "Water logged!" : "Log a glass now"}
            </Text>
          </TouchableOpacity>
        </FadeIn>
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
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: FONTS.display, fontSize: 17, fontWeight: "700" },
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
  heroTitle: {
    fontFamily: FONTS.display,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  heroSub: { fontSize: 14, lineHeight: 20 },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  statText: { fontSize: 12, color: T.PRIMARY, fontWeight: "600", flex: 1 },
  block: { paddingHorizontal: 24, marginBottom: 22 },
  bodyText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  emphasis: { fontWeight: "700", color: T.PRIMARY },
  pointsCol: { gap: 12 },
  patternCard: { borderRadius: 20, borderWidth: 1, marginBottom: 10 },
  patternRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  patternDot: { width: 8, height: 8, borderRadius: 4 },
  patternLabel: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  patternVal: { fontFamily: FONTS.display, fontSize: 18, fontWeight: "700" },
  whyBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    padding: 12,
  },
  whyText: { fontSize: 13, lineHeight: 18 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontSize: 13, fontWeight: "700", color: T.PRIMARY },
  stepText: { fontSize: 14, flex: 1, lineHeight: 20 },
  ctaBtn: {
    backgroundColor: T.PRIMARY,
    borderRadius: 999,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
  },
  ctaBtnDone: { backgroundColor: T.SECONDARY },
  ctaBtnText: { fontSize: 16, fontWeight: "700", color: T.WHITE },
});
