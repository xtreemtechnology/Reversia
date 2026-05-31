import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeProvider";

function countByCategory(logs = [], category) {
  return logs.filter((log) => log?.category === category).length;
}

export default function EmptyWeeklyWellness({ logs = [] }) {
  const { colors } = useTheme();
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const mealCount = countByCategory(logs, "meal");
  const hydrationCount = countByCategory(logs, "hydration");
  const sleepCount = countByCategory(logs, "sleep");
  const hasLogs = logs.length > 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Weekly Wellness
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        {hasLogs
          ? "Your weekly progress is based on the logs you've added so far."
          : "Complete 3 more days of logging to see your weekly progress take shape."}
      </Text>

      <View style={styles.weekRow}>
        {days.map((d, i) => (
          <View key={i} style={styles.dayCol}>
            <View
              style={[styles.dayTrack, { backgroundColor: colors.background }]}
            >
              <View
                style={[
                  styles.dayFill,
                  {
                    backgroundColor: colors.muted,
                    height: `${Math.min(
                      15 + mealCount * 4 + hydrationCount * 3 + sleepCount * 2,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>
              {d}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.progressItems}>
        {[
          { label: "Mindful Dinners", value: `${mealCount}/7 days` },
          { label: "Hydration", value: `${hydrationCount}/7 days` },
        ].map((item) => (
          <View key={item.label} style={styles.progressRow}>
            <View style={styles.progressMeta}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              <Text
                style={[
                  styles.progressValue,
                  { color: colors.mutedForeground },
                ]}
              >
                {item.value}
              </Text>
            </View>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colors.background },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    lineHeight: 20,
  },
  weekRow: {
    flexDirection: "row",
    gap: 6,
    height: 60,
    alignItems: "flex-end",
  },
  dayCol: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    height: "100%",
  },
  dayTrack: {
    flex: 1,
    width: "100%",
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  dayFill: {
    width: "100%",
    borderRadius: 6,
    opacity: 0.5,
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
  },
  progressItems: {
    gap: 14,
  },
  progressRow: {
    gap: 8,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
});
