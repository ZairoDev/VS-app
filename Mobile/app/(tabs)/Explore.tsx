import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Switch,
  Image,
  FlatList,
  Pressable
} from "react-native";
import { useState ,useRef} from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import  {Countries} from "@/Constants/Country"
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Explore() {
  const [isEnabled, setIsEnabled] = useState(false);
  const[open,setOpen]=useState(false);
  const toggleSwitch = () => {
    setIsEnabled((prev) => !prev);
  };
 
  return (
    <SafeAreaView style={styles.mainContainer}>
      <FlatList
        data={[1]}
        renderItem={({ item }) => (
          <View style={styles.mainContainer}>
            <View style={styles.propertyContainer}>
              <View style={{position:"relative"}}>
              <Pressable >
              
              <Image
                
                style={styles.imageContainer}
                source={{
                  uri: "https://images.pexels.com/photos/22610592/pexels-photo-22610592/free-photo-of-view-of-green-trees-reflecting-in-a-body-of-water.jpeg?auto=compress&cs=tinysrgb&w=600",
                }}
              />
              </Pressable>
                
                <Ionicons style={{position:"absolute",top:10,left:"87%",backgroundColor:"rgba(0,0,0,0.3)", borderRadius:100,padding:4 }} size={20} name="heart-outline"/>
                
              </View>
              <Text style={{color:"gray",padding:2}}>1 beds</Text>
              <Text style={{fontSize:17,fontWeight:500,padding:2}}>VS ID - X3DQ0BS, Villa</Text>
              <Text style={{color:"gray",padding:2}}>
                <Ionicons name="location-outline" size={15} color="gray" />
                30019 Municipal Unit of Palairos Greece
              </Text>
            </View>
            <View style={styles.propertyContainer}>
              <View>
              <Image
                style={styles.imageContainer}
                source={{
                  uri: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=600",
                }}
              />
               <Ionicons style={{position:"absolute",top:10,left:"87%",backgroundColor:"rgba(0,0,0,0.3)", borderRadius:100,padding:4 }} size={20} name="heart-outline"/>
              </View>
              <Text style={{color:"gray",padding:2}}>1 beds</Text>
              <Text style={{fontSize:17,fontWeight:500,padding:2}}>VS ID - X3DQ0BS, Villa</Text>
              <Text style={{color:"gray",padding:2}}>
                <Ionicons name="location-outline" size={15} color="gray" />
                30019 Municipal Unit of Palairos Greece
              </Text>
            </View>
            <View style={styles.propertyContainer}>
              <View style={{position:"relative"}}>
              <Image
                style={styles.imageContainer}
                source={{
                  uri: "https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg?auto=compress&cs=tinysrgb&w=600",
                }}
              />
              <Ionicons style={{position:"absolute",top:10,left:"87%",backgroundColor:"rgba(0,0,0,0.3)", borderRadius:100,padding:4 }} size={20} name="heart-outline"/>
              </View>
              <Text style={{color:"gray",padding:2}}>1 beds</Text>
              <Text style={{fontSize:17,fontWeight:500,padding:2}}>VS ID - X3DQ0BS, Villa</Text>
              <Text style={{color:"gray",padding:2}}>
                <Ionicons name="location-outline" size={15} color="gray" />
                30019 Municipal Unit of Palairos Greece
              </Text>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.mainContainer}>
            <TextInput
              style={styles.input}
              placeholder="Start Search"
              placeholderTextColor={"gray"}
            />
            <View style={styles.switchContainer}>
              <Text style={{ fontSize: 15 }}>Tap for Long Term</Text>
              <Switch
                trackColor={{ false: "orange", true: "orange" }}
                style={styles.switch}
                thumbColor={"white"}
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
                </View>
              <View style={{flex:1,margin:8,marginTop:15}}>
                <FlatList
                  data={Countries}
                  keyExtractor={(item,index)=>index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({item})=>(
                    <View style={{flex:1,alignItems:"center"}} >
                      <Image source={{uri:item.imageUrl}} style={{width:100,height:100,margin:4,borderRadius:100}}/>
                      <Text>{item.name}</Text>
                    </View>
                  )} 
                />
              </View>  

             
            <View style={styles.featuredText}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Featured places to stay
              </Text>
              <Text style={{ color: "gray" }}>
                Popular places to stay that vacation saga suggests you.
              </Text>
            </View>
          </View>
        }
        
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff", // Original white background
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  input: {
    textAlign: "left",
    width: "75%", // Limit the width
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 20, // Rounded corners
    margin: 16,
    paddingLeft: 20,
    fontSize: 20,
    shadowColor: "#000",
    elevation: 10, // Slightly reduced shadow elevation for subtlety
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2, 
    flexShrink: 1,  // Prevent it from expanding beyond the container
    maxWidth: "100%", // Prevents it from overflowing
    overflow: 'hidden',
  },
  switchContainer: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    maxHeight: 50,
    justifyContent: "space-around",
    alignItems: "center",
  },
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
    height: 30,
  },
  featuredText: {
    width: "100%",
    padding: 20,
  },
  imageContainer: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  propertyContainer: {
    margin: 15,
  },
});
