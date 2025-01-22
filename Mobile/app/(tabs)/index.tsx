import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import FastImage from "react-native-fast-image";
import axios from "axios";
import { Link, Route } from "expo-router";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { PropertyInterface } from "@/data/types";
import { Countries } from "@/Constants/Country";
import Ionicons from "@expo/vector-icons/Ionicons";
import { propertyTypes } from "@/Constants/Country";
import Carousel from "react-native-reanimated-carousel";
import { ScrollView } from "react-native-gesture-handler";

export default function Index() {
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<PropertyInterface[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string[]>([]);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string[]>([]);

  const handleSelectCountry = (id: string) => {
    setSelectedCountry((prev) =>
      prev.includes(id)
        ? prev.filter((countryId) => countryId !== id)
        : [...prev, id]
    );
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/properties/getAllProperties`,
        {
          skip,
          limit,
        }
      );
      setProperties((prev) => [...prev, ...response.data.data]);
    } catch (err) {
      console.log("err in explore page", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [skip]);

  // const filteredProperties=selectedCountry.length===0?properties:properties.filter((property)=>{

  //   selectedCountry.includes(property.country)
  // })

  const [filteredProperties, setFilteredProperties] =
    useState<PropertyInterface[]>(properties);

  useEffect(() => {
    if (selectedCountry.length === 0) {
      setFilteredProperties(properties);
    } else {
      setFilteredProperties(
        properties.filter((property) =>
          selectedCountry.some(
            (countryId) =>
              Countries.find((country) => country.id === countryId)?.name ===
              property.country
          )
        )
      );
    }
  }, [selectedCountry]);

  const skeleton = () => (
    <View
      style={{
        display: "flex",
        marginTop: 10,
        backgroundColor: "#fff",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <View
        style={{
          width: 300,
          height: 300,
          backgroundColor: "#e0e0e0",
          borderRadius: 10,
          marginRight: 10,
        }}
      />
      <View style={{ width: 300, height: 300 }}>
        <View
          style={{
            width: 100,
            height: 15,
            backgroundColor: "#e0e0e0",
            borderRadius: 5,
            marginTop: 10,
          }}
        />
        <View
          style={{
            width: 150,
            height: 15,
            backgroundColor: "#e0e0e0",
            borderRadius: 5,
            marginTop: 10,
          }}
        />
        <View
          style={{
            width: 200,
            height: 15,
            backgroundColor: "#e0e0e0",
            borderRadius: 5,
            marginTop: 10,
          }}
        />
      </View>
      <View
        style={{
          width: 300,
          height: 300,
          backgroundColor: "#e0e0e0",
          borderRadius: 10,
          marginRight: 10,
        }}
      />
      <View style={{ width: 300, height: 300 }}>
        <View
          style={{
            width: 100,
            height: 15,
            backgroundColor: "#e0e0e0",
            borderRadius: 5,
            marginTop: 10,
          }}
        />
        <View
          style={{
            width: 150,
            height: 15,
            backgroundColor: "#e0e0e0",
            borderRadius: 5,
            marginTop: 10,
          }}
        />
        <View
          style={{
            width: 200,
            height: 15,
            backgroundColor: "#e0e0e0",
            borderRadius: 5,
            marginTop: 10,
          }}
        />
      </View>
      <View
        style={{
          width: 300,
          height: 300,
          backgroundColor: "#e0e0e0",
          borderRadius: 10,
          marginRight: 10,
        }}
      />
      <View style={{ width: 300, height: 300 }}>
        <View
          style={{
            width: 100,
            height: 15,
            backgroundColor: "#e0e0e0",
            borderRadius: 5,
            marginTop: 10,
          }}
        />
        <View
          style={{
            width: 150,
            height: 15,
            backgroundColor: "#e0e0e0",
            borderRadius: 5,
            marginTop: 10,
          }}
        />
        <View
          style={{
            width: 200,
            height: 15,
            backgroundColor: "#e0e0e0",
            borderRadius: 5,
            marginTop: 10,
          }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.mainContainer}>
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) =>
          `${item._id.toString()}${Math.random().toFixed(5)}`
        }
        renderItem={({ item }) => (
          <View style={styles.mainContainer}>
            <View style={styles.propertyContainer}>
              <View style={styles.imageWrapper}>
                {/* <Link href={`/(screens)/PropertyInfo/${item._id}`}> */}
                <Link href={`/(screens)/PropertyInfo/${item._id}` as Route}>
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
              renderItem={({ item }) => {
                const isSelected = selectedCountry.includes(item.id);
                return (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() => handleSelectCountry(item.id)}
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
                    <Text style={[isSelected && styles.selectedcountrytext]}>
                      {item.name}
                    </Text>
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
              renderItem={({ item }) => (
                <View style={styles.propertyTypeItem}>
                  {item.icon}
                  <Text style={styles.propertyTypeText}>{item.name}</Text>
                </View>
              )}
            />
          </View>
        }
        ListFooterComponent={<View>{loading && skeleton()}</View>}
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
    maxWidth: "90%",
    color: "gray",
    padding: 2,
  },
  selectedcountryimage: {
    width: 100,
    height: 100,
    marginBottom: 4,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "orange",
  },
  selectedcountrytext: {
    fontWeight: 500,
    fontSize: 15,
    color: "orange",
  },
});
