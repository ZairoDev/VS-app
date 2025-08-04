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
const CARD_WIDTH = width * 0.85;
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
      activeOpacity={0.9}
      onPress={() => onPress(booking)}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: booking.propertyId.propertyCoverFileUrl }} style={styles.image} />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {booking.propertyId.placeName}
        </Text>

        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color="#666" />
          <Text style={styles.location} numberOfLines={1}>
            {booking.propertyId.city}, {booking.propertyId.country}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar-range" size={16} color="#fca42c" />
            <Text style={styles.detailText}>
              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color="#fca42c" />
            <Text style={styles.detailText}>
              {booking.guests.adults + booking.guests.children + booking.guests.infants} guests
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Total</Text>
            {booking.totalNights > 0 && (
              <Text style={styles.nightsText}>
                {booking.totalNights} {booking.totalNights === 1 ? 'night' : 'nights'}
              </Text>
            )}
          </View>
          <Text style={styles.price}>Є{booking.price.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.hostRow}>
          <View style={styles.hostInfo}>
            <FontAwesome5 name="user-circle" size={16} color="#666" />
            <Text style={styles.hostName}>{booking.userId.name}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {booking.bookingStatus !== 'confirmed' ? (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>Pending request confirmation</Text>
            </View>
          ) : (
            <>
              
              <View
                style={[
                  styles.contactButtonsContainer,
                  !isContactHostEnabled && { opacity: 0.5 }
                ]}
              >
                <View style={styles.hostButtonsRow}>
                  <TouchableOpacity
                    style={styles.hostButton}
                    onPress={() => onCallHost(booking.userId.phone || '')}
                    disabled={!isContactHostEnabled || loading}
                  >
                    <Feather name="phone" size={16} color="#fff" />
                    <Text style={styles.buttonText}>Call Host</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.hostButton}
                    onPress={() => onEmailHost(booking.userId.email || '')}
                    disabled={!isContactHostEnabled || loading}
                  >
                    <Feather name="mail" size={16} color="#fff" />
                    <Text style={styles.buttonText}>Email Host</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.supportButton}
                  onPress={onContactSupport}
                  disabled={!isContactHostEnabled || loading}
                >
                  <Feather name="headphones" size={16} color="#5E72E4" />
                  <Text style={styles.supportButtonText}>Contact Vacation Saga</Text>
                </TouchableOpacity>
              </View>

              
              {booking.paymentStatus !== 'paid' && (
                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={() => onPayFees(booking)}
                  disabled={loading}
                >
                  <Feather name="credit-card" size={18} color="#5E72E4" />
                  <Text style={styles.outlineButtonText}>Pay Fees</Text>
                </TouchableOpacity>
              )}

              
              {hasEnded && (
                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={() => onRebook(booking)}
                  disabled={loading}
                >
                  <Feather name="refresh-cw" size={18} color="#5E72E4" />
                  <Text style={styles.outlineButtonText}>Rebook</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Cancel Button */}
          {booking.bookingStatus === 'pending' && (
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => onCancel(booking._id)}
              disabled={loading}
            >
              <Feather name="x-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Cancel</Text>
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
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#5E72E4",
  },
  supportButtonText: {
    color: "#5E72E4",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
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
  outlineButtonText: {
    color: "#5E72E4",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
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
})
