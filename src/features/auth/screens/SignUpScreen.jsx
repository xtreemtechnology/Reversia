import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth, db } from "../../../config/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { DeviceEventEmitter } from "react-native";
import { useTheme } from "../../../theme/ThemeProvider";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import { validateEmail, validatePassword, firebaseErrorMessage } from "../authHelpers";

export default function SignUpScreen({ navigation }) {
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const lastRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 && !/[^a-zA-Z0-9]/.test(password) ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "#E28A82", "#F2CC8F", colors.secondary][strength];

  const handleSignUp = async () => {
    const nextErrors = {};
    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!validateEmail(email)) nextErrors.email = "Enter a valid email address.";
    if (!validatePassword(password)) nextErrors.password = "Password must be at least 8 characters.";
    if (password !== confirm) nextErrors.confirm = "Passwords do not match.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
      await sendEmailVerification(cred.user);
      // Ensure a minimal user profile document exists so the app can read it immediately
      try {
        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            id: cred.user.uid,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: cred.user.email,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (profileErr) {
        // non-fatal; log for diagnostics
        // eslint-disable-next-line no-console
        console.warn("create user profile failed", profileErr);
      }
      // Request post-onboarding flow (welcome/questionnaire) for new users
      try {
        DeviceEventEmitter.emit("postOnboardingRequested");
      } catch (_) {}
      navigation.navigate("EmailVerification", { email: email.trim(), displayName: firstName.trim() });
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
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create your{"\n"}account.</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Your reversal journey starts here.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <AuthInput
                  label="First name"
                  placeholder="Chioma"
                  value={firstName}
                  onChangeText={(t) => { setFirstName(t); setFieldErrors((e) => ({ ...e, firstName: "" })); }}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  iconName="person-outline"
                  error={fieldErrors.firstName}
                  returnKeyType="next"
                  onSubmitEditing={() => lastRef.current?.focus()}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AuthInput
                  label="Last name"
                  placeholder="Eze"
                  value={lastName}
                  onChangeText={(t) => { setLastName(t); setFieldErrors((e) => ({ ...e, lastName: "" })); }}
                  autoCapitalize="words"
                  autoComplete="family-name"
                  iconName="person-outline"
                  error={fieldErrors.lastName}
                  inputRef={lastRef}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            </View>

            <AuthInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setFieldErrors((e) => ({ ...e, email: "" })); }}
              keyboardType="email-address"
              autoComplete="email"
              iconName="mail-outline"
              error={fieldErrors.email}
              inputRef={emailRef}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <View style={styles.strengthWrap}>
              <AuthInput
                label="Password"
                placeholder="At least 8 characters"
                value={password}
                onChangeText={(t) => { setPassword(t); setFieldErrors((e) => ({ ...e, password: "" })); }}
                secureTextEntry
                autoComplete="new-password"
                iconName="lock-closed-outline"
                error={fieldErrors.password}
                inputRef={passwordRef}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
              {password.length > 0 ? (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3].map((level) => (
                      <View key={level} style={[styles.strengthBar, { backgroundColor: strength >= level ? strengthColor : colors.border }]} />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
                </View>
              ) : null}
            </View>

            <AuthInput
              label="Confirm password"
              placeholder="Re-enter password"
              value={confirm}
              onChangeText={(t) => { setConfirm(t); setFieldErrors((e) => ({ ...e, confirm: "" })); }}
              secureTextEntry
              autoComplete="new-password"
              iconName="lock-closed-outline"
              error={fieldErrors.confirm}
              inputRef={confirmRef}
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={16} color="#E28A82" />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.ctaGroup}>
            <AuthButton label="Create Account" onPress={handleSignUp} loading={loading} disabled={!firstName || !lastName || !email || !password || !confirm} variant="primary" />
            <TouchableOpacity onPress={() => navigation.replace("SignIn")} style={styles.signinLink} activeOpacity={0.6}>
              <Text style={[styles.signinLinkText, { color: colors.mutedForeground }]}>Already have an account? <Text style={{ color: colors.primary, fontFamily: "DMSans_500Medium" }}>Sign in</Text></Text>
            </TouchableOpacity>
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
    gap: 14,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  strengthWrap: {
    gap: 8,
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 5,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    fontWeight: "600",
    width: 44,
    textAlign: "right",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderColor: "rgba(226,138,130,0.4)",
    backgroundColor: "rgba(226,138,130,0.18)",
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
  signinLink: {
    alignItems: "center",
    paddingVertical: 6,
  },
  signinLinkText: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
  },
});
