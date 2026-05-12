import React, { useState } from "react";
import { validatePassword, validateMatch } from "../../utils/validation";
import { handleAuthError, logError } from "../../utils/errorHandling";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../config/firebase";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useTheme } from "../../theme/ThemeProvider";

export default function ChangePassword({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const styles = getStyles(colors, isDark);

  const handleChangePassword = async () => {
    setMessage(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill in all password fields");
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setMessage(
        passwordValidation.errors[0] || "Please use a stronger password"
      );
      return;
    }

    const matchValidation = validateMatch(
      newPassword,
      confirmPassword,
      "Passwords"
    );
    if (!matchValidation.isValid) {
      setMessage(matchValidation.error);
      return;
    }

    if (currentPassword === newPassword) {
      setMessage(
        "Your new password must be different from your current password"
      );
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("Please log in to change your password");
        return;
      }

      if (user) {
        await updatePassword(user, newPassword);
        setMessage("Password changed successfully");
        navigation.goBack();
      }
    } catch (error) {
      logError("ChangePassword.handleChangePassword", error);
      const errorInfo = handleAuthError(error);
      setMessage(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({
    label,
    value,
    onChangeText,
    isVisible,
    onToggleVisibility,
    colors,
    isDark,
  }) => {
    const st = getStyles(colors, isDark);
    return (
      <View style={st.section}>
        <Text style={st.label}>{label}</Text>
        <View style={st.inputContainer}>
          <TextInput
            style={st.input}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!isVisible}
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
          />
          <TouchableOpacity onPress={onToggleVisibility} style={st.eyeIcon}>
            <Ionicons
              name={isVisible ? "eye" : "eye-off"}
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.note}>
          For your security, please enter a strong password with a mix of
          uppercase, lowercase, numbers, and symbols.
        </Text>

        <PasswordInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          isVisible={showCurrentPassword}
          onToggleVisibility={() =>
            setShowCurrentPassword(!showCurrentPassword)
          }
          colors={colors}
          isDark={isDark}
        />

        <PasswordInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          isVisible={showNewPassword}
          onToggleVisibility={() => setShowNewPassword(!showNewPassword)}
          colors={colors}
          isDark={isDark}
        />

        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isVisible={showConfirmPassword}
          onToggleVisibility={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
          colors={colors}
          isDark={isDark}
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? "Updating..." : "Change Password"}
          </Text>
        </TouchableOpacity>

        {message && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    title: { fontSize: 20, fontWeight: "800", color: colors.text },
    content: { paddingHorizontal: 20, paddingVertical: 20 },
    note: {
      fontSize: 13,
      color: colors.muted,
      lineHeight: 20,
      marginBottom: 24,
      backgroundColor: "#FEF3C7",
      padding: 12,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: "#D97706",
      borderWidth: 1,
      borderColor: "#FDE68A",
    },
    section: { marginBottom: 20 },
    label: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: { flex: 1, padding: 14, fontSize: 15, color: colors.text },
    eyeIcon: { paddingRight: 14 },
    submitBtn: {
      backgroundColor: colors.text,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginTop: 20,
      borderWidth: 1,
      borderColor: colors.text,
    },
    submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
    messageBox: {
      backgroundColor: "#FEE2E2",
      padding: 12,
      borderRadius: 12,
      marginTop: 12,
    },
    messageText: { color: "#B91C1C", textAlign: "center" },
  });

const styles = StyleSheet.create({});
