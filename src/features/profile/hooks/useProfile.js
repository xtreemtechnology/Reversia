import { useState, useCallback, useEffect } from "react";
import * as profileService from "../services/profileService";

/**
 * useProfile - User profile management hook
 *
 * Manages user profile data and settings
 *
 * Usage:
 *   const { profile, isLoading, error, updateProfile } = useProfile(userId);
 */
/* eslint-disable no-console */
export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      console.log("[useProfile] No userId provided");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log("[useProfile] Loading profile for userId:", userId);
      const data = await profileService.getUserProfile(userId);
      console.log("[useProfile] Profile data loaded:", data);
      setProfile(data);
    } catch (err) {
      console.error("[useProfile] Error loading profile:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId, loadProfile]);

  const updateProfile = useCallback(
    async (updates) => {
      setIsLoading(true);
      setError(null);
      try {
        const updated = await profileService.updateUserProfile(userId, updates);
        setProfile(updated);
        return updated;
      } catch (err) {
        setError(err.message || "Failed to update profile");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    profile,
    isLoading,
    error,
    loadProfile,
    updateProfile,
    clearError,
  };
}

export default useProfile;
