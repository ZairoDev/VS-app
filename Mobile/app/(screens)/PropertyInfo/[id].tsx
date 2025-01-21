import axios from "axios";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import {
  Text,
  View,
  Image,
  FlatList,
  StatusBar,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { PropertyInterface } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { globalStyles } from "@/Constants/Styles"
import { FlipInEasyX } from "react-native-reanimated";

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
        <Text style={globalStyles.Heading}>Amenities</Text>
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
              <View style={styles.amenityItem} key={ind}>
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
      <View>
        <Text style={globalStyles.Heading}>Room Rates</Text>
        <Text style={globalStyles.MutedText}>
          Prices may increase in weekends and holidays
        </Text>

        <View style={styles.rateItem}>
          <Text>Monday-Thursday</Text>
          <Text>€ {property?.basePrice}</Text>
        </View>

        <View style={styles.rateItem}>
          <Text>Friday-Sunday</Text>
          <Text>€ {property?.weekendPrice}</Text>
        </View>

        <View style={styles.rateItem}>
          <Text>Weekly Discount</Text>
          <Text>€ {property?.weeklyDiscount ?? "------"}</Text>
        </View>

        <View style={styles.rateItem}>
          <Text>Minimum number of nights</Text>
          <Text>{property?.night[0]} nights</Text>
        </View>

        <View style={styles.rateItem}>
          <Text>Max number of nights</Text>
          <Text>{property?.night[1]} nights</Text>
        </View>
      </View>
    );
  };

  const renderHostInfo = () => {
    return (
      <View>
        <Text style={globalStyles.Heading}>Host information</Text>

        {/* host image and name */}
        <View style={styles.hostImageView}>
          <Image
            style={styles.hostImage}
            source={{
              uri: "https://cdn.pixabay.com/photo/2015/01/27/09/58/man-613601_640.jpg",
            }}
          />
          <Text>Hostname</Text>
        </View>

        {/* host details */}
        <View style={styles.container}>
          <View style={styles.hostItem}>
            <MaterialIcons name="date-range" size={20} />
            <Text style={globalStyles.MutedText}>Joined long time ago</Text>
          </View>

          <View style={styles.hostItem}>
            <MaterialCommunityIcons name="message-text-outline" size={20} />
            <Text style={globalStyles.MutedText}>Response rate - 100%</Text>
          </View>

          <View style={styles.hostItem}>
            <MaterialCommunityIcons name="clock-time-nine-outline" size={20} />
            <Text style={globalStyles.MutedText}>
              Fast response - within a few hours
            </Text>
          </View>

          <View style={styles.hostItem}>
            <Ionicons name="language-outline" size={20} />
            <Text style={globalStyles.MutedText}>
              Language Spoken - English , Greek
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderThingsToKnow = () => {
    return (
      <View>
        <View
          style={{
            
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
            borderRadius: 10,
            padding: 5,
          }}
        >
          <View style={{display:"flex", gap:10, shadowColor:"black",elevation:10,padding:5, borderRadius:10, backgroundColor:"#e0e0e0",width:"40%"}}>
            <Text style={{fontSize:20}}>Check-in</Text>
            <Text style={{fontSize:15}}>15:00</Text>
          </View>
          <View style={{display:"flex", gap:10, shadowColor:"black",elevation:10   ,padding:5, borderRadius:10 ,backgroundColor:"#e0e0e0",width:"40%"}}>
            <Text style={{fontSize:20,textAlign:"right"}}>Check-out</Text>
            <Text style={{textAlign:"right",fontSize:15}}>11:00</Text>
          </View>
          
        </View>
        <View style={styles.container}>
          {property?.additionalRules?.map((item, index) => (
            <View     
              style={{ display: "flex", flexDirection: "row", gap: 5 }}
              key={index}
            >
              <Text style={globalStyles.Text}>•</Text>
              <Text style={globalStyles.Text}>{item}</Text>
            </View>
          ))}
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
      

      <FlatList
        data={[1]}
        contentContainerStyle={styles.flatListContainer}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.imageContainer}>
        {/* <Image
          source={{
            uri: property?.propertyCoverFileUrl,
          }}
          style={styles.image}
        /> */}
        {property?.propertyImages && property?.propertyImages.length>0 ?(

          <Carousel
          loop
          height={300}
          width={Dimensions.get("window").width}
          autoPlay
          autoPlayInterval={3000}
          data={property.propertyImages}
          
          renderItem={({ item, index }) => (
            <View key={index}>
              <Image source={{uri:item}} resizeMode="cover" style={styles.image}/>
            </View>
            
          )}
          />

        ) :(<Text>No images available</Text>)
      }



        <View style={styles.allPhotosTextContainer}>
          <Ionicons name="albums-outline" color={"white"} size={24} />
          <Text style={styles.allPhotosText}> All Photos</Text>
        </View>
      </View>
        }
        renderItem={() => (
          <View style={globalStyles.Container} key={property?._id}>
            {renderPropertyInfo()}

            {renderAmenities()}

            {renderPricingCard()}

            {renderThingsToKnow()}

            {renderHostInfo()}
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
    display: "flex",
    gap: 10,
    marginTop: 10,
    fontSize: 20,
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
    alignItems: "center",
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  rateItem: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    marginVertical: 5,
    justifyContent: "space-between",
  },
  hostImageView: {
    display: "flex",
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
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
