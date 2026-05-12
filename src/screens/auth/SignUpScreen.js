import React, { useState } from "react";
import {
  validateEmail,
  validatePassword,
  validateMatch,
} from "../../utils/validation";
import { handleAuthError, logError } from "../../utils/errorHandling";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { signUp as authServiceSignUp } from "../../features/auth/services/authService";
import { ROUTES } from "../../navigation/routeNames";
import { useTheme } from "../../theme/ThemeProvider";

// compute width at render time via useWindowDimensions

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
      // delegate to central auth service (adds verification + user doc creation)
      await authServiceSignUp(email.trim(), password);
      navigation.replace("Setup");
    } catch (error) {
      console.error("SignUp error detailed:", {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });
      const friendlyError = handleAuthError(error);
      setError(friendlyError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.headerContainer}>
          <View style={styles.decorativeCircle} />
          <View style={styles.logoPlaceholder}>
            <Image
              source={require("../../../assets/Reversia-Logo.png")}
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Reversia and start your reversal journey
          </Text>

          {/* Email Input */}
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
              placeholder="Enter your email"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              underlineColorAndroid="transparent"
              selectionColor={colors.primary}
              cursorColor={colors.primary}
            />
          </View>

          {/* Password Input */}
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
              placeholder="Create a password"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              underlineColorAndroid="transparent"
              selectionColor={colors.primary}
              cursorColor={colors.primary}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.muted}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
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
              placeholder="Confirm your password"
              placeholderTextColor={colors.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              onFocus={() => setFocusedInput("confirmPassword")}
              onBlur={() => setFocusedInput(null)}
              underlineColorAndroid="transparent"
              selectionColor={colors.primary}
              cursorColor={colors.primary}
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

          <TouchableOpacity
            style={[styles.signUpButton, loading && { opacity: 0.7 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.orText}>or sign up with</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { width: socialButtonWidth }]}
            >
              <FontAwesome name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { width: socialButtonWidth }]}
            >
              <FontAwesome name="facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { width: socialButtonWidth }]}
            >
              <FontAwesome name="apple" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(ROUTES.AUTH.LOGIN, { email: email.trim() })
              }
            >
              <Text style={styles.loginText}>Login</Text>
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
    headerContainer: {
      height: 180,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    },
    decorativeCircle: {
      position: "absolute",
      right: -60,
      top: -40,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: colors.card,
    },
    logoPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 25,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
      shadowColor: colors.primary,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      zIndex: 10,
    },
    formContainer: { flex: 1, paddingHorizontal: 25 },
    title: { fontSize: 28, fontWeight: "bold", color: colors.text },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      marginBottom: 30,
      marginTop: 5,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 30,
      paddingHorizontal: 20,
      height: 55,
      marginBottom: 15,
    },
    inputWrapperFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    inputIcon: { marginRight: 12 },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 0,
      borderWidth: 0,
      // Fix for the black browser focus ring
      ...Platform.select({
        web: {
          outlineStyle: "none",
        },
      }),
    },
    signUpButton: {
      backgroundColor: colors.primary,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 25,
      elevation: 3,
    },
    signUpButtonText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: "bold",
    },
    orText: { textAlign: "center", color: colors.muted, marginBottom: 25 },
    socialContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    socialButton: {
      height: 60,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    footer: { flexDirection: "row", justifyContent: "center" },
    footerText: { color: colors.muted },
    loginText: { color: colors.primary, fontWeight: "bold" },
    errorBox: {
      backgroundColor: "#FEE2E2",
      borderRadius: 10,
      padding: 8,
      marginTop: 8,
    },
    errorText: { color: "#B91C1C" },
  });
