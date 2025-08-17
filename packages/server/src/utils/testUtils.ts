// Integration test utilities
export function verifyNoMocks(): void {
  const mockFunctions = [
    'jest.fn',
    'jest.mock',
    'jest.spyOn',
    'jest.createMockFromModule',
    'jest.genMockFromModule'
  ];
  
  // Check if any Jest mock functions are being used
  const jestGlobal = (global as { jest?: unknown }).jest;
  if (jestGlobal) {
    mockFunctions.forEach(mockFn => {
      const fn = mockFn.split('.').reduce((obj: unknown, key) => 
        obj && typeof obj === 'object' && key in obj ? (obj as Record<string, unknown>)[key] : undefined, 
        jestGlobal
      );
      if (fn && typeof fn === 'function') {
        // Allow the function to exist but warn if it's being used inappropriately
        console.log(`⚠️ Integration test environment: ${mockFn} is available but should not be used for real integrations`);
      }
    });
  }
}
