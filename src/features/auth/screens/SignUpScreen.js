// src/features/auth/screens/SignUpScreen.js
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
  useWindowDimensions,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import {
  validateEmail,
  validatePassword,
  validateMatch,
} from "../../../utils/validation";
import { handleAuthError } from "../../../utils/errorHandling";
import { AuthButton } from "../components/AuthButton";
import { AuthError } from "../components/AuthError";
import { signUp } from "../services/authService";
import { ROUTES } from "../../../navigation/routeNames";
import { useTheme } from "../../../theme/ThemeProvider";

export default function SignUpScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { width: screenWidth } = useWindowDimensions();
  const socialButtonWidth = Math.max(72, (screenWidth - 80) / 3);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation) {
      setError("Please enter a valid email address.");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(
        passwordValidation.errors[0] || "Please use a stronger password."
      );
      return;
    }

    const matchValidation = validateMatch(
      password,
      confirmPassword,
      "Passwords"
    );
    if (!matchValidation.isValid) {
      setError(matchValidation.error);
      return;
    }

    setLoading(true);
    try {
      setError(null);
      await signUp(email, password);
      navigation.replace("Setup");
    } catch (err) {
      console.error("SignUpScreen.handleSignUp error:", err);
      if (
        err?.message === "EMAIL_EXISTS" ||
        err?.code === "auth/email-already-in-use"
      ) {
        setError(
          "This email is already registered. Please log in or reset your password."
        );
      } else {
        const friendlyError = handleAuthError(err);
        setError(friendlyError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.headerContainer}>
          <View style={styles.decorativeCircle} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Reversia and start your reversal journey
          </Text>

          <View
            style={[
              styles.inputWrapper,
              focusedInput === "email" && styles.inputWrapperFocused,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={focusedInput === "email" ? colors.primary : colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              testID="signup-email-input"
              placeholder="Enter your email"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor={colors.primary}
              cursorColor={colors.primary}
              underlineColorAndroid="transparent"
            />
          </View>

          <View
            style={[
              styles.inputWrapper,
              focusedInput === "password" && styles.inputWrapperFocused,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={
                focusedInput === "password" ? colors.primary : colors.muted
              }
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              testID="signup-password-input"
              placeholder="Create a password"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              selectionColor={colors.primary}
              cursorColor={colors.primary}
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.muted}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.inputWrapper,
              focusedInput === "confirmPassword" && styles.inputWrapperFocused,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={
                focusedInput === "confirmPassword"
                  ? colors.primary
                  : colors.muted
              }
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              testID="signup-confirm-password-input"
              placeholder="Confirm your password"
              placeholderTextColor={colors.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              onFocus={() => setFocusedInput("confirmPassword")}
              onBlur={() => setFocusedInput(null)}
              selectionColor={colors.primary}
              cursorColor={colors.primary}
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.muted}
              />
            </TouchableOpacity>
          </View>

          <AuthError error={error} onDismiss={() => setError(null)} />

          <AuthButton
            label="Create Account"
            onPress={handleSignUp}
            loading={loading}
            disabled={!email || !password || !confirmPassword}
          />

          <Text style={styles.orText}>or sign up with</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { width: socialButtonWidth }]}
            >
              <FontAwesome name="google" size={22} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { width: socialButtonWidth }]}
            >
              <FontAwesome name="facebook" size={22} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { width: socialButtonWidth }]}
            >
              <FontAwesome name="apple" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.AUTH.LOGIN)}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    keyboardAvoidingView: { flex: 1 },
    headerContainer: {
      height: 180,
      justifyContent: "center",
      alignItems: "center",
    },
    decorativeCircle: {
      position: "absolute",
      top: -30,
      right: -30,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: colors.card,
    },
    formContainer: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: { fontSize: 15, color: colors.muted, marginBottom: 28 },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 56,
      marginBottom: 16,
    },
    inputWrapperFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    inputIcon: { marginRight: 10 },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 0,
      paddingHorizontal: 0,
      borderWidth: 0,
      backgroundColor: "transparent",
      underlineColorAndroid: "transparent",
      // avoid invalid web style props in RN StyleSheet; focus ring handled in src/web.css
    },
    orText: { textAlign: "center", color: colors.border, marginVertical: 20 },
    socialContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
      marginBottom: 16,
    },
    socialButton: {
      height: 54,
      borderRadius: 27,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    footer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
    footerText: { color: colors.muted },
    signInText: { color: colors.primary, fontWeight: "700" },
  });
