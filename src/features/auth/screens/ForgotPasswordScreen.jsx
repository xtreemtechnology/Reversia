import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import { validateEmail, firebaseErrorMessage } from "../authHelpers";

export default function ForgotPasswordScreen({ navigation, route }) {
  const { colors } = useTheme();
  const prefill = route?.params?.prefillEmail || "";
  const [email, setEmail] = useState(prefill);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleReset = async () => {
    setError("");
    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      navigation.replace("CheckEmail", { email: email.trim() });
    } catch (err) {
      setError(firebaseErrorMessage(err?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.card }]} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + "1A" }]}>
            <Ionicons name="lock-open-outline" size={36} color={colors.primary} />
          </View>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Forgot{"\n"}password?</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>No stress. Enter your email and we'll send you a link to reset it.</Text>
          </View>

          <AuthInput
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(""); }}
            keyboardType="email-address"
            autoComplete="email"
            iconName="mail-outline"
            error={error}
            inputRef={inputRef}
            returnKeyType="done"
            onSubmitEditing={handleReset}
          />

          <View style={styles.ctaGroup}>
            <AuthButton label="Send Reset Link" onPress={handleReset} loading={loading} disabled={!email} variant="primary" iconName="arrow-forward" />
            <AuthButton label="Back to Sign In" onPress={() => navigation.navigate("SignIn")} variant="ghost" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 36,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: Platform.OS === "ios" ? 120 : 100,
    paddingBottom: 48,
    gap: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    gap: 10,
  },
  title: {
    fontSize: 44,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -1.2,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
    lineHeight: 23,
  },
  ctaGroup: {
    gap: 14,
  },
});
