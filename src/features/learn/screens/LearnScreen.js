import React from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import AnimatedScreen from "../../../components/AnimatedScreen";
import { useTheme } from "../../../theme/ThemeProvider";
import LearnHeader from "../components/LearnHeader";
import GuideQuestionCard from "../components/GuideQuestionCard";
import DailyDiscoveriesSection from "../components/DailyDiscoveriesSection";
import HealthyLivingSection from "../components/HealthyLivingSection";
import SuccessStories from "../components/SuccessStories";

export default function LearnScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AnimatedScreen style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <LearnHeader delay={0} />
          <GuideQuestionCard delay={90} />
          <DailyDiscoveriesSection delay={180} />
          <HealthyLivingSection delay={270} />
          <SuccessStories delay={360} />
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 132,
    gap: 32,
  },
});
