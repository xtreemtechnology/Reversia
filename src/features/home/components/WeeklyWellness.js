// components/WeeklyWellness.jsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeProvider";

const ITEMS = [
  {
    label: "Mindful Dinners",
    current: 5,
    total: 7,
    colorKey: "primary",
  },
  {
    label: "Hydration",
    current: 3,
    total: 5,
    colorKey: "secondary",
  },
];

export default function WeeklyWellness() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}> 
      <Text style={[styles.title, { color: colors.foreground }]}>
        Weekly Wellness
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}> 
        You're building wonderful consistency. Just two more days of mindful
        evening meals to reach your target.
      </Text>

      <View style={styles.items}>
        {ITEMS.map((item) => {
          const pct = item.current / item.total;
          const barColor = colors[item.colorKey];

          return (
            <View key={item.label} style={styles.item}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  {item.label}
                </Text>
                <Text style={[styles.value, { color: colors.mutedForeground }]}>
                  {item.current}/{item.total} days
                </Text>
              </View>
              <View
                style={[styles.track, { backgroundColor: colors.background }]}
              >
                <View
                  style={[
                    styles.fill,
                    { width: `${pct * 100}%`, backgroundColor: barColor },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    padding: 24,
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  items: {
    gap: 16,
  },
  item: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});