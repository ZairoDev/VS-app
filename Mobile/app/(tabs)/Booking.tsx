import { useEffect, useState, useRef } from "react"
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
  Modal,
  Animated,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5, AntDesign } from "@expo/vector-icons"
import axios from "axios"
import { useAuthStore } from "@/store/auth-store"
import type { Booking } from "@/types"
import { router } from "expo-router"

const { width, height } = Dimensions.get("window")
const CARD_WIDTH = width * 0.85

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  return new Date(dateString).toLocaleDateString("en-IN", options)
}

const formatFullDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
  return new Date(dateString).toLocaleDateString("en-IN", options)
}

const BookingHubScreen = () => {
  // Main state
  const [activeTab, setActiveTab] = useState("upcoming")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const travellerId = user?._id
  const scrollViewRef = useRef<ScrollView>(null)

  // Modal states
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState("")

  // Animation values
  const slideAnimation = useRef(new Animated.Value(0)).current
  const fadeAnimation = useRef(new Animated.Value(0)).current

  // Fetch bookings
  const getBookings = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}/booking/${travellerId}`)
      setBookings(response.data.bookings)
    } catch (error: any) {
      console.error("error fetching bookings", error)
      Alert.alert("Error", "Failed to load bookings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getBookings()
  }, [travellerId])

  // Handle contact host via email or phone
  const handleContactHost = (email: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`)
    } else {
      Alert.alert("Contact Info", "Host email is not available")
    }
  }

  // Add a new function for calling the host
  const handleCallHost = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`)
    } else {
      Alert.alert("Contact Info", "Host phone number is not available")
    }
  }

  // Handle contact customer support
  const handleContactSupport = () => {
    Linking.openURL(`tel:+447897037080 `)
  }

  // Handle pay platform fees
  const handlePayPlatformFees = async (booking: Booking) => {
    Alert.alert(
      "Pay Platform Fees",
      "You are about to pay the platform fees for this booking.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue to Payment",
          onPress: async () => {
            try {
              const response = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/pay/create-order`, {
                amount: booking.price,
              });
              const orderId = response.data.order.id;
  
              router.push({
                pathname: "/(screens)/pages/payment-webview-screen",
                params: {
                  orderId,
                  amount: booking.price.toString(),
                  bookingId: booking._id,
                },
              });
  
            } catch (error) {
              console.error("Payment order creation failed", error);
              Alert.alert("Error", "Failed to create payment order.");
            }
          }
        }
      ]
    );
  };

  const handleCancelBooking = (id: string) => {
    if (!selectedBooking) {
      // If called from the main list view, find the booking
      const booking = bookings.find((b) => b._id === id)
      if (!booking) {
        Alert.alert("Error", "Booking not found")
        return
      }

      // If user hasn't paid, just cancel without mentioning refunds
      if (booking.paymentStatus !== "paid") {
        Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
          { text: "No", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true)
                await axios.patch(`${process.env.EXPO_PUBLIC_BASE_URL}/booking/${id}`, {
                  bookingStatus: "cancelled",
                })
                getBookings()
                if (detailsModalVisible) {
                  setDetailsModalVisible(false)
                }
                Alert.alert("Success", "Your booking has been cancelled")
              } catch (error) {
                console.error("Error cancelling booking:", error)
                Alert.alert("Error", "Failed to cancel booking. Please try again.")
              } finally {
                setLoading(false)
              }
            },
          },
        ])
        return
      }

      // Calculate days until booking
      const today = new Date()
      const startDate = new Date(booking.startDate)
      const daysUntilBooking = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Determine refund percentage based on cancellation timing
      let refundPercentage = 0
      let refundMessage = ""

      if (daysUntilBooking > 7) {
        // More than a week before booking
        refundPercentage = 100
        refundMessage = "You will receive a 100% refund as you're cancelling more than a week before your booking."
      } else if (daysUntilBooking > 0) {
        // Between booking date and one week before
        refundPercentage = 70
        refundMessage =
          "You will receive a 70% refund as you're cancelling between your booking date and one week prior."
      } else {
        // On the booking date
        refundPercentage = 50
        refundMessage = "You will receive a 50% refund as you're cancelling on your booking date."
      }

      // Calculate refund amount
      const refundAmount = (booking.price * refundPercentage) / 100

      Alert.alert(
        "Cancel Booking",
        `${refundMessage}\n\nRefund Amount: €${refundAmount.toLocaleString("en-IN")}\n\nAre you sure you want to cancel this booking?`,
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true)
                await axios.patch(`${process.env.EXPO_PUBLIC_BASE_URL}/booking/${id}`, {
                  bookingStatus: "cancelled",
                  refundAmount: refundAmount,
                  refundPercentage: refundPercentage,
                  paymentStatus: "refunded",
                })
                getBookings()
                if (detailsModalVisible) {
                  setDetailsModalVisible(false)
                }
                Alert.alert(
                  "Success",
                  `Your booking has been cancelled and a refund of €${refundAmount.toLocaleString("en-IN")} (${refundPercentage}%) has been initiated.`,
                )
              } catch (error) {
                console.error("Error cancelling booking:", error)
                Alert.alert("Error", "Failed to cancel booking. Please try again.")
              } finally {
                setLoading(false)
              }
            },
          },
        ],
      )
      return
    } else {
      // If called from the details modal, use the selectedBooking
      // If user hasn't paid, just cancel without mentioning refunds
      if (selectedBooking.paymentStatus !== "paid") {
        Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
          { text: "No", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true)
                await axios.patch(`${process.env.EXPO_PUBLIC_BASE_URL}/booking/${id}`, {
                  bookingStatus: "cancelled",
                })
                getBookings()
                if (detailsModalVisible) {
                  setDetailsModalVisible(false)
                }
                Alert.alert("Success", "Your booking has been cancelled")
              } catch (error) {
                console.error("Error cancelling booking:", error)
                Alert.alert("Error", "Failed to cancel booking. Please try again.")
              } finally {
                setLoading(false)
              }
            },
          },
        ])
        return
      }

      // Calculate days until booking
      const today = new Date()
      const startDate = new Date(selectedBooking.startDate)
      const daysUntilBooking = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Determine refund percentage based on cancellation timing
      let refundPercentage = 0
      let refundMessage = ""

      if (daysUntilBooking > 7) {
        // More than a week before booking
        refundPercentage = 100
        refundMessage = "You will receive a 100% refund as you're cancelling more than a week before your booking."
      } else if (daysUntilBooking > 0) {
        // Between booking date and one week before
        refundPercentage = 70
        refundMessage =
          "You will receive a 70% refund as you're cancelling between your booking date and one week prior."
      } else {
        // On the booking date
        refundPercentage = 50
        refundMessage = "You will receive a 50% refund as you're cancelling on your booking date."
      }

      // Calculate refund amount
      const refundAmount = (selectedBooking.price * refundPercentage) / 100

      Alert.alert(
        "Cancel Booking",
        `${refundMessage}\n\nRefund Amount: €${refundAmount.toLocaleString("en-IN")}\n\nAre you sure you want to cancel this booking?`,
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true)
                await axios.patch(`${process.env.EXPO_PUBLIC_BASE_URL}/booking/${id}`, {
                  bookingStatus: "cancelled",
                  refundAmount: refundAmount,
                  refundPercentage: refundPercentage,
                  paymentStatus: "refunded",
                })
                getBookings()
                if (detailsModalVisible) {
                  setDetailsModalVisible(false)
                }
                Alert.alert(
                  "Success",
                  `Your booking has been cancelled and a refund of €${refundAmount.toLocaleString("en-IN")} (${refundPercentage}%) has been initiated.`,
                )
              } catch (error) {
                console.error("Error cancelling booking:", error)
                Alert.alert("Error", "Failed to cancel booking. Please try again.")
              } finally {
                setLoading(false)
              }
            },
          },
        ],
      )
    }
  }

  // Handle rebook
  const handleRebook = (booking: Booking) => {
    // Placeholder for rebooking functionality
    // You'll implement this part yourself
    Alert.alert(
      "Rebook Property",
      `You're about to rebook ${booking.propertyId.placeName}. This functionality will be implemented by you.`,
    )
  }

  // Handle view details
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setNotes(booking.notes || "")
    setDetailsModalVisible(true)

    // Animate the modal
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  // Handle save notes
  const handleSaveNotes = async () => {
    if (!selectedBooking) return

    try {
      setLoading(true)
      await axios.patch(`${process.env.EXPO_PUBLIC_BASE_URL}/booking/${selectedBooking._id}`, {
        notes: notes,
      })
      setIsEditingNotes(false)

      // Update the local booking data
      const updatedBookings = bookings.map((booking) =>
        booking._id === selectedBooking._id ? { ...booking, notes } : booking,
      )
      setBookings(updatedBookings)

      Alert.alert("Success", "Notes updated successfully")
    } catch (error) {
      console.error("Error updating notes:", error)
      Alert.alert("Error", "Failed to update notes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50"
      case "pending":
        return "#FFC107"
      case "cancelled":
        return "#F44336"
      default:
        return "#FFC107"
    }
  }

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#4CAF50"
      case "refunded":
        return "#2196F3"
      case "pending":
        return "#FFC107"
      default:
        return "#FFC107"
    }
  }

  // Filter bookings
  const upcomingBookings = bookings.filter(
    (item) => item.bookingStatus !== "cancelled" && new Date(item.endDate) >= new Date(),
  )
  const pastBookings = bookings.filter(
    (item) => item.bookingStatus === "cancelled" || new Date(item.endDate) < new Date(),
  )

  // Check if contact host button should be enabled
  const isContactHostEnabled = (booking: Booking) => {
    return booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid"
  }

  // Render booking card
  const renderBookingCard = (item: Booking) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => handleViewDetails(item)} key={item._id}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.propertyId.propertyCoverFileUrl }} style={styles.image} />
        <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]} style={styles.gradient} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.propertyId.placeName}
        </Text>

        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color="#666" />
          <Text style={styles.location} numberOfLines={1}>
            {item.propertyId.city}, {item.propertyId.country}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar-range" size={16} color="#fca42c" />
            <Text style={styles.detailText}>
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color="#fca42c" />
            <Text style={styles.detailText}>
              {item.guests.adults + item.guests.children + item.guests.infants} guests
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Total</Text>
            {item.totalNights > 0 && (
              <Text style={styles.nightsText}>
                {item.totalNights} {item.totalNights === 1 ? "night" : "nights"}
              </Text>
            )}
          </View>
          <Text style={styles.price}>Є{item.price.toLocaleString("en-IN")}</Text>
        </View>

        <View style={styles.hostRow}>
          <View style={styles.hostInfo}>
            <FontAwesome5 name="user-circle" size={16} color="#666" />
            <Text style={styles.hostName}>{item.userId.name}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {item.bookingStatus !== "confirmed" ? (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>Pending request confirmation</Text>
            </View>
          ) : (
            <>
              {isContactHostEnabled(item) ? (
                <View style={styles.contactButtonsContainer}>
                  <View style={styles.hostButtonsRow}>
                    <TouchableOpacity style={styles.hostButton} onPress={() => handleCallHost(item.userId.phone || "")}>
                      <Feather name="phone" size={16} color="#fff" />
                      <Text style={styles.buttonText}>Call Host</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.hostButton}
                      onPress={() => handleContactHost(item.userId.email || "")}
                    >
                      <Feather name="mail" size={16} color="#fff" />
                      <Text style={styles.buttonText}>Email Host</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
                    <Feather name="headphones" size={16} color="#5E72E4" />
                    <Text style={styles.supportButtonText}>Contact Vacation Saga</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.contactButtonsContainer, { opacity: 0.5 }]}>
                  {/* <View style={styles.hostButtonsRow}>
                    <TouchableOpacity style={styles.hostButton} disabled={true}>
                      <Feather name="phone" size={16} color="#fff" />
                      <Text style={styles.buttonText}>Call Host</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.hostButton} disabled={true}>
                      <Feather name="mail" size={16} color="#fff" />
                      <Text style={styles.buttonText}>Email Host</Text>
                    </TouchableOpacity>
                  </View> */}

                  <TouchableOpacity style={styles.supportButton} disabled={true}>
                    {/* <Feather name="headphones" size={16} color="#5E72E4" /> */}
                    <Text style={styles.supportButtonText}>Contact Vacation Saga</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.paymentStatus !== "paid" && (
                <TouchableOpacity style={styles.outlineButton} onPress={() => handlePayPlatformFees(item)}>
                  <Feather name="credit-card" size={18} color="#5E72E4" />
                  <Text style={styles.outlineButtonText}>Pay Fees</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {item.bookingStatus === "pending" && (
            <TouchableOpacity style={styles.dangerButton} onPress={() => handleCancelBooking(item._id)}>
              <Feather name="x-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {item.bookingStatus === "confirmed" && new Date(item.endDate) < new Date() && (
            <TouchableOpacity style={styles.outlineButton} onPress={() => handleRebook(item)}>
              <Feather name="refresh-cw" size={18} color="#5E72E4" />
              <Text style={styles.outlineButtonText}>Rebook</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="calendar" size={60} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No bookings found</Text>
      <Text style={styles.emptyStateText}>
        {activeTab === "upcoming" ? "You don't have any upcoming bookings" : "You don't have any past bookings"}
      </Text>
    </View>
  )

  // Render loading state
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
              {/* <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
                <Feather name="headphones" size={20} color="#fff" />
                <Text style={styles.supportButtonText}>Support</Text>
              </TouchableOpacity> */}
            </View>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
                onPress={() => setActiveTab("upcoming")}
              >
                <Text style={[styles.tabText, activeTab === "upcoming" && styles.activeTabText]}>Upcoming</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "past" && styles.activeTab]}
                onPress={() => setActiveTab("past")}
              >
                <Text style={[styles.tabText, activeTab === "past" && styles.activeTabText]}>Past</Text>
              </TouchableOpacity>
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
          : activeTab === "upcoming"
            ? upcomingBookings.length > 0
              ? upcomingBookings.map((item) => renderBookingCard(item))
              : renderEmptyState()
            : pastBookings.length > 0
              ? pastBookings.map((item) => renderBookingCard(item))
              : renderEmptyState()}
      </ScrollView>

      {/* Booking Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setDetailsModalVisible(false)
                  setIsEditingNotes(false)
                }}
              >
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            {selectedBooking && (
              <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.detailsHeader}>
                  <Image
                    source={{ uri: selectedBooking.propertyId.propertyCoverFileUrl }}
                    style={styles.detailsHeaderImage}
                  />
                  <LinearGradient
                    colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]}
                    style={styles.detailsHeaderGradient}
                  />
                </View>

                <View style={styles.detailsContent}>
                  <Text style={styles.detailsTitle}>{selectedBooking.propertyId.placeName}</Text>
                  <View style={styles.detailsLocationRow}>
                    <Feather name="map-pin" size={14} color="#666" />
                    <Text style={styles.detailsLocation}>
                      {selectedBooking.propertyId.city}, {selectedBooking.propertyId.country}
                    </Text>
                  </View>

                  <View style={styles.statusContainer}>
                    <View style={styles.statusItem}>
                      <Text style={styles.statusLabel}>Booking Status</Text>
                      <View
                        style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedBooking.bookingStatus) }]}
                      >
                        <Text style={styles.statusText}>{selectedBooking.bookingStatus}</Text>
                      </View>
                    </View>

                    <View style={styles.statusItem}>
                      <Text style={styles.statusLabel}>Payment Status</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getPaymentStatusColor(selectedBooking.paymentStatus) },
                        ]}
                      >
                        <Text style={styles.statusText}>{selectedBooking.paymentStatus}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Booking Details</Text>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailsGridItem}>
                        <MaterialCommunityIcons name="calendar-range" size={20} color="#fca42c" />
                        <View style={styles.detailsGridItemContent}>
                          <Text style={styles.detailsGridItemLabel}>Check-in</Text>
                          <Text style={styles.detailsGridItemValue}>{formatFullDate(selectedBooking.startDate)}</Text>
                        </View>
                      </View>

                      <View style={styles.detailsGridItem}>
                        <MaterialCommunityIcons name="calendar-range" size={20} color="#fca42c" />
                        <View style={styles.detailsGridItemContent}>
                          <Text style={styles.detailsGridItemLabel}>Check-out</Text>
                          <Text style={styles.detailsGridItemValue}>{formatFullDate(selectedBooking.endDate)}</Text>
                        </View>
                      </View>

                      <View style={styles.detailsGridItem}>
                        <Ionicons name="time-outline" size={20} color="#fca42c" />
                        <View style={styles.detailsGridItemContent}>
                          <Text style={styles.detailsGridItemLabel}>Duration</Text>
                          <Text style={styles.detailsGridItemValue}>
                            {selectedBooking.totalNights} {selectedBooking.totalNights === 1 ? "night" : "nights"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailsGridItem}>
                        <Ionicons name="people" size={20} color="#fca42c" />
                        <View style={styles.detailsGridItemContent}>
                          <Text style={styles.detailsGridItemLabel}>Guests</Text>
                          <Text style={styles.detailsGridItemValue}>
                            {selectedBooking.guests.adults} {selectedBooking.guests.adults === 1 ? "adult" : "adults"}
                            {selectedBooking.guests.children > 0 &&
                              `, ${selectedBooking.guests.children} ${selectedBooking.guests.children === 1 ? "child" : "children"}`}
                            {selectedBooking.guests.infants > 0 &&
                              `, ${selectedBooking.guests.infants} ${selectedBooking.guests.infants === 1 ? "infant" : "infants"}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Price Details</Text>
                    <View style={styles.priceDetails}>
                      <View style={styles.priceDetailRow}>
                        <Text style={styles.priceDetailLabel}>Total Amount</Text>
                        <Text style={styles.priceDetailValue}>Є{selectedBooking.price.toLocaleString("en-IN")}</Text>
                      </View>
                    </View>
                  </View>

                  {/* <View style={styles.detailsSection}>
                    <View style={styles.notesHeader}>
                      <Text style={styles.detailsSectionTitle}>Notes</Text>
                      {!isEditingNotes && (
                        <TouchableOpacity onPress={() => setIsEditingNotes(true)}>
                          <Feather name="edit-2" size={18} color="#5E72E4" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {isEditingNotes ? (
                      <View style={styles.notesEditContainer}>
                        <TextInput
                          style={styles.notesInput}
                          value={notes}
                          onChangeText={setNotes}
                          placeholder="Add notes about your stay..."
                          multiline
                          numberOfLines={4}
                        />
                        <View style={styles.notesActions}>
                          <TouchableOpacity
                            style={styles.notesCancelButton}
                            onPress={() => {
                              setNotes(selectedBooking.notes || "")
                              setIsEditingNotes(false)
                            }}
                          >
                            <Text style={styles.notesCancelText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.notesSaveButton} onPress={handleSaveNotes} disabled={loading}>
                            <Text style={styles.notesSaveText}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.notesText}>{notes ? notes : "No notes added yet."}</Text>
                    )}
                  </View> */}

                  <View style={styles.hostSection}>
                    <Text style={styles.detailsSectionTitle}>Host Information</Text>
                    <View style={styles.hostCard}>
                      <View style={styles.hostCardInfo}>
                        <FontAwesome5 name="user-circle" size={40} color="#666" />
                        <View style={styles.hostCardDetails}>
                          <Text style={styles.hostCardName}>{selectedBooking.userId.name}</Text>
                          <Text style={styles.hostCardJoined}>Host</Text>
                        </View>
                      </View>
                      {isContactHostEnabled(selectedBooking) ? (
                        <View style={styles.hostCardButtons}>
                          <TouchableOpacity
                            style={styles.hostCardButton}
                            onPress={() => handleCallHost(selectedBooking.userId.phone || "")}
                          >
                            <Feather name="phone" size={16} color="#fff" />
                            <Text style={styles.hostCardButtonText}>Call</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.hostCardButton}
                            onPress={() => handleContactHost(selectedBooking.userId.email || "")}
                          >
                            <Feather name="mail" size={16} color="#fff" />
                            <Text style={styles.hostCardButtonText}>Email</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={[styles.hostCardButtons, { opacity: 0.5 }]}>
                          <TouchableOpacity style={styles.hostCardButton} disabled={true}>
                            <Feather name="phone" size={16} color="#fff" />
                            <Text style={styles.hostCardButtonText}>Call</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.hostCardButton} disabled={true}>
                            <Feather name="mail" size={16} color="#fff" />
                            <Text style={styles.hostCardButtonText}>Email</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    {/* Show cancel button for pending, confirmed, or paid bookings */}
                    {(selectedBooking.bookingStatus === "pending" ||
                      selectedBooking.bookingStatus === "confirmed" ||
                      selectedBooking.paymentStatus === "paid") &&
                      selectedBooking.bookingStatus !== "cancelled" && (
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => handleCancelBooking(selectedBooking._id)}
                          disabled={loading}
                        >
                          <Feather name="x-circle" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Cancel Booking</Text>
                        </TouchableOpacity>
                      )}

                    {selectedBooking.bookingStatus === "confirmed" && selectedBooking.paymentStatus !== "paid" && (
                      <TouchableOpacity
                        style={styles.rebookButton}
                        onPress={() => handlePayPlatformFees(selectedBooking)}
                      >
                        <Feather name="credit-card" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Pay Platform Fees</Text>
                      </TouchableOpacity>
                    )}

                    {selectedBooking.bookingStatus === "confirmed" &&
                      new Date(selectedBooking.endDate) < new Date() && (
                        <TouchableOpacity
                          style={styles.rebookButton}
                          onPress={() => {
                            setDetailsModalVisible(false)
                            handleRebook(selectedBooking)
                          }}
                        >
                          <Feather name="refresh-cw" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Book Again</Text>
                        </TouchableOpacity>
                      )}
                  </View>
                </View>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
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

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.9,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalHeaderSpacer: {
    width: 28,
  },
  modalScrollContent: {
    flex: 1,
  },

  // Details modal styles
  detailsHeader: {
    height: 200,
    position: "relative",
  },
  detailsHeaderImage: {
    width: "100%",
    height: "100%",
  },
  detailsHeaderGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  detailsContent: {
    padding: 20,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  detailsLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  detailsLocation: {
    color: "#666",
    marginLeft: 4,
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statusItem: {
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  detailsSection: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailsGridItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "48%",
    marginBottom: 16,
  },
  detailsGridItemContent: {
    marginLeft: 8,
  },
  detailsGridItemLabel: {
    fontSize: 12,
    color: "#666",
  },
  detailsGridItemValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  priceDetails: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  priceDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceDetailLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceDetailValue: {
    fontSize: 14,
    color: "#333",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  notesEditContainer: {
    gap: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 100,
    textAlignVertical: "top",
  },
  notesActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  notesCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  notesCancelText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  notesSaveButton: {
    backgroundColor: "#5E72E4",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  notesSaveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  hostSection: {
    marginBottom: 24,
  },
  hostCard: {
    display: "flex",
    gap: 10,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 10,
    borderColor: "#5E72E4",
  },
  hostCardInfo: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  hostCardDetails: {
    marginLeft: 12,
  },
  hostCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  hostCardJoined: {
    fontSize: 12,
    color: "#666",
  },
  contactHostButton: {
    backgroundColor: "#fca42c",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactHostText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 40,
  },
  cancelButton: {
    backgroundColor: "#EF5350",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  rebookButton: {
    backgroundColor: "#fca42c",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: 10,
    borderRadius: 12,
    // flexDirection: "row",
    justifyContent: "center",
    // alignItems: "center",
    borderWidth: 1,
    borderColor: "#5E72E4",
  },
  supportButtonText: {
    color: "#5E72E4",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  contactButtonsContainer: {
    flex: 1,
    gap: 10,
  },
  hostButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  hostButton: {
    flex: 1,
    backgroundColor: "#fca42c",
    paddingVertical: 10,
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
  hostCardButtons: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",

    justifyContent: "space-around",
  },
  hostCardButton: {
    backgroundColor: "#fca42c",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    width: "45%",
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hostCardButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
})
