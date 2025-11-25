import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  StatusBar,
  SafeAreaView,
  Platform
} from "react-native";
import axios from "axios";
import { Link, Route, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect, useRef } from "react";
import useStore from "@/store/filter-store";
import { Countries } from "@/Constants/Country";
import { PropertyInterface } from "@/data/types";
import { propertyTypes } from "@/Constants/Country";
import { useAuthStore } from "@/store/auth-store";
import useSearchStore from "@/store/location-search-store";
import { extractLocationParts } from "@/utils/extractLocation";

export interface FetchPropertiesRequest {
  skip: number;
  limit: number;
  selectedCountry: string[];
  propertyType: string[];
  beds: number;
  bedrooms: number;
  bathroom: number;
  allowCooking: boolean;
  isEnabled: boolean;
  allowParty: boolean;
  allowPets: boolean;
  minPrice: number;
  maxPrice: number;
  city: string;
  state: string;
  country: string;
}

export interface FetchPropertiesResponse {
  status?: number;
  error?: string;
  data: PropertyInterface[];
}

enum SelectedType {
  COUNTRY = "country",
  PROPERTY_TYPE = "propertyType",
  BEDS = "beds",
  BEDROOMS = "bedrooms",
  BATHROOMS = "bathroom",
}

export default function Index() {
  const { user } = useAuthStore();
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [propertyType, setPropertyType] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string[]>([]);
  const [properties, setProperties] = useState<PropertyInterface[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(user?.wishlist || []);

  const {
    beds,
    bathroom,
    bedrooms,
    allowCooking,
    allowParty,
    allowPets,
    isEnabled,
    minPrice,
    maxPrice,
    handleCount,
    applyFilters,
  } = useStore();

  const { selectedPlace } = useSearchStore();

  const fetchProperties = async () => {
    try {
      setLoading(true);
      let city = "";
      let state = "";
      let country = "";
      if (selectedPlace?.address) {
        console.log("selectedPlace: ", selectedPlace.address);
        const location = extractLocationParts(selectedPlace.address);
        city = location.city;
        state = location.state;
        country = location.country;
        console.log("city: ", city);
        console.log("state: ", state);
        console.log("country: ", country);
      }
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
        allowPets,
        maxPrice,
        minPrice,
        city,
        state,
        country,
      };
      console.log("requestBody");
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
    if (selectedPlace) {
      console.log("selectedPlace index page me : ", selectedPlace);
    }
  }, [selectedPlace]);

  useEffect(() => {
    setWishlist(user?.wishlist || []);
  }, [user]);

  useEffect(() => {
    setProperties([]);
    setSkip(0);
  }, [applyFilters, selectedPlace]);

  useEffect(() => {
    fetchProperties();
  }, [skip, propertyType, selectedCountry]);

  useEffect(() => {
    console.log("property array: ", properties.length);
    console.log("selectedPlace: ", selectedPlace);
  }, [properties]);

  const handleWishlistToggle = async (propertyId: string) => {
    const { user } = useAuthStore.getState();
    if (!user || !user._id) {
      console.log("User not logged in");
      return;
    }
    const isInWishlist = wishlist.includes(propertyId);
    const updatedWishlist = isInWishlist
      ? wishlist.filter((id) => id !== propertyId)
      : [...wishlist, propertyId];

    setWishlist(updatedWishlist);
    try {
      const endpoint = isInWishlist
        ? `${process.env.EXPO_PUBLIC_BASE_URL}/wishlist/remove`
        : `${process.env.EXPO_PUBLIC_BASE_URL}/wishlist/add`;
      const response = await axios.post(endpoint, {
        userId: user._id,
        propertyId,
      });
      console.log("Success:", response.data.message);
    } catch (error) {
      setWishlist((prev) =>
        isInWishlist
          ? [...prev, propertyId]
          : prev.filter((id) => id !== propertyId)
      );
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.data?.message
      ) {
        console.log("Error:", error.response.data.message);
      } else {
        console.log("Unknown error:", error);
      }
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
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
        <Pressable
          style={styles.icon}
          onPress={() => handleWishlistToggle(item._id)}
        >
          <Ionicons
            size={20}
            name={
              wishlist.includes(item._id) ? "heart" : "heart-outline"
            }
            color={wishlist.includes(item._id) ? "orange" : "white"}
          />
        </Pressable>
      </View>
      <Text style={styles.propertyText}>{item.beds} beds</Text>
      <Text style={styles.propertyTitle}>
        VS ID - {item.VSID}, {item?.propertyType}
      </Text>
      <Text style={styles.locationText} numberOfLines={1}>
        <Ionicons name="location-outline" size={15} color="gray" />
        {item.postalCode}, {item.city}, {item.state}
      </Text>
      <Text style={{ color: "gray", fontWeight: 400, fontSize: 14 }}>
        <Text style={{ color: "black", fontWeight: 600, fontSize: 18 }}>
          €{item.basePrice}
        </Text>
        /night
      </Text>
    </View>
  </View>
)}
        onEndReached={() => {
          setSkip((prev) => prev + 10);
        }}
        onEndReachedThreshold={0.7}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Pressable
                style={styles.searchInput}
                onPress={() => router.push("/(screens)/pages/search-page")}
              >
                <Ionicons name="search" size={20} color="#8E8E93" />
                <Text style={styles.searchPlaceholder}>Where to?</Text>
              </Pressable>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => router.push("/(screens)/pages/filter-page")}
              >
                <Ionicons name="options" size={20} color="#2C2C2E" />
              </TouchableOpacity>
            </View>

            {/* Countries List */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Explore by Country</Text>
              <FlatList
                style={styles.countriesList}
                data={Countries}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.countriesContainer}
                renderItem={({ item }) => {
                  const isSelected = selectedCountry.includes(item.name);
                  return (
                    <TouchableOpacity
                      style={styles.countryItem}
                      onPress={() =>
                        handleSelect(SelectedType.COUNTRY, item.name)
                      }
                    >
                      <View style={styles.countryImageContainer}>
                        <Image
                          source={{
                            uri:
                              item.imageUrl ??
                              "https://picsum.photos/seed/picsum/200/300",
                          }}
                          style={[
                            styles.countryImage,
                            isSelected && styles.selectedCountryImage,
                          ]}
                        />
                      </View>
                      <Text style={[
                        styles.countryName,
                        isSelected && styles.selectedCountryName
                      ]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {/* Property Types */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>All Properties</Text>
              <FlatList
                data={propertyTypes}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.propertyTypesContainer}
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
                          styles.propertyTypeChip,
                          isSelected && styles.selectedPropertyTypeChip,
                        ]}
                      >
                        {item.icon(isSelected ? "#FFFFFF" : "#8E8E93")}
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
          </View>
        }
      />
    </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
     flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
  },
  
  // Search Section
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 52,
    backgroundColor: "#F8F9FA",
    borderRadius: 26,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  searchPlaceholder: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
  },
  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: "#F8F9FA",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },

  // Section Headers
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // Countries Section
  countriesList: {
    paddingLeft: 20,
  },
  countriesContainer: {
    paddingRight: 20,
  },
  countryItem: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  countryImageContainer: {
    marginBottom: 8,
  },
  countryImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F8F9FA",
  },
  selectedCountryImage: {
    borderWidth: 3,
    borderColor: "orange",
  },
  countryName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8E8E93",
    textAlign: "center",
  },
  selectedCountryName: {
    color: "orange",
    fontWeight: "600",
  },

  // Property Types Section
  propertyTypesContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  propertyTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    gap: 6,
  },
  selectedPropertyTypeChip: {
    backgroundColor: "orange",
    borderColor: "orange",
  },
  propertyTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  selectedPropertyTypeText: {
    color: "#FFFFFF",
  },

  // Property Cards
  propertyContainer: {
  margin: 15,
  width: '80%',
  height: '60%',
  alignSelf: 'center',
},
imageWrapper: {
  width: '100%',
  aspectRatio: 4/3,
  borderRadius: 10,
  overflow: 'hidden',
  position: 'relative',
},
imageContainer: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},
icon: {
  position: "absolute",
  top: 10,
  left: "87%",
  backgroundColor: "rgba(0,0,0,0.3)",
  borderRadius: 100,
  padding: 4,
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
});