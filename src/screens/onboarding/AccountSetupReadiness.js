import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import {
  Ionicons,
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";
import { shadowStyle } from "../../utils/shadows";
import { ROUTES } from "../../navigation/routeNames";

// 1. FIREBASE IMPORTS
import { auth, db } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AccountSetupReadiness({ navigation }) {
  const { colors } = useTheme();
  const [selectedReadiness, setSelectedReadiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { width: screenWidth } = useWindowDimensions();
  const contentPadding = screenWidth < 380 ? 20 : 25;
  const styles = getStyles(colors);

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

  // 2. FIREBASE SAVE LOGIC
  const handleFinish = async () => {
    if (!selectedReadiness) {return;}

    setError(null);
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          readinessLevel: selectedReadiness,
          onboardingStep: 8,
          isOnboardingComplete: true, // Flag to indicate they're done
          updatedAt: new Date().toISOString(),
        });
        // Mirror completion locally so app restarts don't reopen onboarding
        try {
          await AsyncStorage.setItem("ONBOARDING_COMPLETE", "true");
        } catch (e) {
          // ignore local storage failures
        }
        // Navigate to your generation/loading screen
        navigation.navigate("SetupGenerating");
      }
    } catch (error) {
      console.error('Error finalizing setup:', error);
      setError('Something went wrong saving your final step. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const user = auth.currentUser;
    if (!user) {
      navigation.replace("Auth", { screen: ROUTES.AUTH.LOGIN });
      return;
    }

    handleFinish();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.skipButton} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: contentPadding },
        ]}
      >
        <Text style={styles.progressText}>
          <Text style={styles.progressActive}>8</Text> / 8
        </Text>

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
                  <Text
                    style={[
                      styles.optionTitle,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {item.title}
                  </Text>
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

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedReadiness || loading) && styles.disabledButton,
          ]}
          disabled={!selectedReadiness || loading}
          onPress={handleFinish}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueText}>Finish Setup</Text>
              <AntDesign
                name="check"
                size={20}
                color="#FFF"
                style={styles.icon}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    backButton: { padding: 8 },
    skipButton: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skipText: { fontSize: 14, color: colors.text, fontWeight: "500" },
    content: { paddingHorizontal: 25, paddingTop: 40 },
    progressText: {
      fontSize: 16,
      color: colors.muted,
      marginBottom: 20,
      fontWeight: "600",
      textAlign: "center",
    },
    progressActive: { color: colors.primary },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 15,
    },
    subtitle: {
      fontSize: 15,
      color: colors.text,
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
      ...shadowStyle({
        color: "#000",
        offsetY: 2,
        opacity: 0.05,
        radius: 8,
        elevation: 3,
      }),
    },
    selectedCard: {
      borderColor: colors.primary,
      backgroundColor: colors.background === "#FFFFFF" ? "#F3F0FF" : "#4A3F7D",
      borderWidth: 2,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 12,
      backgroundColor: colors.background === "#FFFFFF" ? "#F9FAFB" : "#2A2535",
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
    optionDesc: { fontSize: 13, color: colors.muted },
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
    errorBox: {
      width: "100%",
      marginTop: 16,
      marginBottom: 8,
      padding: 12,
      borderRadius: 14,
      backgroundColor: "#FEE2E2",
    },
    errorText: {
      color: "#B91C1C",
      textAlign: "center",
    },
    footer: { paddingHorizontal: 25, paddingBottom: 40 },
    continueButton: {
      backgroundColor: colors.primary,
      height: 65,
      borderRadius: 35,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    disabledButton: { backgroundColor: colors.muted },
    continueText: { color: colors.background, fontSize: 18, fontWeight: "700" },
    icon: { marginLeft: 10 },
  });
