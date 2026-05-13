import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedScreen from "../../../components/AnimatedScreen";
import { useTheme } from "../../../theme/ThemeProvider";

export default function OrdersScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.text}>All Orders Screen</Text>
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 110,
    },
    text: { fontSize: 18, fontWeight: "700", color: colors.text },
  });
