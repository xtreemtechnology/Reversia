import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";

// 1. FIREBASE IMPORTS
import { auth, db } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useTheme } from "../../theme/ThemeProvider";

const { width } = Dimensions.get("window");

export default function AccountSetupGender({ navigation }) {
  const [gender, setGender] = useState("female");
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // 2. UPDATE FIRESTORE
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          gender: gender,
          onboardingStep: 2,
          updatedAt: new Date().toISOString(),
        });

        navigation.navigate("AccountSetupAge");
      }
    } catch (error) {
      console.log("Error saving gender:", error);
      Alert.alert(
        "Connection Error",
        "We couldn't save your selection. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.skipButton} />
      </View>

      <View style={styles.content}>
        {/* Progress Indicator */}
        <Text style={styles.progressText}>
          <Text style={styles.progressActive}>2</Text> / 8
        </Text>

        <Text style={styles.title}>What is your gender?</Text>
        <Text style={styles.subtitle}>
          Please give some true answers for the following question
        </Text>

        {/* Gender Selection Cards */}
        <View style={styles.selectionContainer}>
          {/* Male Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setGender("male")}
            style={styles.genderWrapper}
            disabled={loading}
          >
            <View
              style={[
                styles.card,
                gender === "male" ? styles.activeCardMale : styles.inactiveCard,
              ]}
            >
              <Image
                source={require("../../../assets/Male.png")}
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

          {/* Female Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setGender("female")}
            style={styles.genderWrapper}
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
                source={require("../../../assets/Female.png")}
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

      {/* Bottom Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, loading && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueText}>Continue</Text>
              <AntDesign
                name="arrowright"
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
      alignItems: "center",
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
    content: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 40,
    },
    progressText: {
      fontSize: 16,
      color: colors.muted,
      marginBottom: 20,
      fontWeight: "600",
    },
    progressActive: { color: colors.primary },
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
      width: (width - 60) / 2,
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
    activeCardMale: { backgroundColor: colors.card },
    activeCardFemale: { backgroundColor: colors.card },
    avatar: { width: "90%", height: "90%" },
    genderLabel: { fontSize: 18, fontWeight: "600", color: colors.muted },
    activeLabelMale: { color: colors.text },
    activeLabelFemale: { color: colors.primary },
    footer: { paddingHorizontal: 25, paddingBottom: 40 },
    continueButton: {
      backgroundColor: colors.primary,
      height: 65,
      borderRadius: 35,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    continueText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
    icon: { marginLeft: 10 },
  });
