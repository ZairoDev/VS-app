"use client"
import axios from "axios"
import { useEffect, useState, useRef, useMemo } from "react"
import { type Route, useLocalSearchParams, router } from "expo-router"
import Carousel from "react-native-reanimated-carousel"
import ImageViewer from "react-native-image-zoom-viewer"
import { Modalize } from "react-native-modalize"
import * as Haptics from "expo-haptics"
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated"
import {
  Text,
  View,
  Modal,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import type { PropertyInterface, UserDataType } from "@/types"
import { useAuthStore } from "@/store/auth-store"
import { globalStyles } from "@/Constants/Styles"
import { Ionicons, FontAwesome, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"
import { isInWishlist, toggleWishlistProperty } from "@/utils/wishlist"
import {
  getStayDescription,
  getStayExtendedDetails,
  getStaySpecItems,
  shouldShowStayMore,
  truncateStayDescription,
  getPropertyTrustSummary,
  formatPropertyLocationLine,
  getPropertyDisplayName,
  formatTrustRowText,
  getActiveAmenities,
  getPropertyImages,
  hasPropertyPhotos,
} from "@/utils/property-display"
import { StayInfoSheet } from "@/components/property/StayInfoSheet"
import { AmenitiesSheet } from "@/components/property/AmenitiesSheet"
import { AmenityIcon } from "@/components/property/AmenityIcon"
import { ReviewsSheet } from "@/components/property/ReviewsSheet"
import { PropertyBentoGrid, PropertyGalleryImage } from "@/components/property/PropertyBentoGrid"
import { PropertyMapPreview } from "@/components/property/PropertyMapPreview"
import { booking } from "@/Constants/booking-theme"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
const STAY_INFO_SHEET_HEIGHT = Math.round(screenHeight * 0.88)
const AMENITIES_SHEET_HEIGHT = Math.round(screenHeight * 0.88)
const { colors: c, radius: r, space: sp, shadow: sh } = booking

function getDisplayPrice(p?: PropertyInterface): { text: string; suffix?: string } {
  const rentalType = (p?.rentalType ?? "").toLowerCase()
  const isLongTerm = rentalType.includes("long")
  
  if (isLongTerm) {
    const monthly = typeof p?.basePriceLongTerm === "number" ? p.basePriceLongTerm : undefined
    if (!monthly || monthly <= 0) return { text: "Contact for price" }
    return { text: `€${monthly}`, suffix: "/month" }
  }

  const nightly = typeof p?.basePrice === "number" ? p.basePrice : undefined
  if (!nightly || nightly <= 0) return { text: "Contact for price" }
  return { text: `€${nightly}`, suffix: "/night" }
}

function getLatLng(p?: PropertyInterface): { lat: number; lng: number } | null {
  const raw: any = p?.center
  const lat = typeof raw?.lat === "number" ? raw.lat : typeof raw?.latitude === "number" ? raw.latitude : null
  const lng = typeof raw?.lng === "number" ? raw.lng : typeof raw?.longitude === "number" ? raw.longitude : null
  if (lat == null || lng == null) return null
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

function buildMapsUrl(p?: PropertyInterface): string {
  const coords = getLatLng(p)
  const query = coords
    ? `${coords.lat},${coords.lng}`
    : [p?.city, p?.state, p?.country].filter(Boolean).join(", ")
  const encoded = encodeURIComponent(query || "Vacation Saga property")
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`
}

export default function PropertyInfo() {
  const { id } = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const { user } = useAuthStore()
  const [imagesModal, setImagesModal] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [bottomsheetVisible, setBottomsheetVisible] = useState(false)
  const [property, setProperty] = useState<PropertyInterface>()
  const [users, setUsers] = useState<UserDataType>()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const modalizeRef = useRef<Modalize>(null)
  const stayInfoModalizeRef = useRef<Modalize>(null)
  const reviewsModalizeRef = useRef<Modalize>(null)
  const [wishlistBusy, setWishlistBusy] = useState(false)
  const isWishlisted = isInWishlist(user?.wishlist, property?._id)
  const [stayInfoSheetHeight, setStayInfoSheetHeight] = useState<number>(STAY_INFO_SHEET_HEIGHT)
  const wishlistScale = useSharedValue(1)
  const wishlistAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wishlistScale.value }],
  }))
  const footerTranslateY = useSharedValue(80)
  const footerAnimRan = useRef(false)
  const footerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: footerTranslateY.value }],
  }))

  useEffect(() => {
    if (footerAnimRan.current) return
    if (loading || loadError || !property) return
    footerAnimRan.current = true
    footerTranslateY.value = withSpring(0, { damping: 16, stiffness: 220 })
  }, [footerTranslateY, loading, loadError, property])

  const handleOpenBottomsheet = () => {
    if (modalizeRef.current) {
      modalizeRef.current.open()
    }
  }

  const handleOpenStayInfo = () => {
    stayInfoModalizeRef.current?.open()
  }

  const stayInfo = useMemo(() => {
    if (!property) {
      return {
        description: "",
        previewDescription: "",
        specItems: [] as string[],
        extendedDetails: [] as { title: string; value: string }[],
        showMore: false,
        hasContent: false,
      }
    }

    const description = getStayDescription(property)
    const specItems = getStaySpecItems(property)
    const extendedDetails = getStayExtendedDetails(property)
    const previewDescription = truncateStayDescription(description)
    const showMore = shouldShowStayMore(description, specItems.length, extendedDetails.length)

    return {
      description,
      previewDescription,
      specItems,
      extendedDetails,
      showMore,
      hasContent: Boolean(description || specItems.length || extendedDetails.length),
    }
  }, [property])

  const galleryImages = useMemo(
    () => (property ? getPropertyImages(property) : []),
    [property],
  )

  const imageViewerUrls = useMemo(
    () => galleryImages.map((url) => ({ url })),
    [galleryImages],
  )

  const getproperty = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/properties/getParticularProperty`, {
        propertyId: id,
      })
      setProperty(response.data.data)
    } catch (err) {
      setProperty(undefined)
      setUsers(undefined)
      setLoadError("We couldn't load this property. Please try again.")
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getproperty()
  }, [])

  const getUser = async () => {
    try {
      const userId = property?.userId
      if (!userId) return
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/user/getUser`, { userId })
      setUsers(response.data.user)
    } catch (error) {
      console.log("error in fetching user")
    }
  }

  useEffect(() => {
    getUser()
  }, [property])

  const plural = (value: number, singular: string, pluralLabel = `${singular}s`) =>
    value === 1 ? `${value} ${singular}` : `${value} ${pluralLabel}`

  const formatQuickFacts = (p?: PropertyInterface) => {
    const guests = typeof p?.guests === "number" ? plural(p.guests, "guest") : "— guests"
    const bedsCount =
      typeof p?.beds === "number" ? p.beds : typeof p?.bedrooms === "number" ? p.bedrooms : undefined
    const beds = typeof bedsCount === "number" ? plural(bedsCount, "bed") : "— beds"
    const baths = typeof p?.bathroom === "number" ? plural(p.bathroom, "bath") : "— baths"
    const size =
      typeof p?.size === "number" && Number.isFinite(p.size)
        ? `${p.size} m²`
        : p?.size
          ? `${String(p.size)} m²`
          : "— m²"

    return { guests, beds, baths, size }
  }

  const handleWishlistToggle = () => {
    const propertyId = property?._id

    if (!user?._id) {
      router.push("/(tabs)/Menu")
      return
    }
    if (!propertyId || wishlistBusy) return

    setWishlistBusy(true)
    toggleWishlistProperty(propertyId)
      .then(async () => {
        wishlistScale.value = withSequence(withSpring(1.25, { damping: 14, stiffness: 220 }), withSpring(1, { damping: 14, stiffness: 220 }))
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        } catch {
          // ignore haptics failures (e.g. simulator)
        }
      })
      .catch(() => {
        // rollback is handled inside toggleWishlistProperty
      })
      .finally(() => {
        setWishlistBusy(false)
      })
  }

  const openImageViewer = (index: number) => {
    setImageIndex(index)
    setImagesModal(true)
  }

  const renderAllPhotos = () => (
    <Modal
      animationType="fade"
      transparent
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false)
        setImagesModal(false)
      }}
    >
      <View style={styles.modalContainer}>
        <ScrollView
          contentContainerStyle={styles.photoGridScroll}
          showsVerticalScrollIndicator={false}
        >
          <PropertyBentoGrid images={galleryImages} onImagePress={openImageViewer} />
        </ScrollView>
        <Pressable
          style={styles.closeButton}
          onPress={() => {
            setModalVisible(false)
            setImagesModal(false)
          }}
          accessibilityRole="button"
          accessibilityLabel="Close photo gallery"
        >
          <Ionicons name="close" size={24} color="white" />
        </Pressable>
      </View>

      <Modal visible={imagesModal} transparent onRequestClose={() => setImagesModal(false)}>
        <ImageViewer
          enableSwipeDown
          onSwipeDown={() => setImagesModal(false)}
          imageUrls={imageViewerUrls}
          index={imageIndex}
          onChange={(index) => {
            if (typeof index === "number") setImageIndex(index)
          }}
        />
      </Modal>
    </Modal>
  )

  const renderHeaderSkeleton = () => (
    <View style={styles.headerSkeleton} accessibilityLabel="Loading property photos">
      <View style={styles.skeletonPulse} />
    </View>
  )

  const renderContentSkeleton = () => (
    <View style={styles.contentContainer}>
      <View style={styles.section}>
        <View style={[styles.skeletonLine, { width: "68%" }]} />
        <View style={[styles.skeletonLine, { width: "46%" }]} />
        <View style={[styles.skeletonLine, { width: "40%", marginBottom: sp.lg }]} />

        <View style={styles.skeletonChipsRow}>
          <View style={styles.skeletonChip} />
          <View style={styles.skeletonChip} />
          <View style={styles.skeletonChip} />
          <View style={styles.skeletonChip} />
        </View>

        <View style={[styles.skeletonLine, { width: "58%", marginTop: sp.lg }]} />
        <View style={[styles.skeletonBlock, { height: 110 }]} />
      </View>
    </View>
  )

  const renderErrorState = () => (
    <View style={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{loadError}</Text>
        <TouchableOpacity
          style={[styles.retryButton, globalStyles.btn]}
          onPress={getproperty}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={[globalStyles.btnText, styles.retryButtonText]}>Try again</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderPropertyInfo = () => {
    const propertyTitle = property ? getPropertyDisplayName(property) : "Property"
    const locationLine = property ? formatPropertyLocationLine(property) : ""
    const trustSummary = property ? getPropertyTrustSummary(property) : { kind: "new" as const }
    const trustText = formatTrustRowText(trustSummary)
    const hasRating = trustSummary.kind !== "new"
    const quickFacts = formatQuickFacts(property)

    return (
      <View style={styles.section}>
        <Text
          style={styles.propertyName}
          accessibilityRole="header"
          accessibilityLabel={propertyTitle}
        >
          {propertyTitle}
        </Text>

        {locationLine ? (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={c.inkMuted} />
            <Text style={styles.locationText}>{locationLine}</Text>
          </View>
        ) : null}

        <Text style={[styles.trustRow, !hasRating && styles.trustRowMuted]}>{trustText}</Text>

        {property?.propertyType ? (
          <View style={styles.propertyTypeTag}>
            <Ionicons name="home-outline" color={c.inkMuted} size={14} />
            <Text style={styles.propertyTypeText}>{property.propertyType}</Text>
          </View>
        ) : null}

        {property?.VSID ? (
          <Text style={styles.vsidMeta}>VS ID · {property.VSID}</Text>
        ) : null}

        <View style={styles.detailsRow}>
          <View style={styles.detailBox}>
            <Ionicons name="person" size={18} color={c.inkMuted} />
            <Text style={styles.detailText}>{quickFacts.guests}</Text>
          </View>
          <View style={styles.detailBox}>
            <Ionicons name="bed" size={18} color={c.inkMuted} />
            <Text style={styles.detailText}>{quickFacts.beds}</Text>
          </View>
          <View style={styles.detailBox}>
            <FontAwesome name="bath" size={18} color={c.inkMuted} />
            <Text style={styles.detailText}>{quickFacts.baths}</Text>
          </View>
          <View style={styles.detailBox}>
            <MaterialCommunityIcons name="floor-plan" size={18} color={c.inkMuted} />
            <Text style={styles.detailText}>{quickFacts.size}</Text>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Stay Information</Text>

          {stayInfo.hasContent ? (
            <Pressable
              style={styles.stayInfoCard}
              onPress={handleOpenStayInfo}
              accessibilityRole="button"
              accessibilityLabel="Open stay information"
            >
              {stayInfo.previewDescription ? (
                <Text style={styles.descriptionText} numberOfLines={4}>
                  {stayInfo.previewDescription}
                </Text>
              ) : null}

              {stayInfo.specItems.slice(0, 2).map((item) => (
                <View key={item} style={styles.staySpecRow}>
                  <View style={styles.staySpecDot} />
                  <Text style={styles.staySpecText}>{item}</Text>
                </View>
              ))}

              {stayInfo.showMore || stayInfo.description || stayInfo.specItems.length > 0 ? (
                <View style={styles.showMoreRow}>
                  <Text style={styles.showMoreText}>Show more</Text>
                  <Ionicons name="chevron-forward" size={16} color={c.accent} />
                </View>
              ) : null}
            </Pressable>
          ) : (
            <Text style={styles.stayInfoEmpty}>No stay information available yet.</Text>
          )}
        </View>
      </View>
    )
  }

  const renderAmenities = () => {
    const amenities = property ? getActiveAmenities(property) : []
    const preview = amenities.slice(0, 5)
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesContainer}>
          {preview.map((amenity) => (
            <View style={styles.amenityItem} key={amenity}>
              <AmenityIcon amenity={amenity} size={16} color={c.accent} />
              <Text style={styles.amenityText} numberOfLines={1}>
                {amenity}
              </Text>
            </View>
          ))}
        </View>

        {amenities.length ? (
          <Pressable
            style={styles.showAllAmenitiesRow}
            onPress={handleOpenBottomsheet}
            accessibilityRole="button"
            accessibilityLabel={`Show all ${amenities.length} amenities`}
          >
            <Text style={styles.showAllAmenitiesText}>Show all {amenities.length} amenities</Text>
            <Ionicons name="chevron-forward" size={16} color={c.accent} />
          </Pressable>
        ) : null}
      </View>
    )
  }

  const renderReviewsSection = () => {
    if (!property) return null
    const rating = typeof (property as any).rating === "number" ? (property as any).rating : undefined
    const reviewCount = typeof (property as any).reviewCount === "number" ? (property as any).reviewCount : undefined
    const hasRating = typeof rating === "number" && rating > 0 && typeof reviewCount === "number" && reviewCount > 0

    return (
      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <View style={styles.reviewsHeaderLeft}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Text style={styles.reviewsSub}>
              {hasRating
                ? `★ ${rating!.toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
                : "★ New · Be the first to review"}
            </Text>
          </View>
          <Pressable
            onPress={() => reviewsModalizeRef.current?.open()}
            accessibilityRole="button"
            accessibilityLabel="Show all reviews"
            style={styles.reviewsLink}
          >
            <Text style={styles.reviewsLinkText}>Show all</Text>
            <Ionicons name="chevron-forward" size={16} color={c.accent} />
          </Pressable>
        </View>

        <View style={styles.reviewsEmptyCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={c.inkMuted} />
          <Text style={styles.reviewsEmptyText}>
            {hasRating ? "Read what guests loved about this stay." : "No reviews yet. Book and be the first to share feedback."}
          </Text>
        </View>
      </View>
    )
  }

  const renderLocationSection = () => {
    if (!property) return null
    const locationLine = [property.city, property.state, property.country].filter(Boolean).join(", ")
    const coords = getLatLng(property)
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Where you'll stay</Text>
        <Pressable
          style={styles.locationCard}
          onPress={() => Linking.openURL(buildMapsUrl(property))}
          accessibilityRole="button"
          accessibilityLabel="Open location in Maps"
        >
          <View style={styles.locationCardTop}>
            <View style={styles.locationPinWrap}>
              <Ionicons name="location" size={18} color={c.accent} />
            </View>
            <View style={styles.locationCopy}>
              <Text style={styles.locationCardTitle} numberOfLines={2}>
                {locationLine || property.country || "Location"}
              </Text>
              <Text style={styles.locationCardSub} numberOfLines={1}>
                {coords ? "Tap to open in Google Maps" : "Tap to open the area in Maps"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.inkPlaceholder} />
          </View>

          <PropertyMapPreview
            latitude={coords?.lat}
            longitude={coords?.lng}
            label={`Map of ${locationLine || "property location"}`}
          />
        </Pressable>
      </View>
    )
  }

  const renderPricingCard = () => {
    const isLongTerm = (property?.rentalType ?? "").toLowerCase().includes("long")
    const monthly = property?.basePriceLongTerm
    const minNights = property?.night?.[0]
    const maxNights = property?.night?.[1]
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <Text style={styles.subtitle}>
          {isLongTerm ? "Monthly pricing for long-term stays" : "Prices may increase on weekends and holidays"}
        </Text>

        <View style={styles.pricingBlock}>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Per {isLongTerm ? "month" : "night"}</Text>
            <Text style={styles.rowValue}>
              {isLongTerm ? `€${monthly ?? 0}` : `€${property?.basePrice ?? 0}`}
            </Text>
          </View>

          <View style={styles.blockDivider} />

          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Weekly discount</Text>
            <Text style={[styles.rowValue, styles.discountValue]}>
              €{property?.weeklyDiscount ?? 0}
            </Text>
          </View>

          <View style={styles.stayRow}>
            <View style={styles.stayCol}>
              <Text style={styles.stayKicker}>MIN. STAY</Text>
              <Text style={styles.stayValue}>{minNights ?? "—"} nights</Text>
            </View>
            <View style={styles.stayColRight}>
              <Text style={styles.stayKicker}>MAX. STAY</Text>
              <Text style={styles.stayValue}>{maxNights ?? "—"} nights</Text>
            </View>
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
          <View style={styles.hostNameRow}>
            <Text style={styles.hostName}>{users?.name}</Text>
            {users?.isVerified ? (
              <View style={styles.verifiedPill}>
                <Ionicons name="shield-checkmark" size={14} color={c.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.hostDetails}>
          <View style={styles.hostDetailItem}>
            <MaterialIcons name="date-range" size={20} color={c.inkMuted} />
            <Text style={styles.hostDetailText}>
              Joined {users?.createdAt && new Date(users.createdAt).getFullYear()}
            </Text>
          </View>
          <View style={styles.hostDetailItem}>
            <Ionicons name="language-outline" size={20} color={c.inkMuted} />
            <Text style={styles.hostDetailText}>
              Language Spoken - {users?.spokenLanguage || "English"}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  const renderThingsToKnow = () => {
    const checkIn = property?.time?.[0]
    const checkOut = property?.time?.[1]
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Check-in & check-out</Text>
        <View style={styles.checkBlock}>
          <View style={styles.checkCol}>
            <Text style={styles.checkLabel}>Check-In</Text>
            <Text style={styles.checkTime}>{checkIn ?? "—"}:00</Text>
          </View>
          <View style={styles.checkDivider} />
          <View style={styles.checkCol}>
            <Text style={styles.checkLabel}>Check-Out</Text>
            <Text style={styles.checkTime}>{checkOut ?? "—"}:00</Text>
          </View>
        </View>

        <View style={styles.blockDividerWide} />

        <Text style={styles.subSectionTitle}>House rules</Text>
        <View style={styles.rulesList}>
          {(property?.additionalRules ?? []).map((item, index) => (
            <View key={index} style={styles.ruleRow}>
              <Ionicons name="checkmark-circle" size={18} color={c.inkMuted} />
              <Text style={styles.ruleRowText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  const canReserve = Boolean(property) && !loading && !loadError

  return (
    <SafeAreaView style={styles.safeAreaView} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.flatListContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {loading ? (
            renderHeaderSkeleton()
          ) : property && hasPropertyPhotos(property) ? (
            <Pressable
              onPress={() => setModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={`Show all ${galleryImages.length} photos`}
            >
              <Carousel
                loop={galleryImages.length > 1}
                height={300}
                width={screenWidth}
                data={galleryImages}
                onSnapToItem={(idx) => setImageIndex(idx)}
                renderItem={({ item }) => (
                  <View>
                    <PropertyGalleryImage uri={item} containerStyle={styles.carouselImage} />
                  </View>
                )}
              />
            </Pressable>
          ) : (
            <Text style={styles.noImagesText}>No images available</Text>
          )}

          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={c.ink} />
          </Pressable>

          {/* Photo count + wishlist overlay */}
          {!loading && property && hasPropertyPhotos(property) ? (
            <View style={styles.heroOverlayBottom} pointerEvents="box-none">
              <Pressable
                style={styles.photosPill}
                onPress={() => setModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={`Show all ${galleryImages.length} photos`}
              >
                  <Animated.Text
                    key={imageIndex}
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(150)}
                    style={styles.photosPillText}
                  >
                  {imageIndex + 1} / {galleryImages.length} photos
                  </Animated.Text>
              </Pressable>
              <TouchableOpacity
                style={styles.wishlistBtn}
                activeOpacity={0.85}
                onPress={handleWishlistToggle}
                disabled={wishlistBusy}
              >
                <Animated.View style={wishlistAnimStyle}>
                  <Ionicons
                    name={isWishlisted ? "heart" : "heart-outline"}
                    size={18}
                    color={c.surface}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {loading ? (
          renderContentSkeleton()
        ) : loadError ? (
          renderErrorState()
        ) : (
          <View style={styles.contentContainer} key={property?._id}>
            {renderPropertyInfo()}
            {renderReviewsSection()}
            {renderAmenities()}
            {renderLocationSection()}
            {renderThingsToKnow()}
            {renderHostInfo()}
            {renderPricingCard()}
          </View>
        )}
      </ScrollView>
      {!loading && modalVisible ? renderAllPhotos() : null}
      <Modalize
        ref={modalizeRef}
        modalHeight={AMENITIES_SHEET_HEIGHT}
        handlePosition="inside"
        withHandle={false}
        disableScrollIfPossible={false}
        modalStyle={styles.staySheetModal}
        scrollViewProps={{
          showsVerticalScrollIndicator: false,
          bounces: true,
          nestedScrollEnabled: true,
          keyboardShouldPersistTaps: "handled",
        }}
        onClose={() => setBottomsheetVisible(false)}
        onOpen={() => setBottomsheetVisible(true)}
      >
        <AmenitiesSheet property={property} onClose={() => modalizeRef.current?.close()} />
      </Modalize>

      <Modalize
        ref={stayInfoModalizeRef}
        modalHeight={stayInfoSheetHeight}
        handlePosition="inside"
        withHandle={false}
        disableScrollIfPossible={false}
        modalStyle={styles.staySheetModal}
        scrollViewProps={{
          showsVerticalScrollIndicator: false,
          bounces: true,
          nestedScrollEnabled: true,
          keyboardShouldPersistTaps: "handled",
        }}
      >
        <StayInfoSheet
          property={property}
          stayInfo={stayInfo}
          onContentHeight={(h) => {
            if (!h || !Number.isFinite(h)) return
            const capped = Math.min(Math.max(320, Math.ceil(h)), STAY_INFO_SHEET_HEIGHT)
            setStayInfoSheetHeight(capped)
          }}
          onClose={() => stayInfoModalizeRef.current?.close()}
        />
      </Modalize>

      <Modalize
        ref={reviewsModalizeRef}
        modalHeight={STAY_INFO_SHEET_HEIGHT}
        handlePosition="inside"
        withHandle={false}
        disableScrollIfPossible={false}
        modalStyle={styles.staySheetModal}
        scrollViewProps={{
          showsVerticalScrollIndicator: false,
          bounces: true,
          nestedScrollEnabled: true,
          keyboardShouldPersistTaps: "handled",
        }}
      >
        <ReviewsSheet
          rating={(property as any)?.rating}
          reviewCount={(property as any)?.reviewCount}
          items={[]}
          onClose={() => reviewsModalizeRef.current?.close()}
        />
      </Modalize>

      <Animated.View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }, footerAnimStyle]}>
        <View style={styles.footerContent}>
          {(() => {
            const p = getDisplayPrice(property)
            return (
          <View style={styles.priceContainer}>
            <Text style={styles.footerPrice}>{p.text}</Text>
            {p.suffix ? <Text style={styles.perNight}>{p.suffix}</Text> : null}
          </View>
            )
          })()}
          <TouchableOpacity
            onPress={() => {
              if (!canReserve) return
              if (user) {
                router.push(`/(screens)/reserve-page/${id}` as Route)
              } else {
                router.push("/(tabs)/Menu")
              }
            }}
            style={[globalStyles.btn, styles.reserveButton, !canReserve && styles.reserveButtonDisabled]}
            disabled={!canReserve}
          >
            <Text style={[globalStyles.btnText, styles.reserveButtonText]}>
              {loading ? "Loading…" : loadError ? "Unavailable" : "Reserve"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: c.surface,
  },
  flatListContainer: {
    paddingBottom: 100,
  },
  imageContainer: {
    backgroundColor: c.track,
    position: "relative",
  },
  carouselImage: {
    height: 300,
    width: "100%",
  },
  headerSkeleton: {
    height: 300,
    backgroundColor: c.track,
    overflow: "hidden",
  },
  skeletonPulse: {
    flex: 1,
    opacity: 0.7,
    backgroundColor: c.border,
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.overlayLight,
    zIndex: 2,
    shadowColor: c.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  noImagesText: {
    textAlign: 'center',
    padding: 40,
    fontSize: 16,
    color: c.inkMuted,
  },
  heroOverlayBottom: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  photosPill: {
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  photosPillText: {
    color: c.surface,
    fontWeight: "800",
    fontSize: 12,
  },
  wishlistBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  contentContainer: {
    backgroundColor: c.surface,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: c.border,
    marginBottom: 10,
    opacity: 0.7,
  },
  skeletonBlock: {
    width: "100%",
    borderRadius: r.lg,
    backgroundColor: c.border,
    opacity: 0.6,
    marginTop: 10,
  },
  skeletonChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skeletonChip: {
    width: "47%",
    height: 38,
    borderRadius: r.md,
    backgroundColor: c.border,
    opacity: 0.6,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: c.ink,
    marginBottom: sp.sm,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: c.inkMuted,
    marginBottom: sp.md,
  },
  retryButton: {
    width: "100%",
    marginTop: sp.sm,
  },
  retryButtonText: {
    fontWeight: "700",
  },
  section: {
    paddingHorizontal: sp.lg - 4,
    paddingVertical: sp.lg,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
  },
  sectionTitle: {
    fontSize: booking.type.sectionTitleLarge.fontSize,
    fontWeight: booking.type.sectionTitleLarge.fontWeight,
    color: c.ink,
    marginBottom: sp.md,
  },
  subtitle: {
    fontSize: 14,
    color: c.inkMuted,
    marginBottom: sp.md,
  },
  propertyName: {
    fontSize: 26,
    fontWeight: "700",
    color: c.ink,
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: sp.sm,
  },
  trustRow: {
    fontSize: 14,
    fontWeight: "600",
    color: c.ink,
    marginBottom: sp.md,
  },
  trustRowMuted: {
    color: c.inkMuted,
    fontWeight: "500",
  },
  propertyTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.track,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: sp.sm,
  },
  propertyTypeText: {
    fontSize: 14,
    color: c.inkMuted,
    fontWeight: '500',
  },
  vsidMeta: {
    fontSize: 12,
    color: c.inkMuted,
    fontWeight: "500",
    marginBottom: sp.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: sp.sm,
  },
  locationText: {
    fontSize: 15,
    color: c.inkSecondary,
    fontWeight: '500',
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
    backgroundColor: c.track,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: r.md,
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: c.ink,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  stayInfoCard: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    padding: sp.md,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    ...sh.card,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: c.inkSecondary,
  },
  staySpecRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  staySpecDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.accent,
    marginTop: 8,
  },
  staySpecText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: c.inkSecondary,
  },
  showMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: "600",
    color: c.accent,
  },
  stayInfoEmpty: {
    fontSize: 15,
    lineHeight: 22,
    color: c.inkMuted,
  },
  staySheetModal: {
    backgroundColor: c.bg,
    borderTopLeftRadius: r.sheet,
    borderTopRightRadius: r.sheet,
    overflow: "hidden",
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityItem: {
    backgroundColor: c.track,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "100%",
  },
  amenityText: {
    fontSize: 14,
    color: c.inkSecondary,
    flexShrink: 1,
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: sp.md,
  },
  reviewsHeaderLeft: {
    flex: 1,
    gap: 6,
  },
  reviewsSub: {
    fontSize: 14,
    fontWeight: "600",
    color: c.inkMuted,
  },
  reviewsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  reviewsLinkText: {
    fontSize: 15,
    fontWeight: "700",
    color: c.accent,
  },
  reviewsEmptyCard: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    padding: sp.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    ...sh.card,
  },
  reviewsEmptyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: c.inkSecondary,
  },
  locationCard: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    overflow: "hidden",
  },
  locationCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: sp.md,
    paddingTop: sp.md,
    paddingBottom: sp.sm,
  },
  locationPinWrap: {
    width: 36,
    height: 36,
    borderRadius: r.md,
    backgroundColor: c.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  locationCopy: {
    flex: 1,
    gap: 2,
  },
  locationCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: c.ink,
    letterSpacing: -0.2,
  },
  locationCardSub: {
    fontSize: 12,
    fontWeight: "600",
    color: c.inkMuted,
  },
  showAllAmenitiesRow: {
    marginTop: sp.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  showAllAmenitiesText: {
    fontSize: 15,
    fontWeight: "600",
    color: c.accent,
  },
  rateContainer: {
    gap: 16,
  },
  pricingBlock: {
    marginTop: 6,
    gap: 14,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 16,
    color: c.inkSecondary,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 16,
    color: c.ink,
    fontWeight: "600",
  },
  discountValue: {
    color: c.success,
  },
  blockDivider: {
    height: 1,
    backgroundColor: c.border,
  },
  stayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
  },
  stayCol: {
    flex: 1,
  },
  stayColRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  stayKicker: {
    fontSize: 12,
    color: c.inkMuted,
    fontWeight: "600",
  },
  stayValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "400",
    color: c.ink,
  },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 16,
    color: c.inkSecondary,
  },
  ratePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: c.ink,
  },
  rateValue: {
    fontSize: 16,
    color: c.ink,
  },
  hostProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  hostNameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 8,
  },
  hostImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  hostName: {
    fontSize: 18,
    fontWeight: '600',
    color: c.ink,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: c.successSoft,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "700",
    color: c.success,
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
    color: c.inkMuted,
  },
  checkInOutContainer: {
    marginBottom: 20,
  },
  checkInOutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: c.track,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: r.sm,
    borderTopRightRadius: r.sm,
  },
  checkInOutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: c.ink,
  },
  checkInOutTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: c.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: c.border,
    borderBottomLeftRadius: r.sm,
    borderBottomRightRadius: r.sm,
  },
  checkInOutTime: {
    fontSize: 16,
    color: c.ink,
  },
  rulesContainer: {
    gap: 8,
  },
  blockHeading: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "400",
    color: c.ink,
  },
  checkBlock: {
    marginTop: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: r.md,
    overflow: "hidden",
    backgroundColor: c.surface,
  },
  checkCol: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkDivider: {
    width: 1,
    backgroundColor: c.border,
  },
  checkLabel: {
    fontSize: 12,
    color: c.inkMuted,
    fontWeight: "600",
  },
  checkTime: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
    color: c.ink,
  },
  blockDividerWide: {
    height: 1,
    backgroundColor: c.border,
    marginVertical: 18,
  },
  rulesList: {
    marginTop: 10,
  },
  subSectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: c.ink,
    marginTop: sp.sm,
    marginBottom: sp.sm,
    letterSpacing: -0.2,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
  },
  ruleRowText: {
    flex: 1,
    fontSize: 16,
    color: c.inkSecondary,
    fontWeight: "400",
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: c.inkSecondary,
  },
  ruleText: {
    fontSize: 16,
    color: c.inkSecondary,
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingHorizontal: sp.lg - 4,
    paddingVertical: sp.md,
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
    color: c.ink,
  },
  perNight: {
    fontSize: 16,
    color: c.inkMuted,
  },
  reserveButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  reserveButtonDisabled: {
    opacity: 0.55,
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: c.surface,
  },
  photoGridScroll: {
    paddingBottom: 24,
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
    padding: sp.lg - 4,
  },
})