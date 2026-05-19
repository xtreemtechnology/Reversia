// src/constants/colors.js
export const colors = {
  primary: "#22422F",
  secondary: "#ECA143",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#ECA143",
  info: "#0284C7",

  // Grays
  gray50: "#F8F6F0",
  gray100: "#EBE7DD",
  gray200: "#DED6C8",
  gray300: "#D1C9B5",
  gray400: "#A89B88",
  gray500: "#627A6E",
  gray600: "#4A6660",
  gray700: "#335550",
  gray800: "#1C2621",
  gray900: "#121A16",

  // Semantic
  background: "#F8F6F0",
  text: "#22422F",
  textSecondary: "#627A6E",
  textTertiary: "#8CA397",
  border: "#EBE7DD",
  shadow: "#000000",

  // Status
  online: "#10B981",
  offline: "#8CA397",
  pending: "#ECA143",
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
