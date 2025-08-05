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
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnimation.setValue(0);
    }
  }, [visible]);

  if (!booking) return null;

  const isContactHostEnabled = booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid";
  const hasEnded = new Date(booking.endDate) < new Date();

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
                    outputRange: [height, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <View style={styles.closeButtonBackground}>
                <Feather name="x" size={20} color="#666" />
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Image */}
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: booking.propertyId.propertyCoverFileUrl }} 
                style={styles.heroImage}
                resizeMode="cover"
              />
              <LinearGradient 
                colors={["transparent", "rgba(0,0,0,0.1)"]} 
                style={styles.imageGradient} 
              />
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Title Section */}
              <View style={styles.titleSection}>
                <Text style={styles.propertyTitle}>{booking.propertyId.placeName}</Text>
                <View style={styles.locationContainer}>
                  <Feather name="map-pin" size={16} color="#9CA3AF" />
                  <Text style={styles.locationText}>
                    {booking.propertyId.city}, {booking.propertyId.country}
                  </Text>
                </View>
              </View>

              {/* Status Pills */}
              <View style={styles.statusContainer}>
                <View style={[styles.statusPill, getStatusStyle(booking.bookingStatus)]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(booking.bookingStatus) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(booking.bookingStatus) }]}>
                    {booking.bookingStatus}
                  </Text>
                </View>
                <View style={[styles.statusPill, getPaymentStatusStyle(booking.paymentStatus)]}>
                  <View style={[styles.statusDot, { backgroundColor: getPaymentStatusColor(booking.paymentStatus) }]} />
                  <Text style={[styles.statusText, { color: getPaymentStatusColor(booking.paymentStatus) }]}>
                    {booking.paymentStatus}
                  </Text>
                </View>
              </View>

              {/* Details Grid */}
              <View style={styles.detailsContainer}>
                <DetailItem
                  icon={<MaterialCommunityIcons name="calendar-check" size={20} color="#6B7280" />}
                  label="Check-in"
                  value={formatFullDate(booking.startDate)}
                />
                <DetailItem
                  icon={<MaterialCommunityIcons name="calendar-remove" size={20} color="#6B7280" />}
                  label="Check-out"
                  value={formatFullDate(booking.endDate)}
                />
                <DetailItem
                  icon={<Ionicons name="time-outline" size={20} color="#6B7280" />}
                  label="Duration"
                  value={`${booking.totalNights} ${booking.totalNights === 1 ? "night" : "nights"}`}
                />
                <DetailItem
                  icon={<Ionicons name="people-outline" size={20} color="#6B7280" />}
                  label="Guests"
                  value={`${booking.guests.adults + booking.guests.children + booking.guests.infants} guests`}
                />
              </View>

              {/* Price Section */}
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Total Amount</Text>
                <Text style={styles.priceValue}>€{booking.price.toLocaleString("en-IN")}</Text>
              </View>

              {/* Host Section */}
              <View style={styles.hostContainer}>
                <Text style={styles.sectionTitle}>Host</Text>
                <View style={styles.hostCard}>
                  <View style={styles.hostInfo}>
                    <View style={styles.hostAvatar}>
                      <FontAwesome5 name="user" size={18} color="#9CA3AF" />
                    </View>
                    <Text style={styles.hostName}>{booking.userId.name}</Text>
                  </View>
                  
                  {isContactHostEnabled && (
                    <View style={styles.hostActions}>
                      <TouchableOpacity 
                        style={styles.hostActionButton}
                        onPress={() => onCallHost(booking.userId.phone || "")}
                      >
                        <Feather name="phone" size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.hostActionButton}
                        onPress={() => onEmailHost(booking.userId.email || "")}
                      >
                        <Feather name="mail" size={16} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {booking.paymentStatus !== "paid" && booking.bookingStatus === "confirmed" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => onPayPlatformFees(booking)}
                    disabled={loading}
                  >
                    <Feather name="credit-card" size={18} color="#fff" />
                    <Text style={styles.primaryButtonText}>Pay Platform Fees</Text>
                  </TouchableOpacity>
                )}

                {hasEnded && booking.bookingStatus === "confirmed" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={() => {
                      onClose();
                      onRebook(booking);
                    }}
                  >
                    <Feather name="refresh-cw" size={18} color="#374151" />
                    <Text style={styles.secondaryButtonText}>Book Again</Text>
                  </TouchableOpacity>
                )}

                {(booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed")
                  && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={() => onCancelBooking(booking._id)}
                    disabled={loading}
                  >
                    <Feather name="x" size={18} color="#EF4444" />
                    <Text style={styles.dangerButtonText}>Cancel Booking</Text>
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

// Detail Item Component
const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <View style={styles.detailIcon}>{icon}</View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

export default BookingDetailsModal;

// Utility Functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "#10B981";
    case "pending": return "#F59E0B";
    case "cancelled": return "#EF4444";
    default: return "#6B7280";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid": return "#10B981";
    case "refunded": return "#3B82F6";
    case "pending": return "#F59E0B";
    default: return "#6B7280";
  }
};

const getStatusStyle = (status: string) => ({
  backgroundColor: `${getStatusColor(status)}15`,
});

const getPaymentStatusStyle = (status: string) => ({
  backgroundColor: `${getPaymentStatusColor(status)}15`,
});

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.92,
    maxHeight: height * 0.92,
  },
  header: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    flex: 1,
  },
  imageContainer: {
    height: 280,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 20,
  },
  propertyTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 34,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  detailsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
    paddingTop: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    marginBottom: 32,
  },
  priceLabel: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  hostContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  hostCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hostAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  hostName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  hostActions: {
    flexDirection: "row",
    gap: 8,
  },
  hostActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#111827",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  dangerButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
});