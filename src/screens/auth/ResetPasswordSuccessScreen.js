// src/screens/auth/ResetPasswordSuccessScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ROUTES } from "../../navigation/routeNames";
import { useTheme } from "../../theme/ThemeProvider";

export default function ResetPasswordSuccessScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.outerCircle}>
            <View style={styles.imageCircle}>
              <Ionicons name="thumbs-up" size={80} color={colors.primary} />
            </View>
          </View>
          {/* Decorative floating dots to match your UI */}
          <View
            style={[
              styles.dot,
              { backgroundColor: "#22C55E", top: 0, right: -20 },
            ]}
          />
          <View
            style={[
              styles.dot,
              { backgroundColor: "#F97316", top: -30, left: 40 },
            ]}
          />
          <View
            style={[
              styles.dot,
              {
                backgroundColor: "#825CFF",
                bottom: -10,
                left: -10,
                opacity: 0.3,
              },
            ]}
          />
        </View>

        <Text style={styles.title}>Reset Password Success!</Text>
        <Text style={styles.subtitle}>
          Please re-login with your new password
        </Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate(ROUTES.AUTH.LOGIN)}
        >
          <Text style={styles.loginButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 25,
    },
    illustrationContainer: {
      position: "relative",
      marginBottom: 50,
    },
    outerCircle: {
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      borderStyle: "dashed",
    },
    imageCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
    },
    dot: {
      position: "absolute",
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 15,
      color: colors.muted,
      textAlign: "center",
      marginBottom: 40,
    },
    loginButton: {
      backgroundColor: colors.primary,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 3,
    },
    loginButtonText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: "700",
    },
  });
