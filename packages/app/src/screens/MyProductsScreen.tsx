import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { IProduct } from '../../../shared/src';
import { useAuth } from '../context/AuthContext';
import { getMyProducts } from '../services/product.service';

const MyProductsScreen = ({ navigation }: any) => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProducts = async () => {
    try {
      if (token) {
        const data = await getMyProducts(token);
        setProducts(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch your produce');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const renderProduct = ({ item }: { item: IProduct }) => (
    <View style={tw`bg-white p-4 mb-2 rounded-lg shadow-sm`}>
      <Text style={tw`text-lg font-semibold`}>{item.name}</Text>
      <Text style={tw`text-gray-600`}>{item.description}</Text>
      <Text style={tw`text-green-600 font-bold mt-2`}>${item.price}</Text>
      <Text style={tw`text-sm text-gray-500`}>Stock: {item.stock}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading your produce...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50 p-4`}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-2xl font-bold text-green-700`}>My Produce</Text>
        <TouchableOpacity
          style={tw`bg-blue-500 px-4 py-2 rounded-lg`}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Text style={tw`text-white font-semibold`}>List Produce</Text>
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-gray-500 text-lg mb-4`}>No produce listed yet</Text>
          <TouchableOpacity
            style={tw`bg-blue-500 px-6 py-3 rounded-lg`}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Text style={tw`text-white font-semibold`}>List Your First Produce</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default MyProductsScreen;