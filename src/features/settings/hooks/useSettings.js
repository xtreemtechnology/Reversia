import { useState, useCallback, useEffect } from "react";
import * as settingsService from "../services/settingsService";

/**
 * useSettings - Main settings state manager
 *
 * Usage:
 *   const { settings, isLoading, error, updateNotifications, updateProfile } = useSettings(userId);
 */
export function useSettings(userId) {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadSettings();
    }
  }, [userId]);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await settingsService.getSettings(userId);
      setSettings(data);
    } catch (err) {
      setError(err.message || "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateNotifications = useCallback(
    async (pushEnabled, emailNotifications) => {
      try {
        await settingsService.updateNotificationSettings(userId, {
          pushEnabled,
          emailNotifications,
        });
        setSettings((prev) => ({
          ...prev,
          pushEnabled,
          emailNotifications,
        }));
        return true;
      } catch (err) {
        setError(err.message || "Failed to update notifications");
        return false;
      }
    },
    [userId]
  );

  const updateProfile = useCallback(
    async (displayName, bio) => {
      try {
        await settingsService.updateProfileSettings(userId, {
          displayName,
          bio,
        });
        setSettings((prev) => ({
          ...prev,
          displayName,
          bio,
        }));
        return true;
      } catch (err) {
        setError(err.message || "Failed to update profile");
        return false;
      }
    },
    [userId]
  );

  const updateAppearance = useCallback(
    async (theme, language) => {
      try {
        await settingsService.updateAppearanceSettings(userId, {
          theme,
          language,
        });
        setSettings((prev) => ({
          ...prev,
          theme,
          language,
        }));
        return true;
      } catch (err) {
        setError(err.message || "Failed to update appearance");
        return false;
      }
    },
    [userId]
  );

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    updateNotifications,
    updateProfile,
    updateAppearance,
  };
}

export default useSettings;
