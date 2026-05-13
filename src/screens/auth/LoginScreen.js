import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

// FIREBASE IMPORTS
import { auth } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  handleAuthError,
  logError,
  handleValidationError,
} from "../../utils/errorHandling";
import { useTheme } from "../../theme/ThemeProvider";

// removed module-level Dimensions usage; use useWindowDimensions() inside components if needed

// FIX: Only use TouchableWithoutFeedback on mobile to prevent blocking focus on Web
const ContainerWrapper =
  Platform.OS === "web" ? View : TouchableWithoutFeedback;
const wrapperProps = Platform.OS === "web" ? {} : { onPress: Keyboard.dismiss };

export default function LoginScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [email, setEmail] = useState(route?.params?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [error, setError] = useState(null);
  const passwordRef = useRef(null);

  const handleSignIn = async () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setError(null);

    if (!email || !password) {
      const validationError = handleValidationError(
        "Email and password",
        "required"
      );
      setError(validationError.message);
      return;
    }

    if (!emailRegex.test(email)) {
      const validationError = handleValidationError("Email", "email");
      setError(validationError.message);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace("MainApp");
    } catch (err) {
      logError("LoginScreen.handleSignIn", err, { email: email.trim() });
      const friendlyError = handleAuthError(err);
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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <ContainerWrapper {...wrapperProps}>
            <View style={{ flex: 1 }}>
              {/* Header Design */}
              <View style={styles.headerContainer}>
                <View style={styles.purpleCard}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <View
                    style={[
                      styles.circle,
                      styles.circleSmall,
                      { left: "40%", top: "15%" },
                    ]}
                  />
                  <View
                    style={[
                      styles.circle,
                      styles.circleMedium,
                      { left: "15%", bottom: -40 },
                    ]}
                  />
                  <View
                    style={[
                      styles.circle,
                      styles.circleLarge,
                      { right: -30, top: "10%" },
                    ]}
                  >
                    <Image
                      source={require("../../../assets/Reversia-Logo.png")}
                      style={{ width: 60, height: 60 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Please login to your account
                </Text>

                {/* Email */}
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === "email" && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.muted}
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
                  />
                </View>

                {/* Password */}
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === "password" && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.muted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                {error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Text style={styles.orText}>or sign in with</Text>

                {/* FIXED: Social Container - Centered and constrained */}
                <View style={styles.socialContainer}>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome name="google" size={22} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome name="facebook" size={22} color="#4267B2" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome name="apple" size={22} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("SignUp")}
                  >
                    <Text style={styles.signUpText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ContainerWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerContainer: { height: 210 },
    purpleCard: {
      backgroundColor: colors.primary,
      height: 180,
      borderBottomRightRadius: 100,
      overflow: "hidden",
    },
    backButton: {
      width: 40,
      height: 40,
      backgroundColor: colors.card,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 40,
      marginLeft: 20,
      zIndex: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    circle: {
      position: "absolute",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 100,
    },
    circleSmall: { width: 50, height: 50 },
    circleMedium: {
      width: 90,
      height: 90,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    circleLarge: {
      width: 170,
      height: 170,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
    },
    formContainer: { flex: 1, paddingHorizontal: 25 },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 5,
    },
    subtitle: { fontSize: 14, color: colors.muted, marginBottom: 25 },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 25,
      paddingHorizontal: 15,
      height: 55,
      marginBottom: 15,
    },
    inputWrapperFocused: { borderColor: colors.primary },
    inputIcon: { marginRight: 10 },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      ...Platform.select({ web: { outlineStyle: "none" } }),
    },
    forgotPasswordContainer: { alignSelf: "flex-end", marginBottom: 20 },
    forgotPasswordText: { color: colors.primary, fontWeight: "600" },
    signInButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 25,
      alignItems: "center",
    },
    signInButtonText: {
      color: colors.background,
      fontWeight: "bold",
      fontSize: 16,
    },
    orText: { textAlign: "center", color: colors.muted, marginVertical: 20 },

    // FIXED STYLES:
    socialContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 15, // Space between pills
      marginBottom: 20,
    },
    socialButton: {
      width: 85, // Fixed width to keep them as pills, not stretched
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },

    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 30,
    },
    footerText: { color: colors.text },
    signUpText: { color: colors.primary, fontWeight: "bold" },
    errorBox: {
      backgroundColor: "#FEE2E2",
      borderRadius: 10,
      padding: 10,
      marginTop: 12,
      marginBottom: 6,
    },
    errorText: { color: "#B91C1C" },
  });
