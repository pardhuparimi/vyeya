import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import ProduceDashboardScreen from '../screens/profile/SellerDashboardScreen';
import BrowseScreen from '../screens/product/BrowseScreen';
import SearchScreen from '../screens/product/SearchScreen';
import CartScreen from '../screens/order/CartScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LocalProduceScreen from '../screens/product/LocalProduceScreen';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { getItemCount } = useCart();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen 
        name="Home" 
        component={ProduceDashboardScreen}
        options={{
          tabBarIcon: () => <Text>🌱</Text>,
          title: 'Fresh Produce'
        }}
      />
      <Tab.Screen 
        name="Browse" 
        component={BrowseScreen}
        options={{
          tabBarIcon: () => <Text>🛍️</Text>
        }}
      />
      <Tab.Screen 
        name="Local" 
        component={LocalProduceScreen}
        options={{
          tabBarIcon: () => <Text>🌿</Text>,
          title: 'Local & Seasonal'
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarIcon: () => <Text>🔍</Text>
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          tabBarIcon: () => <Text>🛒</Text>,
          tabBarBadge: getItemCount() > 0 ? getItemCount() : undefined
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: () => <Text>👤</Text>
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;