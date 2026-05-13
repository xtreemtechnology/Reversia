import { useState, useCallback } from "react";
import * as authService from "../services/authService";

/**
 * usePasswordReset - Manages password reset flow
 *
 * Usage:
 *   const { email, setEmail, isLoading, error, success, resetPassword } = usePasswordReset();
 */
export function usePasswordReset() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const resetPassword = useCallback(async () => {
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return false;
    }

    setIsLoading(true);
    try {
      await authService.sendPasswordReset(email);
      setSuccess(true);
      setEmail("");
      return true;
    } catch (err) {
      const message =
        err.code === "auth/user-not-found"
          ? "No account found with this email"
          : err.message || "Failed to send password reset email";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const reset = useCallback(() => {
    setEmail("");
    setError(null);
    setSuccess(false);
  }, []);

  return {
    email,
    setEmail,
    isLoading,
    error,
    success,
    resetPassword,
    reset,
  };
}

export default usePasswordReset;
