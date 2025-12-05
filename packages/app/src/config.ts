// Configuration for the mobile app

// Default to localhost for Android emulator
// For iOS simulator, you might want to use 'http://localhost:3000/api/v1'
// For physical devices, use your computer's IP address: 'http://192.168.1.X:3000/api/v1'
// In production, this would be replaced by the actual production URL

export const Config = {
  API_URL: process.env.API_URL || 'http://10.0.2.2:3000/api/v1',
};
