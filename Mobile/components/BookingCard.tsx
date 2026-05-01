import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Linking
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Booking } from '@/types';
import { formatDate } from '@/utils/dateFormatters';

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9; // Increased from 0.85 for better use of space

interface BookingCardProps {
  booking: Booking;
  onPress: (booking: Booking) => void;
  onCancel: (id: string) => void;
  loading: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  onCancel,
  loading,
}) => {
  const host = booking.userId ?? null
  const property = booking.propertyId ?? null

  const openWhatsApp = () => {
    const number = "447897037080"
    const text = encodeURIComponent(
      `Hi Vacation Saga team, I submitted a booking request (ID: ${booking._id}). Please help me with the next steps.`
    )
    Linking.openURL(`https://wa.me/${number}?text=${text}`)
  }

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={() => onPress(booking)}
    >
      {/* Image with Status Badge */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: property?.propertyCoverFileUrl || "https://via.placeholder.com/800x600?text=Vacation+Saga" }} 
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
          style={styles.gradient}
        />
        
        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          booking.bookingStatus === 'confirmed' 
            ? styles.confirmedBadge 
            : styles.pendingBadge
        ]}>
          <Text style={[
            styles.statusText,
            booking.bookingStatus === 'confirmed' 
              ? styles.confirmedText 
              : styles.pendingText
          ]}>
            {booking.bookingStatus === 'confirmed' ? 'Confirmed' : 'Pending'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Location */}
        <View style={styles.headerSection}>
          <Text style={styles.title} numberOfLines={2}>
            {property?.placeName ?? "Property"}
          </Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color="#666" />
            <Text style={styles.location} numberOfLines={1}>
              {property ? `${property.city}, ${property.country}` : "Location unavailable"}
            </Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar-range" size={16} color="#fca42c" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Dates</Text>
              <Text style={styles.detailText}>
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color="#fca42c" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Guests</Text>
              <Text style={styles.detailText}>
                {booking.guests.adults + booking.guests.children + booking.guests.infants} guests
              </Text>
            </View>
          </View>
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Total Price</Text>
            {booking.totalNights > 0 && (
              <Text style={styles.nightsText}>
                {booking.totalNights} {booking.totalNights === 1 ? 'night' : 'nights'}
              </Text>
            )}
          </View>
          <Text style={styles.price}>€{booking.price.toLocaleString('en-IN')}</Text>
        </View>

        {/* Status message */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIcon}>
            <Feather name="check-circle" size={16} color="#16a34a" />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>Booking request submitted</Text>
            <Text style={styles.infoText}>Our team will reach out to you very soon.</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.whatsAppButton}
            onPress={openWhatsApp}
            disabled={loading}
            activeOpacity={0.85}
          >
            <FontAwesome5 name="whatsapp" size={16} color="#fff" />
            <Text style={styles.whatsAppButtonText}>Chat with us on WhatsApp</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          {booking.bookingStatus === 'pending' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => onCancel(booking._id)}
              disabled={loading}
            >
              <Feather name="x-circle" size={16} color="#fff" />
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BookingCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    width: CARD_WIDTH,
    alignSelf: "center",
    overflow: "hidden",
  },
  imageContainer: {
    height: 200,
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
    height: "50%",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confirmedBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
  },
  pendingBadge: {
    backgroundColor: "rgba(255, 193, 7, 0.9)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  confirmedText: {
    color: "#fff",
  },
  pendingText: {
    color: "#fff",
  },
  content: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    lineHeight: 28,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    color: "#666",
    marginLeft: 6,
    fontSize: 15,
  },
  detailsGrid: {
    marginBottom: 20,
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 20,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  nightsText: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  hostSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  hostLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  hostName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  infoBanner: {
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 18,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  infoTextWrap: { flex: 1 },
  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#166534",
  },
  infoText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: "#166534",
    opacity: 0.9,
  },
  actionsContainer: {
    gap: 16,
  },
  whatsAppButton: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  whatsAppButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  waitingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3CD",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  waitingText: {
    color: "#856404",
    fontWeight: "600",
    fontSize: 14,
  },
  contactSection: {
    gap: 12,
  },
  disabledSection: {
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  contactButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: "#4CAF50",
  },
  emailButton: {
    backgroundColor: "#2196F3",
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5E72E4",
    backgroundColor: "rgba(94, 114, 228, 0.05)",
    gap: 8,
  },
  supportButtonText: {
    color: "#5E72E4",
    fontWeight: "600",
    fontSize: 14,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  payButton: {
    backgroundColor: "#FF9800",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  rebookButton: {
    borderWidth: 1.5,
    borderColor: "#5E72E4",
    backgroundColor: "rgba(94, 114, 228, 0.08)",
  },
  rebookButtonText: {
    color: "#5E72E4",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f44336",
    gap: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});