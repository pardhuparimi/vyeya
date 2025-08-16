import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import ProductList from '../components/ProductList';
import { IProduct } from '../../../shared/src';
import { getProducts } from '../services/product.service';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProduceDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch produce');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={tw`flex-1 pt-12`}>
      <View style={tw`flex-row justify-between items-center px-4 mb-4`}>
        <Text style={tw`text-2xl font-bold text-green-700`}>Fresh Local Produce</Text>
        <Button title="List Produce" onPress={() => navigation.navigate('AddProduct')} />
      </View>
      <Text style={tw`px-4 text-gray-600 mb-4`}>Direct from growers to your table</Text>
      {isLoading ? (
        <Text style={tw`text-center`}>Loading fresh produce...</Text>
      ) : (
        <ProductList products={products} />
      )}
    </View>
  );
};

export default ProduceDashboardScreen;
