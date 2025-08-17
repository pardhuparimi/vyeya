// Jest setup file to handle console errors during testing

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Mock console.error during tests to reduce noise from intentional error testing
// Only suppress specific expected error messages, not all errors
beforeEach(() => {
  // Mock console.error to suppress expected error messages during testing
  console.error = jest.fn().mockImplementation((...args) => {
    const message = args.join(' ');
    
    // List of expected error messages that we want to suppress during tests
    const expectedErrors = [
      'Database error:',
      'Registration error:',
      'Order creation error:',
      'Orders fetch error:',
      'Order fetch error:',
      'Search error:',
      'Database connection failed',
      'Failed to create order',
      'Failed to fetch orders',
      'Failed to fetch order',
      'Search failed',
      'Server error',
      'Internal server error',
      'Unable to fetch user profile',
      'Unable to fetch user',
      'Failed to create product',
      'Failed to fetch your products'
    ];
    
    // Only suppress if it's one of our expected test errors
    const shouldSuppress = expectedErrors.some(expectedError => 
      message.includes(expectedError)
    );
    
    if (!shouldSuppress) {
      // Call original console.error for unexpected errors
      originalConsoleError(...args);
    }
  });

  // Similarly for console.warn if needed
  console.warn = jest.fn().mockImplementation((...args) => {
    const message = args.join(' ');
    
    // Suppress expected warnings
    const expectedWarnings = [
      'watchman warning',
      'Recrawled this watch'
    ];
    
    const shouldSuppress = expectedWarnings.some(expectedWarning => 
      message.includes(expectedWarning)
    );
    
    if (!shouldSuppress) {
      originalConsoleWarn(...args);
    }
  });

  // Mock console.log to suppress E2E test status messages
  console.log = jest.fn().mockImplementation((...args) => {
    const message = args.join(' ');
    
    // Suppress E2E test status messages
    const expectedLogs = [
      '🟡 Database not available - E2E tests will run in degraded mode',
      '🟡 Database not available',
      '⚠️ User registration skipped',
      '📊 Response Status:',
      '💾 Database:',
      '⚠️ User login skipped',
      '⚠️ Products list failed',
      '❌ Error Message:',
      '✅ Product creation properly requires authentication',
      '⚠️ Authenticated product creation skipped',
      '✅ Profile fetch properly requires authentication',
      '⚠️ Authenticated profile fetch skipped',
      '✅ Profile update properly requires authentication',
      '⚠️ Authenticated profile update skipped',
      '✅ Orders fetch properly requires authentication',
      '⚠️ Authenticated orders fetch skipped',
      '✅ Order creation properly requires authentication',
      '⚠️ Authenticated order creation skipped',
      '✅ BASIC HEALTH CHECK SUCCESS:',
      '🟢 Status:',
      '⏰ Server Uptime:',
      '🏥 Basic health endpoint working',
      '⚠️ DEEP HEALTH CHECK DEGRADED:',
      '🟡 Overall Status:',
      '🔄 Redis Check:',
      '💾 Database Check:',
      '🏥 Some systems unavailable',
      'Creating user:',
      'User created:'
    ];
    
    const shouldSuppress = expectedLogs.some(expectedLog => 
      message.includes(expectedLog)
    );
    
    if (!shouldSuppress) {
      originalConsoleLog(...args);
    }
  });
});

afterEach(() => {
  // Restore original console methods after each test
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});
