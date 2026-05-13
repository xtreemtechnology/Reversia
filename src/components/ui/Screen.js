import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

export default function Screen({ children, style, contentStyle }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={[{ backgroundColor: colors.background }, styles.container, style]}
    >
      <View
        style={[
          { backgroundColor: colors.background },
          styles.content,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { flex: 1, padding: 16 },
});
