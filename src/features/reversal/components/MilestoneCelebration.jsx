// features/reversal/components/MilestoneCelebration.jsx
// The moment a Reversal Plan milestone is reached, made unmissable:
// a full-screen celebration with confetti, the milestone's own
// words, and what comes next. It appears once per milestone (the
// Plan screen drives `visible` from the persisted celebrated-weeks
// list) and stays until the user dismisses it — no auto-dismiss
// that could be missed. The milestone art on the Plan screen keeps
// showing the reached milestone afterwards, as the record.
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LottieMoment from "../../../components/LottieMoment";
import PressScale from "../../home/components/PressScale";
import { useTheme } from "../../../theme/ThemeProvider";
import { FONTS } from "../../../theme/tokens";

export default function MilestoneCelebration({
  milestone,
  nextMilestone,
  visible,
  onDismiss,
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  // Mounting fresh each time the modal opens guarantees the confetti
  // replays from the start.
  if (!visible || !milestone) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        {/* Tapping outside the card dismisses; the card sits above
            this layer, so taps on it do not dismiss. */}
        <TouchableOpacity
          style={styles.backdropTouch}
          onPress={onDismiss}
          activeOpacity={1}
          accessibilityLabel="Dismiss celebration"
        />
        <View style={styles.card} accessibilityRole="dialog">
          <LottieMoment
            animation="confetti"
            size={240}
            speed={1.5}
            style={styles.confetti}
          />
          <Text style={styles.eyebrow}>MILESTONE REACHED</Text>
          <Text style={styles.title}>Week {milestone.week} — you did it!</Text>
          <Text style={styles.milestoneTitle}>{milestone.title}</Text>
          <Text style={styles.body}>{milestone.description}</Text>
          <Text style={styles.next}>
            {nextMilestone
              ? `Next up: Week ${nextMilestone.week} — ${nextMilestone.title}`
              : "You've reached the final week — time to review with your clinician."}
          </Text>
          <PressScale
            onPress={onDismiss}
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="Keep going"
          >
            <Text style={styles.buttonText}>Keep going</Text>
          </PressScale>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    backdropTouch: {
      ...StyleSheet.absoluteFillObject,
    },
    card: {
      width: "100%",
      maxWidth: 380,
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 24,
      paddingTop: 8,
      alignItems: "center",
    },
    confetti: {
      marginBottom: 4,
    },
    eyebrow: {
      fontFamily: FONTS.body,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: colors.secondary,
      marginBottom: 6,
    },
    title: {
      fontFamily: FONTS.display,
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      marginBottom: 4,
    },
    milestoneTitle: {
      fontFamily: FONTS.body,
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 8,
    },
    body: {
      fontFamily: FONTS.body,
      fontSize: 14,
      lineHeight: 21,
      color: colors.text,
      textAlign: "center",
      marginBottom: 12,
    },
    next: {
      fontFamily: FONTS.body,
      fontSize: 13,
      lineHeight: 19,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 20,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontFamily: FONTS.body,
      fontSize: 16,
      fontWeight: "700",
      color: colors.primaryForeground,
    },
  });
}
