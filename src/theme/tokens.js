// Reversia's shared design tokens — the fresh light look, following the
// soft-green reference: sage background, white cards, bright leaf green.
// The Phase 1 bold dark palette is kept intact below as BOLD_TOKENS so the
// dark look stays available (ThemeProvider "bold").
//
// Palette discipline: one leaf green for progress and actions, one warm
// amber for warnings and celebration, dark green-black text on soft sage.
// Colour means state, never decoration.
export const T = {
  BG: "#E9F1E2",
  SURFACE: "#FFFFFF",
  PRIMARY: "#8BC34A",
  PRIMARY_LIGHT: "#EFF6E4",
  SECONDARY: "#689F38",
  SECONDARY_LIGHT: "#E4EEDB",
  TEXT: "#1E2B1A",
  MUTED: "#7A8A72",
  BORDER: "#DDE7D2",
  ACCENT: "#8BC34A",
  SUCCESS: "#689F38",
  WARNING: "#E8A33D",
  DANGER: "#D96C83",
  WHITE: "#FFFFFF",
  INK: "#22301F",
  // Backwards-compatible aliases used by older components.
  CARD: "#FFFFFF",
  AMBER: "#E8A33D",
  AMBER_LIGHT: "#FBF3DF",
  SAGE: "#8BC34A",
  RED: "#D96C83",
};

// Phase 1 bold dark-first palette, kept intact. The ThemeProvider "bold"
// variant uses these values; nothing in the fresh look depends on them.
export const BOLD_TOKENS = {
  BG: "#0F1512",
  SURFACE: "#1B221D",
  PRIMARY: "#A3E635",
  PRIMARY_LIGHT: "#242E26",
  SECONDARY: "#7CC36A",
  SECONDARY_LIGHT: "#2E3A32",
  TEXT: "#F3EFE3",
  MUTED: "#9AA79B",
  BORDER: "#2E3A32",
  ACCENT: "#A3E635",
  SUCCESS: "#A3E635",
  WARNING: "#F2A93B",
  DANGER: "#E86A6A",
  WHITE: "#FFFFFF",
  CARD: "#1B221D",
  AMBER: "#F2A93B",
  AMBER_LIGHT: "#2E3A32",
  SAGE: "#7CC36A",
  RED: "#E86A6A",
};

// Bundled fonts (assets/fonts). Loaded by ThemeProvider on startup;
// components fall back to the system font until the files are ready.
export const FONTS = {
  display: "PlusJakartaSans-Regular",
  body: "DMSans-Regular",
};

export default T;
