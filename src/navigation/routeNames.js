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
    STEP1: "ONBOARDING/Onboarding1",
    STEP2: "ONBOARDING/Onboarding2",
    STEP3: "ONBOARDING/Onboarding3",
    START: "ONBOARDING/Start",
    ACCOUNT_SETUP_NAME: "ONBOARDING/AccountSetupName",
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
