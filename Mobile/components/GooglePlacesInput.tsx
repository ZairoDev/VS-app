import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import debounce from 'lodash.debounce';

interface Prediction {
  description: string;
  place_id: string;
}

interface PlaceDetails {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface GooglePlacesInputProps {
  onPlaceSelected: (place: PlaceDetails) => void;
  placeholder?: string;
  apiKey: string;
}

const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  onPlaceSelected,
  placeholder = 'Search for a place',
  apiKey,
}) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (text: string) => {
    console.log("⌨️ Input changed:", text);
    setInput(text);
  };

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input: text,
            key: apiKey,
            language: 'en',
          },
        }
      );

      setLoading(false);
      if (response.data.status === 'OK') {
        setSuggestions(response.data.predictions);
      } else {
        console.warn('⚠️ Autocomplete error:', response.data.status, response.data.error_message);
        setSuggestions([]);
      }
    } catch (error: any) {
      setLoading(false);
      console.error('❌ Autocomplete API error:', error.message);
    }
  };

  const debouncedFetch = debounce(fetchSuggestions, 300);

  useEffect(() => {
    debouncedFetch(input);
    return () => debouncedFetch.cancel();
  }, [input]);

  const handleSelect = async (item: Prediction) => {
    setInput(item.description);
    setSuggestions([]);

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: item.place_id,
            key: apiKey,
            fields: 'geometry,formatted_address,name',
          },
        }
      );

      const result = response.data.result;
      const details: PlaceDetails = {
        name: result.name,
        address: result.formatted_address,
        location: result.geometry.location,
      };

      // console.log("📍 Selected place details:", details);
      onPlaceSelected(details);
    } catch (error: any) {
      console.error('❌ Place details API error:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={input}
        onChangeText={handleChange}
      />
      {loading && <ActivityIndicator size="small" color="#888" style={{ marginTop: 10 }} />}
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
            <Text>{item.description}</Text>
          </TouchableOpacity>
        )}
        style={styles.suggestions}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  suggestions: {
    marginTop: 5,
    borderColor: '#eee',
    borderWidth: 1,
    maxHeight: 200,
    backgroundColor: '#fff',
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});

export default GooglePlacesInput;
