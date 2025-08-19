import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, FlatList } from 'react-native';
import tw from 'twrnc';
import { IProduct } from '../../../shared/src';
import { searchProducts } from '../services/product.service';

const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await searchProducts(searchQuery);
      setProducts(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProduct = ({ item }: { item: IProduct }) => (
    <TouchableOpacity
      style={tw`p-4 border-b border-gray-200`}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
    >
      <Text style={tw`text-lg font-semibold`}>{item.name}</Text>
      <Text style={tw`text-green-600 font-bold`}>${Number(item.price).toFixed(2)}</Text>
      <Text style={tw`text-gray-600 text-sm`} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`p-4 border-b border-gray-200`}>
        <Text style={tw`text-lg font-semibold mb-2 text-green-700`}>Find Fresh Produce</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg px-4 py-2 mb-2`}
          placeholder="Search tomatoes, apples, herbs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={tw`bg-blue-500 py-2 px-4 rounded-lg`}
          onPress={handleSearch}
        >
          <Text style={tw`text-white text-center font-semibold`}>Search</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View style={tw`flex-1 justify-center items-center p-8`}>
              <Text style={tw`text-gray-500`}>
                {searchQuery ? 'No fresh produce found' : 'Search for fresh local produce'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default SearchScreen;