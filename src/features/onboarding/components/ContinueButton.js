// src/features/onboarding/components/ContinueButton.js
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const ContinueButton = ({
  onPress,
  loading = false,
  disabled = false,
  label = "Continue",
}) => (
  <TouchableOpacity
    style={[styles.button, (loading || disabled) && { opacity: 0.7 }]}
    onPress={onPress}
    disabled={loading || disabled}
  >
    {loading ? (
      <ActivityIndicator color="#FFF" />
    ) : (
      <>
        <Text style={styles.text}>{label}</Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#FFF"
          style={styles.icon}
        />
      </>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#7C3AED",
    height: 65,
    borderRadius: 35,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  text: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  icon: {
    marginLeft: 10,
  },
});
