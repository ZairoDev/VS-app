import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GooglePlacesInput from '@/components/GooglePlacesInput';
import { useNavigation } from '@react-navigation/native';

const RECENT_SEARCHES_KEY = 'recentsearch';


const SearchPage = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (data) setRecentSearches(JSON.parse(data));
    } catch (err) {
      console.error('❌ Error loading recent searches:', err);
    }
  };

  const saveSearch = async (query: string) => {
    try {
      const updated = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 5);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (err) {
      console.error('❌ Error saving search:', err);
    }
  };

  const removeSearch = async (query: string) => {
    try {
      const updated = recentSearches.filter((item) => item !== query);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (err) {
      console.error('❌ Error removing search:', err);
    }
  };

  const handlePlaceSelected = (place: { name: string; address: string }) => {
    saveSearch(place.name);
    Alert.alert('Selected Location', `${place.name}\n${place.address}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <GooglePlacesInput onPlaceSelected={handlePlaceSelected} apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!} />
      </View>

      <Text style={styles.recentTitle}>Recent Searches</Text>
      <FlatList
        data={recentSearches}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.searchItem}>
            <TouchableOpacity onPress={() => handlePlaceSelected({ name: item, address: '' })}>
              <Text style={styles.searchText}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeSearch(item)}>
              <AntDesign name="delete" size={16} color="gray" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No recent searches</Text>
        }
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 16,
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  searchText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});

export default SearchPage;
