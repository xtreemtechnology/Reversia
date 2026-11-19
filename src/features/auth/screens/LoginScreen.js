import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { auth } from "../../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useTheme } from "../../../theme/ThemeProvider";
import { T, FONTS } from "../../../theme/tokens";

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged in ProfileScreen will react — just close modal
      navigation.goBack();
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Sign in</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={colors.mutedForeground}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[
          styles.input,
          { color: colors.foreground, borderColor: colors.border },
        ]}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={colors.mutedForeground}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[
          styles.input,
          { color: colors.foreground, borderColor: colors.border },
        ]}
      />

      {error ? (
        <Text style={[styles.error, { color: T.DANGER }]}>{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleSignIn}
        style={[styles.button, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation?.goBack?.()}
        style={styles.close}
      >
        <Text style={{ fontFamily: FONTS.body, color: colors.mutedForeground }}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  button: {
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  buttonText: { fontFamily: FONTS.body, color: "#fff", fontWeight: "700" },
  close: { marginTop: 16, alignItems: "center" },
  error: { marginTop: 8 },
});
