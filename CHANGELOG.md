# Changelog

All notable changes to Reversia will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-11

### Added
- **Dark Mode Support** — Full theme support across all screens (Home, Meals, Water, Glucose, Activity, Sleep, Nutrition, Settings)
- **ThemeProvider integration** — Centralized theme management using React context with light/dark color tokens
- **ESLint + Prettier setup** — Automated code linting and formatting

### Changed
- Replaced hardcoded light-mode colors with theme tokens throughout the app
- Improved Home screen tab navigation UX with auto-scroll to active tab
- Updated all shared components to use `useTheme()` for consistent dark mode rendering
- Enhanced Settings screens with proper theme support

### Fixed
- Fixed PanResponder stale state in Category Switcher causing swipe gesture issues
- Corrected ScrollView closing tags in Settings screens (ChangePassword, EditProfile, NotificationSettings)
- Resolved JSX parsing errors in SetupScreens
- Improved accessibility contrast in dark mode across all screens

### Technical
- Updated ESLint configuration with Babel parser for React Native support
- Added `.eslintignore` and `.eslintrc.json` for code quality
- Created `babel.config.js` with expo preset
- Lint passes with 0 parsing errors; 51 minor warnings (non-blocking)

## [1.0.0] - 2026-04-01

### Initial Release
- User authentication (Firebase Auth)
- Health data logging (Glucose, Meals, Water, Activity, Sleep, Weight, BMI)
- Meal analysis with photo capture
- Exercise timer with activity tracking
- Sleep insights and nutrition dashboard
- Weight and BMI calculator
- User profile and settings management
- Bottom tab navigation
- Firestore integration for data persistence
- Expo-based React Native mobile app (iOS & Android)
