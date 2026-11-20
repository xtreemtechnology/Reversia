import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";

const ThemeContext = createContext({
  theme: "bold",
  colors: {},
  typography: { heading: "System", body: "System" },
  setTheme: async () => {},
  toggleTheme: async () => {},
});

const light = {
  background: "#F5F1FF",
  card: "#FFFFFF",
  text: "#242033",
  foreground: "#242033",
  muted: "#F0E9FF",
  mutedForeground: "#756D84",
  mutedBackground: "#F0E9FF",
  border: "#E8E1F5",
  primary: "#8055E8",
  secondary: "#A78BFA",
  accent: "#8B75C8",
  primaryForeground: "#FFFFFF",
  borderSurface: "#E8E1F5",
  cardBackground: "#FFFFFF",
  mutedTextColor: "#756D84",
  destructive: "#D96C83",
  success: "#689F38",
  warning: "#E8A33D",
  cardForeground: "#242033",
  secondaryForeground: "#242033",
};

const dark = {
  background: "#171322",
  card: "#241D35",
  text: "#F7F3FF",
  foreground: "#F7F3FF",
  muted: "#302744",
  mutedForeground: "#B8ACC9",
  mutedBackground: "#302744",
  border: "#403454",
  primary: "#A78BFA",
  secondary: "#C4B2FF",
  accent: "#8B75C8",
  primaryForeground: "#171322",
  borderSurface: "#403454",
  cardBackground: "#241D35",
  mutedTextColor: "#B8ACC9",
  destructive: "#F08BA0",
  success: "#A3E635",
  warning: "#F2A93B",
  cardForeground: "#F7F3FF",
  secondaryForeground: "#F7F3FF",
};

// Fresh — the default Reversia look, following the soft-green reference:
// sage background, white cards, bright leaf green for progress and
// actions, dark green-black text. Colour means state, never decoration.
const fresh = {
  background: "#E9F1E2",
  card: "#FFFFFF",
  text: "#1E2B1A",
  foreground: "#1E2B1A",
  muted: "#EFF6E4",
  mutedForeground: "#7A8A72",
  mutedBackground: "#EFF6E4",
  border: "#DDE7D2",
  primary: "#8BC34A",
  secondary: "#689F38",
  accent: "#8BC34A",
  primaryForeground: "#FFFFFF",
  borderSurface: "#DDE7D2",
  cardBackground: "#FFFFFF",
  mutedTextColor: "#7A8A72",
  destructive: "#D96C83",
  success: "#689F38",
  warning: "#E8A33D",
  cardForeground: "#1E2B1A",
  secondaryForeground: "#1E2B1A",
};

// Bold — the Phase 1 dark-first look. Deep green-charcoal surfaces, warm
// cream text, one vivid leaf-lime accent for progress and actions, warm
// amber for warnings and celebration. Kept intact as an option.
const bold = {
  background: "#0F1512",
  card: "#1B221D",
  text: "#F3EFE3",
  foreground: "#F3EFE3",
  muted: "#242E26",
  mutedForeground: "#9AA79B",
  mutedBackground: "#242E26",
  border: "#2E3A32",
  primary: "#A3E635",
  secondary: "#7CC36A",
  accent: "#A3E635",
  primaryForeground: "#0F1512",
  borderSurface: "#2E3A32",
  cardBackground: "#1B221D",
  mutedTextColor: "#9AA79B",
  destructive: "#E86A6A",
  success: "#A3E635",
  warning: "#F2A93B",
  cardForeground: "#F3EFE3",
  secondaryForeground: "#F3EFE3",
};

export function ThemeProvider({ children }) {
  // The fresh light look is the default. The bold dark look and the older
  // light and dark palettes stay available for the appearance switch in
  // Profile.
  const [localTheme, setLocalTheme] = useState(null);
  const THEME_KEY = "APP_THEME";

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const t = await AsyncStorage.getItem(THEME_KEY);
        if (mounted && t) setLocalTheme(t);
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Load the bundled display and body fonts once. If loading fails, the app
  // keeps working — React Native falls back to the system font.
  useEffect(() => {
    Font.loadAsync({
      "PlusJakartaSans-Regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
      "DMSans-Regular": require("../../assets/fonts/DMSans-Regular.ttf"),
    }).catch(() => {});
  }, []);

  const effectiveTheme = localTheme || "fresh";
  const colors =
    effectiveTheme === "dark"
      ? dark
      : effectiveTheme === "bold"
      ? bold
      : effectiveTheme === "fresh"
      ? fresh
      : light;

  const setTheme = async (theme) => {
    setLocalTheme(theme);
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // ignore
    }
  };

  const toggleTheme = () =>
    setTheme(effectiveTheme === "dark" ? "light" : "dark");

  const typography = {
    heading: "PlusJakartaSans-Regular",
    headingMedium: "PlusJakartaSans-Regular",
    body: "DMSans-Regular",
    medium: "DMSans-Regular",
  };

  const value = {
    theme: effectiveTheme,
    colors,
    typography,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
