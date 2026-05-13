import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 1. FIREBASE IMPORTS
import { auth } from "../../config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { ROUTES } from "../../navigation/routeNames";
import { useTheme } from "../../theme/ThemeProvider";

export default function ForgotPasswordScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [email, setEmail] = useState(route?.params?.email || "");
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // 2. RESET LOGIC
  const handleResetPassword = async () => {
    setStatus(null);

    if (!email) {
      setStatus({ type: "error", message: "Please enter your email address." });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setStatus({
        type: "success",
        message: "Check your inbox for a link to reset your password.",
      });
    } catch (error) {
      let message = "Something went wrong. Please try again.";
      if (error.code === "auth/user-not-found") {
        message = "No user found with this email.";
      } else if (error.code === "auth/invalid-email") {
        message = "The email address is badly formatted.";
      }
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Illustration Container */}
        <View style={styles.illustrationContainer}>
          <View style={styles.imageCircle}>
            <Ionicons
              name="lock-open-outline"
              size={80}
              color={colors.primary}
            />
          </View>
        </View>

        <Text style={styles.instructionText}>
          Please enter your email address to receive a password reset link.
        </Text>

        {/* FIXED EMAIL INPUT */}
        <View
          style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={20} color={colors.background} />
          </View>
          <TextInput
            style={[
              styles.input,
              // Force removal of web-specific outlines
              Platform.OS === "web" && { outlineStyle: "none" },
            ]}
            placeholder="Enter your email"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
            underlineColorAndroid="transparent"
          />
        </View>

        <TouchableOpacity style={styles.tryAnotherWay}>
          <Text style={styles.tryAnotherWayText}>Try another way</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, loading && { opacity: 0.7 }]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>

        {status?.message && (
          <View
            style={[
              styles.statusBox,
              status.type === "success"
                ? styles.statusSuccess
                : styles.statusError,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                status.type === "success"
                  ? styles.statusSuccessText
                  : styles.statusErrorText,
              ]}
            >
              {status.message}
            </Text>
            {status.type === "success" && (
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() =>
                  navigation.navigate(ROUTES.AUTH.LOGIN, {
                    email: email.trim(),
                  })
                }
              >
                <Text style={styles.loginButtonText}>Back to Login</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      height: 56,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    backButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 25,
      alignItems: "center",
      paddingTop: 40,
    },
    illustrationContainer: {
      marginBottom: 60,
    },
    imageCircle: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
    },
    instructionText: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 40,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1.5, // Thicker border like the Heald images
      borderColor: colors.border,
      borderRadius: 35, // High value for that perfect pill shape
      paddingHorizontal: 15,
      height: 65,
      width: "100%",
      marginBottom: 30,
      overflow: "hidden",
    },
    inputWrapperFocused: {
      borderColor: colors.primary,
    },
    iconContainer: {
      width: 40,
      height: 40,
      backgroundColor: colors.primary,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      height: "100%",
      backgroundColor: "transparent",
      // Kill the box on native
      borderWidth: 0,
    },
    tryAnotherWay: {
      marginBottom: 40,
    },
    tryAnotherWayText: {
      color: colors.muted,
      fontSize: 16,
      textDecorationLine: "underline",
    },
    sendButton: {
      backgroundColor: colors.primary,
      height: 65,
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    sendButtonText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: "700",
    },
    statusBox: {
      width: "100%",
      borderRadius: 14,
      padding: 14,
      marginTop: 16,
    },
    statusSuccess: {
      backgroundColor: "#ECFDF5",
    },
    statusError: {
      backgroundColor: "#FEE2E2",
    },
    statusText: {
      textAlign: "center",
      fontSize: 15,
      lineHeight: 21,
    },
    statusSuccessText: {
      color: "#065F46",
    },
    statusErrorText: {
      color: "#B91C1C",
    },
    loginButton: {
      alignSelf: "center",
      marginTop: 12,
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 999,
    },
    loginButtonText: {
      color: colors.background,
      fontWeight: "700",
    },
  });
