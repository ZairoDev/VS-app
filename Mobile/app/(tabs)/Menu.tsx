"use client"
import React, { useState, useEffect } from "react"
import {
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import type { UserDataType } from "@/types"
import { router } from "expo-router"
import { useAuthStore } from "@/store/auth-store"
import * as WebBrowser from "expo-web-browser"
import { LoginScreen, RegisterScreen } from "@/components/auth"
import { profile } from "@/Constants/profile-theme"
import {
  ProfileHeader,
  ProfileMenuCard,
  ProfileLogoutButton,
  ProfileToast,
  NextTripCard,
  ProfileCompleteCard,
  type ProfileMenuItem,
} from "@/components/profile"
import { useProfileScreen } from "@/hooks/useProfileScreen"

const { colors: c } = profile

const Menu = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<"" | "Owner" | "Traveller">("Traveller")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const { login, setUser } = useAuthStore()

  const {
    user,
    isPhotoUploading,
    nextTrip,
    toast,
    dismissToast,
    handleChangePhoto,
    handleLogoutPress,
  } = useProfileScreen()

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = await AsyncStorage.getItem("token")
      const storedUser = await AsyncStorage.getItem("user")

      if (token && storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }

    checkUserLoggedIn()
  }, [setUser])

  useEffect(() => {
    const loadRememberedEmail = async () => {
      const savedEmail = await AsyncStorage.getItem("rememberedEmail")
      if (savedEmail) {
        setEmail(savedEmail)
        setRememberMe(true)
      }
    }
    loadRememberedEmail()
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    try {
      setIsLoading(true)
      await login(email, password)
      if (rememberMe) {
        await AsyncStorage.setItem("rememberedEmail", email)
      } else {
        await AsyncStorage.removeItem("rememberedEmail")
      }
    } catch (err: any) {
      console.error("Login error:", err?.response?.data?.message || err.message)
      Alert.alert("Login Failed", err?.response?.data?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    try {
      setIsLoading(true)
      await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/user/register`, {
        name,
        email,
        password,
        phone,
      })
      Alert.alert("Success", "Registration successful. Please login.")
      setIsLogin(true)
      setPassword("")
      setConfirmPassword("")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Registration Failed", error.response?.data?.message || "Something went wrong")
      } else {
        Alert.alert("Registration Failed", "An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getWebsiteOrigin = () => {
    const raw =
      (process.env.EXPO_PUBLIC_WEBSITE_URL?.trim() || "https://vacationsaga.com").replace(/\/+$/, "")

    try {
      return new URL(raw).origin
    } catch {
      return "https://vacationsaga.com"
    }
  }

  const GOOGLE_REDIRECT_URI = "myapp://google-auth"

  const processGoogleRedirectUrl = async (url: string): Promise<boolean> => {
    const redirectQs = url.includes("?") ? url.split("?")[1] : ""
    const params = new URLSearchParams(redirectQs)

    const error = params.get("error")
    if (error) {
      Alert.alert(
        "Sign-In Failed",
        error === "role_mismatch"
          ? "This email is already registered with a different role."
          : `Google sign-in failed: ${error}`
      )
      return false
    }

    const token = params.get("token")
    if (!token) {
      Alert.alert("Sign-In Failed", "No token returned. Please try again.")
      return false
    }

    const loggedInUser: UserDataType = {
      _id: params.get("_id") ?? "",
      name: params.get("name") ?? "",
      email: params.get("email") ?? "",
      profilePic: params.get("profilePic") ?? "",
      role: (params.get("role") as "Owner" | "Traveller") ?? (role || "Traveller"),
      isVerified: true,
      preferredName: "",
      bankDetails: {},
      phone: "",
      emergencyContact: "",
      wishlist: [],
    }

    await AsyncStorage.setItem("authToken", token)
    await AsyncStorage.setItem("authUser", JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    await useAuthStore.getState().syncWishlist()
    return true
  }

  const handleGoogleSignIn = async () => {
    if (role !== "Owner" && role !== "Traveller") {
      Alert.alert("Select role", "Please select a role before signing in.")
      return
    }

    try {
      setIsGoogleLoading(true)

      const startQs = new URLSearchParams()
      startQs.set("role", role)
      startQs.set("redirect", GOOGLE_REDIRECT_URI)

      const startUrl = `${getWebsiteOrigin()}/api/oauth/google/start?${startQs.toString()}`
      const result = await WebBrowser.openAuthSessionAsync(startUrl, GOOGLE_REDIRECT_URI)

      if (result.type === "success" && result.url) {
        await processGoogleRedirectUrl(result.url)
      }
    } catch (error: any) {
      console.error("Google Sign-In error:", error)
      Alert.alert("Sign-In Failed", error?.message ?? "Something went wrong.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const openPersonalInfo = () => {
    router.push("/(screens)/pages/profile-page")
  }

  const showComingSoon = (feature: string) => {
    Alert.alert("Coming soon", `${feature} will be available in a future update.`)
  }

  // Terminology mirrors Airbnb / Booking account surfaces.
  const settingsItems: ProfileMenuItem[] = [
    {
      label: "Personal info",
      icon: "user",
      subtitle: "Name, phone, address",
      onPress: openPersonalInfo,
      accessibilityHint: "Opens your personal details",
    },
    {
      label: "Login & security",
      icon: "shield",
      subtitle: "Password and account access",
      onPress: () => showComingSoon("Login & security"),
      accessibilityHint: "Coming soon",
    },
    {
      label: "Notifications",
      icon: "bell",
      subtitle: "Trip updates and offers",
      onPress: () => showComingSoon("Notifications"),
      accessibilityHint: "Coming soon",
    },
  ]

  const travelItems: ProfileMenuItem[] = [
    {
      label: "Saved travellers",
      icon: "users",
      subtitle: "Guests you travel with",
      onPress: () => showComingSoon("Saved travellers"),
      accessibilityHint: "Coming soon",
    },
  ]

  const supportItems: ProfileMenuItem[] = [
    {
      label: "Get help",
      icon: "help-circle",
      onPress: () => router.push("/(screens)/pages/need-support"),
      accessibilityHint: "Opens help and support",
    },
    {
      label: "Privacy policy",
      icon: "lock",
      onPress: () => router.push("/(screens)/pages/privacy-policy"),
    },
    {
      label: "Terms of service",
      icon: "file-text",
      onPress: () => router.push("/(screens)/pages/terms-conditions"),
    },
  ]

  const hostingItems: ProfileMenuItem[] =
    user?.role === "Owner"
      ? [
          {
            label: "Manage listings",
            icon: "home",
            subtitle: "Your properties and calendars",
            onPress: () => showComingSoon("Manage listings"),
            accessibilityHint: "Coming soon",
          },
        ]
      : []

  const renderAuthForm = () => {
    if (isLogin) {
      return (
        <LoginScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          role={role === "Owner" ? "Owner" : "Traveller"}
          setRole={setRole}
          isLoading={isLoading}
          isGoogleLoading={isGoogleLoading}
          onLogin={handleLogin}
          onGoogleSignIn={handleGoogleSignIn}
          onForgotPassword={() => {}}
          onSignUp={() => setIsLogin(false)}
        />
      )
    }

    return (
      <RegisterScreen
        name={name}
        setName={setName}
        phone={phone}
        setPhone={setPhone}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        role={role === "Owner" ? "Owner" : "Traveller"}
        setRole={setRole}
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
        onRegister={handleRegister}
        onGoogleSignIn={handleGoogleSignIn}
        onSignIn={() => setIsLogin(true)}
      />
    )
  }

  if (!user) {
    return renderAuthForm()
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          user={user}
          isPhotoUploading={isPhotoUploading}
          onOpenPersonalInfo={openPersonalInfo}
          onChangePhoto={() => handleChangePhoto(user)}
        />

        <ProfileCompleteCard user={user} onPress={openPersonalInfo} />

        {nextTrip ? (
          <NextTripCard
            booking={nextTrip}
            onPress={() => router.push("/(tabs)/Booking")}
          />
        ) : null}

        <ProfileMenuCard label="Settings" items={settingsItems} delay={80} />

        <ProfileMenuCard label="Travel" items={travelItems} delay={110} />

        {hostingItems.length > 0 ? (
          <ProfileMenuCard label="Hosting" items={hostingItems} delay={140} />
        ) : null}

        <ProfileMenuCard label="Support" items={supportItems} delay={170} />

        <ProfileLogoutButton onPress={handleLogoutPress} delay={200} />
      </ScrollView>

      <ProfileToast
        message={toast.message}
        variant={toast.variant}
        onDismiss={dismissToast}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 4,
  },
})

export default Menu
