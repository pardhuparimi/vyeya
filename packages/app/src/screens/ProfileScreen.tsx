import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  return (
    <View style={tw`flex-1 p-4 bg-white`}>
      <View style={tw`items-center mb-8`}>
        <View style={tw`w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4`}>
          <Text style={tw`text-white text-2xl font-bold`}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={tw`text-xl font-bold`}>{user?.name}</Text>
        <Text style={tw`text-gray-600`}>{user?.email}</Text>
      </View>

      <View style={tw`space-y-4`}>
        <TouchableOpacity 
          style={tw`p-4 bg-gray-50 rounded-lg`}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={tw`text-lg`}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={tw`p-4 bg-gray-50 rounded-lg`}
          onPress={() => navigation.navigate('MyProducts')}
        >
          <Text style={tw`text-lg`}>My Produce</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={tw`p-4 bg-gray-50 rounded-lg`}
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={tw`text-lg`}>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={tw`p-4 bg-red-50 rounded-lg`}
          onPress={handleLogout}
        >
          <Text style={tw`text-lg text-red-600`}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;