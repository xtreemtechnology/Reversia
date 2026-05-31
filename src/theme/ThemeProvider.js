import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext({
  theme: "light",
  colors: {},
  typography: { heading: "PlusJakartaSans", body: "DMSans" },
  setTheme: async () => {},
  toggleTheme: async () => {},
});

const light = {
  background: "#211613",
  card: "#2D201C",
  text: "#F4EAE4",
  foreground: "#F4EAE4",
  muted: "#3A2A25",
  mutedForeground: "#9A8478",
  mutedBackground: "#3A2A25",
  border: "#402E29",
  primary: "#D88939",
  secondary: "#3A2A25",
  accent: "#6A816A",
  primaryForeground: "#211613",
  borderSurface: "#402E29",
  cardBackground: "#2D201C",
  mutedTextColor: "#9A8478",
  destructive: "#CE6C60",
  cardForeground: "#F4EAE4",
  secondaryForeground: "#F4EAE4",
};

const dark = {
  background: "#211613",
  card: "#2D201C",
  text: "#F4EAE4",
  foreground: "#F4EAE4",
  muted: "#3A2A25",
  mutedForeground: "#9A8478",
  mutedBackground: "#3A2A25",
  border: "#402E29",
  primary: "#D88939",
  secondary: "#3A2A25",
  accent: "#6A816A",
  primaryForeground: "#211613",
  borderSurface: "#402E29",
  cardBackground: "#2D201C",
  mutedTextColor: "#9A8478",
  destructive: "#CE6C60",
  cardForeground: "#F4EAE4",
  secondaryForeground: "#F4EAE4",
};

export function ThemeProvider({ children }) {
  // We prefer a deliberate choice: default to dark to preserve brand identity.
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

  // Default to dark when the user hasn't selected a preference.
  const effectiveTheme = localTheme || "dark";
  const colors = effectiveTheme === "dark" ? dark : light;

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
    heading: Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "Georgia",
    }),
    headingMedium: Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "Georgia",
    }),
    body: Platform.select({
      ios: "DM Sans",
      android: "sans-serif",
      web: "system-ui",
    }),
    medium: Platform.select({
      ios: "DM Sans",
      android: "sans-serif",
      web: "system-ui",
    }),
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
