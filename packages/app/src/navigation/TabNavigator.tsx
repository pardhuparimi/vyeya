import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import ProduceDashboardScreen from '../screens/SellerDashboardScreen';
import BrowseScreen from '../screens/BrowseScreen';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LocalProduceScreen from '../screens/LocalProduceScreen';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();

// Define tab icons outside of render to avoid re-creation
const HomeIcon = () => <Text>🌱</Text>;
const BrowseIcon = () => <Text>🛍️</Text>;
const LocalIcon = () => <Text>🌿</Text>;
const SearchIcon = () => <Text>🔍</Text>;
const CartIcon = () => <Text>🛒</Text>;
const ProfileIcon = () => <Text>👤</Text>;

const TabNavigator = () => {
  const { getItemCount } = useCart();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen 
        name="Home" 
        component={ProduceDashboardScreen}
        options={{
          tabBarIcon: HomeIcon,
          title: 'Fresh Produce'
        }}
      />
      <Tab.Screen 
        name="Browse" 
        component={BrowseScreen}
        options={{
          tabBarIcon: BrowseIcon
        }}
      />
      <Tab.Screen 
        name="Local" 
        component={LocalProduceScreen}
        options={{
          tabBarIcon: LocalIcon,
          title: 'Local & Seasonal'
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarIcon: SearchIcon
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          tabBarIcon: CartIcon,
          tabBarBadge: getItemCount() > 0 ? getItemCount() : undefined
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ProfileIcon
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;