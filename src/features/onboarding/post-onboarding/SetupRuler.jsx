// src/features/onboarding/post-onboarding/SetupRuler.jsx
//
// A screw-gauge ruler for the age / weight / height / target-weight
// steps (Figma kit screens 16–18, 20): a horizontal strip of numbers
// or tick marks you drag with your finger. The value at the CENTRE of
// the strip is the selected one — it updates live while you drag
// (onScroll), and the strip snaps so a value always lands centred.
//
// Built on a horizontal ScrollView with snapToInterval (no new
// dependency): every step is one fixed-width slot, the content has
// half-viewport padding on both ends so the first and last values can
// centre, and the centre value is derived from the scroll offset.
// External changes (chevrons, tapping a number) glide the strip to
// the new value; while the user is dragging or the strip is still
// settling from a flick, the strip is never steered programmatically,
// so the finger always wins.
//
// Also holds the measure-step chrome that used to live in
// SetupSlider.jsx (unit toggle + value box) — the old PanResponder
// slider is gone.

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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

function numberSize(distance) {
  if (distance === 0) return styles.numCentre;
  if (distance === 1) return styles.numNear;
  if (distance === 2) return styles.numFar;
  return styles.numDistant;
}

function NumberSlot({ value, focused, itemWidth, onPress }) {
  const distance = Math.abs(value - focused);
  return (
    <TouchableOpacity
      onPress={() => onPress(value)}
      activeOpacity={0.7}
      style={[styles.numberSlot, { width: itemWidth }]}
      accessibilityLabel={`${value}`}
    >
      <Text style={[styles.numberText, numberSize(distance)]}>{value}</Text>
    </TouchableOpacity>
  );
}

function TickSlot({ value, min, step, labelEvery, itemWidth, formatLabel }) {
  const labelled = (value - min) % (labelEvery * step) === 0;
  return (
    <View style={[styles.tickSlot, { width: itemWidth }]}>
      <View style={styles.tickTop}>
        <View
          style={[styles.tick, labelled ? styles.tickMajor : styles.tickMinor]}
        />
      </View>
      <Text
        style={[styles.tickLabel, { width: labelEvery * itemWidth }]}
        numberOfLines={1}
      >
        {labelled ? formatLabel(value) : " "}
      </Text>
    </View>
  );
}

export default function SetupRuler({
  min,
  max,
  step = 1,
  value,
  onChange,
  variant = "ticks",
  labelEvery = 5,
  itemWidth = 16,
  formatLabel = (v) => String(v),
}) {
  const scrollRef = useRef(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const draggingRef = useRef(false);
  const momentumRef = useRef(false);
  const mountedRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState(
    Math.max(200, Dimensions.get("window").width - 32)
  );

  const count = Math.floor((max - min) / step) + 1;
  const pad = Math.max(0, (containerWidth - itemWidth) / 2);
  const offsetFor = (v) => ((v - min) / step) * itemWidth;
  const valueFromOffset = (x) => {
    const idx = Math.round(x / itemWidth);
    return Math.min(max, Math.max(min, min + idx * step));
  };

  const handleScroll = (event) => {
    // Only the finger drives the value. Programmatic scrolls (initial
    // positioning, chevron glides) are ignored here, so a glide can
    // never push the value back through the numbers it passes.
    if (!draggingRef.current && !momentumRef.current) return;
    const v = valueFromOffset(event.nativeEvent.contentOffset.x);
    if (v !== valueRef.current) onChange(v);
  };

  const handleMomentumEnd = (event) => {
    const wasMoving = momentumRef.current;
    momentumRef.current = false;
    if (!wasMoving) return;
    // Insurance: the snap should already have settled on a value, but
    // if the last onScroll was throttled away, commit it now.
    const v = valueFromOffset(event.nativeEvent.contentOffset.x);
    if (v !== valueRef.current) onChange(v);
  };

  const handleContentSizeChange = () => {
    // Positions the strip once its geometry is known (first layout,
    // and whenever the measured width changes the padding). Never
    // steers while the user is dragging or the strip is settling.
    if (draggingRef.current || momentumRef.current) return;
    scrollRef.current?.scrollTo({
      x: offsetFor(valueRef.current),
      animated: false,
    });
  };

  // External value changes (chevrons, tapping a number) glide the
  // strip to the new value. The first run is skipped — the initial
  // position is set by handleContentSizeChange instead, so the strip
  // never slides in on its own when the screen appears.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (draggingRef.current || momentumRef.current) return;
    scrollRef.current?.scrollTo({
      x: ((value - min) / step) * itemWidth,
      animated: true,
    });
  }, [value, min, step, itemWidth]);

  const values = [];
  for (let i = 0; i < count; i++) values.push(min + i * step);

  return (
    <View
      style={styles.rulerWrap}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={itemWidth}
        nestedScrollEnabled
        onScrollBeginDrag={() => {
          draggingRef.current = true;
          momentumRef.current = true;
        }}
        onScrollEndDrag={() => {
          draggingRef.current = false;
        }}
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={{ paddingHorizontal: pad }}
        accessibilityLabel="Drag to change the value"
      >
        {variant === "numbers"
          ? values.map((v) => (
              <NumberSlot
                key={v}
                value={v}
                focused={value}
                itemWidth={itemWidth}
                onPress={onChange}
              />
            ))
          : values.map((v) => (
              <TickSlot
                key={v}
                value={v}
                min={min}
                step={step}
                labelEvery={labelEvery}
                itemWidth={itemWidth}
                formatLabel={formatLabel}
              />
            ))}
      </ScrollView>
      {variant === "ticks" ? (
        <View style={styles.centreBar} pointerEvents="none" />
      ) : null}
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
  rulerWrap: {
    position: "relative",
  },
  numberSlot: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontFamily: FONTS.display,
    color: T.TEXT,
  },
  numCentre: {
    fontSize: 28,
    fontWeight: "700",
    color: DEEP_GREEN,
  },
  numNear: {
    fontSize: 22,
  },
  numFar: {
    fontSize: 16,
    color: T.MUTED,
  },
  numDistant: {
    fontSize: 14,
    color: T.MUTED,
    opacity: 0.5,
  },
  tickSlot: {
    alignItems: "center",
  },
  tickTop: {
    height: 28,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  tick: {
    width: 2,
    borderRadius: 1,
    backgroundColor: T.MUTED,
  },
  tickMajor: {
    height: 24,
    backgroundColor: T.TEXT,
  },
  tickMinor: {
    height: 12,
  },
  tickLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: T.MUTED,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 4,
  },
  centreBar: {
    position: "absolute",
    left: "50%",
    marginLeft: -1.5,
    top: 0,
    width: 3,
    height: 28,
    borderRadius: 2,
    backgroundColor: DEEP_GREEN,
  },
});
