// src/features/home/components/HomeCurveHeader.jsx
//
// Decorative curved header for the Home screen — the big sweeping wave
// across the top, like the reference's blue curve holding the greeting
// (doctor with folded arms, "GOOD MORNING!" bubble, location below).
//
// Two layered SVG waves, drawn in a fixed 400-wide viewBox and stretched
// to the screen width with preserveAspectRatio="none", so the curve
// scales on any phone width:
//
//   - a leaf-green rim (#8BC34A) whose bottom edge sits ~14pt lower,
//   - a deep-green wave (#3C5F27) on top of it.
//
// The rim peeks out along the whole bottom edge, giving the layered
// wave look of the reference. The deep green is dark enough for white
// text at AAA contrast (~7.3:1), so the greeting and headline sit in
// white inside the curve while the "Hello" pill and icon buttons stay
// white — the same trick as the reference's white bubble on blue.
//
// The curve is purely decorative (pointerEvents="none"); all header
// controls live in HomeScreen.js on top of it.

import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

// Total height of the curved header zone. The wave's bottom edge dips
// to ~252pt at its lowest point (mid-screen) and sits ~205–215pt at the
// left and right edges.
export const HOME_CURVE_HEIGHT = 252;

// Deep green, dark enough for white text at AAA contrast. A step darker
// than T.SECONDARY (#689F38) so small white text stays readable too.
export const HOME_CURVE_GREEN = "#3C5F27";

// Bottom edge of the deep-green wave, drawn right-to-left in the
// 400 × 252 viewBox: high at the right edge, dipping low around the
// middle, rising again at the left — one smooth sweeping curve.
const DEEP_PATH =
  "M0 0 H400 V182 C330 236 268 252 196 244 C124 236 56 214 0 206 Z";

// Leaf-green rim: the same wave with its bottom edge ~14pt lower, so a
// rim of leaf green shows along the whole curve.
const RIM_PATH =
  "M0 0 H400 V196 C330 250 268 266 196 258 C124 250 56 228 0 220 Z";

export default function HomeCurveHeader({ height = HOME_CURVE_HEIGHT }) {
  const { width } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={[styles.wrap, { height }]}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 400 ${HOME_CURVE_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <Path d={RIM_PATH} fill="#8BC34A" />
        <Path d={DEEP_PATH} fill={HOME_CURVE_GREEN} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
