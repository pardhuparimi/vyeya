import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../context/AuthContext';

const AuthScreen = () => {
  const [email, setEmail] = useState('seller@vyeya.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const { login, signup, isLoading } = useAuth();

  const handleAuth = async () => {
    try {
      if (isSignup) {
        if (!name.trim()) {
          Alert.alert('Error', 'Name is required');
          return;
        }
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (_error) {
      Alert.alert('Error', isSignup ? 'Signup failed' : 'Login failed');
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center p-4`} testID="auth-screen">
      <Text style={tw`text-2xl font-bold mb-4`} testID="auth-title">
        {isSignup ? 'Sign Up' : 'Login'} to Vyeya
      </Text>
      
      {isSignup && (
        <TextInput
          style={tw`w-full border border-gray-300 rounded-md p-2 mb-2`}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          testID="name-input"
        />
      )}
      
      <TextInput
        style={tw`w-full border border-gray-300 rounded-md p-2 mb-2`}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        testID="email-input"
      />
      <TextInput
        style={tw`w-full border border-gray-300 rounded-md p-2 mb-4`}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
      />
      <View testID="auth-button">
        <Button
          title={isLoading ? (isSignup ? 'Signing up...' : 'Logging in...') : (isSignup ? 'Sign Up' : 'Login')}
          onPress={handleAuth}
          disabled={isLoading}
        />
      </View>
      
      <TouchableOpacity 
        style={tw`mt-4`}
        onPress={() => setIsSignup(!isSignup)}
        testID="toggle-auth-mode"
      >
        <Text style={tw`text-blue-500`}>
          {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;
