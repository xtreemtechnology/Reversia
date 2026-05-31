// screens/profile/components/ProfileStatsRow.jsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

const STATS = [
  {
    iconName: "flame",
    color: "#F59E0B",
    labelKey: "primaryHba1c",
    label: "HBA1c",
    suffix: "%",
  },
  {
    iconName: "checkmark-circle",
    color: "#10B981",
    labelKey: "fastingBloodSugar",
    label: "Fasting",
    suffix: " mg/dL",
  },
  {
    iconName: "trending-up",
    color: "#798C73", // secondary from theme
    labelKey: "sleepQuality",
    label: "Sleep Quality",
    suffix: "",
  },
];

export default function ProfileStatsRow({ profile }) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      {STATS.map((stat) => {
        const raw = profile?.[stat.labelKey];
        const display =
          raw != null && raw !== "" ? `${raw}${stat.suffix}` : "—";
        return (
          <View
            key={stat.label}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border + "80",
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: stat.color + "18" },
              ]}
            >
              <Ionicons name={stat.iconName} size={20} color={stat.color} />
            </View>
            <Text style={[styles.value, { color: colors.foreground }]}>
              {display}
            </Text>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              {stat.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    gap: 6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});
