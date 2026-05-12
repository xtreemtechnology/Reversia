// src/features/auth/components/AuthError.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const AuthError = ({ error, onDismiss }) => {
  if (!error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons
        name="alert-circle"
        size={20}
        color="#B91C1C"
        style={styles.icon}
      />
      <Text style={styles.text}>{error}</Text>
      {onDismiss && (
        <Ionicons name="close" size={20} color="#B91C1C" onPress={onDismiss} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 14,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#B91C1C",
  },
  icon: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});
