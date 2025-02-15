import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import axios from "axios";
import { Link, Route, router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import { Countries } from "@/Constants/Country";
import { PropertyInterface } from "@/data/types";
import { propertyTypes } from "@/Constants/Country";
import  useStore  from "@/store/filter-store";

export interface FetchPropertiesRequest {
  skip: number;
  limit: number;
  selectedCountry: string[];
  propertyType: string[];
  beds:number
  bedrooms:number
  bathroom:number
  allowCooking:boolean
  isEnabled:boolean
  allowParty:boolean
  allowPets:boolean
}

export interface FetchPropertiesResponse {
  status?: number;
  error?: string;
  data: PropertyInterface[];
}

enum SelectedType {
  COUNTRY="country",
  PROPERTY_TYPE="propertyType",
  BEDS="beds",
  BEDROOMS="bedrooms",
  BATHROOMS="bathroom"
}

export default function Index() {
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
;
  const [propertyType, setPropertyType] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string[]>([]);
  const [properties, setProperties] = useState<PropertyInterface[]>([]);

  const {beds,bathroom,bedrooms,allowCooking,allowParty,allowPets,isEnabled,minPrice,maxPrice,handleCount,applyFilters} = useStore();

  const fetchProperties = async () => {
    try {
      setLoading(true);    
      console.log("process: ", process.env.EXPO_PUBLIC_BASE_URL);
      console.log("store se aate hue beds,bathrooms aur bedrooms",{beds,bathroom,bedrooms})
      const requestBody: FetchPropertiesRequest = {
        skip,
        limit,
        selectedCountry,
        propertyType,
        beds,
        bedrooms,
        bathroom,
        isEnabled,
        allowCooking,
        allowParty,
        allowPets
       
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

  


  useEffect(()=>{
    setProperties([]);
    setSkip(0);
  },[applyFilters]);
  // },[beds,bedrooms,bathroom,isEnabled,allowCooking,allowParty,allowPets]);



  useEffect(() => {
    fetchProperties();
  }, [skip, propertyType, selectedCountry,beds,bathroom,bedrooms,isEnabled]);

  useEffect(() => {
    console.log("property array: ", properties.length);
  }, [properties]);



  

  
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
              <Text style={{ color: "black" ,fontWeight:400 ,fontSize:14 ,borderTopWidth:1,borderTopColor:"gray",  }}>€{item.basePrice}/night {item.cooking},{item.party},{item.pet}</Text>
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
                onPress={() => router.push("/(screens)/pages/search-page")}
              >
                <Ionicons name="search" size={24} color={"gray"} />
                <Text style={styles.input}>Start Search</Text>
              </Pressable>
              <TouchableOpacity onPress={()=>router.push("/(screens)/pages/filter-page")}>
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
    fontWeight: "500", 
    color: "gray",
    flex: 1, 
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
    borderColor: "orange",
    fontWeight: 700,
    borderWidth: 2,
  },
  selectedPropertyTypeText: {
    color: "white",
    
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
    display: "flex",
    borderRadius: 20,
    borderWidth: 2,

  },
  header: {
    width: "100%",
    height: 50,
    display: "flex",
    padding: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    borderRadius: 10,
    backgroundColor: "orange"
  },
  container: {
    width: "100%",
    margin: 16,
    paddingHorizontal: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputDiv: {
    height: 50,
    backgroundColor: "#f0f0f0", 
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
