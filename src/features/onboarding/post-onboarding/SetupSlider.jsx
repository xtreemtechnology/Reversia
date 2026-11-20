// src/features/onboarding/post-onboarding/SetupSlider.jsx
//
// A dependency-free slider for the weight / height / target-weight steps
// (no slider library is installed in this repo): a track with a filled
// portion and a thumb, driven by PanResponder so dragging and tapping
// the track both move the value. Above it sits a value box and, where
// needed, a unit toggle. The value is always the canonical metric
// number (kg or cm); imperial units are display-only.

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  StyleSheet,
} from "react-native";
import { FONTS, T } from "../../../theme/tokens";
import { DEEP_GREEN } from "./SetupChrome";

export function UnitToggle({ units, value, onChange }) {
  return (
    <View style={styles.toggleRow}>
      {units.map((unit) => {
        const active = value === unit.value;
        return (
          <TouchableOpacity
            key={unit.value}
            onPress={() => onChange(unit.value)}
            activeOpacity={0.7}
            style={[
              styles.toggleBtn,
              active ? styles.toggleBtnActive : styles.toggleBtnIdle,
            ]}
            accessibilityLabel={`Use ${unit.label}`}
          >
            <Text
              style={[
                styles.toggleText,
                active ? styles.toggleTextActive : styles.toggleTextIdle,
              ]}
            >
              {unit.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function ValueBox({ displayValue, unitLabel, highlighted }) {
  return (
    <View style={[styles.valueBox, highlighted && styles.valueBoxHighlighted]}>
      <Text style={styles.valueNumber} numberOfLines={1} adjustsFontSizeToFit>
        {displayValue}
      </Text>
      <Text style={styles.valueUnit}>{unitLabel}</Text>
    </View>
  );
}

function tickLabels(min, max, formatValue) {
  const labels = [];
  for (let i = 0; i <= 4; i++) {
    const value = Math.round(min + ((max - min) * i) / 4);
    labels.push(formatValue(value));
  }
  return labels;
}

export default function SetupSlider({
  min,
  max,
  value,
  onChange,
  formatValue,
}) {
  const [trackWidth, setTrackWidth] = useState(0);

  const valueFromLocation = (locationX) => {
    if (!trackWidth) return value;
    const ratio = Math.min(1, Math.max(0, locationX / trackWidth));
    return Math.round(min + ratio * (max - min));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        onChange(valueFromLocation(event.nativeEvent.locationX));
      },
      onPanResponderMove: (event) => {
        onChange(valueFromLocation(event.nativeEvent.locationX));
      },
    })
  ).current;

  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const labels = tickLabels(min, max, formatValue);

  return (
    <View style={styles.sliderBlock}>
      <View
        style={styles.trackHitArea}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${ratio * 100}%` }]} />
          <View style={[styles.thumb, { left: `${ratio * 100}%` }]} />
        </View>
      </View>
      <View style={styles.labelsRow}>
        {labels.map((label, i) => (
          <Text
            key={`${label}-${i}`}
            style={[
              styles.tickLabel,
              i === 0 && styles.tickLabelFirst,
              i === labels.length - 1 && styles.tickLabelLast,
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  toggleBtn: {
    width: 60,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnActive: {
    backgroundColor: DEEP_GREEN,
  },
  toggleBtnIdle: {
    backgroundColor: T.SURFACE,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  toggleText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  toggleTextIdle: {
    color: T.MUTED,
  },
  valueBox: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: T.SURFACE,
    borderWidth: 1,
    borderColor: T.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  valueBoxHighlighted: {
    borderColor: DEEP_GREEN,
    borderWidth: 2,
  },
  valueNumber: {
    fontFamily: FONTS.display,
    fontSize: 28,
    fontWeight: "700",
    color: T.TEXT,
  },
  valueUnit: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: T.MUTED,
    marginTop: 2,
  },
  sliderBlock: {
    width: "100%",
  },
  trackHitArea: {
    paddingVertical: 12,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: T.BORDER,
    position: "relative",
  },
  trackFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: DEEP_GREEN,
  },
  thumb: {
    position: "absolute",
    top: -11,
    width: 28,
    height: 28,
    marginLeft: -14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: DEEP_GREEN,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  tickLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: T.MUTED,
    textAlign: "center",
  },
  tickLabelFirst: {
    textAlign: "left",
  },
  tickLabelLast: {
    textAlign: "right",
  },
});
