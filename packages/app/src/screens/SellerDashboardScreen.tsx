import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import tw from 'twrnc';
import ProductList from '../components/ProductList';
import { IProduct } from '../../../shared/src';
import { getProducts } from '../services/product.service';
import { useAuth } from '../context/AuthContext';

const SellerDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch products');
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
        <Text style={tw`text-2xl font-bold`}>Welcome, {user?.name}</Text>
        <Button title="Logout" onPress={logout} color="red" />
      </View>
      <Button title="Add Product" onPress={() => navigation.navigate('AddProduct')} />
      {isLoading ? (
        <Text style={tw`text-center`}>Loading products...</Text>
      ) : (
        <ProductList products={products} />
      )}
    </View>
  );
};

export default SellerDashboardScreen;
