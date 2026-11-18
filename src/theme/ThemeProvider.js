import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext({
  theme: "light",
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
  cardForeground: "#F7F3FF",
  secondaryForeground: "#F7F3FF",
};

export function ThemeProvider({ children }) {
  // Keep the default appearance aligned with the new light lavender companion design.
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

  // Default to the light lavender companion experience shown in the redesign reference.
  const effectiveTheme = localTheme || "light";
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
    heading: Platform.select({ ios: "System", android: "sans-serif", web: "system-ui" }),
    headingMedium: Platform.select({ ios: "System", android: "sans-serif-medium", web: "system-ui" }),
    body: Platform.select({ ios: "System", android: "sans-serif", web: "system-ui" }),
    medium: Platform.select({ ios: "System", android: "sans-serif-medium", web: "system-ui" }),
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
