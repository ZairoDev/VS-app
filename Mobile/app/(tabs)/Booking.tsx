"use client"

import { useState } from "react"
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
  Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.85

const bookings = [
  {
    _id: "b1",
    propertyName: "Mountain Retreat",
    location: "Shimla, HP",
    image: "https://images.unsplash.com/photo-1590265788376-5d99eb11976e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGhpbWFjaGFsJTIwcHJhZGVzaHxlbnwwfHwwfHx8MA%3D%3D",
    checkIn: "2025-04-25",
    checkOut: "2025-04-28",
    guests: 2,
    amount: 9200,
    status: "Upcoming",
    hostPhone: "tel:+918273645123",
    hostName: "Rahul Sharma",
    rating: 4.8,
  },
  {
    _id: "b2",
    propertyName: "Lake View Cottage",
    location: "Nainital, UK",
    image: "https://images.unsplash.com/photo-1586255028095-d93edb74e412?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bmFpbml0YWwlMjBsYWtlfGVufDB8fDB8fHww",
    checkIn: "2025-01-10",
    checkOut: "2025-01-12",
    guests: 4,
    amount: 12000,
    status: "Completed",
    hostPhone: "tel:+918273645124",
    hostName: "Priya Patel",
    rating: 4.9,
  },
  {
    _id: "b3",
    propertyName: "Beach Villa",
    location: "Goa",
    image: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z29hfGVufDB8fDB8fHww",
    checkIn: "2024-12-20",
    checkOut: "2024-12-25",
    guests: 6,
    amount: 25000,
    status: "Upcoming",
    hostPhone: "tel:+918273645125",
    hostName: "Vikram Mehta",
    rating: 4.7,
  },
]

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return new Date(dateString).toLocaleDateString("en-IN", options);
}

const BookingHubScreen = () => {
  const [activeTab, setActiveTab] = useState("upcoming")

  const handleContactHost = (phone: string) => Linking.openURL(phone)

  const handleCancelBooking = (id: string) => {
    console.log("Cancel booking:", id)
  }

  const handleRebook = (id: string) => {
    console.log("Rebook property:", id)
  }

  const handleViewDetails = (id: string) => {
    console.log("View details for booking:", id)
  }

  const upcomingBookings = bookings.filter((item) => item.status === "Upcoming")
  const pastBookings = bookings.filter((item) => item.status === "Completed")

  const renderBookingCard = ({ item }: { item: (typeof bookings)[0] }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => handleViewDetails(item._id)}>
      {/* Image with gradient overlay */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]} style={styles.gradient} />
        <View style={styles.imageOverlay}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.propertyName}</Text>

        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color="#666" />
          <Text style={styles.location}>{item.location}</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar-range" size={16} color="orange" />
            <Text style={styles.detailText}>
              {formatDate(item.checkIn)} - {formatDate(item.checkOut)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color="orange" />
            <Text style={styles.detailText}>{item.guests} guests</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.price}>₹{item.amount.toLocaleString("en-IN")}</Text>
        </View>

        <View style={styles.hostRow}>
          <View style={styles.hostInfo}>
            <FontAwesome5 name="user-circle" size={16} color="#666" />
            <Text style={styles.hostName}>{item.hostName}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => handleContactHost(item.hostPhone)}>
            <Feather name="phone" size={18} color="#fff" />
            <Text style={styles.buttonText}>Contact Host</Text>
          </TouchableOpacity>

          {item.status === "Upcoming" && (
            <TouchableOpacity style={styles.dangerButton} onPress={() => handleCancelBooking(item._id)}>
              <Feather name="x-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {item.status === "Completed" && (
            <TouchableOpacity style={styles.outlineButton} onPress={() => handleRebook(item._id)}>
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

  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle="light-content" /> */}

      {/* Static Header */}
      <View style={styles.header}>
        <BlurView intensity={90} tint="dark" style={styles.blurView}>
          <LinearGradient
            colors={[ "#fca42c","#ffb86b"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Text style={styles.heading}>Booking Hub</Text>
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

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === "upcoming"
          ? upcomingBookings.length > 0
            ? upcomingBookings.map((item) => <View key={item._id}>{renderBookingCard({ item })}</View>)
            : renderEmptyState()
          : pastBookings.length > 0
            ? pastBookings.map((item) => <View key={item._id}>{renderBookingCard({ item })}</View>)
            : renderEmptyState()}
      </ScrollView>
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
    height: Platform.OS === "ios" ? 140 : 120,
  },
  blurView: {
    flex: 1,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 20 : 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
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
    marginBottom: 20,
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
  statusBadge: {
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
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "orange",
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
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
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
    shadowColor: "#5E72E4",
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
  },
})
