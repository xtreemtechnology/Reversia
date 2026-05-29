import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import AuthButton from "../components/AuthButton";

export default function EmailVerificationScreen({ navigation, route, email: emailProp, displayName: displayNameProp }) {
  const { colors } = useTheme();
  const email = emailProp || route?.params?.email || auth.currentUser?.email || "your inbox";
  const displayName = displayNameProp || route?.params?.displayName || auth.currentUser?.displayName?.split(" ")[0] || "there";
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setNotice("");
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setResent(true);
      }
    } catch (_) {
      setNotice("We couldn't resend the verification email just now.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setChecking(true);
    setNotice("");
    try {
      await auth.currentUser?.reload();
      if (!auth.currentUser?.emailVerified) {
        setNotice("Your email is still not verified. Open the link in your inbox, then try again.");
      } else {
        // Email is verified — proceed to post-onboarding questionnaire
        navigation.navigate("PostOnboarding");
      }
    } catch (_) {
      setNotice("We couldn't check verification yet. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigation?.reset?.({ index: 0, routes: [{ name: "AuthLanding" }] });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.inner}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "1A" }]}>
          <Ionicons name="mail-unread-outline" size={44} color={colors.primary} />
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.text }]}>One more{"\n"}step, {displayName}.</Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>We sent a verification link to{"\n"}<Text style={{ color: colors.text, fontFamily: "DMSans_500Medium" }}>{email}</Text></Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Tap the link in the email to verify your account, then come back here to continue.</Text>
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {resent ? (
          <View style={styles.resentRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
            <Text style={[styles.resentText, { color: colors.secondary }]}>Verification email resent.</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AuthButton label={checking ? "Checking…" : "I've verified — Continue"} onPress={handleContinue} loading={checking} variant="primary" iconName="arrow-forward" />
          <AuthButton label={loading ? "Sending…" : "Resend verification email"} onPress={handleResend} loading={loading} variant="ghost" />
          <TouchableOpacity onPress={handleSignOut} activeOpacity={0.6} style={styles.signOutBtn}>
            <Text style={[styles.signOutText, { color: colors.mutedForeground }]}>Use a different account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 40,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -1,
    lineHeight: 48,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
    lineHeight: 24,
    textAlign: "center",
  },
  hint: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    lineHeight: 20,
    textAlign: "center",
  },
  notice: {
    fontSize: 14,
    color: "#E28A82",
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  resentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  resentText: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
  },
  actions: {
    width: "100%",
    gap: 14,
  },
  signOutBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  signOutText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
});
