"use client"
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import type { UserDataType } from "@/types";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import * as WebBrowser from "expo-web-browser";

const Menu = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [modalVisible, setModalVisible] = useState(true)
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<"" | "Owner" | "Traveller">("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const { user, login, register, logout, setUser} = useAuthStore()
  const BUNNY_ACCESS_KEY = process.env.EXPO_PUBLIC_BUNNY_ACCESS_KEY

 
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const slideAnim = React.useRef(new Animated.Value(50)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [isLogin])

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      return result.assets[0].uri
    }
    return null
  }

  const uploadToBunny = async (uri: string, fileName: string): Promise<string | null> => {
    try {
      const fileBinary = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      const buffer = Buffer.from(fileBinary, "base64")

      const url = `${process.env.EXPO_PUBLIC_BUNNY_STORAGE_URL}/${process.env.EXPO_PUBLIC_BUNNY_STORAGE_ZONE}/${fileName}`

      console.log("Uploading to:", url)

      await axios.put(url, buffer, {
        headers: {
          AccessKey: process.env.EXPO_PUBLIC_BUNNY_ACCESS_KEY!,
          "Content-Type": "application/octet-stream",
        },
      })

      return `${process.env.EXPO_PUBLIC_BUNNY_CDN_URL}/${fileName}`
    } catch (error: any) {
      console.error("Bunny Upload Error:", error.response?.data || error.message || "Unknown Error")
      return null
    }
  }

  const updateProfilePicInDB = async (userId: string, profilePicUrl: string) => {
    try {
      await axios.put(`${process.env.EXPO_PUBLIC_BASE_URL}/user/updateProfilePic`, {
        userId,
        profilePic: profilePicUrl,
      })
      Alert.alert("Success", "Profile photo updated!")
    } catch (err) {
      console.error("DB Update Error:", err)
      Alert.alert("Failed to update profile pic in DB")
    }
  }

  const handleEditProfilePhoto = async (user: UserDataType) => {
    const localUri = await pickImageFromGallery()
    if (!localUri) return

    const fileName = `profile_${user._id}_${Date.now()}.jpg`
    const bunnyUrl = await uploadToBunny(localUri, fileName)

    if (bunnyUrl) {
      await updateProfilePicInDB(user._id, bunnyUrl)
      setUser({ ...user, profilePic: bunnyUrl })
    }
  }

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    try {
      setIsLoading(true)
      await login(email, password)
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

    // Some envs accidentally include a full path (ex: .../api/oauth/google/callback). We only want origin.
    try {
      return new URL(raw).origin
    } catch {
      // If it’s not parseable as a URL, fall back to production.
      return "https://vacationsaga.com"
    }
  }

  
  // The redirect URI must be hardcoded to the production custom scheme.
  // Linking.createURL() returns the Expo dev-client URL in development
  // (exp+mobile://...) which breaks the OAuth redirect.
  const GOOGLE_REDIRECT_URI = "myapp://google-auth"

  // Processes the "myapp://google-auth?token=..." URL returned by the website.
  // Extracted so both openAuthSessionAsync AND the Linking fallback can use it.
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
    return true
  }

  // NOTE: The Android-intent path (where the OS wakes the app up with the
  // redirect URL instead of the in-app browser catching it) is now handled
  // by the dedicated Expo Router screen at app/google-auth.tsx. That route
  // reads the same query params, persists the session, and navigates back
  // to /(tabs)/Menu — so no Linking listener is needed here.

  const handleGoogleSignIn = async () => {
    if (role !== "Owner" && role !== "Traveller") {
      Alert.alert("Select role", "Please select a role before signing in.")
      return
    }

    try {
      setIsGoogleLoading(true)

      // Mirrors the website's handleGoogleLogin exactly:
      // vacationsaga.com/api/oauth/google/start?role=...&redirect=...
      // The website completes OAuth and redirects back to GOOGLE_REDIRECT_URI
      // with token, _id, name, email, profilePic, role as query params.
      const startQs = new URLSearchParams()
      startQs.set("role", role)
      startQs.set("redirect", GOOGLE_REDIRECT_URI)

      const startUrl = `${getWebsiteOrigin()}/api/oauth/google/start?${startQs.toString()}`

      // Open the auth session. On Android, if the browser intercepts the
      // myapp:// redirect (normal path), result.url contains the full URL.
      // If Android's intent system gets it first, the useEffect Linking
      // listener above will process it instead — so we ignore "dismiss"
      // results here (they just mean "the browser closed, processing
      // continues in the Linking handler").
      const result = await WebBrowser.openAuthSessionAsync(startUrl, GOOGLE_REDIRECT_URI)

      if (result.type === "success" && result.url) {
        await processGoogleRedirectUrl(result.url)
      }
      // Any other result (dismiss / cancel / opened) is handled by the
      // Linking listener if the redirect came through as an Android intent.
    } catch (error: any) {
      console.error("Google Sign-In error:", error)
      Alert.alert("Sign-In Failed", error?.message ?? "Something went wrong.")
    } finally {
      // Note: setIsGoogleLoading(false) is ALSO called by the Linking
      // listener — calling it twice is safe.
      setIsGoogleLoading(false)
    }
  }

  const handleLogout = async () => {
    setUser(null)
    await logout()
  }

  const renderAuthForm = () => {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidView}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={["#ff7f11", "#ffb344"]} style={styles.modalGradient} />

          <Animated.View style={[styles.authShell, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: "https://www.vacationsaga.com/_next/static/media/logo1.fe6fe7c4.png" }}
                style={styles.logoImage}
              />
              <Text style={styles.logoText}>Vacation Saga</Text>
              <Text style={styles.authEyebrow}>TRAVEL ACCOUNT</Text>
            </View>

            <Text style={styles.modalTitle}>{isLogin ? "Welcome back" : "Create your account"}</Text>
            <Text style={styles.modalSubtitle}>
              {isLogin ? "Sign in to access your account" : "Fill in your details to get started"}
            </Text>

            <View style={styles.roleRow}>
              <Text style={styles.roleLabel}>Role</Text>
              <View style={styles.rolePills}>
                <TouchableOpacity
                  onPress={() => setRole("Traveller")}
                  activeOpacity={0.85}
                  style={[styles.rolePill, role === "Traveller" && styles.rolePillActive]}
                >
                  <Text style={[styles.rolePillText, role === "Traveller" && styles.rolePillTextActive]}>Traveller</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setRole("Owner")}
                  activeOpacity={0.85}
                  style={[styles.rolePill, role === "Owner" && styles.rolePillActive]}
                >
                  <Text style={[styles.rolePillText, role === "Owner" && styles.rolePillTextActive]}>Owner</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formSection}>
              {!isLogin && (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Full Name"
                      value={name}
                      onChangeText={setName}
                      style={styles.input}
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Feather name="phone" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Phone Number"
                      value={phone}
                      onChangeText={setPhone}
                      style={styles.input}
                      keyboardType="phone-pad"
                      placeholderTextColor="#999"
                    />
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {isLogin && (
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={isLogin ? handleLogin : handleRegister}
              style={[styles.authButton, isLoading && styles.authButtonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.authButtonText}>
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={[styles.socialButton, isGoogleLoading && styles.authButtonDisabled]}
              onPress={() => handleGoogleSignIn()}
              disabled={isGoogleLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
              <Text style={styles.socialButtonText}>
                {isGoogleLoading ? "Signing in…" : "Continue with Google"}
              </Text>
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>{isLogin ? "Don't have an account? " : "Already have an account? "}</Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.toggleActionText}>{isLogin ? "Sign Up" : "Sign In"}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    )
  }

  const quickActions = [
    {
      label: "Wishlist",
      icon: "favorite-border" as const,
      color: "#e74c3c",
      bg: "#fdf0f0",
      onPress: () => router.push("/(tabs)/Wishlist"),
    },
    {
      label: "Bookings",
      icon: "bookmark-border" as const,
      color: "#2980b9",
      bg: "#eef6fd",
      onPress: () => router.push("/(tabs)/Booking"),
    },
    {
      label: "Trips",
      icon: "map" as const,
      color: "#27ae60",
      bg: "#edfaf3",
      onPress: () => router.push("/(tabs)/Trips"),
    },
  ]

  const accountItems = [
    {
      label: "Go to Profile",
      icon: "person" as const,
      onPress: () => router.push("/(screens)/pages/profile-page"),
    },
    {
      label: "Need Help",
      icon: "help-outline" as const,
      onPress: () => router.push("/(screens)/pages/need-support"),
    },
  ]

  const legalItems = [
    {
      label: "Privacy Policy",
      icon: "lock-outline" as const,
      onPress: () => router.push("/(screens)/pages/privacy-policy"),
    },
    {
      label: "Terms of Use",
      icon: "description" as const,
      onPress: () => router.push("/(screens)/pages/terms-conditions"),
    },
  ]

  const renderMenuGroup = (items: Array<{ label: string; icon: string; onPress: () => void }>) =>
    items.map((item, index) => (
      <TouchableOpacity
        key={index}
        onPress={item.onPress}
        style={[styles.menuItem, index === items.length - 1 && styles.menuItemLast]}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <View style={styles.menuIconContainer}>
                  <MaterialIcons name={item.icon as any} size={18} color="#555" />
          </View>
          <Text style={styles.menuItemText}>{item.label}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#c7c7c7" />
      </TouchableOpacity>
    ))

  return (
    <SafeAreaView style={styles.container}>

      {user ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.menuScrollContent} showsVerticalScrollIndicator={false}>
          {/* Ambient header backdrop */}
          <View style={styles.headerBackdrop} pointerEvents="none">
            <View style={styles.headerAuraPrimary} />
            <View style={styles.headerAuraSecondary} />
            <LinearGradient
              colors={["rgba(255,127,17,0.10)", "rgba(255,127,17,0.02)", "rgba(255,255,255,0)"]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.headerTint}
            />
            <View style={styles.headerAccentLine} />
          </View>

          {/* Profile header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileTopRow}>
              <View style={styles.profileImageContainer}>
                <Image
                  style={styles.profileImage}
                  source={{
                    uri:
                      user.profilePic && user.profilePic.trim() !== ""
                        ? user.profilePic
                        : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png",
                  }}
                />
                <TouchableOpacity onPress={() => handleEditProfilePhoto(user)} style={styles.editIconContainer}>
                  <MaterialIcons name="edit" size={16} color="#333" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileTextWrap}>
                <Text style={styles.welcomeText}>Account</Text>
                <Text style={styles.nameText}>{user.name}</Text>
                <Text style={styles.profileMetaText}>{user.email}</Text>
              </View>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickActionCard}
                onPress={action.onPress}
                activeOpacity={0.75}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.bg }]}>
                  <MaterialIcons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.sectionDivider} />

          {/* Account section */}
          <View style={styles.menuContainer}>
            <Text style={styles.sectionLabel}>ACCOUNT</Text>
            {renderMenuGroup(accountItems)}
          </View>

          <View style={styles.sectionDivider} />

          {/* Legal section */}
          <View style={styles.menuContainer}>
            <Text style={styles.sectionLabel}>LEGAL</Text>
            {renderMenuGroup(legalItems)}
          </View>

          <View style={styles.sectionDivider} />

          {/* Logout */}
          <View style={styles.menuContainer}>
            <TouchableOpacity onPress={handleLogout} style={[styles.menuItem, styles.menuItemLast]} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#fff5f5" }]}>
                  <MaterialIcons name="logout" size={18} color="#b42318" />
                </View>
                <Text style={styles.menuItemTextDanger}>Logout</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#c7c7c7" />
            </TouchableOpacity>
          </View>

          {/* Brand footer */}
          <View style={styles.brandFooter}>
            <Image
              source={{ uri: "https://www.vacationsaga.com/_next/static/media/logo1.fe6fe7c4.png" }}
              style={styles.brandLogo}
            />
            <Text style={styles.brandName}>Vacation Saga</Text>
            <Text style={styles.versionText}>Version 1.2.0</Text>
          </View>
        </ScrollView>
      ) : (
        renderAuthForm()
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  menuScrollContent: {
    paddingBottom: 36,
  },
  headerBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 210,
    overflow: "hidden",
  },
  headerAuraPrimary: {
    position: "absolute",
    top: -54,
    right: -18,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255, 196, 122, 0.16)",
  },
  headerAuraSecondary: {
    position: "absolute",
    top: 22,
    left: -44,
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "rgba(255, 234, 214, 0.45)",
  },
  headerTint: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 180,
  },
  headerAccentLine: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 0,
    height: 1,
    backgroundColor: "rgba(255,127,17,0.12)",
  },
  profileHeader: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: "#fff",
  },
  editIconContainer: {
    position: "absolute",
    right: -2,
    bottom: -2,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f1f1",
    borderRadius: 12,
    padding: 5,
  },
  profileTextWrap: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: "#7a7a7a",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  nameText: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  profileMetaText: {
    marginTop: 6,
    fontSize: 14,
    color: "#666",
  },
  profileSupportText: {
    marginTop: 18,
    fontSize: 15,
    lineHeight: 22,
    color: "#5f5f5f",
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#fafafa",
    borderRadius: 14,
    gap: 10,
  },
  quickActionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  // Section structure
  sectionDivider: {
    height: 8,
    backgroundColor: "#f7f7f7",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#aaa",
    letterSpacing: 1.1,
    marginBottom: 4,
    marginTop: 18,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#f6f6f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  menuItemTextDanger: {
    fontSize: 16,
    fontWeight: "500",
    color: "#b42318",
  },

  // Brand footer
  brandFooter: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 12,
    gap: 6,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    opacity: 0.55,
  },
  brandName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#bbb",
  },
  versionText: {
    textAlign: "center",
    fontSize: 11,
    color: "#ccc",
  },

  // New Auth UI Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  modalGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 210,
  },
  authShell: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: "stretch",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ff7f11",
  },
  authEyebrow: {
    marginTop: 6,
    fontSize: 11,
    color: "#8b8b8b",
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "left",
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#888",
    marginBottom: 24,
    textAlign: "left",
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  roleLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  rolePills: {
    flexDirection: "row",
    gap: 10,
  },
  rolePill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  rolePillActive: {
    backgroundColor: "rgba(255,127,17,0.12)",
    borderColor: "rgba(255,127,17,0.45)",
  },
  rolePillText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "700",
  },
  rolePillTextActive: {
    color: "#ff7f11",
  },
  formSection: {
    paddingTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 55,
    backgroundColor: "#fafafa",
    marginBottom: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ececec",
  },
  inputIcon: {
    marginRight: 10,
    marginLeft: 6,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#333",
  },
  passwordToggle: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 22,
    marginTop: 2,
  },
  forgotPasswordText: {
    color: "#ff7f11",
    fontSize: 14,
  },
  authButton: {
    backgroundColor: "#ff7f11",
    width: "100%",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#ff7f11",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  authButtonDisabled: {
    backgroundColor: "#ffb344",
    shadowOpacity: 0.1,
  },
  authButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },
  dividerText: {
    color: "#999",
    paddingHorizontal: 10,
    fontSize: 12,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 55,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#eee",
  },
  socialButtonText: {
    color: "#333",
    fontSize: 15,
    marginLeft: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  toggleText: {
    color: "#666",
    fontSize: 14,
  },
  toggleActionText: {
    color: "#ff7f11",
    fontSize: 14,
    fontWeight: "bold",
  },
})

export default Menu
