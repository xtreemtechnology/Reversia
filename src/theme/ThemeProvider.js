import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../config/firebase";
import useSettings from "../features/settings/hooks/useSettings";

const ThemeContext = createContext({
  theme: "light",
  colors: {},
  setTheme: async () => {},
  toggleTheme: async () => {},
});

const light = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  muted: "#6B7280",
  border: "#E5E7EB",
  primary: "#825CFF",
};

const dark = {
  background: "#0B1220",
  card: "#0F172A",
  text: "#E6EEF7",
  muted: "#94A3B8",
  border: "#1F2937",
  primary: "#8B5CF6",
};

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const userId = auth?.currentUser?.uid;
  const { settings } = useSettings(userId);
  const [localTheme, setLocalTheme] = useState(null);
  const [userSettingsTheme, setUserSettingsTheme] = useState(null);
  const THEME_KEY = "APP_THEME";

  // Load persisted local theme (for unauthenticated or fallback)
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

  // Sync theme from settings when userId becomes available
  useEffect(() => {
    if (settings?.theme) {
      setUserSettingsTheme(settings.theme);
    }
  }, [settings?.theme]);

  // Determine the effective theme
  const effectiveTheme =
    localTheme || userSettingsTheme || (system === "dark" ? "dark" : "light");

  const colors = effectiveTheme === "dark" ? dark : light;

  const setTheme = async (theme) => {
    try {
      setLocalTheme(theme);
      try {
        await AsyncStorage.setItem(THEME_KEY, theme);
      } catch (e) {
        // ignore
      }
      // Update Firestore if user is authenticated
      if (userId) {
        const settingsService = require("../features/settings/services/settingsService");
        await settingsService.updateAppearanceSettings(userId, {
          theme,
          language: settings?.language || "en",
        });
      }
    } catch (err) {
      console.warn("Failed to save theme preference:", err);
      // UI will still reflect local choice even if save fails
    }
  };

  const toggleTheme = () =>
    setTheme(effectiveTheme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider
      value={{ theme: effectiveTheme, colors, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
