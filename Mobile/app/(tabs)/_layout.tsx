import React from "react"
import { Image, Platform, View, StyleSheet } from "react-native"
import { Tabs } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"
import Feather from "@expo/vector-icons/Feather"
import { useAuthStore } from "@/store/auth-store"
import { profile } from "@/Constants/profile-theme"

const TAB_BAR_HEIGHT = 52
const ACCENT = profile.colors.accent

function ProfileTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const user = useAuthStore((s) => s.user)
  const pic = user?.profilePic?.trim()

  if (pic) {
    return (
      <View style={[styles.avatarWrap, focused && styles.avatarFocused]}>
        <Image source={{ uri: pic }} style={styles.avatar} />
      </View>
    )
  }

  return <Feather name="user" color={color} size={24} />
}

export default function Layout() {
  const insets = useSafeAreaInsets()
  // On Android with edge-to-edge (RN 0.79+), insets.bottom is the height of
  // the system navigation bar. We extend the tab bar to fill that area so
  // no black strip shows through.
  const bottomInset = Platform.OS === "android" ? insets.bottom : 0

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: TAB_BAR_HEIGHT + bottomInset,
          paddingBottom: bottomInset,
          borderTopWidth: 0,
          elevation: Platform.OS === "android" ? 5 : 0,
          shadowOpacity: Platform.OS === "ios" ? 0.1 : 0,
          shadowOffset: Platform.OS === "ios" ? { width: 0, height: -3 } : undefined,
          shadowColor: Platform.OS === "ios" ? "#000" : undefined,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: Platform.OS === "ios" ? 16 : 0,
          backgroundColor: "#ffffff",
        },
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Ionicons name="search" color={color} size={28} />,
          tabBarLabelStyle: { fontSize: 11 },
        }}
      />
      <Tabs.Screen
        name="Wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ color }) => <Feather name="heart" color={color} size={28} />,
          tabBarLabelStyle: { fontSize: 11 },
        }}
      />
      <Tabs.Screen
        name="Booking"
        options={{
          title: "Booking",
          tabBarIcon: () => (
            <Image
              source={{
                uri: "https://www.vacationsaga.com/_next/static/media/logo1.fe6fe7c4.png",
              }}
              style={{ width: 28, height: 28 }}
            />
          ),
          tabBarLabelStyle: { fontSize: 11 },
        }}
      />
      <Tabs.Screen
        name="Trips"
        options={{
          lazy: true,
          title: "Trips",
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" color={color} size={28} />
          ),
          tabBarLabelStyle: { fontSize: 11 },
        }}
      />
      <Tabs.Screen
        name="Menu"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <ProfileTabIcon color={color} focused={focused} />
          ),
          tabBarLabelStyle: { fontSize: 11 },
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  avatarWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  avatarFocused: {
    borderColor: ACCENT,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
})
