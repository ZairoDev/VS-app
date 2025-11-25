"use client"
import axios from "axios"
import { useEffect, useState, useRef } from "react"
import { type Route, useLocalSearchParams, router } from "expo-router"
import Carousel from "react-native-reanimated-carousel"
import ImageViewer from "react-native-image-zoom-viewer"
import { Modalize } from "react-native-modalize"
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
  SafeAreaView,
  TouchableOpacity,
} from "react-native"
import type { PropertyInterface, UserDataType } from "@/types"
import { useAuthStore } from "@/store/auth-store"
import { globalStyles } from "@/Constants/Styles"
import { Ionicons, FontAwesome, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"

const { width: screenWidth } = Dimensions.get("window")

export default function PropertyInfo() {
  const { id } = useLocalSearchParams()
  const { user } = useAuthStore()
  const [imagesModal, setImagesModal] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [bottomsheetVisible, setBottomsheetVisible] = useState(false)
  const [property, setProperty] = useState<PropertyInterface>()
  const [users, setUsers] = useState<UserDataType>()
  const modalizeRef = useRef<Modalize>(null)

  const handleOpenBottomsheet = () => {
    if (modalizeRef.current) {
      modalizeRef.current.open()
    }
  }

  const getproperty = async () => {
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/properties/getParticularProperty`, {
        propertyId: id,
      })
      setProperty(response.data.data)
    } catch (err) {
      console.log("error in fetching particular property")
    }
  }

  useEffect(() => {
    getproperty()
  }, [])

  const getUser = async () => {
    try {
      const userId = property?.userId
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/user/getUser`, { userId })
      setUsers(response.data.user)
    } catch (error) {
      console.log("error in fetching user")
    }
  }

  useEffect(() => {
    getUser()
  }, [property])

  const openImageViewer = (index: number) => {
    setImageIndex(index)
    setImagesModal(true)
  }

  const bentoStyle = (index: number) => {
    const spacing = 4
    const availableWidth = screenWidth - (spacing * 3) // Account for padding and gaps
    const styles = [
      { width: availableWidth, height: 200 },
      { width: (availableWidth - spacing) / 2, height: 200 },
      { width: (availableWidth - spacing) / 2, height: 200 },
      { width: availableWidth, height: 300 },
      { width: (availableWidth - spacing) / 2, height: 150 },
      { width: (availableWidth - spacing) / 2, height: 150 },
    ]
    return styles[index % styles.length]
  }

  const imageGallery = () => {
    const images =
      property?.propertyImages.map((item, index) => {
        return { url: item }
      }) ?? []
    return (
      <Modal visible={imagesModal} transparent={true} onRequestClose={() => setImagesModal(false)}>
        <ImageViewer
          enableSwipeDown={true}
          onSwipeDown={() => setImagesModal(false)}
          imageUrls={images}
          index={imageIndex}
        />
      </Modal>
    )
  }

  const renderAllPhotos = () => {
    return (
      <View style={styles.allPhotosContainer}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible)
          }}
        >
          <View style={styles.modalContainer}>
            <ScrollView
              contentContainerStyle={styles.photoGrid}
              showsVerticalScrollIndicator={false}
            >
              {property?.propertyImages.map((item, index: number) => (
                <TouchableOpacity key={index} onPress={() => openImageViewer(index)}>
                  <View style={[styles.gridItem, bentoStyle(index)]}>
                    <Image source={{ uri: item }} style={styles.gridImage} resizeMode="cover" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
          </View>
        </Modal>
        {imagesModal && imageGallery()}
      </View>
    )
  }

  const renderPropertyInfo = () => {
    return (
      <View style={styles.section}>
        <View style={styles.propertyHeader}>
          <View style={styles.propertyTypeTag}>
            <Ionicons name="home-outline" color="#666" size={14} />
            <Text style={styles.propertyTypeText}>{property?.propertyType}</Text>
          </View>
        </View>

        <Text style={styles.vsidText}>VS ID - {property?.VSID}</Text>

        <View style={styles.locationContainer}>
          <Ionicons name="location" size={18} color="#666" />
          <Text style={styles.locationText}>{property?.country}</Text>
        </View>

        <View style={styles.hostContainer}>
          <Ionicons name="person-circle-outline" size={24} color="#666" />
          <Text style={styles.hostText} numberOfLines={1}>Hosted by {users?.name}</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailBox}>
            <Ionicons name="person" size={18} color="#666" />
            <Text style={styles.detailText}>{property?.guests}</Text>
          </View>
          <View style={styles.detailBox}>
            <Ionicons name="bed" size={18} color="#666" />
            <Text style={styles.detailText}>{property?.bedrooms}</Text>
          </View>
          <View style={styles.detailBox}>
            <FontAwesome name="bath" size={18} color="#666" />
            <Text style={styles.detailText}>{property?.bathroom}</Text>
          </View>
          <View style={styles.detailBox}>
            <MaterialCommunityIcons name="floor-plan" size={18} color="#666" />
            <Text style={styles.detailText}>{property?.size}</Text>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Stay Information</Text>
          <Text style={styles.descriptionText}>
            {(property?.newReviews || property?.reviews)?.trim() ?? ""}
          </Text>
        </View>
      </View>
    )
  }

  const renderAmenities = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
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
                    [key: string]: boolean
                  }
                )[item] == true && index < 16,
            )
            ?.map((amenity, ind) => (
              <View style={styles.amenityItem} key={ind}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          <TouchableOpacity style={styles.viewAllButton} onPress={handleOpenBottomsheet}>
            <Text style={styles.viewAllText}>View All..</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderPricingCard = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Room Rates</Text>
        <Text style={styles.subtitle}>Prices may increase on weekends and holidays</Text>
        
        <View style={styles.rateContainer}>
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>Monday-Thursday</Text>
            <Text style={styles.ratePrice}>€{property?.basePrice}</Text>
          </View>
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>Friday-Sunday</Text>
            <Text style={styles.ratePrice}>€{property?.weekendPrice}</Text>
          </View>
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>Weekly Discount</Text>
            <Text style={styles.ratePrice}>€{property?.weeklyDiscount ?? "------"}</Text>
          </View>
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>Minimum nights</Text>
            <Text style={styles.rateValue}>{property?.night[0]} nights</Text>
          </View>
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>Maximum nights</Text>
            <Text style={styles.rateValue}>{property?.night[1]} nights</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderHostInfo = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Host Information</Text>
        
        <View style={styles.hostProfile}>
          <Image
            style={styles.hostImage}
            source={{
              uri: users?.profilePic
                ? users.profilePic
                : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png",
            }}
          />
          <Text style={styles.hostName}>{users?.name}</Text>
        </View>

        <View style={styles.hostDetails}>
          <View style={styles.hostDetailItem}>
            <MaterialIcons name="date-range" size={20} color="#666" />
            <Text style={styles.hostDetailText}>
              Joined {users?.createdAt && new Date(users.createdAt).getFullYear()}
            </Text>
          </View>
          <View style={styles.hostDetailItem}>
            <MaterialCommunityIcons name="message-text-outline" size={20} color="#666" />
            <Text style={styles.hostDetailText}>Response rate - 100%</Text>
          </View>
          <View style={styles.hostDetailItem}>
            <MaterialCommunityIcons name="clock-time-nine-outline" size={20} color="#666" />
            <Text style={styles.hostDetailText}>Fast response - within a few hours</Text>
          </View>
          <View style={styles.hostDetailItem}>
            <Ionicons name="language-outline" size={20} color="#666" />
            <Text style={styles.hostDetailText}>
              Language Spoken - {users?.spokenLanguage || "English"}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  const renderThingsToKnow = () => {
    return (
      <View style={styles.section}>
        <View style={styles.checkInOutContainer}>
          <View style={styles.checkInOutHeader}>
            <Text style={styles.checkInOutTitle}>Check-in</Text>
            <Text style={styles.checkInOutTitle}>Check-out</Text>
          </View>
          <View style={styles.checkInOutTimes}>
            <Text style={styles.checkInOutTime}>{property?.time[0]}:00</Text>
            <Text style={styles.checkInOutTime}>{property?.time[1]}:00</Text>
          </View>
        </View>

        <View style={styles.rulesContainer}>
          {property?.additionalRules?.map((item, index) => (
            <View style={styles.ruleItem} key={index}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.ruleText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar hidden={true} />
      <FlatList
        data={[1]}
        contentContainerStyle={styles.flatListContainer}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.imageContainer}>
            {property?.propertyImages && property?.propertyImages?.length > 0 ? (
              <Pressable onPress={() => setModalVisible(true)}>
                <Carousel
                  loop
                  height={300}
                  width={screenWidth}
                  data={property.propertyImages}
                  renderItem={({ item, index }) => (
                    <View key={index}>
                      <Image source={{ uri: item }} resizeMode="cover" style={styles.carouselImage} />
                    </View>
                  )}
                />
              </Pressable>
            ) : (
              <Text style={styles.noImagesText}>No images available</Text>
            )}
          </View>
        }
        renderItem={() => (
          <View style={styles.contentContainer} key={property?._id}>
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
        <View style={styles.modalizeContent}>
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
                      [key: string]: boolean
                    }
                  )[item] == true,
              )
              ?.map((amenity, ind) => (
                <View style={styles.amenityItem} key={ind}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
          </View>
        </View>
      </Modalize>
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <TouchableOpacity style={styles.priceContainer}>
            <Text style={styles.footerPrice}>€{property?.basePrice}</Text>
            <Text style={styles.perNight}>/night</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (user) {
                router.push(`/(screens)/reserve-page/${id}` as Route)
              } else {
                router.push("/(tabs)/Menu")
              }
            }}
            style={[globalStyles.btn, styles.reserveButton]}
          >
            <Text style={[globalStyles.btnText, styles.reserveButtonText]}>Reserve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flatListContainer: {
    paddingBottom: 100,
  },
  imageContainer: {
    backgroundColor: '#f8f9fa',
  },
  carouselImage: {
    height: 300,
    width: '100%',
  },
  noImagesText: {
    textAlign: 'center',
    padding: 40,
    fontSize: 16,
    color: '#666',
  },
  contentContainer: {
    backgroundColor: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  propertyHeader: {
    marginBottom: 16,
  },
  propertyTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  propertyTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  vsidText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  hostText: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityItem: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
  },
  viewAllButton: {
    backgroundColor: 'orange',
    borderColor: '#ff7f11',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewAllText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  rateContainer: {
    gap: 16,
  },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 16,
    color: '#333',
  },
  ratePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  rateValue: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  hostProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  hostImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  hostName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  hostDetails: {
    gap: 16,
  },
  hostDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostDetailText: {
    fontSize: 15,
    color: '#666',
  },
  checkInOutContainer: {
    marginBottom: 20,
  },
  checkInOutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  checkInOutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  checkInOutTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  checkInOutTime: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  rulesContainer: {
    gap: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
  },
  ruleText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  perNight: {
    fontSize: 16,
    color: '#666',
  },
  reserveButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  allPhotosContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
    gap: 4,
  },
  gridItem: {
    marginBottom: 4,
    borderRadius: 0, // Removed border radius
    overflow: 'hidden',
  },
  gridImage: {
    height: '100%',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 24,
  },
  modalizeContent: {
    padding: 20,
  },
})