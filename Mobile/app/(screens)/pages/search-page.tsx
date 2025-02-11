import { useState } from "react";
import {View,Text, StyleSheet } from "react-native"
import { TextInput } from "react-native-gesture-handler";
export default function SearchPage(){
    const [searchText, setSearchText] = useState('');

    return (
    <View style={styles.container}>
         <TextInput
           style={styles.searchBar}
           placeholder="Search..."
           autoFocus={true}
           value={searchText}
           onChangeText={setSearchText}
         />
    </View>
    )
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    searchBar: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
  });