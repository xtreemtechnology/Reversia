// src/features/onboarding/screens/AccountSetupGender.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  useWindowDimensions,
} from "react-native";
import { OnboardingHeader } from "../components/OnboardingHeader";
import { OnboardingProgress } from "../components/OnboardingProgress";
import { ContinueButton } from "../components/ContinueButton";
import { saveGender } from "../services/onboardingService";
import { useTheme } from "../../../theme/ThemeProvider";

export default function AccountSetupGender({ navigation }) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [gender, setGender] = useState("female");
  const [loading, setLoading] = useState(false);

  const genderWidth = (width - 60) / 2;

  const handleContinue = async () => {
    try {
      setLoading(true);
      await saveGender(gender);
      navigation.navigate("AccountSetupAge");
    } catch (error) {
      console.error("Error saving gender:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <OnboardingProgress current={2} />
        <Text style={styles.title}>What is your gender?</Text>
        <Text style={styles.subtitle}>
          Please give some true answers for the following question
        </Text>

        <View style={styles.selectionContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setGender("male")}
            style={[styles.genderWrapper, { width: genderWidth }]}
            disabled={loading}
          >
            <View
              style={[
                styles.card,
                gender === "male" ? styles.activeCardMale : styles.inactiveCard,
              ]}
            >
              <Image
                source={require("../../../../assets/Male.png")}
                style={styles.avatar}
                resizeMode="contain"
              />
            </View>
            <Text
              style={[
                styles.genderLabel,
                gender === "male" && styles.activeLabelMale,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setGender("female")}
            style={[styles.genderWrapper, { width: genderWidth }]}
            disabled={loading}
          >
            <View
              style={[
                styles.card,
                gender === "female"
                  ? styles.activeCardFemale
                  : styles.inactiveCard,
              ]}
            >
              <Image
                source={require("../../../../assets/Female.png")}
                style={styles.avatar}
                resizeMode="contain"
              />
            </View>
            <Text
              style={[
                styles.genderLabel,
                gender === "female" && styles.activeLabelFemale,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <ContinueButton onPress={handleContinue} loading={loading} />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 40,
    },
    title: {
      fontSize: 32,
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
      marginBottom: 40,
    },
    selectionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: 10,
    },
    genderWrapper: {
      alignItems: "center",
    },
    card: {
      width: "100%",
      aspectRatio: 0.85,
      borderRadius: 24,
      justifyContent: "flex-end",
      alignItems: "center",
      overflow: "hidden",
      marginBottom: 12,
    },
    inactiveCard: { backgroundColor: colors.card },
    activeCardMale: { backgroundColor: "#DBEAFE" },
    activeCardFemale: { backgroundColor: "#E0E7FF" },
    avatar: { width: "90%", height: "90%" },
    genderLabel: { fontSize: 18, fontWeight: "600", color: colors.muted },
    activeLabelMale: { color: "#2563EB" },
    activeLabelFemale: { color: colors.primary },
    footer: { paddingHorizontal: 25, paddingBottom: 40 },
  });
