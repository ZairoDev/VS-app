import axios from "axios";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  Text,
  View,
  Image,
  FlatList,
  StatusBar,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { PropertyInterface } from "@/types";
import { globalStyles } from "@/Constants/Styles";

export default function PropertyInfo() {
  const { id } = useLocalSearchParams();

  const [property, setProperty] = useState<PropertyInterface>();

  const getproperty = async () => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/properties/getParticularProperty`,
        { propertyId: id }
      );
      setProperty(response.data.data);
    } catch (err) {
      console.log("error in fetching particular property");
    }
  };

  useEffect(() => {
    getproperty();
  }, []);

  const renderPropertyInfo = () => {
    return (
      <View style={styles.detailsContainer}>
        {/* property type */}
        <View style={styles.propertyTypeTag}>
          <Ionicons name="home-outline" color={"black"} size={12} />
          <Text>{property?.propertyType}</Text>
        </View>

        {/* VSID */}
        <Text style={styles.infoContainer}>VS ID - {property?.VSID}</Text>

        {/* country */}
        <View style={styles.infoContainer}>
          <Ionicons name="location" size={16} />
          <Text>{property?.country}</Text>
        </View>

        {/* hosted by */}
        <View style={styles.infoContainer}>
          <Ionicons name="person-circle-outline" size={28} />
          <Text numberOfLines={1}>Hosted by {property?.email}</Text>
        </View>

        {/* beds and Bathrooms */}
        <View style={{ display: "flex", flexDirection: "row", gap: 7 }}>
          <View style={styles.detailBox}>
            <Ionicons name="person" size={20} />
            <Text>{property?.guests}</Text>
          </View>
          <View style={styles.detailBox}>
            <Ionicons name="bed" size={20} />
            <Text>{property?.bedrooms} Bedrooms</Text>
          </View>
          <View style={styles.detailBox}>
            <FontAwesome name="bath" size={20} />
            <Text>{property?.bathroom} Bathrooms</Text>
          </View>
          <View style={styles.detailBox}>
            <MaterialCommunityIcons name="floor-plan" size={20} />
            <Text>{property?.size}</Text>
          </View>
        </View>

        {/* description */}
        <View>
          <Text style={globalStyles.Heading}>Stay Information</Text>
          <Text style={globalStyles.Text}>
            {(property?.newReviews || property?.reviews)?.trim() ?? ""}
          </Text>
        </View>
      </View>
    );
  };

  const renderAmenities = () => {
    return (
      <View>
        <Text style={globalStyles.SubHeading}>Amenities</Text>
        <View style={styles.amenitiesContainer}>
          {Object.keys({
            ...property?.generalAmenities,
            ...property?.safeAmenities,
            ...property?.otherAmenities,
          })
            ?.filter(
              (item, index) =>
                (
                  property?.generalAmenities as {
                    [key: string]: boolean;
                  }
                )[item] == true && index < 16
            )
            ?.map((amenity, ind) => (
              <View style={styles.amenityItem}>
                <Text>{amenity}</Text>
              </View>
            ))}
          <View
            style={{
              backgroundColor: "#7393B3",
              borderRadius: 20,
              padding: 5,
            }}
          >
            <Text>View All</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPricingCard = () => {
    return (
      <View style={{ borderWidth: 2, borderColor: "blue" }}>
        <Text style={globalStyles.SubHeading}>Room Rates</Text>
        <Text>Prices may increase in weekends and holidays</Text>

        <View style={styles.rateItem}>
          <Text>Monday-Thursday</Text>
          <Text>€115</Text>
        </View>

        <View style={styles.rateItem}>
          <Text>Friday-Sunday</Text>
          <Text>€115</Text>
        </View>

        <View style={styles.rateItem}>
          <Text>Weekly Discount</Text>
          <Text>€</Text>
        </View>

        <View style={styles.rateItem}>
          <Text>Minimum number of nights</Text>
          <Text>7 nights</Text>
        </View>

        <View style={styles.rateItem}>
          <Text>Max number of nights</Text>
          <Text>21 nights</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={styles.safeAreaView}
    >
      <StatusBar hidden={true} />
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: property?.propertyCoverFileUrl,
          }}
          style={styles.image}
        />
        <View style={styles.allPhotosTextContainer}>
          <Ionicons name="albums-outline" color={"white"} size={24} />
          <Text style={styles.allPhotosText}> All Photos</Text>
        </View>
      </View>

      <FlatList
        data={[1]}
        contentContainerStyle={styles.flatListContainer}
        renderItem={() => (
          <View style={globalStyles.Container}>
            {renderPropertyInfo()}

            {renderAmenities()}

            {renderPricingCard()}

            <View>
              <Text style={globalStyles.SubHeading}>Host information</Text>
              <View style={styles.hostInfo}>
                <Image
                  style={styles.hostImage}
                  source={{
                    uri: "https://cdn.pixabay.com/photo/2015/01/27/09/58/man-613601_640.jpg",
                  }}
                />
                <Text style={{ fontSize: 20 }}>Viki</Text>
              </View>
              <View style={styles.container}>
                <View style={styles.hostItem}>
                  <MaterialIcons name="date-range" size={20} />
                  <Text>Joined long time ago</Text>
                </View>
                <View style={styles.hostItem}>
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={20}
                  />
                  <Text>Response rate - 100%</Text>
                </View>
                <View style={styles.hostItem}>
                  <MaterialCommunityIcons
                    name="clock-time-nine-outline"
                    size={20}
                  />
                  <Text>Fast response - within a few hours</Text>
                </View>
                <View style={styles.hostItem}>
                  <Ionicons name="language-outline" size={20} />
                  <Text>Language Spoken - English , Greek</Text>
                </View>
              </View>
            </View>
            <View
              style={{
                borderColor: "black",
                borderWidth: 1,
                marginHorizontal: 15,
                marginTop: 10,
                borderRadius: 10,
              }}
            >
              <View style={styles.rateItem}>
                <Text style={{ fontSize: 15, fontWeight: 500 }}>
                  Check-in Time
                </Text>
                <Text style={{ fontSize: 15, fontWeight: 500 }}>
                  Check-out Time
                </Text>
              </View>
              <View style={styles.rateItem}>
                <Text>15:00</Text>
                <Text>11:00</Text>
              </View>
            </View>
            <View style={styles.container}>
              <Text>No smoking in common area</Text>
              <Text>No cooking in bedroom</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: { flex: 1 },
  imageContainer: { position: "relative" },
  image: { height: 300, width: "100%" },
  allPhotosTextContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 35,
    width: "30%",
    gap: 4,
    position: "absolute",
    bottom: 0,
    margin: 10,
    backgroundColor: "black",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 20,
  },
  allPhotosText: { color: "white" },
  propertyTypeTag: {
    gap: 3,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "35%",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 20,
    padding: 2,
    marginTop: 10,
  },
  infoContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    fontWeight: 700,
    fontSize: 20,
  },
  detailsContainer: {
    width: "100%",
    display: "flex",
    gap: 10,
    // borderWidth: 5,
    // borderColor: "green",
  },
  detailBox: {
    borderWidth: 1,
    borderColor: "black",
    display: "flex",
    padding: 3,
    gap: 4,
    borderRadius: 15,
    flexDirection: "row",
  },
  container: {
    marginHorizontal: 15,
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  amenitiesContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10,
  },
  amenityItem: {
    display: "flex",
    gap: 4,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 20,
    padding: 5,
    flexDirection: "row",
  },
  hostItem: {
    display: "flex",
    gap: 4,
    flexDirection: "row",
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  rateItem: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    margin: 5,
    justifyContent: "space-between",
  },
  hostInfo: {
    display: "flex",
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 10,
  },
  hostImage: {
    height: 60,
    width: 60,
    borderRadius: 100,
    objectFit: "cover",
  },
  subheading: {
    fontSize: 20,
    marginHorizontal: 15,
    fontWeight: "400",
  },
  specialnote: {
    fontSize: 20,

    fontWeight: "400",
    marginTop: 15,
  },
});
