"use client"

import React, { useState, useEffect } from "react"
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
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import { Buffer } from "buffer"
import type { UserDataType } from "@/types"
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { useAuthStore } from "@/store/auth-store"

const Menu = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [modalVisible, setModalVisible] = useState(true)
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, login, register, logout, setUser } = useAuthStore()
  const BUNNY_ACCESS_KEY = process.env.EXPO_PUBLIC_BUNNY_ACCESS_KEY

  // Animation values
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

  const handleLogout = async () => {
    setUser(null)
    await logout()
  }

  const renderAuthForm = () => {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidView}>
        
        <View style={styles.modalContainer}>
          <LinearGradient colors={["#ff7f11", "#ffb344"]} style={styles.modalGradient} />

          <Animated.View style={[styles.modalContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: "https://www.vacationsaga.com/_next/static/media/logo1.fe6fe7c4.png" }}
                style={styles.logoImage}
              />
              <Text style={styles.logoText}>Vacation Saga</Text>
            </View>

            <Text style={styles.modalTitle}>{isLogin ? "Welcome Back" : "Create Account"}</Text>
            <Text style={styles.modalSubtitle}>
              {isLogin ? "Sign in to access your account" : "Fill in your details to get started"}
            </Text>

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

            {/* <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View> */}

            {/* <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color="#333" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity> */}

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

  return (
    <SafeAreaView style={styles.container}>
      
      {user ? (
        <ScrollView style={styles.container}>
          <LinearGradient colors={["#ffdea8", "#ffffff"]} style={styles.gradientBackground} />

          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image style={styles.profileImage} source={{ uri: user.profilePic }} />
              <TouchableOpacity onPress={() => handleEditProfilePhoto(user)} style={styles.editIconContainer}>
                <MaterialIcons name="edit" size={18} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.nameText}>{user.name}</Text>
          </View>

          <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            {[
              {
                label: "Go to Profile",
                icon: "person",
                onPress: () => router.push("/(screens)/pages/profile-page"),
              },
              {
                label: "Need Help",
                icon: "help-outline",
                onPress: () => router.push("/(screens)/pages/need-support"),
              },
              {
                label: "Privacy Policy",
                icon: "lock-outline",
                onPress: () => router.push("/(screens)/pages/privacy-policy"),
              },
              {
                label: "Terms of Use",
                icon: "description",
                onPress: () => router.push("/(screens)/pages/terms-conditions"),
              },
              { label: "Logout", icon: "logout", onPress: handleLogout },
            ].map((item, index) => (
              <TouchableOpacity key={index} onPress={item.onPress} style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <MaterialIcons name={item.icon as any} size={20} color="#555" />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
                <MaterialIcons name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.versionText}>Version 1.2.0</Text>
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
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 250,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },
  profileImageContainer: {
    marginBottom: 15,
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  editIconContainer: {
    position: "absolute",
    right: -5,
    bottom: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 20,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  menuContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginBottom: 20,
  },

  // New Auth UI Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  modalGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff7f11",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 25,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 55,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  inputIcon: {
    marginRight: 10,
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
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#ff7f11",
    fontSize: 14,
  },
  authButton: {
    backgroundColor: "#ff7f11",
    width: "100%",
    height: 55,
    borderRadius: 12,
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
    fontWeight: "bold",
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
