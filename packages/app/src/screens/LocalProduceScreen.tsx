import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { IProduct } from '../../../shared/src';
import { getProducts } from '../services/product.service';
import ProductList from '../components/ProductList';

const LocalProduceScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocalProduce();
  }, []);

  const fetchLocalProduce = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch local produce');
    } finally {
      setLoading(false);
    }
  };

  const seasonalProduce = [
    { name: 'Tomatoes', season: 'Summer', emoji: '🍅' },
    { name: 'Apples', season: 'Fall', emoji: '🍎' },
    { name: 'Leafy Greens', season: 'Year-round', emoji: '🥬' },
    { name: 'Berries', season: 'Summer', emoji: '🫐' }
  ];

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <View style={tw`p-4 bg-green-50 border-b border-green-200`}>
        <Text style={tw`text-2xl font-bold text-green-800 mb-2`}>Local & Seasonal</Text>
        <Text style={tw`text-green-600 mb-4`}>
          Fresh produce from growers within 25 miles of your location
        </Text>
        
        <Text style={tw`text-lg font-semibold mb-3 text-green-700`}>What's in Season</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {seasonalProduce.map((item, index) => (
            <View key={index} style={tw`bg-white p-3 rounded-lg mr-3 items-center min-w-20`}>
              <Text style={tw`text-2xl mb-1`}>{item.emoji}</Text>
              <Text style={tw`text-sm font-semibold text-center`}>{item.name}</Text>
              <Text style={tw`text-xs text-gray-500 text-center`}>{item.season}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={tw`p-4`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-xl font-bold text-green-700`}>Available Now</Text>
          <TouchableOpacity 
            style={tw`bg-green-500 px-3 py-1 rounded-lg`}
            onPress={() => navigation.navigate('Browse')}
          >
            <Text style={tw`text-white text-sm font-semibold`}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <Text style={tw`text-center`}>Loading fresh produce...</Text>
        ) : (
          <ProductList products={products.slice(0, 5)} />
        )}
      </View>
    </ScrollView>
  );
};

export default LocalProduceScreen;