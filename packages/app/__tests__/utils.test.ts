// Simple utility functions for the mobile app
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Unit tests
test('formatPrice should format prices correctly', () => {
  expect(formatPrice(10)).toBe('$10.00');
  expect(formatPrice(99.99)).toBe('$99.99');
  expect(formatPrice(0)).toBe('$0.00');
});

test('validatePhoneNumber should validate phone numbers', () => {
  expect(validatePhoneNumber('+1234567890')).toBe(true);
  expect(validatePhoneNumber('123-456-7890')).toBe(true);
  expect(validatePhoneNumber('123')).toBe(false);
});

test('truncateText should truncate long text', () => {
  expect(truncateText('This is a very long text', 10)).toBe('This is...');
  expect(truncateText('Short', 10)).toBe('Short');
});
