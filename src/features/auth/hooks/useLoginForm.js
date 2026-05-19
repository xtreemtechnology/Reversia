import { useState, useCallback } from "react";

/**
 * useLoginForm - Manages login form state and validation
 *
 * Usage:
 *   const { email, password, errors, setEmail, setPassword, isValid, reset } = useLoginForm();
 *
 * Why separate from useAuth?
 *   - Login form state (UI concern) is isolated from auth state (business logic)
 *   - Can use this hook in multiple screens
 *   - Testable independently
 */
export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const reset = useCallback(() => {
    setEmail("");
    setPassword("");
    setErrors({});
  }, []);

  return {
    email,
    password,
    errors,
    setEmail,
    setPassword,
    isValid: email && password && Object.keys(errors).length === 0,
    validateForm,
    reset,
  };
}

export default useLoginForm;
