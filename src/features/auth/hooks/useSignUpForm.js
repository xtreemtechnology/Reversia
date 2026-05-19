import { useState, useCallback } from "react";

/**
 * useSignUpForm - Manages signup form state and validation
 *
 * Usage:
 *   const form = useSignUpForm();
 *
 * Why separate from useAuth?
 *   - Signup validation is more complex (password confirmation, etc.)
 *   - Can reuse in multiple signup contexts
 *   - Easier to test validation independently
 */
export function useSignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate display name
    if (!displayName.trim()) {
      newErrors.displayName = "Display name is required";
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain an uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain a number";
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, confirmPassword, displayName, agreedToTerms]);

  const reset = useCallback(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
    setAgreedToTerms(false);
    setErrors({});
  }, []);

  const isValid =
    email &&
    password &&
    confirmPassword &&
    displayName &&
    agreedToTerms &&
    Object.keys(errors).length === 0;

  return {
    email,
    password,
    confirmPassword,
    displayName,
    agreedToTerms,
    errors,
    setEmail,
    setPassword,
    setConfirmPassword,
    setDisplayName,
    setAgreedToTerms,
    isValid,
    validateForm,
    reset,
  };
}

export default useSignUpForm;
