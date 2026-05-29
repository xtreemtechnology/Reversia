import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeProvider";
import SolarIcon from "../../../components/SolarIcon";

export default function RestRecoveryCard({ navigation }) {
  const { colors } = useTheme();

  // secondary color with 20% opacity for icon bg
  const secondaryBg = colors.secondary + "33";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border + "80",
        },
      ]}
    >
      {/* Glow blob — visually approximated with a blurred overlay */}
      <View
        style={[styles.glowBlob, { backgroundColor: colors.secondary + "30" }]}
      />

      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: secondaryBg }]}>
          <SolarIcon
            name="moon-sleep-bold-duotone"
            size={22}
            color={colors.secondary}
          />
        </View>
        <View style={styles.textGroup}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Rest &amp; Recovery
          </Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            Your sleep quality appears to be improving your glucose stability.
            The 7.5 hours of rest you got last night has set a strong foundation
            for your metabolism today.
          </Text>
          <View style={styles.metricRow}>
            <SolarIcon
              name="graph-up-bold"
              size={15}
              color={colors.secondary}
            />
            <Text style={[styles.metric, { color: colors.secondary }]}>
              +15% better recovery than last week
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  glowBlob: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textGroup: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  metric: {
    fontSize: 13,
    fontWeight: "500",
  },
});
