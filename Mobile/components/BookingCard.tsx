import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform
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
  onPayFees: (booking: Booking) => void;
  onRebook: (booking: Booking) => void;
  onCallHost: (phone: string) => void;
  onEmailHost: (email: string) => void;
  onContactSupport: () => void;
  loading: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  onCancel,
  onPayFees,
  onRebook,
  onCallHost,
  onEmailHost,
  onContactSupport,
  loading,
}) => {
  const isContactHostEnabled =
    booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'paid';
  const hasEnded = new Date(booking.endDate) < new Date();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={() => onPress(booking)}
    >
      {/* Image with Status Badge */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: booking.propertyId.propertyCoverFileUrl }} 
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
            {booking.propertyId.placeName}
          </Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color="#666" />
            <Text style={styles.location} numberOfLines={1}>
              {booking.propertyId.city}, {booking.propertyId.country}
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

        {/* Host Info */}
        <View style={styles.hostSection}>
          <FontAwesome5 name="user-circle" size={18} color="#666" />
          <Text style={styles.hostLabel}>Host:</Text>
          <Text style={styles.hostName}>{booking.userId.name}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {booking.bookingStatus !== 'confirmed' ? (
            <View style={styles.waitingContainer}>
              <Feather name="clock" size={16} color="#7A5800" />
              <Text style={styles.waitingText}>Pending host confirmation</Text>
            </View>
          ) : (
            <>
              {/* Contact Buttons */}
              <View style={[
                styles.contactSection,
                !isContactHostEnabled && styles.disabledSection
              ]}>
                <Text style={styles.sectionTitle}>Contact Host</Text>
                <View style={styles.contactButtonsRow}>
                  <TouchableOpacity
                    style={[styles.contactButton, styles.callButton]}
                    onPress={() => onCallHost(booking.userId.phone || '')}
                    disabled={!isContactHostEnabled || loading}
                  >
                    <Feather name="phone" size={16} color="#fff" />
                    <Text style={styles.contactButtonText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.contactButton, styles.emailButton]}
                    onPress={() => onEmailHost(booking.userId.email || '')}
                    disabled={!isContactHostEnabled || loading}
                  >
                    <Feather name="mail" size={16} color="#fff" />
                    <Text style={styles.contactButtonText}>Email</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.supportButton}
                  onPress={onContactSupport}
                  disabled={!isContactHostEnabled || loading}
                >
                  <Feather name="headphones" size={16} color="#5E72E4" />
                  <Text style={styles.supportButtonText}>Contact Support</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsRow}>
                {booking.paymentStatus !== 'paid' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.payButton]}
                    onPress={() => onPayFees(booking)}
                    disabled={loading}
                  >
                    <Feather name="credit-card" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Pay Fees</Text>
                  </TouchableOpacity>
                )}

                {hasEnded && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rebookButton]}
                    onPress={() => onRebook(booking)}
                    disabled={loading}
                  >
                    <Feather name="refresh-cw" size={16} color="#5E72E4" />
                    <Text style={styles.rebookButtonText}>Rebook</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

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
  actionsContainer: {
    gap: 16,
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