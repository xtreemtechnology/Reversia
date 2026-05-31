import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, StatusBar, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { useTheme } from "../../../theme/ThemeProvider";
import AuthButton from "../components/AuthButton";
import { firebaseErrorMessage } from "../authHelpers";

export default function CheckEmailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const email = route?.params?.email || "your inbox";
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setResent(true);
    } catch (err) {
      setError(firebaseErrorMessage(err?.code));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setResent(false);
  }, [email]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.inner}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: colors.secondary + "1A" },
          ]}
        >
          <Ionicons
            name="mail-open-outline"
            size={44}
            color={colors.secondary}
          />
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.text }]}>
            Check your{"\n"}inbox.
          </Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            We sent a password reset link to{"\n"}
            <Text
              style={{ color: colors.text, fontFamily: "DMSans_500Medium" }}
            >
              {email}
            </Text>
          </Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            It may take a minute. Check your spam folder if you don't see it.
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {resent ? (
          <View style={styles.resentRow}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.secondary}
            />
            <Text style={[styles.resentText, { color: colors.secondary }]}>
              Email resent successfully.
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AuthButton
            label="Back to Sign In"
            onPress={() => navigation.navigate("SignIn")}
            variant="primary"
          />
          <AuthButton
            label={loading ? "Sending…" : "Resend email"}
            onPress={handleResend}
            loading={loading}
            variant="ghost"
          />
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
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
    alignItems: "center",
    gap: 28,
    justifyContent: "center",
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
    fontSize: 42,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -1,
    lineHeight: 50,
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
  errorText: {
    fontSize: 14,
    color: "#E28A82",
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
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
});
