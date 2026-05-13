// src/utils/accessibility.js
/**
 * Accessibility helper utilities for React Native components
 * Provides consistent accessibility labels and hints across the app
 */

export const accessibilityLabels = {
  // Navigation
  backButton: "Go back to previous screen",
  closeButton: "Close this dialog or screen",
  nextButton: "Go to next step",
  previousButton: "Go to previous step",

  // Login/Auth
  emailInput: "Email address field",
  passwordInput: "Password field",
  loginButton: "Sign in with email and password",
  signupButton: "Create new account",
  forgotPasswordButton: "Forgot password, reset your password",

  // Home
  profileButton: "Go to user profile",
  settingsButton: "Open settings",
  notificationBell: "View notifications",

  // Logging
  logGlucose: "Log a glucose reading",
  logMeal: "Add food and carbs",
  logWater: "Track water intake",
  logExercise: "Log your workout",

  // Controls
  incrementButton: "Increase value",
  decrementButton: "Decrease value",
  toggleSwitch: "Toggle this setting",
  expandButton: "Show more details",
  collapseButton: "Hide details",

  // Save/Actions
  saveButton: "Save changes",
  cancelButton: "Cancel and discard changes",
  deleteButton: "Delete this item",
  editButton: "Edit this item",
  confirmButton: "Confirm action",

  // Media
  camera: "Take a photo",
  gallery: "Choose from photo library",
  captureImage: "Capture food image for analysis",
};

export const accessibilityHints = {
  // Input hints
  requiredField: "This field is required",
  emailFormat: "Enter a valid email address",
  passwordRequirements: "Must be at least 8 characters",
  confirmPassword: "Must match your password",

  // Action hints
  saveData: "Saves your information to the database",
  deleteWarning: "This action cannot be undone",
  deleteAccount: "Permanently deletes your account and all data",

  // Navigation hints
  tabNavigation: "Navigate to different sections of the app",
  deepLink: "Opens detailed information",

  // Form hints
  toggleSetting: "Enable or disable this feature",
  selectOption: "Choose from available options",
  dateSelection: "Select a date from calendar",
};

/**
 * Get combined accessibility properties for a button
 * @param {string} labelKey - Key from accessibilityLabels
 * @param {string} hintKey - Optional key from accessibilityHints
 * @returns {object} Object with accessibilityLabel, accessibilityHint, accessibilityRole
 */
export const getButtonAccessibility = (labelKey, hintKey = null) => {
  return {
    accessible: true,
    accessibilityRole: "button",
    accessibilityLabel: accessibilityLabels[labelKey] || labelKey,
    ...(hintKey && { accessibilityHint: accessibilityHints[hintKey] }),
  };
};

/**
 * Get combined accessibility properties for an input field
 * @param {string} labelKey - Key from accessibilityLabels
 * @param {string} hintKey - Optional key from accessibilityHints
 * @param {string} value - Current value for announcement
 * @returns {object} Object with accessibility properties
 */
export const getInputAccessibility = (labelKey, hintKey = null, value = "") => {
  return {
    accessible: true,
    accessibilityRole: "search",
    accessibilityLabel: accessibilityLabels[labelKey] || labelKey,
    ...(hintKey && { accessibilityHint: accessibilityHints[hintKey] }),
    accessibilityValue: {
      min: 0,
      max: 100,
      now: value.length || 0,
      text: value || "",
    },
  };
};

/**
 * Announce important information to screen readers
 * Note: This requires AccessibilityInfo in production
 * @param {string} message - Message to announce
 */
export const announceForAccessibility = (message) => {
  // This would use AccessibilityInfo.announceForAccessibility(message)
  // in a real implementation
  console.log("[A11y Announcement]:", message);
};
