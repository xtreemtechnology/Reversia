// src/features/auth/components/AuthHeader.js
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const AuthHeader = ({ onBack, showBack = true }) => {
  if (!showBack) {
    return <View style={styles.spacer} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#7C3AED" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    alignItems: "flex-start",
  },
  spacer: {
    height: 16,
  },
});
