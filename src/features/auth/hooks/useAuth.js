import { useCallback, useState, useEffect } from "react";
import { auth } from "../../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import * as authService from "../services/authService";

/**
 * useAuth - Manages authentication state and user session
 *
 * Usage:
 *   const { user, isLoading, error, signIn, signUp, signOut } = useAuth();
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor auth state changes
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.signIn(email, password);
      setUser(user);
      return user;
    } catch (err) {
      const message =
        err.code === "auth/user-not-found"
          ? "User not found"
          : err.code === "auth/wrong-password"
          ? "Invalid password"
          : err.message || "Sign in failed";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email, password, displayName) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.signUp(email, password, displayName);
      setUser(user);
      return user;
    } catch (err) {
      const message =
        err.message === "EMAIL_EXISTS"
          ? "Email already in use"
          : err.message || "Sign up failed";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signOut();
      setUser(null);
    } catch (err) {
      setError(err.message || "Sign out failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    setError(null);
    try {
      const result = await authService.sendPasswordReset(email);
      return result;
    } catch (err) {
      setError(err.message || "Password reset failed");
      throw err;
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
  };
}

export default useAuth;
