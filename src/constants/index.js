// src/constants/colors.js
export const colors = {
  primary: "#825CFF",
  secondary: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",

  // Grays
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // Semantic
  background: "#FAFAFA",
  text: "#111827",
  textSecondary: "#374151",
  textTertiary: "#9CA3AF",
  border: "#E5E7EB",
  shadow: "#000000",

  // Status
  online: "#10B981",
  offline: "#9CA3AF",
  pending: "#F59E0B",
  error: "#EF4444",
};

// src/constants/sizes.js
export const sizes = {
  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 999,
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },

  // Component heights
  buttonHeight: 48,
  tabBarHeight: 60,
  navItemHeight: 70,
  inputHeight: 44,
};

// src/constants/strings.js
export const strings = {
  // Auth
  auth: {
    loginTitle: "Welcome Back",
    signupTitle: "Create Account",
    forgotPasswordTitle: "Reset Password",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    passwordConfirmPlaceholder: "Confirm password",
  },

  // Errors
  errors: {
    generic: "Something went wrong. Please try again.",
    network: "Network connection failed. Please try again.",
    timeout: "Request timed out. Please try again.",
    unauthorized: "You are not authorized to perform this action.",
    notFound: "The requested item was not found.",
    validation: "Please check your input and try again.",
    required: "This field is required.",
    invalidEmail: "Please enter a valid email address.",
    passwordTooShort: "Password must be at least 8 characters long.",
    passwordMismatch: "Passwords do not match.",
  },

  // Common
  common: {
    loading: "Loading...",
    saving: "Saving...",
    ok: "OK",
    cancel: "Cancel",
    delete: "Delete",
    save: "Save",
    edit: "Edit",
    done: "Done",
  },
};

// src/constants/timeouts.js
export const timeouts = {
  apiCall: 30000, // 30 seconds
  firestore: 10000, // 10 seconds
  imageAnalysis: 30000, // 30 seconds
  debounce: 300, // 300 milliseconds
};

// src/constants/limits.js
export const limits = {
  // Exercise
  minExerciseDuration: 5, // minutes
  maxExerciseDuration: 480, // 8 hours

  // Password
  minPasswordLength: 8,
  maxPasswordLength: 128,

  // Text inputs
  maxNameLength: 50,
  maxEmailLength: 254,

  // Images
  imageQuality: 0.7,
};
