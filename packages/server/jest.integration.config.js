module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupIntegrationTests.ts'],
  testMatch: [
    '**/__tests__/**/*.e2e.test.ts',
    '**/__tests__/**/*.http.test.ts',
    '**/__tests__/**/*.integration.test.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/test.ts',
    '/src/index.ts',
    '/src/standalone-test.ts',
    '/src/types/',
    '/src/scripts/',
    '/__mocks__/',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Disable coverage for integration tests
  collectCoverage: false,
  // Longer timeout for integration tests that hit real services
  testTimeout: 60000,
  // Run tests serially to avoid database conflicts
  maxWorkers: 1,
  // Verbose output for CI debugging
  verbose: true,
  // Clear mocks between tests but allow real implementations
  clearMocks: false,
  resetMocks: false,
  restoreMocks: false
};
