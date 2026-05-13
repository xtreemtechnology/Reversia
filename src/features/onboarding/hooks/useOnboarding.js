import { useState, useCallback } from "react";
import * as onboardingService from "../services/onboardingService";

/**
 * useOnboarding - Onboarding flow state management
 *
 * Manages user progress through account setup
 *
 * Usage:
 *   const { currentStep, isLoading, error, completeStep } = useOnboarding(userId);
 */
export function useOnboarding(userId) {
  const [currentStep, setCurrentStep] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const completeStep = useCallback(
    async (stepData) => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Implement onboarding step completion
        // const updated = await onboardingService.updateOnboardingStep(userId, stepData);
        // setUserProfile(updated);
        return stepData;
      } catch (err) {
        setError(err.message || "Failed to complete onboarding step");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const skipStep = useCallback(async () => {
    try {
      // TODO: Implement skip logic if needed
    } catch (err) {
      setError(err.message || "Failed to skip step");
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentStep,
    isLoading,
    error,
    userProfile,
    completeStep,
    skipStep,
    clearError,
  };
}

export default useOnboarding;
