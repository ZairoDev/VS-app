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
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GooglePlacesTextInput from 'react-native-google-places-textinput';


export default function SearchPage() {
  const API_KEY =process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const RECENT_SEARCHES_KEY = "recentsearch";
  const navigation = useNavigation();

 

  useEffect(() => {
    console.log("🔁 useEffect - loading recent searches");
    loadRecentSearch();
  }, []);

  const loadRecentSearch = async () => {
    try {
     
      const searches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (searches) {
        const parsed = JSON.parse(searches);
       
        setRecentSearches(parsed);
      } else {
        console.log("ℹ️ No recent searches found.");
      }
    } catch (err) {
      
      Alert.alert("Error", "Could not load recent searches.");
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
      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(searches)
      );
      setRecentSearches(searches);
    
    } catch (err) {
      
      Alert.alert("Error", "Could not save your search.");
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
      console.log("✅ Search removed. Updated list:", filteredSearches);
    } catch (err) {
     
      Alert.alert("Error", "Could not remove search from history.");
    }
  };
  const handlePlaceSelect = (place: any) => {
    console.log('Selected place:', place);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            console.log("🔙 Back button pressed");
            navigation.goBack();
          }}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
       
         <GooglePlacesTextInput
      apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!}
     
      onPlaceSelect={handlePlaceSelect}
    />


      </View>

      <Text style={styles.recentSearchesTitle}>Recent Searches</Text>

      <FlatList
        data={recentSearches}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.recentSearchesContainer}
        renderItem={({ item }) => {
         
          return (
            <TouchableOpacity
              onPress={() => {
                
                saveSearch(item);
                Alert.alert("Re-searching", `You searched for: ${item}`);
              }}
              style={styles.searchItem}
            >
              <Text style={styles.searchText}>{item}</Text>
              <TouchableOpacity
                onPress={() => {
                  
                  removeSearch(item);
                }}
              >
                <AntDesign name="delete" size={15} color="gray" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => {
          
          return (
            <Text style={styles.noRecentSearchesText}>
              No recent searches yet.
            </Text>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  searchContainer: {
    marginTop: 20,
    padding: 16,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    borderBottomColor: "#eee",
  },
  autocompleteContainer: {
    flex: 1,
  },
  searchInput: {
    height: 50,
    maxWidth: "90%",
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    fontSize: 16,
  },
  listView: {
    borderWidth: 0,
    backgroundColor: "#fff",
    marginTop: 8,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recentSearchesContainer: {
    flexGrow: 1, 
    paddingHorizontal: 16,
  },
  recentSearchesTitle: { 
    fontSize: 18,
    marginTop: 10,
    marginHorizontal: 16,
    fontWeight: "bold", 
  },
  
  searchText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  searchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 20,
    height: "7%",
    backgroundColor: "white",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    paddingLeft: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  noRecentSearchesText: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});