// Central route constants to avoid string typos and collisions.
// Keep these additive and stable; use them gradually during migration.
export const ROUTES = {
  ROOT: {
    ONBOARDING_FLOW: "OnboardingFlow",
    AUTH_STACK: "AuthStack",
    AUTH: "Auth",
    MAIN_APP: "MainApp",
  },
  AUTH: {
    LOGIN: "AUTH/Login",
    SIGNUP: "AUTH/SignUp",
    FORGOT_PASSWORD: "AUTH/ForgotPassword",
    OTP: "AUTH/OTPVerification",
    VERIFY_EMAIL: "AUTH/VerifyEmail",
    EMAIL_VERIFICATION_SUCCESS: "AUTH/EmailVerificationSuccess",
    RESET_SUCCESS: "AUTH/ResetPasswordSuccess",
  },
  ONBOARDING: {
    SPLASH: "ONBOARDING/Splash",
    WELCOME: "ONBOARDING/Welcome",
    ACCOUNT_SETUP_NAME: "ONBOARDING/AccountSetupName",
    ACCOUNT_SETUP_GENDER: "ONBOARDING/AccountSetupGender",
    ACCOUNT_SETUP_AGE: "ONBOARDING/AccountSetupAge",
    ACCOUNT_SETUP_WEIGHT: "ONBOARDING/AccountSetupWeight",
    ACCOUNT_SETUP_HEIGHT: "ONBOARDING/AccountSetupHeight",
    ACCOUNT_SETUP_GOAL: "ONBOARDING/AccountSetupGoal",
    ACCOUNT_SETUP_HEALTH_STATUS: "ONBOARDING/AccountSetupHealthStatus",
    ACCOUNT_SETUP_ACTIVITY: "ONBOARDING/AccountSetupActivity",
    ACCOUNT_SETUP_READINESS: "ONBOARDING/AccountSetupReadiness",
    ACCOUNT_SETUP_CHECK_FREQUENCY: "ONBOARDING/AccountSetupCheckFrequency",
    ACCOUNT_SETUP_COMPLETE: "ONBOARDING/AccountSetupComplete",
  },
  APP: {
    ROOT: "APP/Root",
    MAIN_TABS: "APP/MainTabs",
    MAIN_APP: "APP/MainApp",
  },
  SETTINGS: {
    EDIT_PROFILE: "SETTINGS/EditProfile",
    NOTIFICATIONS: "SETTINGS/Notifications",
    CHANGE_PASSWORD: "SETTINGS/ChangePassword",
    APPEARANCE: "SETTINGS/Appearance",
    PRIVACY: "SETTINGS/Privacy",
    DATA_SYNC: "SETTINGS/DataSync",
    EXPORT_DATA: "SETTINGS/ExportData",
    ABOUT: "SETTINGS/About",
    SUPPORT: "SETTINGS/Support",
  },
  FEATURES: {
    MEALS_ANALYSER: "FEATURES/MealAnalyser",
    MEAL_ENTRY: "MEALS/Entry",
    MEAL_PLAN: "MEALS/Plan",
    GLUCOSE_MONITORING: "GLUCOSE/Monitoring",
    GLUCOSE_LOG: "GLUCOSE/Log",
    ACTIVITY_LOG: "ACTIVITY/Log",
    PROFILE_VIEW: "PROFILE/View",
  },
};

export default ROUTES;
