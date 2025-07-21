

import { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Pressable,
  ScrollView,
} from "react-native"
import axios from "axios"
import type { PropertyInterface } from "@/types"
import { useAuthStore } from "@/store/auth-store"
import { LinearGradient } from "expo-linear-gradient"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

const { width } = Dimensions.get("window")

const Wishlist = () => {
  const { user, token } = useAuthStore()
  const [wishlistProperties, setWishlistProperties] = useState<PropertyInterface[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchWishlist = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true)
      if (!user || !token) {
        setWishlistProperties([])
        return
      }

      const wishlistRes = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/wishlist/get`, { userId: user._id })
      const wishlistIds: string[] = wishlistRes.data?.wishlist || []

      if (!wishlistIds.length) {
        setWishlistProperties([])
        return
      }

      const propertyDetails = await Promise.all(
        wishlistIds.map(async (propertyId) => {
          const res = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/properties/getParticularProperty`, {
            propertyId,
          })
          return res.data?.data as PropertyInterface
        }),
      )

      setWishlistProperties(propertyDetails)
    } catch (error: any) {
      console.error("\u274C Error fetching wishlist:", error.message)
      setWishlistProperties([])
    } finally {
      if (isRefreshing) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [user])

  const onRefresh = () => {
    setRefreshing(true)
    fetchWishlist(true)
  }

  const handleRemoveFromWishlist = async (propertyId: string) => {
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/wishlist/remove`, {
        userId: user?._id,
        propertyId,
      })
      fetchWishlist()
    } catch (error: any) {
      console.error("Error removing from wishlist:", error.message)
    }
  }

  const renderItem = ({ item, index }: { item: PropertyInterface; index: number }) => (
    <TouchableOpacity onPress={()=>router.push(`/(screens)/property-info/${item._id}`)}
      style={[styles.card, { marginLeft: index % 2 === 0 ? 0 : 8, marginRight: index % 2 === 0 ? 8 : 0 }]}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.propertyCoverFileUrl || "https://vacationsaga.b-cdn.net/assets/suitcase.png" }} style={styles.image} />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.gradient} />
        <View style={styles.priceTag}>
          <Text style={styles.price}>€{item.basePrice}</Text>
          <Text style={styles.perNight}>/night</Text>
        </View>
        <Pressable onPress={() => handleRemoveFromWishlist(item._id)} style={styles.deleteIcon}>
          <AntDesign name="delete" size={18} color="black" />
        </Pressable>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.propertyName} numberOfLines={1}>
          {item.propertyName}
        </Text>
        <View style={styles.locationContainer}>
          <Text style={styles.location} numberOfLines={1}>
            {item.city}, {item.country}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>Loading your wishlist...</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.emptyStateIcon}>
          <Text style={{ fontSize: 50 }}>🔒</Text>
        </View>
        <Text style={styles.emptyStateTitle}>Sign in to view your wishlist</Text>
        <Text style={styles.emptyStateMessage}>Your favorite properties will be saved here</Text>
      </View>
    )
  }

  if (wishlistProperties.length === 0) {
    return (
      <View style={styles.centered}  >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.emptyStateIcon}>
          <Text style={{ fontSize: 50 }}>💔</Text>
        </View>
        <Text style={styles.emptyStateTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptyStateMessage}>Save properties you love to find them here later</Text>
        
        <TouchableOpacity style={{ marginTop: 20, padding: 10, backgroundColor: "orange", borderRadius: 8 }}
          onPress={onRefresh}><Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Refresh</Text></TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
      </View>
      <FlatList
        data={wishlistProperties}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  )
}

export default Wishlist


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    maxWidth: "80%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    maxWidth: (width - 40) / 2,
  },
  imageContainer: {
    position: "relative",

  },
  image: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  priceTag: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  perNight: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 2,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardContent: {
    padding: 12,
  },
  propertyName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    color: "#777",
    fontSize: 13,
  },
  deleteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    opacity: 0.7,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
})
