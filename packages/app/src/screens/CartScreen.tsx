import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/order.service';

const CartScreen = ({ navigation }: any) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Add fresh produce to cart before checkout');
      return;
    }
    
    try {
      const orderItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      await createOrder((user as any)?.token || '', orderItems, getTotalPrice()); // TODO: Fix User type
      Alert.alert('Order Placed', 'Your order has been placed successfully!', [
        { text: 'View Orders', onPress: () => { clearCart(); navigation.navigate('Orders'); } },
        { text: 'OK', onPress: () => { clearCart(); navigation.goBack(); } }
      ]);
    } catch (_error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={tw`bg-white p-4 mb-2 rounded-lg shadow-sm`}>
      <Text style={tw`text-lg font-semibold`}>{item.name}</Text>
      <Text style={tw`text-green-600 font-bold`}>${Number(item.price).toFixed(2)}</Text>
      <View style={tw`flex-row justify-between items-center mt-2`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity
            style={tw`bg-gray-200 w-8 h-8 rounded-full justify-center items-center`}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={tw`text-lg font-bold`}>-</Text>
          </TouchableOpacity>
          <Text style={tw`mx-4 text-lg`}>{item.quantity}</Text>
          <TouchableOpacity
            style={tw`bg-gray-200 w-8 h-8 rounded-full justify-center items-center`}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={tw`text-lg font-bold`}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={tw`bg-red-500 px-3 py-1 rounded`}
          onPress={() => removeFromCart(item.id)}
        >
          <Text style={tw`text-white text-sm`}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold mb-4 text-green-700`}>Fresh Cart</Text>
        {items.length === 0 ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <Text style={tw`text-gray-500 text-lg mb-4`}>Your cart is empty</Text>
            <TouchableOpacity
              style={tw`bg-blue-500 px-6 py-3 rounded-lg`}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={tw`text-white font-semibold`}>Browse Fresh Produce</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={tw`flex-1`}
            />
            <View style={tw`bg-white p-4 rounded-lg shadow-sm mt-4`}>
              <Text style={tw`text-xl font-bold mb-2`}>
                Total: ${getTotalPrice().toFixed(2)}
              </Text>
              <TouchableOpacity
                style={tw`bg-green-500 py-3 rounded-lg`}
                onPress={handleCheckout}
              >
                <Text style={tw`text-white text-center font-semibold text-lg`}>
                  Checkout
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default CartScreen;