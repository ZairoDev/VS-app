import { useCallback, useState } from "react"
import {
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import { Buffer } from "buffer"
import { useFocusEffect } from "expo-router"
import { useAuthStore } from "@/store/auth-store"
import type { Booking, UserDataType } from "@/types"
import { getNextUpcomingBooking } from "@/utils/profile"

type ToastState = {
  message: string | null
  variant: "success" | "error"
}

export function useProfileScreen() {
  const { user, logout, setUser } = useAuthStore()
  const [isPhotoUploading, setIsPhotoUploading] = useState(false)
  const [nextTrip, setNextTrip] = useState<Booking | null>(null)
  const [toast, setToast] = useState<ToastState>({ message: null, variant: "success" })

  const showToast = useCallback((message: string, variant: "success" | "error" = "success") => {
    setToast({ message, variant })
  }, [])

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, message: null }))
  }, [])

  const fetchNextTrip = useCallback(async () => {
    if (!user?._id) {
      setNextTrip(null)
      return
    }
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/traveller-booking/${user._id}`
      )
      const bookings: Booking[] = response.data?.bookings ?? []
      setNextTrip(getNextUpcomingBooking(bookings))
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setNextTrip(null)
      } else {
        console.error("Profile next-trip fetch error:", error)
      }
    }
  }, [user?._id])

  useFocusEffect(
    useCallback(() => {
      fetchNextTrip()
    }, [fetchNextTrip])
  )

  const pickImageFromGallery = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to update your profile picture."
      )
      return null
    }

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

  const takePhoto = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow camera access to take a profile photo."
      )
      return null
    }

    const result = await ImagePicker.launchCameraAsync({
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
    await axios.put(`${process.env.EXPO_PUBLIC_BASE_URL}/user/updateProfilePic`, {
      userId,
      profilePic: profilePicUrl,
    })
  }

  const applyProfilePhoto = async (localUri: string, currentUser: UserDataType) => {
    setIsPhotoUploading(true)
    try {
      const fileName = `profile_${currentUser._id}_${Date.now()}.jpg`
      const bunnyUrl = await uploadToBunny(localUri, fileName)

      if (!bunnyUrl) {
        showToast("Couldn't upload photo. Try again.", "error")
        return
      }

      await updateProfilePicInDB(currentUser._id, bunnyUrl)
      const updated = { ...currentUser, profilePic: bunnyUrl }
      setUser(updated)
      await AsyncStorage.setItem("authUser", JSON.stringify(updated))
      showToast("Photo updated")
    } catch (err) {
      console.error("Profile photo update error:", err)
      showToast("Failed to update profile photo", "error")
    } finally {
      setIsPhotoUploading(false)
    }
  }

  const handlePhotoSource = async (
    source: "library" | "camera",
    currentUser: UserDataType
  ) => {
    const localUri =
      source === "camera" ? await takePhoto() : await pickImageFromGallery()
    if (!localUri) return
    await applyProfilePhoto(localUri, currentUser)
  }

  const handleChangePhoto = (currentUser: UserDataType) => {
    if (isPhotoUploading) return

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Choose from library", "Take photo"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) void handlePhotoSource("library", currentUser)
          if (buttonIndex === 2) void handlePhotoSource("camera", currentUser)
        }
      )
      return
    }

    Alert.alert("Change profile photo", undefined, [
      { text: "Choose from library", onPress: () => void handlePhotoSource("library", currentUser) },
      { text: "Take photo", onPress: () => void handlePhotoSource("camera", currentUser) },
      { text: "Cancel", style: "cancel" },
    ])
  }

  const handleLogoutPress = () => {
    Alert.alert(
      "Log out?",
      "You'll need to sign in again to manage bookings and your wishlist.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            setUser(null)
            await logout()
          },
        },
      ]
    )
  }

  return {
    user,
    isPhotoUploading,
    nextTrip,
    toast,
    dismissToast,
    handleChangePhoto,
    handleLogoutPress,
  }
}
