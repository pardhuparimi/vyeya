module.exports = {
  root: true,
  extends: ['@react-native'],
  ignorePatterns: ['coverage/**/*', 'build/**/*', 'android/**/*', 'ios/**/*'],
  rules: {
    // Make errors into warnings for CI
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unstable-nested-components': 'warn',
    'no-console': 'warn',
    'prefer-const': 'warn',
    'no-var': 'warn',
    'radix': 'warn',
  },
};
