import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, Image } from 'react-native';
import axios from 'axios';

import { Property } from "@/data/types";



export default function Booking() {
  
    const [properties, setProperties] = useState<Property[]>([]);
  const [isFetched,setIsfetched]=useState(false);

  useEffect(() => {
    if(!isFetched){
      fetchProperties();
      setIsfetched(true);
    }

  }, [isFetched]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get<{ success: boolean; data: Property[] }>(
        'http://192.168.1.163:5000/api/properties'
      );
      if (response.data.success) {
        setProperties(response.data.data);
      } else {
        console.error('Failed to fetch properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } 
  };



  return (
 
    <FlatList
    data={properties}
    keyExtractor={(item) => item._id}
    renderItem={({ item }) => (
      <View>
        <Image source={{ uri: item.propertyCoverFileUrl }} style={{ height: 200, width: '100%' }} />
        <View>
          <Text>{item.propertyName}</Text>
          <Text>{item.placeName}</Text>
          <Text>{item.city}, {item.state}, {item.country}</Text>
          <Text>Guests: {item.guests}</Text>
          <Text>Price: {item.basePrice}</Text>
        </View>
      </View>
    )}
  />
  );
};


