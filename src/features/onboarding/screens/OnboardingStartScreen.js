import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { useTheme } from "../../../theme/ThemeProvider";

export default function OnboardingStartScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Reversia</Text>
        <Text style={styles.subtitle}>
          Build your personal plan in a few guided steps before entering the app.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("AccountSetupName")}
        >
          <Text style={styles.primaryButtonText}>Start Setup</Text>
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
      paddingHorizontal: 30,
    },
    title: {
      fontSize: 34,
      fontWeight: "800",
      color: colors.primary,
      textAlign: "center",
    },
    subtitle: {
      marginTop: 14,
      fontSize: 16,
      lineHeight: 24,
      color: colors.muted,
      textAlign: "center",
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 34,
    },
    primaryButton: {
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
