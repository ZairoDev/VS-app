import React, { useEffect } from "react"
import { View, ActivityIndicator, Text, StyleSheet, Alert } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuthStore } from "@/store/auth-store"
import type { UserDataType } from "@/types"

// Dedicated route for the Google OAuth deep-link callback.
// When the website redirects to `myapp://google-auth?token=...&_id=...&...`,
// Expo Router navigates here. This screen:
//  1) Reads the query params
//  2) Persists the session (AsyncStorage + Zustand)
//  3) Navigates the user into the app (Menu tab)
//
// Having this route also prevents the "Unmatched Route" fallback screen,
// which was what showed up before because no such route existed.
export default function GoogleAuthCallback() {
  const params = useLocalSearchParams<{
    token?: string
    _id?: string
    name?: string
    email?: string
    profilePic?: string
    role?: string
    error?: string
  }>()

  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const first = (v: string | string[] | undefined) =>
      Array.isArray(v) ? v[0] : v

    ;(async () => {
      const token = first(params.token)
      const error = first(params.error)

      if (error) {
        Alert.alert(
          "Sign-In Failed",
          error === "role_mismatch"
            ? "This email is already registered with a different role."
            : `Google sign-in failed: ${error}`
        )
        router.replace("/(tabs)/Menu")
        return
      }

      if (!token) {
        Alert.alert("Sign-In Failed", "No token returned. Please try again.")
        router.replace("/(tabs)/Menu")
        return
      }

      const loggedInUser: UserDataType = {
        _id: first(params._id) ?? "",
        name: first(params.name) ?? "",
        email: first(params.email) ?? "",
        profilePic: first(params.profilePic) ?? "",
        role: (first(params.role) as "Owner" | "Traveller") ?? "Traveller",
        isVerified: true,
        preferredName: "",
        bankDetails: {},
        phone: "",
        emergencyContact: "",
        wishlist: [],
      }

      try {
        await AsyncStorage.setItem("authToken", token)
        await AsyncStorage.setItem("authUser", JSON.stringify(loggedInUser))
        setUser(loggedInUser)
      } catch (e) {
        console.error("Failed to persist Google auth session:", e)
      }

      router.replace("/(tabs)/Menu")
    })()
    // We intentionally only want this to run once when the deep link opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#ff7f11" />
      <Text style={styles.text}>Signing you in…</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
})
