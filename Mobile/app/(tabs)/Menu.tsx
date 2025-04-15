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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Dimensions } from "react-native";
import { Buffer } from "buffer";
import { UserDataType } from "@/types";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

const Menu = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  // const [user, setUser] = useState<UserDataType | null>(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const { user, login, register, logout ,setUser } = useAuthStore();
  const BUNNY_ACCESS_KEY=process.env.EXPO_PUBLIC_BUNNY_ACCESS_KEY
   
  const pickImageFromGallery = async () =>{
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if(!result.canceled){
      return result.assets[0].uri;

    }
    return null;
  }

  const uploadToBunny = async (uri: string, fileName: string): Promise<string | null> => {
    try {
      const fileBinary = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const buffer = Buffer.from(fileBinary, "base64");
  
      const url = `${process.env.EXPO_PUBLIC_BUNNY_STORAGE_URL}/${process.env.EXPO_PUBLIC_BUNNY_STORAGE_ZONE}/${fileName}`;
  
      console.log("Uploading to:", url);
  
      await axios.put(url, buffer, {
        headers: {
          AccessKey: process.env.EXPO_PUBLIC_BUNNY_ACCESS_KEY!,
          "Content-Type": "application/octet-stream",
        },
      });
  
      return `${process.env.EXPO_PUBLIC_BUNNY_CDN_URL}/${fileName}`;
    } catch (error: any) {
      console.error(
        "Bunny Upload Error:",
        error.response?.data || error.message || "Unknown Error"
      );
      return null;
    }
  };


  const updateProfilePicInDB = async (userId: string, profilePicUrl: string) => {
    try {
      await axios.put(`${process.env.EXPO_PUBLIC_BASE_URL}/user/updateProfilePic`, {
        userId,
        profilePic: profilePicUrl,
      });
      Alert.alert("Success", "Profile photo updated!");
    } catch (err) {
      console.error("DB Update Error:", err);
      Alert.alert("Failed to update profile pic in DB");
    }
  };
  


  const handleEditProfilePhoto = async (user: UserDataType) => {
    const localUri = await pickImageFromGallery();
    if (!localUri) return;
  
    const fileName = `profile_${user._id}_${Date.now()}.jpg`;
    const bunnyUrl = await uploadToBunny(localUri, fileName);
  
    if (bunnyUrl) {
      await updateProfilePicInDB(user._id, bunnyUrl);
  
      // Update the profilePic in auth store after successful upload
      setUser({ ...user, profilePic: bunnyUrl });
    }
  };

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    checkUserLoggedIn();
  }, [setUser]);



  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err: any) {
      console.error("Login error:", err?.response?.data?.message || err.message);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/user/register`, {
        name,
        email,
        password,
        phone,
      });
      Alert.alert("Success", "Registration successful. Please login.");
      setIsLogin(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert(
          "Registration Failed",
          error.response?.data?.message || "Something went wrong"
        );
      } else {
        Alert.alert("Registration Failed", "An unexpected error occurred");
      }
    }
  };

  const handleLogout = async () => {
    setUser(null);
    await logout();
  };
  const recentActivity = [
    { type: 'visit', property: 'Sunset Villa', date: '2 days ago' },
    { type: 'message', property: 'Mountain View Apartment', date: '1 week ago' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {user ? (
        <ScrollView style={styles.container}>
          <LinearGradient colors={["#ffdea8", "#ffffff"]} style={styles.gradientBackground} />

          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                style={styles.profileImage}
                source={{ uri: user.profilePic }}
              />
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

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </ScrollView>
      ) : (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isLogin ? "Login" : "Register"}</Text>

            {!isLogin && (
              <>
                <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
                <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
              </>
            )}

            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

            <TouchableOpacity onPress={isLogin ? handleLogin : handleRegister} style={styles.authButton}>
              <Text style={styles.authButtonText}>{isLogin ? "Login" : "Register"}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleTextContainer}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
 
  profileContainer: {
    backgroundColor: "white",
    marginTop: 50,
  },
  profileText: { fontSize: 20, fontWeight: "bold" },
  logoutButton: {
    marginTop: 10,
    padding: 10,
    alignItems: "center",
    width: "30%",
    backgroundColor: "red",
    borderRadius: 5,
  },
  logoutText: { color: "#fff", fontWeight: "bold" },

  modalContainer: {
    display: "flex",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "white",
    elevation: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: {
    width: 230,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  toggleTextContainer: { marginTop: 10 },
  toggleText: { color: "blue" },
  authButton: {
    backgroundColor: "#f57c00",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },

  authButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 250,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    
  },
  profileImageContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editIconContainer: {
    position: 'absolute',
    right: -5,
    bottom: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#eee',
  },
  quickActionsContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#555',
  },
  recentActivityContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0080ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#555',
  },
  activityHighlight: {
    fontWeight: 'bold',
    color: '#333',
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  menuContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
});

export default Menu;
