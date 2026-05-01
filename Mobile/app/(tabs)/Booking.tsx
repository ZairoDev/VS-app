import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  StatusBar,
  Dimensions,
  ScrollView,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5, AntDesign } from "@expo/vector-icons"
import axios from "axios";
import { useAuthStore } from "@/store/auth-store";
import type { Booking } from "@/types";
import { router, useFocusEffect } from "expo-router";
const { width, height } = Dimensions.get("window");
import BookingDetailsModal from "@/components/BookingDetailsModal";
import BookingCard from "@/components/BookingCard";
const CARD_WIDTH = width * 0.85;
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  return new Date(dateString).toLocaleDateString("en-IN", options);
}
const formatFullDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
  return new Date(dateString).toLocaleDateString("en-IN", options);
}
const BookingHubScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const travellerId = user?._id
  const scrollViewRef = useRef<ScrollView>(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const getBookings = async () => {
    if (!travellerId) {
      setBookings([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}/traveller-booking/${travellerId}`)
      setBookings(response.data.bookings)
    } catch (error: any) {
      // 404 from the backend means "no bookings yet" — treat it as an empty list, not an error.
      if (error?.response?.status === 404) {
        setBookings([])
      } else {
        console.error("error fetching bookings", error)
        Alert.alert("Error", "Failed to load bookings. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }
  // Refetch whenever the tab is focused (e.g. after a user returns here
  // from the reserve page after creating a new booking).
  useFocusEffect(
    useCallback(() => {
      getBookings()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [travellerId])
  )
const handleCancelBooking = (id: string) => {
  Alert.alert(
    "Cancel Booking",
    "Are you sure you want to cancel this booking?",
    [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true)
            const response = await axios.patch(`${process.env.EXPO_PUBLIC_BASE_URL}/traveller-booking/cancel/${id}`)
            getBookings()
            if (detailsModalVisible) {
              setDetailsModalVisible(false)
            }

            const { refundAmount, refundPercentage } = response.data

            if (refundAmount > 0) {
              Alert.alert(
                "Booking Cancelled",
                `Your booking has been cancelled and a refund of €${refundAmount.toLocaleString("en-IN")} (${refundPercentage}%) has been initiated.`
              )
            } else {
              Alert.alert("Booking Cancelled", "Your booking has been cancelled.")
            }
          } catch (error) {
            console.error("Cancel booking failed:", error)
            Alert.alert("Error", "Failed to cancel booking. Please try again.")
          } finally {
            setLoading(false)
          }
        },
      },
    ]
  )
}
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setDetailsModalVisible(true)
  }
  
  const upcomingBookings = bookings.filter(
    (item) => item.bookingStatus !== "cancelled"
  )
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="calendar" size={60} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No bookings found</Text>
      <Text style={styles.emptyStateText}>
        You don't have any bookings yet.
      </Text>
    </View>
  )
  const renderLoadingState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Loading bookings...</Text>
    </View>
  )
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <BlurView intensity={90} tint="dark" style={styles.blurView}>
          <LinearGradient
            colors={["#fca42c", "#ffb86b"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerTop}>
              <Text style={styles.heading}>My Bookings</Text>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={getBookings} />}
      >
        {loading
          ? renderLoadingState()
          : upcomingBookings.length > 0
            ? upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  loading={loading}
                  onPress={handleViewDetails}
                  onCancel={handleCancelBooking}
                />
              ))
            : renderEmptyState()}
      </ScrollView>
      <BookingDetailsModal
        visible={detailsModalVisible}
        booking={selectedBooking}
        loading={loading}
        onClose={() => {
          setDetailsModalVisible(false);
        }}
        onCancelBooking={handleCancelBooking}
/>
    </View>
  )
}
export default BookingHubScreen
const styles = StyleSheet.create({


  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 100,
    overflow: "hidden",
    height: 140,
  },
  blurView: {
    flex: 1,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  tabText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
    fontSize: 14,
  },
  activeTabText: {
    color: "#fff",
  },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 150 : 130,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: CARD_WIDTH,
    alignSelf: "center",
    overflow: "hidden",
  },
  imageContainer: {
    height: 180,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  paymentStatusContainer: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  location: {
    color: "#666",
    marginLeft: 4,
    fontSize: 14,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: 6,
    color: "#444",
    fontSize: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 12,
  },
  priceInfo: {
    flexDirection: "column",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  nightsText: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
  },
  hostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  hostName: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#fca42c",
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fca42c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerButton: {
    flex: 1,
    backgroundColor: "#EF5350",
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f5365c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#5E72E4",
    backgroundColor: "rgba(94, 114, 228, 0.08)",
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
  outlineButtonText: {
    color: "#5E72E4",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
  waitingContainer: {
    flex: 1,
    backgroundColor: "#FFC10780",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  waitingText: {
    color: "#7A5800",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    maxWidth: "80%",
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: "#fca42c",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  });
  