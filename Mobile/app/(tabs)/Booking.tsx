import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Booking = () => {
  const logAllStorage = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    console.log("🔍 AsyncStorage Content:");
    result.forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
  };

  useEffect(() => {
    logAllStorage();
  }, []);

  return (
    <View>
      <Text>Booking</Text>
    </View>
  )
}

export default Booking