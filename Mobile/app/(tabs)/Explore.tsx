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

export default function Explore() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [open, setOpen] = useState(false);
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
              <View style={{ position: "relative" }}>
                <Pressable>
                  <Image
                    style={styles.imageContainer}
                    source={{
                      uri: "https://images.unsplash.com/photo-1544952019-734321a2a151?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zmxvd2VyJTIwdmFsbGV5fGVufDB8fDB8fHww",
                    }}
                  />
                </Pressable>

                <Ionicons
                  style={{
                    position: "absolute",
                    top: 10,
                    left: "87%",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    borderRadius: 100,
                    padding: 4,
                  }}
                  size={20}
                  name="heart-outline"
                  color={"white"}
                />
              </View>
              <Text style={{ color: "gray", padding: 2 }}>1 beds</Text>
              <Text style={{ fontSize: 17, fontWeight: 500, padding: 2 }}>
                VS ID - X3DQ0BS, Villa
              </Text>
              <Text style={{ color: "gray", padding: 2 }}>
                <Ionicons name="location-outline" size={15} color="gray" />
                30019 Municipal Unit of Palairos Greece
              </Text>
            </View>
            <View style={styles.propertyContainer}>
              <View>
                <Image
                  style={styles.imageContainer}
                  source={{
                    uri: "https://cdn.pixabay.com/photo/2018/05/16/17/40/tulips-3406530_1280.jpg",
                  }}
                />
                <Ionicons
                  style={{
                    position: "absolute",
                    top: 10,
                    left: "87%",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    borderRadius: 100,
                    padding: 4,
                  }}
                  size={20}
                  name="heart-outline"
                  color={"white"}
                />
              </View>
              <Text style={{ color: "gray", padding: 2 }}>1 beds</Text>
              <Text style={{ fontSize: 17, fontWeight: 500, padding: 2 }}>
                VS ID - X3DQ0BS, Villa
              </Text>
              <Text style={{ color: "gray", padding: 2 }}>
                <Ionicons name="location-outline" size={15} color="gray" />
                30019 Municipal Unit of Palairos Greece
              </Text>
            </View>
            <View style={styles.propertyContainer}>
              <View style={{ position: "relative" }}>
                <Image
                  style={styles.imageContainer}
                  source={{
                    uri: "https://img.freepik.com/free-photo/view-beautiful-blooming-roses_23-2150718897.jpg?t=st=1736506501~exp=1736510101~hmac=85f18cdc7f74a8956c6ea11793b7f77dffdca04b83b087a65c3814f412bbde47&w=996",
                  }}
                />
                <Ionicons
                  style={{
                    position: "absolute",
                    top: 10,
                    left: "87%",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    borderRadius: 100,
                    padding: 4,
                  }}
                  size={20}
                  name="heart-outline"
                  color={"white"}
                />
              </View>
              <Text style={{ color: "gray", padding: 2 }}>1 beds</Text>
              <Text style={{ fontSize: 17, fontWeight: 500, padding: 2 }}>
                VS ID - X3DQ0BS, Villa
              </Text>
              <Text style={{ color: "gray", padding: 2 }}>
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
                style={{ width: "75%" }}
                placeholder="Start Search"
                placeholderTextColor={"gray"}
              />
            </View>
            {/* <View style={styles.switchContainer}>
              <Text style={{ fontSize: 15 }}>Tap for Long Term</Text>
              <Switch
                trackColor={{ false: "orange", true: "orange" }}
                style={styles.switch}
                thumbColor={"white"}
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View> */}

            <FlatList
              style={{ padding: 8, height: 140 }}
              data={Countries}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={{ alignItems: "center", paddingHorizontal: 2 }}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{
                      width: 100, // Adjusted size for better proportion
                      height: 100,
                      marginBottom: 4,
                      borderRadius: 100,
                    }}
                  />
                  <Text>{item.name}</Text>
                </View>
              )}
            />

            {/* <View style={styles.featuredText}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Featured places to stay
              </Text>
              <Text style={{ color: "gray" }}>
                Popular places to stay that vacation saga suggests you.
              </Text>
            </View> */}
            <FlatList
              style={{
                paddingLeft: 20,
              }}
              data={propertyTypes}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingRight: 20,
              }}
              renderItem={({ item }) => (
                <View
                  style={{
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
                  }}
                >
                  {item.icon}
                  <Text style={{ margin: 2 }}>{item.name}</Text>
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
    backgroundColor: "#fff", // Original white background
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  inputDiv: {
    textAlign: "left",
    width: "90%", // Limit the width
    height: 50,
    backgroundColor: "#e5e4e2",
    borderRadius: 15, // Rounded corners
    margin: 16,
    fontSize: 15,
    paddingHorizontal: 10,
    shadowColor: "#000",
    elevation: 10, // Slightly reduced shadow elevation for subtlety
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    flexShrink: 1, // Prevent it from expanding beyond the container
    maxWidth: "88%", // Prevents it from overflowing
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 2,
  },
  input: {
    textAlign: "left",
    width: "90%", // Limit the width
    height: 50,
    backgroundColor: "#e5e4e2",
    borderRadius: 15, // Rounded corners
    margin: 16,
    paddingLeft: 20,
    fontSize: 15,
    shadowColor: "#000",
    elevation: 10, // Slightly reduced shadow elevation for subtlety
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    flexShrink: 1, // Prevent it from expanding beyond the container
    maxWidth: "100%", // Prevents it from overflowing
    overflow: "hidden",
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
