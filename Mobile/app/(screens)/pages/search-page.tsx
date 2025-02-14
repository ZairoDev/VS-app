import "react-native-get-random-values";
import { View, Text, StyleSheet } from "react-native";

import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";


export default function SearchPage() {
  const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  console.log("API Key:", API_KEY);
  
  return (
    <View style={styles.container}>
     <View style={{height:200,position:"relative"}}>
      <GooglePlacesAutocomplete
        placeholder="Search"
        onPress={(data, details = null) => {
          console.log("google maps pe aata hua data", data);
          console.log("google maps pe aata hui details", data);
        }}
        query={{
          key: API_KEY,
          language: "en",
        }}
        styles={{
          container: {
            flex: 1,
            maxHeight: 200,
          },
          textInputContainer: {
            borderRadius: 5,
            borderWidth: 1,
            borderColor: "gray",
            paddingHorizontal: 10,
          },
          textInput: {
            height: 45,
            color: "#333",
            fontSize: 16,
          },
          listView: {
            zIndex:10,
            maxHeight:200,
            backgroundColor: "yellow",
            borderRadius: 5,
            elevation: 3, 
            marginTop: 5,
          },
          row: {
            padding: 10,
            height: 50,
            flexDirection: "row",
            alignItems: "center",

          },
        
          description: {
            color: "black",
            fontSize: 14,
          },
          poweredContainer: {
            display: "none",
          },
        }}
        />
        <Text style={{position:"absolute",top:70,left:10,zIndex:1,fontSize:17,fontWeight:300}}>Recent Searches</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  searchBar: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    elevation: 5,
  },
});
