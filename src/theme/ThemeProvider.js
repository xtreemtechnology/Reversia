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
  background: "#FDFBF9",
  card: "#FFFFFF",
  text: "#2C2825",
  foreground: "#2C2825",
  muted: "#78716C",
  mutedForeground: "#78716C",
  mutedBackground: "#F5F2EF",
  border: "#E8E2DC",
  primary: "#E07A5F",
  secondary: "#798C73",
  primaryForeground: "#FFFFFF",
  borderSurface: "#E8E2DC",
  cardBackground: "#FFFFFF",
  mutedTextColor: "#78716C",
  destructive: "#E28A82",
  cardForeground: "#2C2825",
};

const dark = {
  background: "#231F1C",
  card: "#2D2825",
  text: "#F5F5F4",
  foreground: "#F5F5F4",
  muted: "#A8A29E",
  mutedForeground: "#A8A29E",
  border: "#3E3835",
  primary: "#E07A5F",
  secondary: "#798C73",
  primaryForeground: "#FFFFFF",
  borderSurface: "#3E3835",
  cardBackground: "#2D2825",
  mutedTextColor: "#A8A29E",
  destructive: "#E28A82",
  cardForeground: "#F5F5F4",
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

  const toggleTheme = () => setTheme(effectiveTheme === "dark" ? "light" : "dark");

  const typography = {
    heading: Platform.select({ ios: "System", android: "sans-serif", web: "system-ui" }),
    headingMedium: Platform.select({ ios: "System", android: "sans-serif-medium", web: "system-ui" }),
    body: Platform.select({ ios: "System", android: "sans-serif", web: "system-ui" }),
    medium: Platform.select({ ios: "System", android: "sans-serif-medium", web: "system-ui" }),
  };

  const value = { theme: effectiveTheme, colors, typography, setTheme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
