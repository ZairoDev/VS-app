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
  Pressable,
} from "react-native";
import { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { Countries } from "@/Constants/Country";
import { propertyTypes } from "@/Constants/Country";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import axios from 'axios';
export default function Explore() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  
  const toggleSwitch = () => {
    setIsEnabled((prev) => !prev);
  };
  const router = useRouter();
  const handleImageTap = () => {
    router.push('/(screens)/PropertyInfo');
  };
  
  


  return (
    <SafeAreaView style={styles.mainContainer}>
      <FlatList
        data={[1]}
        renderItem={({ item }) => (
          <View style={styles.mainContainer}>
            <View style={styles.propertyContainer}>
              <View style={styles.imageWrapper}>
                <Pressable onPress={handleImageTap} hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <Image
                    style={styles.imageContainer}
                    source={{
                      uri: "https://images.unsplash.com/photo-1544952019-734321a2a151?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zmxvd2VyJTIwdmFsbGV5fGVufDB8fDB8fHww",
                    }}
                  />
                </Pressable>

                <Ionicons
                  style={styles.icon}
                  size={20}
                  name="heart-outline"
                  color={"white"}
                />
              </View>
              <Text style={styles.propertyText}>1 beds</Text>
              <Text style={styles.propertyTitle}>
                VS ID - X3DQ0BS, Villa
              </Text>
              <Text style={styles.locationText}>
                <Ionicons name="location-outline" size={15} color="gray" />
                30019 Municipal Unit of Palairos Greece
              </Text>
            </View>
            <View style={styles.propertyContainer}>
              <View style={styles.imageWrapper}>
                <Image
                  style={styles.imageContainer}
                  source={{
                    uri: "https://cdn.pixabay.com/photo/2018/05/16/17/40/tulips-3406530_1280.jpg",
                  }}
                />
                <Ionicons
                  style={styles.icon}
                  size={20}
                  name="heart-outline"
                  color={"white"}
                />
              </View>
              <Text style={styles.propertyText}>1 beds</Text>
              <Text style={styles.propertyTitle}>
                VS ID - X3DQ0BS, Villa
              </Text>
              <Text style={styles.locationText}>
                <Ionicons name="location-outline" size={15} color="gray" />
                30019 Municipal Unit of Palairos Greece
              </Text>
            </View>
            <View style={styles.propertyContainer}>
              <View style={styles.imageWrapper}>
                <Image
                  style={styles.imageContainer}
                  source={{
                    uri: "https://img.freepik.com/free-photo/view-beautiful-blooming-roses_23-2150718897.jpg?t=st=1736506501~exp=1736510101~hmac=85f18cdc7f74a8956c6ea11793b7f77dffdca04b83b087a65c3814f412bbde47&w=996",
                  }}
                />
                <Ionicons
                  style={styles.icon}
                  size={20}
                  name="heart-outline"
                  color={"white"}
                />
              </View>
              <Text style={styles.propertyText}>1 beds</Text>
              <Text style={styles.propertyTitle}>
                VS ID - X3DQ0BS, Villa
              </Text>
              <Text style={styles.locationText}>
                <Ionicons name="location-outline" size={15} color="gray" />
                30019 Municipal Unit of Palairos Greece
              </Text>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.mainContainer}>
            <View style={styles.inputDiv}>
              <Ionicons name="search" size={24} color={"gray"} />
              <TextInput
                style={styles.input}
                placeholder="Start Search"
                placeholderTextColor={"gray"}
              />
              <Ionicons name="options" size={24} color={"gray"} />
            </View>

            <FlatList
              style={styles.horizontalList}
              data={Countries}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.countryItem}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.countryImage}
                  />
                  <Text>{item.name}</Text>
                </View>
              )}
            />

            <FlatList
              style={styles.propertyTypeList}
              data={propertyTypes}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.propertyTypeContainer}
              renderItem={({ item }) => (
                <View style={styles.propertyTypeItem}>
                  {item.icon}
                  <Text style={styles.propertyTypeText}>{item.name}</Text>
                </View>
              )}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  inputDiv: {
    textAlign: "left",
    width: "90%",
    height: 50,
    backgroundColor: "#e5e4e2",
    borderRadius: 15,
    margin: 16,
    fontSize: 15,
    paddingHorizontal: 10,
    shadowColor: "#000",
    elevation: 10,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    flexShrink: 1,
    maxWidth: "88%",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 2,
  },
  input: {
    textAlign: "left",
    width: "75%",
    height: 50,
    backgroundColor: "#e5e4e2",
    borderRadius: 15,
    margin: 16,
    paddingLeft: 20,
    fontSize: 15,
    flexShrink: 1,
    maxWidth: "100%",
    overflow: "hidden",
  },
  horizontalList: {
    padding: 8,
    height: 140,
  },
  countryItem: {
    alignItems: "center",
    paddingHorizontal: 2,
  },
  countryImage: {
    width: 100,
    height: 100,
    marginBottom: 4,
    borderRadius: 100,
  },
  propertyTypeList: {
    paddingLeft: 20,
  },
  propertyTypeContainer: {
    paddingRight: 20,
  },
  propertyTypeItem: {
    borderColor: "black",
    borderWidth: 1,
    flex: 1,
    height: 32,
    width: "auto",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#e5e4e2",
    padding: 4,
    rowGap: 4,
    margin: 4,
  },
  propertyTypeText: {
    margin: 2,
  },
  icon: {
    position: "absolute",
    top: 10,
    left: "87%",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 100,
    padding: 4,
  },
  imageWrapper: {
    position: "relative",
  },
  imageContainer: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  propertyContainer: {
    margin: 15,
  },
  propertyText: {
    color: "gray",
    padding: 2,
  },
  propertyTitle: {
    fontSize: 17,
    fontWeight: 500,
    padding: 2,
  },
  locationText: {
    color: "gray",
    padding: 2,
  },
});
