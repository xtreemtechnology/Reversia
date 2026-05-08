// src/features/onboarding/index.js
// Screens
export { default as AccountSetupName } from './screens/AccountSetupName';
export { default as AccountSetupGender } from './screens/AccountSetupGender';
export { default as AccountSetupAge } from './screens/AccountSetupAge';
export { default as AccountSetupWeight } from './screens/AccountSetupWeight';
export { default as AccountSetupHeight } from './screens/AccountSetupHeight';
export { default as AccountSetupGoal } from './screens/AccountSetupGoal';
export { default as AccountSetupHealthStatus } from './screens/AccountSetupHealthStatus';
export { default as AccountSetupReadiness } from './screens/AccountSetupReadiness';
export { default as AccountSetupComplete } from './screens/AccountSetupComplete';

// Components
export { OnboardingHeader } from './components/OnboardingHeader';
export { OnboardingProgress } from './components/OnboardingProgress';
export { ContinueButton } from './components/ContinueButton';
export { ErrorBox } from './components/ErrorBox';

// Services
export * from './services/onboardingService';
