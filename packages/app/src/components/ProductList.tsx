import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import tw from 'twrnc';
import { IProduct } from '../../../shared/src';

interface ProductListProps {
  products: IProduct[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {


  const renderItem = ({ item }: { item: IProduct }) => (
    <View style={tw`p-4 border-b border-gray-200`}>
      <Text style={tw`text-lg font-bold`}>{item.name}</Text>
      <Text style={tw`text-gray-600`}>Price: ${item.price}</Text>
      <Text style={tw`text-gray-600`}>Stock: {item.stock}</Text>
    </View>
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
