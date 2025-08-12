import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import tw from 'twrnc';
import { createProduct } from '../services/product.service';

const AddProductScreen = ({ navigation }: any) => {

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProduct = async () => {
    setIsLoading(true);
    try {
      await createProduct({ name, price: parseFloat(price), stock: parseInt(stock), store_id: '1', location: {}, category_id: '1' });
      Alert.alert('Success', 'Product added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center p-4`}>
      <Text style={tw`text-2xl font-bold mb-4`}>Add Product</Text>
      <TextInput
        style={tw`w-full border border-gray-300 rounded-md p-2 mb-2`}
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={tw`w-full border border-gray-300 rounded-md p-2 mb-2`}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={tw`w-full border border-gray-300 rounded-md p-2 mb-4`}
        placeholder="Stock"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />
      <Button
        title={isLoading ? 'Adding...' : 'Add Product'}
        onPress={handleAddProduct}
        disabled={isLoading}
      />
    </View>
  );
};

export default AddProductScreen;
