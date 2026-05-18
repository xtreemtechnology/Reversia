import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { shared } from "../styles/shared";

export const StepDots = ({ current, total = 11 }) => (
  <View style={shared.dotsRow}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          shared.dot,
          i < current ? shared.dotFilled : shared.dotEmpty,
          i === current - 1 && shared.dotActive,
        ]}
      />
    ))}
  </View>
);

export const OnboardingProgress = ({ current, total = 11 }) => (
  <Text style={styles.progressText}>
    <Text style={styles.progressActive}>{current}</Text> / {total}
  </Text>
);

const styles = StyleSheet.create({
  progressText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginBottom: 20,
    fontWeight: "600",
  },
  progressActive: {
    color: "#7C3AED",
  },
});

export default StepDots;
