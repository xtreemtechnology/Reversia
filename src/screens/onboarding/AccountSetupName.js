import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";

// 1. FIREBASE IMPORTS
import { auth, db } from "../../config/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useTheme } from "../../theme/ThemeProvider";

export default function AccountSetupName({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  // Initializing with an empty string so the user can type their own name
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleContinue = async () => {
    setError(null);
    if (name.trim().length < 2) {
      setError("Please enter your real name to continue.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // 2. SAVE NAME TO FIRESTORE
        // We use merge: true so we don't overwrite other data if it exists
        await setDoc(
          doc(db, "users", user.uid),
          {
            displayName: name.trim(),
            onboardingStep: 1,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        navigation.navigate("AccountSetupGender");
      }
    } catch (error) {
      console.log("Error saving name:", error);
      setError("We couldn't save your name. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {/* Header with Back Button Only */}
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
            <Text style={styles.progressActive}>1</Text> / 8
          </Text>

          <Text style={styles.title}>What is your name?</Text>
          <Text style={styles.subtitle}>
            Please give some true answers for the following questions
          </Text>

          {/* Large Pill Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.muted}
              textAlign="center"
              autoFocus={true}
              autoCapitalize="words"
              disabled={loading}
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Bottom Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, loading && { opacity: 0.7 }]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <>
                <Text style={styles.continueText}>Continue</Text>
                <AntDesign
                  name="arrowright"
                  size={20}
                  color={colors.background}
                  style={styles.icon}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    backButton: {
      padding: 8,
    },
    skipButton: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skipText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    content: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 30,
      paddingTop: 40,
    },
    progressText: {
      fontSize: 16,
      color: colors.muted,
      marginBottom: 20,
      fontWeight: "600",
    },
    progressActive: {
      color: colors.primary,
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
      marginBottom: 50,
    },
    inputContainer: {
      width: "100%",
      height: 90,
      borderRadius: 45,
      borderWidth: 1,
      borderColor: colors.primary,
      justifyContent: "center",
      paddingHorizontal: 25,
    },
    input: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    errorBox: {
      width: "100%",
      marginTop: 16,
      padding: 12,
      borderRadius: 14,
      backgroundColor: "#FEE2E2",
    },
    errorText: {
      color: "#B91C1C",
      textAlign: "center",
    },
    footer: {
      paddingHorizontal: 25,
      paddingBottom: 40,
    },
    continueButton: {
      backgroundColor: colors.primary,
      height: 65,
      borderRadius: 35,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    continueText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: "700",
    },
    icon: {
      marginLeft: 10,
    },
  });
