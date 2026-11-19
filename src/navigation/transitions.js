// navigation/transitions.js
//
// Single source of truth for screen transitions in Reversia.
//
// React Navigation 7's native stack does not expose custom card
// interpolators (those belong to the JS stack), so the shared spec is built
// from the native presets plus one duration. That keeps the feel identical
// on iOS and Android without switching stacks or adding dependencies.
//
// Feel: calm and premium. One duration everywhere, gentle ease, no bouncy
// overshoot. Pushes slide horizontally; full-screen flows rise from the
// bottom; the auth flow fades up from the bottom.
//
// Usage: spread the matching preset into a navigator's screenOptions, and
// override per screen where a different presentation applies, e.g.
//   <Stack.Navigator screenOptions={{ headerShown: false, ...pushTransition }}>
//   <Stack.Screen name="LogMeal" options={{ headerShown: false, ...modalTransition }} />

export const TRANSITION_DURATION_MS = 300;

// Standard push between screens inside a stack: horizontal slide.
// The native slide already carries a subtle fade on Android; the shared
// duration keeps iOS and Android moving at the same pace.
export const pushTransition = {
  animation: "slide_from_right",
  animationDuration: TRANSITION_DURATION_MS,
  gestureEnabled: true,
};

// Full-screen flows that rise from the bottom: log-entry modals, the Guide,
// ExportReport, Login. Native sheet presentation on iOS; slide from bottom
// on Android. The animation key is honoured on Android and ignored where
// the sheet presentation drives it (iOS).
export const modalTransition = {
  presentation: "modal",
  animation: "slide_from_bottom",
  animationDuration: TRANSITION_DURATION_MS,
  gestureEnabled: true,
};

// Auth flow: fade + rise from the bottom. Kept from AuthNavigator — it
// already matched the calm feel, so it is folded in here as the shared auth
// transition rather than replaced.
export const authTransition = {
  animation: "fade_from_bottom",
  animationDuration: TRANSITION_DURATION_MS,
  gestureEnabled: true,
};

export default {
  TRANSITION_DURATION_MS,
  pushTransition,
  modalTransition,
  authTransition,
};
