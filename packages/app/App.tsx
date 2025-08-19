import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { NotificationProvider } from './src/context/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <AppNavigator />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
