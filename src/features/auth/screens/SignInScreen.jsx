import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import { validateEmail, firebaseErrorMessage } from "../authHelpers";

export default function SignInScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const passwordRef = useRef(null);

  const handleSignIn = async () => {
    const nextErrors = {};
    if (!validateEmail(email))
      nextErrors.email = "Enter a valid email address.";
    if (!password || password.length < 8)
      nextErrors.password = "Password must be at least 8 characters.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(firebaseErrorMessage(err?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backBtn, { backgroundColor: colors.card }]}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Welcome{"\n"}back.
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Sign in to continue your reversal journey.
            </Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setFieldErrors((e) => ({ ...e, email: "" }));
              }}
              keyboardType="email-address"
              autoComplete="email"
              iconName="mail-outline"
              error={fieldErrors.email}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <AuthInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setFieldErrors((e) => ({ ...e, password: "" }));
              }}
              secureTextEntry
              autoComplete="password"
              iconName="lock-closed-outline"
              error={fieldErrors.password}
              inputRef={passwordRef}
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
            />

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ForgotPassword", { prefillEmail: email })
              }
              style={styles.forgotBtn}
              activeOpacity={0.6}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: "rgba(226,138,130,0.18)",
                  borderColor: "rgba(226,138,130,0.4)",
                },
              ]}
            >
              <Ionicons name="warning-outline" size={16} color="#E28A82" />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.ctaGroup}>
            <AuthButton
              label="Sign in"
              onPress={handleSignIn}
              loading={loading}
              disabled={!email || !password}
              variant="primary"
            />

            <View style={[styles.dividerRow, { marginVertical: 2 }]}>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
              <Text
                style={[styles.dividerText, { color: colors.mutedForeground }]}
              >
                or
              </Text>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
            </View>

            <AuthButton
              label="Create an account"
              onPress={() => navigation.replace("SignUp")}
              variant="outline"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  keyboardAvoid: { flex: 1 },
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
    gap: 20,
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
  form: {
    gap: 16,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: "#E28A82",
    fontFamily: "DMSans_400Regular",
    lineHeight: 20,
  },
  ctaGroup: {
    gap: 14,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
});
