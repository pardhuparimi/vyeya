import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useTailwind } from 'twrnc';
import { signUp, signIn } from '../services/auth.service';

const AuthScreen = () => {
  const tailwind = useTailwind();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      if (isSigningUp) {
        await signUp(email, password, phone);
        Alert.alert('Success', 'Please check your email to confirm your account.');
      } else {
        const session = await signIn(email, password);
        Alert.alert('Success', 'Signed in successfully.');
        console.log('ID Token: ' + session.getIdToken().getJwtToken());
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={tailwind`flex-1 justify-center items-center p-4`}>
      <Text style={tailwind`text-2xl font-bold mb-4`}>
        {isSigningUp ? 'Sign Up' : 'Sign In'}
      </Text>
      <TextInput
        style={tailwind`w-full border border-gray-300 rounded-md p-2 mb-2`}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {isSigningUp && (
        <TextInput
          style={tailwind`w-full border border-gray-300 rounded-md p-2 mb-2`}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      )}
      <TextInput
        style={tailwind`w-full border border-gray-300 rounded-md p-2 mb-4`}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={isLoading ? 'Loading...' : (isSigningUp ? 'Sign Up' : 'Sign In')}
        onPress={handleAuth}
        disabled={isLoading}
      />
      <View style={tailwind`mt-4`}>
        <Button
          title={isSigningUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
          onPress={() => setIsSigningUp(!isSigningUp)}
        />
      </View>
    </View>
  );
};

export default AuthScreen;
