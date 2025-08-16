import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../context/AuthContext';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), email });
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 p-4 bg-white`}>
      <Text style={tw`text-2xl font-bold mb-6`}>Edit Profile</Text>
      
      <View style={tw`space-y-4`}>
        <View>
          <Text style={tw`text-gray-700 mb-2`}>Name</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-lg p-3`}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
        </View>

        <View>
          <Text style={tw`text-gray-700 mb-2`}>Email</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-lg p-3 bg-gray-50`}
            value={email}
            editable={false}
            placeholder="Email cannot be changed"
          />
        </View>

        <TouchableOpacity
          style={tw`bg-blue-500 p-4 rounded-lg mt-6 ${loading ? 'opacity-50' : ''}`}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={tw`text-white text-center font-semibold`}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfileScreen;