import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  Linking,
} from "react-native";
import axios from "axios";
import { Link, Route, router } from "expo-router";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { Countries } from "@/Constants/Country";
import { PropertyInterface } from "@/data/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { propertyTypes } from "@/Constants/Country";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { AnimatedView } from "react-native-reanimated/lib/typescript/component/View";

export interface FetchPropertiesRequest {
  skip: number;
  limit: number;
  selectedCountry: string[];
  propertyType: string[];
}

export interface FetchPropertiesResponse {
  status?: number;
  error?: string;
  data: PropertyInterface[];
}

enum SelectedType {
  COUNTRY = "country",
  PROPERTY_TYPE = "propertyType",
}

export default function Index() {
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [propertyType, setPropertyType] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string[]>([]);
  const [properties, setProperties] = useState<PropertyInterface[]>([]);

  const height = useSharedValue(60);
  const opacity = useSharedValue(0);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log("process: ", process.env.EXPO_PUBLIC_BASE_URL);

      const requestBody: FetchPropertiesRequest = {
        skip,
        limit,
        selectedCountry,
        propertyType,
      };

      const response = await axios.post<FetchPropertiesResponse>(
        `${process.env.EXPO_PUBLIC_BASE_URL}/properties/getAllProperties`,
        requestBody
      );
      console.log("response", response.data.data.length);
      setProperties((prev) => [...prev, ...response.data.data]);
    } catch (err) {
      console.log("err in explore page: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (type: string, value: string) => {
    setProperties([]);
    setSkip(0);
    if (type === SelectedType.COUNTRY) {
      setSelectedCountry((prev) =>
        prev.includes(value)
          ? prev.filter((countryId) => countryId !== value)
          : [...prev, value]
      );
    } else if (type === SelectedType.PROPERTY_TYPE) {
      setPropertyType((prev) =>
        prev.includes(value)
          ? prev.filter((propertyType) => propertyType !== value)
          : [...prev, value]
      );
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [skip, propertyType, selectedCountry]);

  useEffect(() => {
    console.log("property array: ", properties.length);
  }, [properties]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      height: height.value,
      overflow: "hidden",
    };
  });

  const filterOpacity = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const toggleExpand = () => {
    if (expanded) {
      height.value = withTiming(60, { duration: 300, easing: Easing.ease });
      opacity.value = withTiming(0, { duration: 200 });
    } else {
      height.value = withTiming(200, { duration: 300, easing: Easing.ease });
      opacity.value = withTiming(1, { duration: 200 });
    }
    setExpanded(!expanded);
  };
  // const skeleton = () => (
  //   <View
  //     style={{
  //       display: "flex",
  //       marginTop: 10,
  //       backgroundColor: "#fff",
  //       alignItems: "center",
  //       width: "100%",
  //       height: "100%",
  //     }}
  //   >
  //     <View
  //       style={{
  //         width: 300,
  //         height: 300,
  //         backgroundColor: "#e0e0e0",
  //         borderRadius: 10,
  //         marginRight: 10,
  //       }}
  //     />
  //     <View style={{ width: 300, height: 300 }}>
  //       <View
  //         style={{
  //           width: 100,
  //           height: 15,
  //           backgroundColor: "#e0e0e0",
  //           borderRadius: 5,
  //           marginTop: 10,
  //         }}
  //       />
  //       <View
  //         style={{
  //           width: 150,
  //           height: 15,
  //           backgroundColor: "#e0e0e0",
  //           borderRadius: 5,
  //           marginTop: 10,
  //         }}
  //       />
  //       <View
  //         style={{
  //           width: 200,
  //           height: 15,
  //           backgroundColor: "#e0e0e0",
  //           borderRadius: 5,
  //           marginTop: 10,
  //         }}
  //       />
  //     </View>
  //     <View
  //       style={{
  //         width: 300,
  //         height: 300,
  //         backgroundColor: "#e0e0e0",
  //         borderRadius: 10,
  //         marginRight: 10,
  //       }}
  //     />
  //     <View style={{ width: 300, height: 300 }}>
  //       <View
  //         style={{
  //           width: 100,
  //           height: 15,
  //           backgroundColor: "#e0e0e0",
  //           borderRadius: 5,
  //           marginTop: 10,
  //         }}
  //       />
  //       <View
  //         style={{
  //           width: 150,
  //           height: 15,
  //           backgroundColor: "#e0e0e0",
  //           borderRadius: 5,
  //           marginTop: 10,
  //         }}
  //       />
  //       <View
  //         style={{
  //           width: 200,
  //           height: 15,
  //           backgroundColor: "#e0e0e0",
  //           borderRadius: 5,
  //           marginTop: 10,
  //         }}
  //       />
  //     </View>
  //     <View
  //       style={{
  //         width: 300,
  //         height: 300,
  //         backgroundColor: "#e0e0e0",
  //         borderRadius: 10,
  //         marginRight: 10,
  //       }}
  //     />
  //     <View style={{ width: 300, height: 300 }}>
  //       <View
  //         style={{
  //           width: 100,
  //           height: 15,
  //           backgroundColor: "#e0e0e0",
  //           borderRadius: 5,
  //           marginTop: 10,
  //         }}
  //       />
  //       <View
  //         style={{
  //           width: 150,
  //           height: 15,
  //           backgroundColor: "#e0e0e0",
  //           borderRadius: 5,
  //           marginTop: 10,
  //         }}
  //       />
  //       <View
  //         style={{
  //           width: 200,
  //           height: 15,
  //           backgroundColor: "#e0e0e0",
  //           borderRadius: 5,
  //           marginTop: 10,
  //         }}
  //       />
  //     </View>
  //   </View>
  // );

  // const searchModal = () => {
  //   return (
  //     <View
  //     style={{flex: 1,
  //       justifyContent: 'center',
  //       alignItems: 'center',}}

  //     >
  //       <Modal
  //         animationType="slide"
  //         transparent={true}
  //         onRequestClose={() => setModalVisible(false)}
  //         visible={isModalVisible}
  //       >
  //         <View style={{
  //         marginTop:"20%",
  //         marginHorizontal:30,
  //         backgroundColor: "white",
  //         borderRadius: 20,
  //         padding: 35,
  //         alignItems: "center",
  //         shadowColor: "#000",

  //         shadowOpacity: 0.25,
  //         shadowRadius: 4,
  //         elevation: 5,
  //       }}>
  //           <Text>This is your frieend aniket</Text>
  //         </View>
  //       </Modal>
  //     </View>
  //   );
  // };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <FlatList
        data={properties}
        keyExtractor={(item) =>
          `${item._id.toString()}${Math.random().toFixed(5)}`
        }
        renderItem={({ item }) => (
          <View style={styles.mainContainer}>
            <View style={styles.propertyContainer}>
              <View style={styles.imageWrapper}>
                <Link href={`/(screens)/property-info/${item._id}` as Route}>
                  <Image
                    style={styles.imageContainer}
                    source={{
                      uri:
                        item.propertyCoverFileUrl &&
                        item.propertyCoverFileUrl !== ""
                          ? item.propertyCoverFileUrl
                          : "https://vacationsaga.b-cdn.net/assets/suitcase.png",
                    }}
                  />
                </Link>

                <Ionicons
                  style={styles.icon}
                  size={20}
                  name="heart-outline"
                  color={"white"}
                />
              </View>
              <Text style={styles.propertyText}>{item.beds} beds</Text>
              <Text style={styles.propertyTitle}>
                VS ID - {item.VSID}, {item?.propertyType}
              </Text>
              <Text style={styles.locationText} numberOfLines={1}>
                <Ionicons name="location-outline" size={15} color="gray" />
                {item.postalCode}, {item.city}, {item.state}
              </Text>
            </View>
          </View>
        )}
        onEndReached={() => {
          setSkip((prev) => prev + 10);
        }}
        onEndReachedThreshold={0.7}
        ListHeaderComponent={
          <View style={styles.mainContainer}>
            {/* <View style={styles.inputDiv}> */}
            {/* <Animated.View style={[styles.accordion, animatedStyles]}>
              <Pressable
                style={{
                  width: "80%",
                  height: 50,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onPress={() => router.push("/(screens)/search-page")}
              >
                <Ionicons name="search" size={24} color={"gray"} />
                <Text style={styles.input}>Start Search</Text>
              </Pressable>
              <TouchableOpacity onPress={toggleExpand}>
                <Ionicons name="options" size={24} color={"gray"} />
              </TouchableOpacity>

              <Animated.View style={[styles.filtersContainer, filterOpacity]}>
                <Text style={styles.filterText}>Filter 1</Text>
                <Text style={styles.filterText}>Filter 2</Text>
                <Text style={styles.filterText}>Filter 3</Text>
              </Animated.View>
            </Animated.View>
            </View> */}
            <View style={styles.container}>
              <View style={{display:"flex",flexDirection:"row"}}>
                <Animated.View style={[styles.accordion, animatedStyles]}>
                  
                  <View
                    
                    style={styles.header}
                  >
                    <TouchableOpacity onPress={toggleExpand}>
                    <Ionicons name="options" size={24} color={"black"} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity>
                    <Ionicons name="search" size={24} color={"black"} />
                  </TouchableOpacity>
                  </View>
                  

                  <Animated.View
                    style={[styles.filtersContainer, filterOpacity]}
                  >
                    <Text style={styles.filterText}>Filter 1</Text>
                    <Text style={styles.filterText}>Filter 2</Text>
                    <Text style={styles.filterText}>Filter 3</Text>
                  </Animated.View>
                </Animated.View>
                
              </View>
            </View>

            <FlatList
              style={styles.horizontalList}
              data={Countries}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedCountry.includes(item.name);
                return (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() =>
                      handleSelect(SelectedType.COUNTRY, item.name)
                    }
                  >
                    <Image
                      source={{
                        uri:
                          item.imageUrl ??
                          "https://picsum.photos/seed/picsum/200/300",
                      }}
                      style={[
                        styles.countryImage,
                        isSelected && styles.selectedcountryimage,
                      ]}
                    />
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                );
              }}
            />
            <FlatList
              style={styles.propertyTypeList}
              data={propertyTypes}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.propertyTypeContainer}
              renderItem={({ item }) => {
                const isSelected = propertyType.includes(item.name);
                return (
                  <TouchableOpacity
                    onPress={() =>
                      handleSelect(SelectedType.PROPERTY_TYPE, item.name)
                    }
                  >
                    <View
                      style={[
                        styles.propertyTypeItem,
                        isSelected && styles.selectedPropertyTypeItem,
                      ]}
                    >
                      {item.icon(isSelected ? "white" : "gray")}
                      <Text
                        style={[
                          styles.propertyTypeText,
                          isSelected && styles.selectedPropertyTypeText,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        }
      />
      {/* {isModalVisible && searchModal()} */}
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
  input: {
    fontSize: 18,
    fontWeight: "500", // Corrected font weight
    color: "gray",
    flex: 1, // Allow text to take available space
    textAlign: "center",
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
    borderWidth: 0.3,
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
    flexWrap: "wrap",
    maxWidth: "80%",
    color: "gray",
    padding: 2,
  },
  selectedcountryimage: {
    width: 100,
    height: 100,
    marginBottom: 4,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "orange",
  },
  selectedPropertyTypeItem: {
    backgroundColor: "orange",
    // backgroundColor: "white",
    borderColor: "orange",
    fontWeight: 700,
    borderWidth: 2,
  },
  selectedPropertyTypeText: {
    color: "white",
    // fontWeight: 500,
  },
  filtersContainer: {
    padding: 10,
    borderWidth: 4,
    borderColor: "pink",
  },
  filterText: {
    fontSize: 16,
    marginVertical: 5,
  },
  accordion: {
    width:"90%",
    backgroundColor: "#f0f0f0",
    height: "auto",
    display: "flex",
    borderWidth:1,
    // flexDirection:"row"
  },
  header: {
    width:"100%",
    height: 50,
    display:"flex",

    justifyContent: "space-between",
    flexDirection:"row",
    // alignItems: "center",
    borderWidth: 1,
    borderColor: "blue",
  },
  container:{
    width:"100%",
    margin:16,
    // backgroundColor: "#f0f0f0",
    paddingHorizontal:10, 
    
    display:"flex",
    alignItems:"center",     
    justifyContent:"center",
  },
  inputDiv: {
    
    height: 50,
    backgroundColor: "#f0f0f0", // Softer background color
    borderRadius: 15,
    margin: 16,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "lightgray",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  
});
