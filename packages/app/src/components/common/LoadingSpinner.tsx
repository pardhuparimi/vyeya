import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import tw from 'twrnc';

export const LoadingSpinner = () => (
  <View style={tw`flex-1 justify-center items-center`}>
    <ActivityIndicator size="large" color="#10B981" />
  </View>
);
