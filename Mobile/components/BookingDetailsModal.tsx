import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Animated,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Feather, AntDesign, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Booking } from '@/types';
import { formatFullDate } from '@/utils/dateFormatters';

const { width, height } = Dimensions.get("window");

interface BookingDetailsModalProps {
  visible: boolean;
  booking: Booking | null;
  loading: boolean;
  onClose: () => void;
  onCancelBooking: (id: string) => void;
  onPayPlatformFees: (booking: Booking) => void;
  onRebook: (booking: Booking) => void;
  onCallHost: (phone: string) => void;
  onEmailHost: (email: string) => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  visible,
  booking,
  loading,
  onClose,
  onCancelBooking,
  onPayPlatformFees,
  onRebook,
  onCallHost,
  onEmailHost
}) => {
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnimation.setValue(0);
    }
  }, [visible]);

  if (!booking) return null;

  const isContactHostEnabled = booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid";

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1000, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.detailsHeader}>
              <Image source={{ uri: booking.propertyId.propertyCoverFileUrl }} style={styles.detailsHeaderImage} />
              <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]} style={styles.detailsHeaderGradient} />
            </View>

            <View style={styles.detailsContent}>
              <Text style={styles.detailsTitle}>{booking.propertyId.placeName}</Text>
              <View style={styles.detailsLocationRow}>
                <Feather name="map-pin" size={14} color="#666" />
                <Text style={styles.detailsLocation}>{booking.propertyId.city}, {booking.propertyId.country}</Text>
              </View>

              <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Booking Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.bookingStatus) }]}>
                    <Text style={styles.statusText}>{booking.bookingStatus}</Text>
                  </View>
                </View>

                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Payment Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(booking.paymentStatus) }]}>
                    <Text style={styles.statusText}>{booking.paymentStatus}</Text>
                  </View>
                </View>
              </View>

              {/* Booking Details Grid */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Booking Details</Text>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailsGridItem}>
                    <MaterialCommunityIcons name="calendar-range" size={20} color="#fca42c" />
                    <View style={styles.detailsGridItemContent}>
                      <Text style={styles.detailsGridItemLabel}>Check-in</Text>
                      <Text style={styles.detailsGridItemValue}>{formatFullDate(booking.startDate)}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsGridItem}>
                    <MaterialCommunityIcons name="calendar-range" size={20} color="#fca42c" />
                    <View style={styles.detailsGridItemContent}>
                      <Text style={styles.detailsGridItemLabel}>Check-out</Text>
                      <Text style={styles.detailsGridItemValue}>{formatFullDate(booking.endDate)}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsGridItem}>
                    <Ionicons name="time-outline" size={20} color="#fca42c" />
                    <View style={styles.detailsGridItemContent}>
                      <Text style={styles.detailsGridItemLabel}>Duration</Text>
                      <Text style={styles.detailsGridItemValue}>
                        {booking.totalNights} {booking.totalNights === 1 ? "night" : "nights"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsGridItem}>
                    <Ionicons name="people" size={20} color="#fca42c" />
                    <View style={styles.detailsGridItemContent}>
                      <Text style={styles.detailsGridItemLabel}>Guests</Text>
                      <Text style={styles.detailsGridItemValue}>
                        {booking.guests.adults} {booking.guests.adults === 1 ? "adult" : "adults"}
                        {booking.guests.children > 0 && `, ${booking.guests.children} ${booking.guests.children === 1 ? "child" : "children"}`}
                        {booking.guests.infants > 0 && `, ${booking.guests.infants} ${booking.guests.infants === 1 ? "infant" : "infants"}`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Price Details */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Price Details</Text>
                <View style={styles.priceDetails}>
                  <View style={styles.priceDetailRow}>
                    <Text style={styles.priceDetailLabel}>Total Amount</Text>
                    <Text style={styles.priceDetailValue}>Є{booking.price.toLocaleString("en-IN")}</Text>
                  </View>
                </View>
              </View>

              {/* Host Info */}
              <View style={styles.hostSection}>
                <Text style={styles.detailsSectionTitle}>Host Information</Text>
                <View style={styles.hostCard}>
                  <View style={styles.hostCardInfo}>
                    <FontAwesome5 name="user-circle" size={40} color="#666" />
                    <View style={styles.hostCardDetails}>
                      <Text style={styles.hostCardName}>{booking.userId.name}</Text>
                      <Text style={styles.hostCardJoined}>Host</Text>
                    </View>
                  </View>

                  {isContactHostEnabled ? (
                    <View style={styles.hostCardButtons}>
                      <TouchableOpacity style={styles.hostCardButton} onPress={() => onCallHost(booking.userId.phone || "")}>
                        <Feather name="phone" size={16} color="#fff" />
                        <Text style={styles.hostCardButtonText}>Call</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.hostCardButton} onPress={() => onEmailHost(booking.userId.email || "")}>
                        <Feather name="mail" size={16} color="#fff" />
                        <Text style={styles.hostCardButtonText}>Email</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={[styles.hostCardButtons, { opacity: 0.5 }]}>
                      <TouchableOpacity style={styles.hostCardButton} disabled>
                        <Feather name="phone" size={16} color="#fff" />
                        <Text style={styles.hostCardButtonText}>Call</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.hostCardButton} disabled>
                        <Feather name="mail" size={16} color="#fff" />
                        <Text style={styles.hostCardButtonText}>Email</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {(booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed" || booking.paymentStatus === "paid") &&
                  booking.bookingStatus !== "cancelled" && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => onCancelBooking(booking._id)}
                      disabled={loading}
                    >
                      <Feather name="x-circle" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Cancel Booking</Text>
                    </TouchableOpacity>
                  )}

                {booking.bookingStatus === "confirmed" && booking.paymentStatus !== "paid" && (
                  <TouchableOpacity
                    style={styles.rebookButton}
                    onPress={() => onPayPlatformFees(booking)}
                    disabled={loading}
                  >
                    <Feather name="credit-card" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Pay Platform Fees</Text>
                  </TouchableOpacity>
                )}

                {booking.bookingStatus === "confirmed" && new Date(booking.endDate) < new Date() && (
                  <TouchableOpacity
                    style={styles.rebookButton}
                    onPress={() => {
                      onClose();
                      onRebook(booking);
                    }}
                  >
                    <Feather name="refresh-cw" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Book Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default BookingDetailsModal;

// Utility Functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "#4CAF50";
    case "pending": return "#FFC107";
    case "cancelled": return "#F44336";
    default: return "#FFC107";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid": return "#4CAF50";
    case "refunded": return "#2196F3";
    case "pending": return "#FFC107";
    default: return "#FFC107";
  }
};



const styles = StyleSheet.create({


  
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    // Note: "backdropFilter" is a web-only style; you can ignore or remove
    // backdropFilter: "blur(4px)",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailsGridItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailsGridItemContent: {
    marginLeft: 10,
    flex: 1,
  },
  detailsGridItemLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  detailsGridItemValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  priceDetails: {
    marginTop: 8,
  },
  priceDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  priceDetailLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  hostSection: {
    marginBottom: 24,
  },
  hostCard: {
    flexDirection: "column",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  hostCardInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  hostCardDetails: {
    marginLeft: 12,
  },
  hostCardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  hostCardJoined: {
    fontSize: 12,
    color: "#888",
  },
  hostCardButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  hostCardButton: {
    flex: 1,
    backgroundColor: "#5E72E4",
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  hostCardButtonText: {
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
    marginBottom: 12,
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
});