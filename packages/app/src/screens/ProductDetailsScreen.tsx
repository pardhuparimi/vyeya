import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { IProduct } from '../../../shared/src';
import { getProductById } from '../services/product.service';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const ProductDetailsScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const fetchedProduct = await getProductById(productId);
      setProduct(fetchedProduct);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch product details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      showNotification('Product added to cart!', 'success');
    }
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const isOwnProduct = user?.id === product.userId;

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold mb-2`}>{product.name}</Text>
        <Text style={tw`text-xl text-green-600 font-semibold mb-4`}>
          ${Number(product.price).toFixed(2)}
        </Text>
        <Text style={tw`text-gray-600 mb-4`}>{product.description}</Text>
        
        <View style={tw`mb-4`}>
          <Text style={tw`text-sm text-gray-500`}>Category: {product.category}</Text>
          <Text style={tw`text-sm text-gray-500`}>Available: {product.stock} units</Text>
          <TouchableOpacity 
            style={tw`mt-2`}
            onPress={() => navigation.navigate('GrowerProfile', { 
              growerId: product.userId
            })}
          >
            <Text style={tw`text-green-600 font-semibold`}>👨‍🌾 View Grower Profile</Text>
          </TouchableOpacity>
        </View>

        {!isOwnProduct && (
          <View style={tw`gap-3`}>
            <View style={tw`bg-blue-50 p-3 rounded-lg`}>
              <Text style={tw`text-blue-800 font-semibold mb-1`}>🚚 Pickup & Delivery</Text>
              <Text style={tw`text-blue-600 text-sm`}>Farm pickup available • Local delivery $3</Text>
            </View>
            <TouchableOpacity
              style={tw`bg-green-500 py-3 px-6 rounded-lg`}
              onPress={handleAddToCart}
            >
              <Text style={tw`text-white text-center font-semibold`}>
                Add to Cart
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isOwnProduct && (
          <View style={tw`flex-row gap-2`}>
            <TouchableOpacity
              style={tw`flex-1 bg-gray-500 py-3 px-6 rounded-lg`}
              onPress={() => navigation.navigate('EditProduct', { productId })}
            >
              <Text style={tw`text-white text-center font-semibold`}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ProductDetailsScreen;