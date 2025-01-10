import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { View, Text } from 'react-native';

export default function Wishlist() {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://192.168.13.146:8000") // Replace with your machine's IP or emulator address
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <View>
      <Text>Response from API</Text>
      <Text>{data || "No data available"}</Text>
    </View>
  );
}
