import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import tw from 'twrnc';
import { IProduct } from '../../../shared/src';
import { getProducts } from '../services/product.service';
import { getGrowerProfile, Grower } from '../services/grower.service';
import ProductList from '../components/ProductList';

const GrowerProfileScreen = ({ route, navigation }: any) => {
  const { growerId } = route.params;
  const [grower, setGrowerProfile] = useState<Grower | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrowerData();
  }, []);

  const fetchGrowerData = async () => {
    try {
      const [growerData, productsData] = await Promise.all([
        getGrowerProfile(growerId),
        getProducts() // Filter by grower in real implementation
      ]);
      setGrowerProfile(growerData);
      setProducts(productsData.filter(p => p.userId === growerId));
    } catch (error) {
      console.error('Failed to fetch grower data');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (grower?.phone) {
      Linking.openURL(`tel:${grower.phone}`);
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`p-4 bg-green-50 border-b border-green-200`}>
        <View style={tw`w-16 h-16 bg-green-500 rounded-full items-center justify-center mb-3`}>
          <Text style={tw`text-white text-2xl font-bold`}>
            {grower?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={tw`text-2xl font-bold text-green-800`}>{grower?.name}</Text>
        <Text style={tw`text-green-600 mb-2`}>Local Grower</Text>
        {grower?.bio && (
          <Text style={tw`text-gray-600 mb-3`}>{grower.bio}</Text>
        )}
        {grower?.location && (
          <Text style={tw`text-gray-500 mb-3`}>📍 {grower.location}</Text>
        )}
        <View style={tw`flex-row gap-2`}>
          {grower?.phone && (
            <TouchableOpacity 
              style={tw`bg-green-500 px-4 py-2 rounded-lg`}
              onPress={handleCall}
            >
              <Text style={tw`text-white font-semibold`}>📞 Call</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={tw`p-4 flex-1`}>
        <Text style={tw`text-xl font-bold mb-4 text-green-700`}>Available Produce</Text>
        {loading ? (
          <Text style={tw`text-center`}>Loading produce...</Text>
        ) : products.length > 0 ? (
          <ProductList products={products} />
        ) : (
          <Text style={tw`text-gray-500 text-center`}>No produce available</Text>
        )}
      </View>
    </View>
  );
};

export default GrowerProfileScreen;