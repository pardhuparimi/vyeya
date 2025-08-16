import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import 'react-native-screens/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import TabNavigator from './TabNavigator';
import AddProductScreen from '../screens/AddProductScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyProductsScreen from '../screens/MyProductsScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import GrowerProfileScreen from '../screens/GrowerProfileScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`} testID="loading-screen">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={tw`mt-4 text-lg`} testID="loading-text">Loading Vyeya...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={TabNavigator} 
              options={{ headerShown: false }}
            />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="MyProducts" component={MyProductsScreen} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="GrowerProfile" component={GrowerProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;