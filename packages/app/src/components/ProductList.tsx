import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { IProduct } from '../../../shared/src';
import { useNavigation } from '@react-navigation/native';

interface ProductListProps {
  products: IProduct[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: IProduct }) => (
    <TouchableOpacity
      style={tw`p-4 border-b border-gray-200`}
      onPress={() => navigation.navigate('ProductDetails' as never, { productId: item.id } as never)}
    >
      <Text style={tw`text-lg font-bold`}>{item.name}</Text>
      <Text style={tw`text-green-600 font-semibold`}>${Number(item.price).toFixed(2)}</Text>
      <Text style={tw`text-gray-600 text-sm`} numberOfLines={2}>{item.description}</Text>
      <Text style={tw`text-gray-500 text-xs`}>Stock: {item.stock}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

export default ProductList;
