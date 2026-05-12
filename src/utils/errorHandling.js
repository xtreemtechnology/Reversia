// src/utils/errorHandling.js
/**
 * Centralized error handling utilities
 * Maps Firebase and API errors to user-friendly messages
 */

import { strings } from "../constants/index";

/**
 * Firebase Auth error handler
 * @param {Error} error - Firebase auth error object
 * @returns {object} {title, message} for Alert display
 */
export const handleAuthError = (error) => {
  const errorMap = {
    "auth/user-not-found": {
      title: "Account Not Found",
      message:
        "No account exists with this email. Please sign up to create an account.",
    },
    "auth/wrong-password": {
      title: "Incorrect Password",
      message: "The password you entered is incorrect. Please try again.",
    },
    "auth/invalid-email": {
      title: "Invalid Email",
      message: "Please enter a valid email address.",
    },
    "auth/weak-password": {
      title: "Weak Password",
      message: "Password must be at least 8 characters long.",
    },
    "auth/email-already-in-use": {
      title: "Email Already Registered",
      message:
        "This email is already associated with an account. Please log in or use a different email.",
    },
    "auth/operation-not-allowed": {
      title: "Operation Not Allowed",
      message:
        "This authentication method is not available. Please try a different method.",
    },
    "auth/too-many-requests": {
      title: "Too Many Attempts",
      message: "Too many failed login attempts. Please try again later.",
    },
    "auth/network-request-failed": {
      title: "Network Error",
      message:
        "Unable to connect to authentication service. Please check your internet connection.",
    },
    "auth/invalid-credential": {
      title: "Invalid Login",
      message:
        "The email or password you entered is incorrect. Please try again.",
    },
    "auth/invalid-login-credentials": {
      title: "Invalid Login",
      message:
        "The email or password you entered is incorrect. Please try again.",
    },
  };

  if (errorMap[error.code]) {
    return errorMap[error.code];
  }

  return {
    title: "Authentication Failed",
    message: error.message || strings.errors.generic,
  };
};

/**
 * Firestore error handler
 * @param {Error} error - Firestore error object
 * @returns {object} {title, message} for Alert display
 */
export const handleFirestoreError = (error) => {
  const errorMap = {
    "permission-denied": {
      title: "Access Denied",
      message: "You do not have permission to perform this action.",
    },
    "not-found": {
      title: "Not Found",
      message: "The requested item was not found. It may have been deleted.",
    },
    "already-exists": {
      title: "Duplicate Entry",
      message: "This item already exists. Please use a different value.",
    },
    "failed-precondition": {
      title: "Operation Failed",
      message: "The operation could not be completed. Please try again.",
    },
    "out-of-range": {
      title: "Invalid Value",
      message: "The provided value is out of range. Please check your input.",
    },
    "invalid-argument": {
      title: "Invalid Input",
      message:
        "One or more fields have invalid values. Please check your input.",
    },
    unavailable: {
      title: "Service Unavailable",
      message:
        "The service is temporarily unavailable. Please try again later.",
    },
    unauthenticated: {
      title: "Not Authenticated",
      message: "You must be logged in to perform this action.",
    },
  };

  if (errorMap[error.code]) {
    return errorMap[error.code];
  }

  return {
    title: "Database Error",
    message: error.message || strings.errors.generic,
  };
};

/**
 * API/Network error handler
 * @param {Error} error - API or network error
 * @returns {object} {title, message} for Alert display
 */
export const handleAPIError = (error) => {
  if (error.name === "AbortError" || error.message.includes("timeout")) {
    return {
      title: "Request Timeout",
      message:
        "The request took too long. Please check your connection and try again.",
    };
  }

  if (
    error.message.includes("network") ||
    error.message.includes("Connection")
  ) {
    return {
      title: "Network Error",
      message:
        "Unable to connect to the service. Please check your internet connection.",
    };
  }

  if (error.message.includes("Camera")) {
    return {
      title: "Camera Error",
      message:
        "Unable to access the camera. Please check permissions in settings.",
    };
  }

  if (error.message.includes("Permission")) {
    return {
      title: "Permission Denied",
      message:
        "This feature requires additional permissions. Please check settings.",
    };
  }

  if (error.response?.status === 429) {
    return {
      title: "Too Many Requests",
      message:
        "You are making too many requests. Please wait a moment before trying again.",
    };
  }

  if (error.response?.status === 401) {
    return {
      title: "Unauthorized",
      message: "Your session has expired. Please log in again.",
    };
  }

  if (error.response?.status === 403) {
    return {
      title: "Forbidden",
      message: "You do not have permission to access this resource.",
    };
  }

  if (error.response?.status === 500) {
    return {
      title: "Server Error",
      message: "The server encountered an error. Please try again later.",
    };
  }

  return {
    title: "Error",
    message: error.message || strings.errors.generic,
  };
};

/**
 * Validation error handler
 * @param {string} field - Field that failed validation
 * @param {string} type - Validation type (required, email, password, etc)
 * @returns {object} {title, message} for Alert display
 */
export const handleValidationError = (field, type) => {
  const errorMap = {
    required: {
      title: "Missing Information",
      message: `${field} is required. Please fill in this field.`,
    },
    email: {
      title: "Invalid Email",
      message: "Please enter a valid email address (e.g., user@example.com).",
    },
    password: {
      title: "Invalid Password",
      message: "Password must be at least 8 characters long.",
    },
    passwordMatch: {
      title: "Passwords Do Not Match",
      message: "The passwords you entered do not match. Please try again.",
    },
    minLength: {
      title: "Input Too Short",
      message: `${field} must be at least 3 characters long.`,
    },
    maxLength: {
      title: "Input Too Long",
      message: `${field} must be less than 100 characters.`,
    },
    format: {
      title: "Invalid Format",
      message: `${field} has an invalid format. Please check your input.`,
    },
  };

  return (
    errorMap[type] || {
      title: "Validation Error",
      message: `Please check your ${field} and try again.`,
    }
  );
};

/**
 * Generic error handler - tries to categorize error and handle appropriately
 * @param {Error} error - Any error object
 * @returns {object} {title, message} for Alert display
 */
export const handleError = (error) => {
  // Check error type/code to determine handler
  if (error.code?.startsWith("auth/")) {
    return handleAuthError(error);
  }

  if (error.code?.includes("firestore") || error.code?.includes("cloud")) {
    return handleFirestoreError(error);
  }

  if (
    error.name === "AbortError" ||
    error.message?.includes("timeout") ||
    error.message?.includes("network")
  ) {
    return handleAPIError(error);
  }

  // Default to generic error
  return {
    title: "Error",
    message: error.message || strings.errors.generic,
  };
};

/**
 * Log error with context for debugging
 * @param {string} context - Where the error occurred (e.g., "LoginScreen.handleSignIn")
 * @param {Error} error - The error object
 * @param {object} additionalInfo - Extra info to log
 */
export const logError = (context, error, additionalInfo = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    code: error.code,
    message: error.message,
    stack: error.stack,
    ...additionalInfo,
  };

  // In production, this would send to error tracking service (Sentry, Firebase Crashlytics, etc)
  console.error("[ERROR LOG]:", errorLog);
};
