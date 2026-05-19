import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shared } from "../styles/shared";

export const BackBtn = ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={shared.backBtn}
    activeOpacity={0.7}
  >
    <Ionicons name="chevron-back" size={22} color={"#1A2E22"} />
  </TouchableOpacity>
);

export const OnboardingHeader = ({ onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Ionicons name="chevron-back" size={24} color="#111827" />
    </TouchableOpacity>
    <View style={styles.spacer} />
  </View>
);

export default BackBtn;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  spacer: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
});
