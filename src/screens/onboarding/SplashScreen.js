// src/screens/onboarding/SplashScreen.js
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, StatusBar } from "react-native";
import { auth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../theme/ThemeProvider";

export default function SplashScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);
  useEffect(() => {
    let resolved = false;
    let timer = null;

    const unsub = onAuthStateChanged(auth, async (user) => {
      resolved = true;
      if (timer) {
        clearTimeout(timer);
      }

      if (user) {
        navigation.replace("MainApp");
      } else {
        // Check if user previously completed onboarding
        const hasCompletedOnboarding = await AsyncStorage.getItem(
          "ONBOARDING_COMPLETE"
        );
        // No user — proceed to onboarding
        navigation.replace("Onboarding1");
      }
      try {
        unsub && unsub();
      } catch {}
    });

    // Fallback: if auth doesn't resolve within 3 seconds, go to onboarding
    // (increased from 800ms to allow slower Firebase operations to complete)
    timer = setTimeout(() => {
      if (!resolved) {
        navigation.replace("Onboarding1");
        try {
          unsub && unsub();
        } catch {}
      }
    }, 3000);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      try {
        unsub && unsub();
      } catch {}
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <View style={styles.content}>
        <Image
          source={require("../../../assets/Reversia-Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      alignItems: "center",
    },
    logo: {
      width: 180,
      height: 180,
    },
  });
