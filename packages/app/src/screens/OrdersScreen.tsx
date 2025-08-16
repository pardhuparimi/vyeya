import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { Order, getOrders } from '../services/order.service';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const OrdersScreen = ({ navigation }: any) => {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      if (token) {
        const data = await getOrders(token);
        setOrders(data);
      }
    } catch (error) {
      showNotification('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'confirmed': return 'text-blue-600';
      case 'shipped': return 'text-purple-600';
      case 'delivered': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={tw`bg-white p-4 mb-2 rounded-lg shadow-sm`}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    >
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <Text style={tw`text-lg font-semibold`}>Order #{item.id.slice(-6)}</Text>
        <Text style={tw`${getStatusColor(item.status)} font-semibold capitalize`}>
          {item.status}
        </Text>
      </View>
      <Text style={tw`text-green-600 font-bold text-lg`}>
        ${Number(item.total_amount).toFixed(2)}
      </Text>
      <Text style={tw`text-gray-500 text-sm mt-1`}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50 p-4`}>
      <Text style={tw`text-2xl font-bold mb-4`}>My Orders</Text>
      {orders.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-gray-500 text-lg mb-2`}>No orders yet</Text>
          <Text style={tw`text-gray-400 text-center mb-4`}>Start supporting local growers!</Text>
          <TouchableOpacity
            style={tw`bg-green-500 px-6 py-3 rounded-lg`}
            onPress={() => navigation.navigate('Local')}
          >
            <Text style={tw`text-white font-semibold`}>Browse Local Produce</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default OrdersScreen;