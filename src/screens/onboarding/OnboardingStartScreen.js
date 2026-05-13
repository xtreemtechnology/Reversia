import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ROUTES } from "../../navigation/routeNames";
import { shadowStyle } from "../../utils/shadows";
import { useTheme } from "../../theme/ThemeProvider";

// 1. FIREBASE IMPORT (To track session/user)
import { auth } from "../../config/firebase";

const { width, height } = Dimensions.get("window");

export default function OnboardingStartScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  // 2. SESSION CHECK (Optional but good practice)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      // If for some reason the session expired, kick back to login
      navigation.replace("Auth", { screen: ROUTES.AUTH.LOGIN });
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Illustration Area */}
      <View style={styles.illustrationContainer}>
        {/* Daniel: Make sure you have a cool illustration here in your assets! */}
        <Image
          source={require("../../../assets/account setup.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Content Card */}
      <View style={styles.bottomSheet}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Your Personalized Reversal Blueprint</Text>
          <Text style={styles.subtitle}>
            Share a few details and Reversia will craft a lifestyle-first plan
            tailored to your glucose profile and reversal goals.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("AccountSetupName")}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <AntDesign
            name="arrowright"
            size={24}
            color={colors.text}
            style={styles.icon}
          />
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
    illustrationContainer: {
      flex: 1.2,
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      width: width * 0.85,
      height: height * 0.4,
    },
    bottomSheet: {
      flex: 1,
      backgroundColor: colors.primary,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      paddingHorizontal: 30,
      paddingTop: 50,
      paddingBottom: 40,
      justifyContent: "space-between",
      ...shadowStyle({
        color: "#000",
        offsetY: -10,
        opacity: 0.1,
        radius: 10,
        elevation: 20,
      }),
    },
    textContainer: {
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.background,
      textAlign: "center",
      lineHeight: 38,
      marginBottom: 15,
    },
    subtitle: {
      fontSize: 16,
      color: colors.background,
      textAlign: "center",
      lineHeight: 24,
      opacity: 0.9,
    },
    continueButton: {
      backgroundColor: colors.background,
      height: 65,
      borderRadius: 35,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    continueButtonText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    icon: {
      marginLeft: 10,
    },
  });
