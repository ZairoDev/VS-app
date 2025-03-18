import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import Carousel from "react-native-reanimated-carousel";
import ImageViewer from "react-native-image-zoom-viewer";
import { SafeAreaView } from "react-native-safe-area-context";
import { Modalize } from "react-native-modalize";
import Animated, { SlideInDown, SlideInUp, SlideOutDown } from "react-native-reanimated";


import {
  Text,
  View,
  Modal,
  Image,
  FlatList,
  StatusBar,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { PropertyInterface } from "@/types";
import { globalStyles } from "@/Constants/Styles";
import {
  Ionicons,
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export default function PropertyInfo() {
  const { id } = useLocalSearchParams();

  const [imagesModal, setImagesModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [bottomsheetVisible, setBottomsheetVisible] = useState(false);
  const [property, setProperty] = useState<PropertyInterface>();
  const modalizeRef = useRef<Modalize>(null);

  const handleOpenBottomsheet = () => {
    if (modalizeRef.current) {
      modalizeRef.current.open();
    }
  };
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

  const openImageViewer = (index: number) => {
    setImageIndex(index);
    setImagesModal(true);
  };

  const bentoStyle = (index: number) => {
    const styles = [
      { width: Dimensions.get("window").width, height: 200 },
      { width: (Dimensions.get("window").width / 100) * 49, height: 200 },
      { width: (Dimensions.get("window").width / 100) * 49, height: 200 },
      { width: Dimensions.get("window").width, height: 300 },
      { width: (Dimensions.get("window").width / 100) * 49, height: 150 },
      { width: (Dimensions.get("window").width / 100) * 49, height: 150 },
    ];
    return styles[index % styles.length];
  };

  const imageGallery = () => {
    const images =
      property?.propertyImages.map((item, index) => {
        return { url: item };
      }) ?? [];
    return (
      <Modal
        visible={imagesModal}
        transparent={true}
        onRequestClose={() => setImagesModal(false)}
      >
        <ImageViewer
          enableSwipeDown={true}
          onSwipeDown={() => setImagesModal(false)}
          imageUrls={images}
          index={imageIndex}
        />
      </Modal>
    );
  };
  const renderAllPhotos = () => {
    return (
      <View
        style={{
          backgroundColor: "white",
          minWidth: "100%",
          minHeight: "100%",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={{ display: "flex" }}>
            <ScrollView
              contentContainerStyle={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                backgroundColor: "white",
              }}
            >
              {property?.propertyImages.map((item, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => openImageViewer(index)}
                >
                  <View
                    key={index}
                    style={[styles.gridItem, bentoStyle(index)]}
                  >
                    <Image
                      source={{ uri: item }}
                      style={{ height: "100%", width: "100%" }}
                      resizeMode="cover"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Pressable
              style={{
                position: "absolute",
                top: 10,
                right: 30,
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: 10,
                borderRadius: 30,
              }}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={{ color: "white", fontSize: 16 }}>close</Text>
            </Pressable>
          </View>
        </Modal>
        {imagesModal && imageGallery()}
      </View>
    );
  };

  const renderPropertyInfo = () => {
    return (
      <View style={styles.detailsContainer}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.propertyTypeTag}>
            <Ionicons name="home-outline" color={"black"} size={12} />
            <Text>{property?.propertyType}</Text>
          </View>
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
        <View style={{ display: "flex", flexDirection: "row", gap: 15 }}>
          <View style={styles.detailBox}>
            <Ionicons name="person" size={20} />
            <Text>{property?.guests}</Text>
          </View>
          <View style={styles.detailBox}>
            <Ionicons name="bed" size={20} />
            <Text>{property?.bedrooms} </Text>
          </View>
          <View style={styles.detailBox}>
            <FontAwesome name="bath" size={20} />
            <Text>{property?.bathroom} </Text>
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
              backgroundColor: "#c1c2c3",
              borderRadius: 20,
              borderColor: "black",
              padding: 5,
              borderWidth: 1,
            }}
          >
            <TouchableOpacity onPress={handleOpenBottomsheet}>
              <Text>View All..</Text>
            </TouchableOpacity>
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
        <View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: "#c1c2c3",
              padding: 8,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
            }}
          >
            <Text style={{ fontSize: 17 }}>Check-in</Text>
            <Text style={{ fontSize: 17 }}>Check-out</Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: "#d3d3d3",
              padding: 8,
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
            }}
          >
            <Text>11:00</Text>
            <Text style={{ textAlign: "center" }}>15:00</Text>
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
            {property?.propertyImages &&
            property?.propertyImages?.length > 0 ? (
              <Pressable onPress={() => setModalVisible(true)}>
                <Carousel
                  loop
                  height={300}
                  width={Dimensions.get("window").width}
                  data={property.propertyImages}
                  renderItem={({ item, index }) => (
                    <View key={index}>
                      <Image
                        source={{ uri: item }}
                        resizeMode="cover"
                        style={styles.image}
                      />
                    </View>
                  )}
                />
              </Pressable>
            ) : (
              <Text>No images available</Text>
            )}
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
      {modalVisible && renderAllPhotos()}
      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        childrenStyle={{ height: 500 }}
        onClose={() => setBottomsheetVisible(false)}
        onOpen={() => setBottomsheetVisible(true)}
      >
        <View style={{ padding: 20 }}>
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
                  )[item] == true
              )
              ?.map((amenity, ind) => (
                <View style={styles.amenityItem} key={ind}>
                  <Text>{amenity}</Text>
                </View>
              ))}
          </View>
        </View>
      </Modalize>
      <View style={globalStyles.footer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity style={styles.footerText}>
            <Text style={styles.footerPrice}>€{property?.basePrice}</Text>
            <Text>/night</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.btn, { paddingRight: 20, paddingLeft: 20 }]}
            onPress={()=>router.push("/(screens)/pages/reserve-page")}
          >
            <Text style={globalStyles.btnText}>Reserve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeAreaView: { flex: 1 },
  imageContainer: {},
  image: { height: 300, width: "100%" },
  allPhotosTextContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 35,
    width: "15%",
    gap: 4,
    top: 20,
    right: 20,
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
    paddingBottom: "20%",
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
  gridItem: {
    marginBottom: 7,
    borderRadius: 8,
  },
  footerPrice: {
    fontSize: 18,
    fontFamily: "mon-sb",
  },
  footerText: {
    height: "100%",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    // gap: 4,
  },
});
