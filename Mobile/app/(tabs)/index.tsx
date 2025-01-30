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
import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch } from "react-native-paper";
import { Countries } from "@/Constants/Country";
import { PropertyInterface } from "@/data/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { propertyTypes } from "@/Constants/Country";
import { Modalize } from "react-native-modalize";

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
  const [loading, setLoading] = useState(false);
  const [isBottomsheetVisible, setBottomsheetVisible] = useState(false);
  const [propertyType, setPropertyType] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string[]>([]);
  const [properties, setProperties] = useState<PropertyInterface[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);

  const modalizeRef = useRef<Modalize>(null);

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

  const openBottomSheet = () => {
    modalizeRef.current?.open();
  };

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

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
            <View style={styles.inputDiv}>
              <Pressable
                style={{
                  width: "80%",
                  height:50,
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
              <TouchableOpacity onPress={openBottomSheet}>
                <Ionicons name="options" size={24} color={"gray"} />
              </TouchableOpacity>
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
                    }>
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
      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        childrenStyle={{ height: 200 }}
        onClose={() => setBottomsheetVisible(false)}
        onOpen={() => setBottomsheetVisible(true)}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            margin: 20,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "400" }}>
            {isEnabled ? "Slide for Short term" : "Slide for Long term"}
          </Text>
          <Switch
            trackColor={{ false: "orange", true: "orange" }}
            thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
            onChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </Modalize>
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
    width: "90%",
    backgroundColor: "blue",
    // maxHeight: 50,
    display: "flex",
    borderRadius: 20,
    // flexDirection:"row"
    borderWidth: 2,
    // backgroundColor:"yellow",
  },
  header: {
    width: "100%",
    height: 50,
    display: "flex",
    padding: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    borderRadius: 10,
    backgroundColor: "orange",

    // alignItems: "center",
  },
  container: {
    width: "100%",

    margin: 16,
    // backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    // borderWidth:3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
