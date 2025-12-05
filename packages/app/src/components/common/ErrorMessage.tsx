import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => (
  <View style={tw`flex-1 justify-center items-center p-4`}>
    <Text style={tw`text-red-500 text-center text-lg`}>{message}</Text>
  </View>
);
