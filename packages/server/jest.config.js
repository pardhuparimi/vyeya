module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/test.ts',                     // Ignore the standalone test file
    '/src/index.ts',                    // Ignore the main server file
    '/src/standalone-test.ts',          // Ignore standalone test script
    '/src/types/',                      // Ignore type definitions
    '/src/scripts/',                    // Ignore database scripts
    '/__mocks__/',                      // Ignore mock files
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/test.ts',
    '!src/index.ts',                    // Main server entry point
    '!src/standalone-test.ts',          // Standalone test script
    '!src/types/**/*',                  // Type definitions
    '!src/scripts/**/*',                // Database scripts and utilities
    '!src/**/__mocks__/**',             // Mock files
  ],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 93,   // Updated to realistic achievable coverage
      functions: 95,
      lines: 95,
    },
  },
  testTimeout: 30000, // 30 seconds for integration tests
};
