import { describe, it, expect } from '@jest/globals';

// Simple utility functions to test
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatUserName = (firstName: string, lastName: string): string => {
  return `${firstName.trim()} ${lastName.trim()}`;
};

// Unit tests
describe('Utility Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('formatUserName', () => {
    it('should format user names correctly', () => {
      expect(formatUserName('John', 'Doe')).toBe('John Doe');
      expect(formatUserName('  Alice  ', '  Smith  ')).toBe('Alice Smith');
    });

    it('should handle empty strings', () => {
      expect(formatUserName('', '')).toBe(' ');
      expect(formatUserName('John', '')).toBe('John ');
    });
  });
});
