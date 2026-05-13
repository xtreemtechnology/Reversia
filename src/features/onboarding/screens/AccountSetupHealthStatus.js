// src/features/onboarding/screens/AccountSetupHealthStatus.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingHeader } from "../components/OnboardingHeader";
import { OnboardingProgress } from "../components/OnboardingProgress";
import { ContinueButton } from "../components/ContinueButton";
import { ErrorBox } from "../components/ErrorBox";
import { saveHealthStatus } from "../services/onboardingService";
import { useTheme } from "../../../theme/ThemeProvider";

export default function AccountSetupHealthStatus({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const statuses = [
    { id: "type2", title: "Type 2 Diabetes" },
    { id: "pre", title: "Prediabetes" },
    { id: "high", title: "High Blood Sugar Concerns" },
    { id: "prevent", title: "Just Want Prevention" },
    { id: "not_sure", title: "Not Sure Yet" },
  ];

  const handleContinue = async () => {
    if (!selectedStatus) {
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await saveHealthStatus(selectedStatus);
      navigation.navigate("AccountSetupReadiness");
    } catch (err) {
      console.error("Error saving health status:", err);
      setError("Could not save your status. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgress current={7} />

        <Text style={styles.title}>
          What best describes your current health status?
        </Text>
        <Text style={styles.subtitle}>
          This helps us tailor our health insights specifically for you.
        </Text>

        <View style={styles.listContainer}>
          {statuses.map((item) => {
            const isSelected = selectedStatus === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => setSelectedStatus(item.id)}
                style={[styles.optionCard, isSelected && styles.selectedCard]}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.selectedLabel,
                  ]}
                >
                  {item.title}
                </Text>

                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <ErrorBox error={error} />
      </ScrollView>

      <View style={styles.footer}>
        <ContinueButton
          onPress={handleContinue}
          loading={loading}
          disabled={!selectedStatus}
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 25, paddingTop: 40, paddingBottom: 20 },
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
      lineHeight: 22,
      marginBottom: 35,
      paddingHorizontal: 15,
    },
    listContainer: { width: "100%" },
    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    selectedCard: {
      borderColor: colors.primary,
      backgroundColor: "#F3F0FF",
      borderWidth: 2,
      elevation: 0,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    selectedLabel: {
      color: colors.primary,
    },
    footer: { paddingHorizontal: 25, paddingBottom: 40 },
  });
