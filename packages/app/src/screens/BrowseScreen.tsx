import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { IProduct } from '../../../shared/src';
import { getProducts } from '../services/product.service';
import ProductList from '../components/ProductList';

const BrowseScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['all', 'vegetables', 'fruits', 'herbs', 'grains', 'dairy', 'eggs'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [products, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`p-4 border-b border-gray-200`}>
        <Text style={tw`text-2xl font-bold mb-2 text-green-700`}>Fresh Local Produce</Text>
        <Text style={tw`text-gray-600 mb-4`}>No middlemen, just fresh from the source</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={tw`mr-3 px-4 py-2 rounded-full ${
                selectedCategory === category ? 'bg-blue-500' : 'bg-gray-200'
              }`}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={tw`${
                selectedCategory === category ? 'text-white' : 'text-gray-700'
              } capitalize`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>Loading products...</Text>
        </View>
      ) : (
        <ProductList products={filteredProducts} />
      )}
    </View>
  );
};

export default BrowseScreen;