import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import tw from 'twrnc';
import ProductList from '../components/ProductList';
import { IProduct } from '../../../shared/src';
import { getProducts } from '../services/product.service';

const SellerDashboardScreen = ({ navigation }: any) => {

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
      <Text style={tw`text-2xl font-bold mb-4 text-center`}>Seller Dashboard</Text>
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
