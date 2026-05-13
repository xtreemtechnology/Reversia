// src/screens/onboarding/Onboarding1.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyle } from "../../utils/shadows";
import { ROUTES } from "../../navigation/routeNames";
import { useTheme } from "../../theme/ThemeProvider";

const { width } = Dimensions.get("window");

export default function Onboarding1({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      {/* Top Section - Illustration */}
      <View style={styles.topSection}>
        <Image
          source={require("../../../assets/onboarding1.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Section - Content Sheet */}
      <View style={styles.bottomSheet}>
        <Text style={styles.title}>
          A Smarter Path to Natural Diabetes Reversal
        </Text>
        <Text style={styles.description}>
          Get personalized food guidance that helps flatten glucose swings and
          restore metabolic health one meal at a time.
        </Text>

        <View style={styles.pagination}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Onboarding2")}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Next</Text>
            <Text style={styles.arrow}> →</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.replace("Auth", { screen: ROUTES.AUTH.LOGIN })
          }
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backButton: {
      position: "absolute",
      top: 16,
      left: 16,
      zIndex: 10,
      padding: 8,
    },
    topSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    illustration: {
      width: width * 0.7,
      height: width * 0.7,
    },
    bottomSheet: {
      flex: 1.2,
      backgroundColor: "#74B9FF", // Sky blue accent preserved for visual design
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      paddingHorizontal: 30,
      paddingTop: 50,
      alignItems: "center",
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: "#FFFFFF",
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 40,
    },
    description: {
      fontSize: 15,
      color: "rgba(255, 255, 255, 0.8)",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 30,
    },
    pagination: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 40,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    activeDot: {
      backgroundColor: "#FFFFFF",
    },
    button: {
      backgroundColor: colors.background,
      paddingVertical: 18,
      borderRadius: 40,
      width: "100%",
      alignItems: "center",
      marginBottom: 20,
      ...shadowStyle({ offsetY: 4, opacity: 0.1, radius: 10, elevation: 5 }),
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttonText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    arrow: {
      fontSize: 24,
      color: colors.text,
      marginLeft: 10,
    },
    skipText: {
      color: "rgba(255, 255, 255, 0.9)",
      fontSize: 16,
      fontWeight: "500",
    },
  });
