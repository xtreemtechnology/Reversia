// src/screens/onboarding/Onboarding3.js
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
import { ROUTES } from "../../navigation/routeNames";
import { shadowStyle } from "../../utils/shadows";
import { useTheme } from "../../theme/ThemeProvider";

const { width } = Dimensions.get("window");

export default function Onboarding3({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.background} />
      </TouchableOpacity>
      {/* Top Section - Illustration */}
      <View style={styles.topSection}>
        <Image
          source={require("../../../assets/onboarding3.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Section - Content Sheet */}
      <View style={styles.bottomSheet}>
        <Text style={styles.title}>From Tracking to Transformation</Text>

        <Text style={styles.description}>
          Turn daily actions into measurable progress with guidance built to
          help reverse Type 2 diabetes naturally and sustainably.
        </Text>

        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.replace("Auth", { screen: ROUTES.AUTH.LOGIN })
          }
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Get Started</Text>
            <Text style={styles.arrow}> →</Text>
          </View>
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
      width: width * 0.8,
      height: width * 0.8,
    },
    bottomSheet: {
      flex: 1.2,
      backgroundColor: colors.primary,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      paddingHorizontal: 30,
      paddingTop: 50,
      alignItems: "center",
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.background,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 40,
      textTransform: "uppercase",
    },
    description: {
      fontSize: 15,
      color: colors.background,
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
      backgroundColor: colors.background,
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
      color: colors.background,
      fontSize: 16,
      fontWeight: "500",
    },
  });
