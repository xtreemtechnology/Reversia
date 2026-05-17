import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../../../theme/ThemeProvider";
import ROUTES from "../../../navigation/routeNames";

export default function OnboardingSplashScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(ROUTES.ONBOARDING.START);
    }, 1100);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Reversia</Text>
      <Text style={styles.tagline}>Natural reversal starts here</Text>
      <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      paddingHorizontal: 24,
    },
    brand: {
      fontSize: 34,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: 0.2,
    },
    tagline: {
      marginTop: 10,
      fontSize: 14,
      color: colors.muted,
      textAlign: "center",
    },
    loader: {
      marginTop: 24,
    },
  });
