// src/features/onboarding/index.js
/**
 * Onboarding Feature - Barrel exports
 */

export { default as OnboardingFeatureStack } from "./navigation";
export * from "./hooks";
export * from "./screens";
export * from "./components";
export * from "./services";
export { default as AccountSetupComplete } from "./screens/AccountSetupComplete";

// Components
export { OnboardingHeader } from "./components/OnboardingHeader";
export { OnboardingProgress } from "./components/OnboardingProgress";
export { ContinueButton } from "./components/ContinueButton";
export { ErrorBox } from "./components/ErrorBox";

// Services
export * from "./services/onboardingService";
