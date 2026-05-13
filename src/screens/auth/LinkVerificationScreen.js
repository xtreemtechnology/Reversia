import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ROUTES } from "../../navigation/routeNames";
import { useTheme } from "../../theme/ThemeProvider";

export default function LinkVerificationScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const email = route.params?.email || "your email";

  const handleOpenEmail = () => {
    // This attempts to open the default mail app on the device
    Linking.openURL("mailto:");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Link Sent</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Verification Link Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.imageCircle}>
            <Ionicons
              name="mail-unread-outline"
              size={80}
              color={colors.primary}
            />
          </View>
          {/* Brand decorative dots */}
          <View
            style={[
              styles.dot,
              { backgroundColor: "#22C55E", top: 10, left: -10 },
            ]}
          />
          <View
            style={[
              styles.dot,
              {
                backgroundColor: "#F97316",
                top: 0,
                right: 0,
                width: 20,
                height: 20,
              },
            ]}
          />
          <View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary,
                bottom: 20,
                left: -20,
                opacity: 0.4,
              },
            ]}
          />
        </View>

        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.instructionText}>
          We have sent a password recovery link to:{"\n"}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <TouchableOpacity
          style={styles.openMailButton}
          onPress={handleOpenEmail}
        >
          <Text style={styles.openMailButtonText}>Open Email App</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.resendText}>
            Didn't receive email?{" "}
            <Text style={{ fontWeight: "700", color: colors.primary }}>
              Try again
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.footerButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      height: 56,
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#000" },
    backButton: { padding: 8 },
    content: {
      flex: 1,
      paddingHorizontal: 25,
      alignItems: "center",
      paddingTop: 40,
    },
    illustrationContainer: {
      width: 180,
      height: 180,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 40,
    },
    imageCircle: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: "#F3F4FF",
      justifyContent: "center",
      alignItems: "center",
    },
    dot: { position: "absolute", width: 12, height: 12, borderRadius: 6 },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: "#111827",
      marginBottom: 12,
    },
    instructionText: {
      fontSize: 15,
      color: "#6B7280",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 40,
    },
    emailHighlight: { color: "#111827", fontWeight: "700" },
    openMailButton: {
      backgroundColor: "#825CFF",
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      marginBottom: 20,
    },
    openMailButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
    resendButton: { marginBottom: 30 },
    resendText: { color: "#9CA3AF", fontSize: 15 },
    footerButton: { padding: 10 },
    footerButtonText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 16,
    },
  });
