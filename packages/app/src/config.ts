// Configuration for the mobile app

// Default to localhost for Android emulator
// For iOS simulator, you might want to use 'http://localhost:3000/api/v1'
// For physical devices, use your computer's IP address: 'http://192.168.1.X:3000/api/v1'
// In production, this would be replaced by the actual production URL

// NOTE: react-native does not have process.env by default without extra setup.
// We are using a simple object here.
export const Config = {
  API_URL: 'http://10.0.2.2:3000/api/v1',
};
