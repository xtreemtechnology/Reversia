// src/features/onboarding/components/ErrorBox.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const ErrorBox = ({ error }) => {
  if (!error) {
    return null;
  }
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{error}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
  },
  text: {
    color: "#B91C1C",
    textAlign: "center",
  },
});
