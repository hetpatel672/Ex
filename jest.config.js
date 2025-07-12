module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-linear-gradient|react-native-vector-icons|react-native-svg|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-navigation|react-native-modal|react-native-animatable|react-native-chart-kit|react-native-date-picker|react-native-picker-select|react-native-haptic-feedback|react-native-device-info|react-native-keychain|react-native-sqlite-storage|react-native-image-picker|@react-native-community|@react-native-async-storage|react-native-encrypted-storage|react-native-fs|react-native-biometrics)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^react-native-sqlite-storage$': '<rootDir>/__mocks__/react-native-sqlite-storage.js',
    '^react-native-vector-icons/(.*)$': '<rootDir>/__mocks__/react-native-vector-icons.js',
    '^react-native-linear-gradient$': '<rootDir>/__mocks__/react-native-linear-gradient.js',
  },
};
