// src/features/onboarding/post-onboarding/SetupRuler.jsx
//
// A screw-gauge ruler for the age / weight / height / target-weight
// steps (Figma kit screens 16–18, 20): a horizontal strip of numbers
// or tick marks you drag with your finger. The value at the CENTRE of
// the strip is the selected one — it updates live while you drag, and
// the strip glides to the nearest centred value on release.
//
// The strip is moved by a reanimated shared translateX value and driven
// by a PanResponder on the container — there is NO ScrollView here, on
// purpose. The previous ScrollView version could not be slid with a
// finger: the ruler sits inside the step's vertical ScrollView, which
// steals the gesture before the inner horizontal ScrollView ever
// becomes the responder, and on the web preview a ScrollView does not
// respond to mouse-drag at all. The PanResponder claims the touch
// itself (onStartShouldSetPanResponder and onMoveShouldSetPanResponder
// both return true, and termination requests are refused), so the
// parent ScrollView can never steal it, and the same code works with
// a mouse drag on web and a finger on a phone.
//
// Dragging left increases the value and dragging right decreases it —
// the strip follows the finger 1:1, like a real screw gauge. A tap
// (no movement) selects the slot under the finger, so tapping a
// number in the age strip still works; the age chevrons keep working
// as tap-to-nudge via the external value change below.
//
// Also holds the measure-step chrome that used to live in
// SetupSlider.jsx (unit toggle + value box) — the old PanResponder
// slider is gone.

import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  PanResponder,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
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

function NumberSlot({ value, focused, itemWidth }) {
  const distance = Math.abs(value - focused);
  return (
    <View
      style={[styles.numberSlot, { width: itemWidth }]}
      accessibilityLabel={`${value}`}
    >
      <Text style={[styles.numberText, numberSize(distance)]}>{value}</Text>
    </View>
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

const SNAP_MS = 180;
const TAP_SLOP = 8;

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
  // The strip's horizontal position, driven on the UI thread.
  const translateX = useSharedValue(0);

  // Mutable state the PanResponder (created once) reads through refs,
  // so its handlers never go stale across re-renders.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const widthRef = useRef(0);
  const mountedRef = useRef(false);
  const measuredRef = useRef(false);
  const draggingRef = useRef(false);
  const startOffsetRef = useRef(0);
  const grantXRef = useRef(0);

  const count = Math.floor((max - min) / step) + 1;

  // Geometry: offsetFor(v) is the translateX that puts value v's slot
  // centre exactly on the container's centre line.
  const offsetFor = useCallback(
    (v) => {
      const w = widthRef.current;
      return w / 2 - (((v - min) / step) * itemWidth + itemWidth / 2);
    },
    [min, step, itemWidth]
  );

  const valueFromOffset = useCallback(
    (x) => {
      const w = widthRef.current;
      const idx = Math.round((w / 2 - itemWidth / 2 - x) / itemWidth);
      const clamped = Math.min(count - 1, Math.max(0, idx));
      return min + clamped * step;
    },
    [min, step, itemWidth, count]
  );

  const clampOffset = useCallback(
    (x) => Math.min(offsetFor(min), Math.max(offsetFor(max), x)),
    [offsetFor, min, max]
  );

  const snapTo = useCallback(
    (v) => {
      translateX.value = withTiming(offsetFor(v), { duration: SNAP_MS });
    },
    [offsetFor, translateX]
  );

  // The PanResponder is created once. Every callback reads live state
  // through refs, so it stays correct across re-renders.
  const panResponderRef = useRef(null);
  if (panResponderRef.current === null) {
    panResponderRef.current = PanResponder.create({
      // Claim the touch at the start and on movement, and refuse to
      // hand it back — the parent vertical ScrollView can never steal
      // a drag that starts on the ruler.
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        draggingRef.current = true;
        startOffsetRef.current = translateX.value;
        grantXRef.current = evt.nativeEvent.locationX;
        // Stop any in-flight snap so the strip follows the finger
        // from exactly where it is.
        cancelAnimation(translateX);
      },
      onPanResponderMove: (_, gestureState) => {
        const next = clampOffset(startOffsetRef.current + gestureState.dx);
        translateX.value = next;
        const v = valueFromOffset(next);
        if (v !== valueRef.current) onChangeRef.current(v);
      },
      onPanResponderRelease: (_, gestureState) => {
        draggingRef.current = false;
        const moved = Math.max(
          Math.abs(gestureState.dx),
          Math.abs(gestureState.dy)
        );
        if (moved < TAP_SLOP) {
          // A tap: select the slot under the finger.
          const localX = grantXRef.current - translateX.value;
          const idx = Math.min(
            count - 1,
            Math.max(0, Math.floor(localX / itemWidth))
          );
          const v = min + idx * step;
          if (v !== valueRef.current) onChangeRef.current(v);
          snapTo(v);
          return;
        }
        const centred = valueFromOffset(translateX.value);
        if (centred !== valueRef.current) onChangeRef.current(centred);
        snapTo(centred);
      },
      onPanResponderTerminate: () => {
        // Interrupted mid-drag (e.g. by the OS): settle on the
        // nearest centred value instead of leaving the strip adrift.
        draggingRef.current = false;
        const centred = valueFromOffset(translateX.value);
        if (centred !== valueRef.current) onChangeRef.current(centred);
        snapTo(centred);
      },
    });
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // First measurement positions the strip directly (no glide-in on
  // appearance); later width changes glide to the current value.
  const handleLayout = (event) => {
    const w = event.nativeEvent.layout.width;
    if (w <= 0 || w === widthRef.current) return;
    widthRef.current = w;
    if (!measuredRef.current) {
      measuredRef.current = true;
      translateX.value = offsetFor(valueRef.current);
      return;
    }
    if (!draggingRef.current) {
      translateX.value = withTiming(offsetFor(valueRef.current), {
        duration: SNAP_MS,
      });
    }
  };

  // External value changes (age chevrons, unit changes) glide the
  // strip to the new value. The first run is skipped — the initial
  // position is set by handleLayout instead. While dragging, the
  // finger owns the strip and this stays out of the way.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (draggingRef.current || widthRef.current <= 0) return;
    translateX.value = withTiming(offsetFor(value), { duration: SNAP_MS });
  }, [value, offsetFor, translateX]);

  const values = [];
  for (let i = 0; i < count; i++) values.push(min + i * step);

  return (
    <View
      style={styles.rulerWrap}
      onLayout={handleLayout}
      {...panResponderRef.current.panHandlers}
      accessibilityLabel="Drag to change the value"
    >
      <Animated.View style={[styles.strip, animatedStyle]}>
        {variant === "numbers"
          ? values.map((v) => (
              <NumberSlot
                key={v}
                value={v}
                focused={value}
                itemWidth={itemWidth}
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
      </Animated.View>
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
    overflow: "hidden",
  },
  strip: {
    flexDirection: "row",
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
