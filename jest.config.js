module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterFramework: [],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/node_modules/react-native',
  },
  testMatch: ['<rootDir>/src/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/utils/mealNormalizer.js',
    'src/features/learn/services/insightsService.js',
  ],
};
