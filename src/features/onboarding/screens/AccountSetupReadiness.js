// src/features/onboarding/screens/AccountSetupReadiness.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { OnboardingHeader } from "../components/OnboardingHeader";
import { OnboardingProgress } from "../components/OnboardingProgress";
import { ContinueButton } from "../components/ContinueButton";
import { ErrorBox } from "../components/ErrorBox";
import { saveReadinessLevel } from "../services/onboardingService";
import { useTheme } from "../../../theme/ThemeProvider";

export default function AccountSetupReadiness({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [selectedReadiness, setSelectedReadiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { width: screenWidth } = useWindowDimensions();
  const contentPadding = screenWidth < 380 ? 20 : 25;

  const options = [
    {
      id: "starting",
      title: "Just Starting",
      icon: (
        <MaterialCommunityIcons name="seed-outline" size={28} color="#4ADE80" />
      ),
      desc: "I am taking my first steps toward health.",
    },
    {
      id: "momentum",
      title: "Building Momentum",
      icon: (
        <MaterialCommunityIcons name="speedometer" size={28} color="#FBBF24" />
      ),
      desc: "I am already making some changes.",
    },
    {
      id: "committed",
      title: "Fully Committed",
      icon: <MaterialCommunityIcons name="fire" size={28} color="#EF4444" />,
      desc: "I am ready to do whatever it takes.",
    },
  ];

  const handleFinish = async () => {
    if (!selectedReadiness) {
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await saveReadinessLevel(selectedReadiness);
      navigation.navigate("AccountSetupComplete");
    } catch (err) {
      console.error("Error finalizing setup:", err);
      setError("Could not complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: contentPadding },
        ]}
      >
        <OnboardingProgress current={8} />

        <Text style={styles.title}>
          How ready are you to improve your health?
        </Text>
        <Text style={styles.subtitle}>
          This helps us set the right pace for your daily goals.
        </Text>

        <View style={styles.listContainer}>
          {options.map((item) => {
            const isSelected = selectedReadiness === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => setSelectedReadiness(item.id)}
                style={[
                  styles.readinessCard,
                  isSelected && styles.selectedCard,
                ]}
                disabled={loading}
              >
                <View style={styles.iconContainer}>{item.icon}</View>
                <View style={styles.textContainer}>
                  <View style={[styles.radioCircle, isSelected && styles.radioSelected]}>
                    {isSelected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.optionDesc}>{item.desc}</Text>
                </View>


                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <ErrorBox error={error} />
      </ScrollView>

      <View style={styles.footer}>
        <ContinueButton
          onPress={handleFinish}
          loading={loading}
          disabled={!selectedReadiness}
          label="Finish Setup"
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 25, paddingTop: 40 },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 15,
    },
    subtitle: {
      fontSize: 15,
      color: colors.muted,
      textAlign: "center",
      marginBottom: 35,
    },
    listContainer: { width: "100%" },
    readinessCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 3,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    selectedCard: {
      borderColor: colors.primary,
      backgroundColor: "#F3F0FF",
      borderWidth: 2,
      elevation: 0,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 12,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    textContainer: { flex: 1 },
    optionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    optionDesc: {
      fontSize: 13,
      color: colors.muted,
    },
    selectedText: { color: colors.primary },
    radioCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    radioSelected: { borderColor: colors.primary },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    footer: { paddingHorizontal: 25, paddingBottom: 40 },
  });
