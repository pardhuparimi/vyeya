module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFiles: [],
  // Bypass React Native preset for now to avoid Flow/TypeScript conflicts
};
