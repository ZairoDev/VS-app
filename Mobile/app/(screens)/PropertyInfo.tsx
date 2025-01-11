import { Entypo, FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import {
  Text,
  View,
  Image,
  StatusBar,
  FlatList,
  StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function PropertyInfo() {
  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeAreaView}>
      <StatusBar hidden={true} />
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1544952019-734321a2a151?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zmxvd2VyJTIwdmFsbGV5fGVufDB8fDB8fHww",
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
        renderItem={() => (
          <View>
            <View style={styles.apartmentTag}>
              <Ionicons name="home-outline" color={"black"} size={12} />
              <Text style={styles.apartmentText}>Apartment</Text>
            </View>
            <View>
              <Text style={styles.propertyIdText}>VS ID - 5HDXM6P</Text>
              <Text style={styles.locationText}>
                <Ionicons name="location" /> Greece
              </Text>
              <View style={styles.ownedByContainer}>
                <Ionicons name="person-circle-outline" size={28} />
                <Text style={styles.ownedByText}> Owned by</Text>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailBox}>
                  <Ionicons name="person" size={20} />
                  <Text>6</Text>
                </View>
                <View style={styles.detailBox}>
                  <Ionicons name="bed" size={20} />
                  <Text>2 Bedrooms</Text>
                </View>
                <View style={styles.detailBox}>
                  <FontAwesome name="bath" size={20} />
                  <Text>1 Bathrooms</Text>
                </View>
                <View style={styles.detailBox}>
                  <MaterialCommunityIcons name="floor-plan" size={20} />
                  <Text>6</Text>
                </View>
              </View>

              <View>
                <Text style={styles.sectionTitle}>Stay Information</Text>
                <Text style={styles.stayInfoText}>
                  PITHOS APARTMENT FOR RENT is a holiday home in Kalamata, offering free WiFi, air conditioning, and a terrace. The property is located 300 meters from Kalamata Beach, 1.8 km from Kalamata Municipal Railway Park, and features sea and mountain views. The holiday home has 2 bedrooms, 1 bathroom with free toiletries, a living room, and a kitchen with a refrigerator. The bathroom has a shower and hydromassage. Nearby attractions include Benakeio Archaeological Museum of Kalamata, Pantazopoulio Spiritual Center, and Kalamata International Airport. The holiday home also features a hot tub, a flat-screen TV, a washing machine, a private entrance, soundproof walls, and sea views. The unit has 3 beds.
                </Text>
              </View>

              <View>
                <Text style={styles.sectionTitle}>Amenities</Text>
                <View style={styles.amenitiesContainer}>
                  <View style={styles.amenityItem}>
                    <Ionicons name="wifi" size={20} />
                    <Text>Wifi</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <Ionicons name="tv-outline" size={20} />
                    <Text>Tv</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <Entypo name="air" size={20} />
                    <Text>Air-Conditioning</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="door-closed" size={20} />
                    <Text>Private Entrance</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="hair-dryer-outline" size={20} />
                    <Text>Dryer</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="washing-machine" size={20} />
                    <Text>Washing Machine</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <FontAwesome6 name="jug-detergent" size={20} />
                    <Text>Detergent</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="desk" size={20} />
                    <Text>Desk</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="fridge-outline" size={20} />
                    <Text>Refrigerator</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="silverware-clean" size={20} />
                    <Text>Cleaning products</Text>
                  </View>
                </View>
              </View>
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
  apartmentTag: {
    display: "flex",
    flexDirection: "row",
    gap: 3,
    width: 80,
    borderColor: "black",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginTop: 20,
    marginHorizontal: 15,
  },
  apartmentText: { color: "black", fontSize: 12 },
  propertyIdText: {
    fontSize: 20,
    marginHorizontal: 15,
    marginTop: 10,
    fontWeight: "500",
  },
  locationText: { fontSize: 15, marginHorizontal: 15, marginTop: 4 },
  ownedByContainer: {
    display: "flex",
    alignItems: "center",
    marginHorizontal: 10,
    width: "60%",
    borderRadius: 20,
    flexDirection: "row",
  },
  ownedByText: { fontSize: 15 },
  detailsContainer: {
    width: "100%",
    display: "flex",
    gap: 10,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
  sectionTitle: {
    fontSize: 25,
    marginHorizontal: 15,
    marginTop: 10,
    fontWeight: "500",
  },
  stayInfoText: { textAlign: "justify", marginHorizontal: 15, marginTop: 4 },
  amenitiesContainer: {
    marginHorizontal: 15,
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  amenityItem: {
    display: "flex",
    gap: 4,
    flexDirection: "row",
  },
});