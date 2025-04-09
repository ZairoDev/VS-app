
import "react-native-get-random-values";
import { useEffect, useState } from "react";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { router } from "expo-router";

export default function SearchPage() {
  const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const RECENT_SEARCHES_KEY = "recentsearch";

  const navigation = useNavigation();

  useEffect(() => {
    loadRecentSearch();
  }, []);
  const loadRecentSearch = async () => {
    try {
      const searches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (err) {
      console.log("error in loading searches", err);
    }
  };

  const saveSearch = async (query: string) => {
    try {
      let searches = [...recentSearches];

      searches = searches.filter((search) => search !== query);

      searches.unshift(query);

      if (searches.length > 5) {
        searches.pop();
      }

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (err) {
      console.log("error in saving searches", err);
    }
  };

  const removeSearch = async (query: string) => {
    try {
      const filteredSearches = recentSearches.filter(
        (search) => search !== query
      );
      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(filteredSearches)
      );
      setRecentSearches(filteredSearches);
    } catch (err) {
      console.log("error in recent Searches", err);
    }
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
         <GooglePlacesAutocomplete
          placeholder="Search for a place"
          onPress={(data) => {
            saveSearch(data.description);
          }}
          query={{
            key: API_KEY, 
            language: 'en',
          }}
          styles={{
            container: styles.autocompleteContainer,
            textInput: styles.searchInput,
            listView: styles.listView,
          }}
          enablePoweredByContainer={false}
          fetchDetails={true}
          debounce={300}
        />
        <TouchableOpacity style={styles.mapIcon} onPress={()=>router.push("/(screens)/pages/map")}>
      <FontAwesome name="map" size={20} color="black" />
    </TouchableOpacity>

      </View>

      <Text style={styles.recentSearches}>Recent Searches</Text>

      <FlatList
          data={recentSearches}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.recentSearchesContainer}
          renderItem={({ item }) => (
            <View style={styles.searchItem}>
              <Text style={styles.searchText}>{item}</Text>
              <TouchableOpacity onPress={() => removeSearch(item)}>
                <AntDesign name="delete" size={15} color="gray" />
              </TouchableOpacity>
            </View>
          )}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    searchContainer: {
      marginTop: 20,
      padding: 16,
      width:"100%",
      display:"flex",
      justifyContent:"center",
      borderBottomWidth: 1,
      flexDirection: 'row',
      borderBottomColor: '#eee',
    },
    autocompleteContainer: {
      flex: 1,
    },
    searchInput: {
      height: 50,
      maxWidth: '90%',
      borderRadius: 30,
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 20,
      fontSize: 16,
    },
    listView: {
      borderWidth: 0,
      backgroundColor: '#fff',
      marginTop: 8,
      borderRadius: 8,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    recentSearchesContainer: {
      flex: 1,
      paddingHorizontal: 16,
      maxHeight:"50%",
    },
    recentSearches:{
      fontSize: 18,
      marginTop:10,
      marginHorizontal:16,
    },
    mapIcon: {
    padding: 15,
    height: 50,
    width: 50,
    backgroundColor: "white",
    borderRadius: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    },
    
    searchText: {
      fontSize: 16,
      color: '#333',
      flex: 1,
    },
    searchItem: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          
         
          borderRadius: 5,
          marginTop: 5,
          overflow: "hidden",
        },
        header: {
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 5,
              paddingHorizontal: 20,
              height: "7%",
              backgroundColor: "white",
              elevation: 5,
            },
            headerTitle: {
              paddingLeft: 10,
              fontSize: 18,
              fontWeight: "bold",
            },
            
  });