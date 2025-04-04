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
import { Dimensions } from "react-native";
import { UserDataType } from "@/types";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const Menu = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState<UserDataType | null>(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  // const width=Dimensions.get("window")

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    const token = await AsyncStorage.getItem("token");
    const storedUser = await AsyncStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setModalVisible(false);
    }
  };

  const handleLogin = async () => {
    try {
      console.log("trying to get the response");
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/user/login`,
        {
          email,
          password,
        }
      );
      const { token, user } = response.data;
      console.log("token", token);
      console.log("user", user);

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setModalVisible(false);
    } catch (error: unknown) {
      console.log("error aa gyi hai ");
      if (axios.isAxiosError(error)) {
        Alert.alert(
          "Login Failed",
          error.response?.data?.message || "Something went wrong"
        );
      } else {
        Alert.alert("Login Failed", "An unexpected error occurred");
      }
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
    } catch (error: unknown) {
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
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
    setModalVisible(true);
  };
  const recentActivity = [
    { type: 'visit', property: 'Sunset Villa', date: '2 days ago' },
    { type: 'message', property: 'Mountain View Apartment', date: '1 week ago' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {user ? (
        <ScrollView style={styles.container}>
        {/* Background gradient */}
        <LinearGradient
          colors={['#ffdea8', '#ffffff']}
          style={styles.gradientBackground}
        />
  
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              style={styles.profileImage}
              source={{
                uri: user.profilePic,
              }}
            />
            <TouchableOpacity
              style={styles.editIconContainer}
              onPress={() => {
                // Handle profile picture edit
              }}
            >
              <MaterialIcons name="edit" size={18} color="#333" />
            </TouchableOpacity>
          </View>
  
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.nameText}>{user.name}</Text>
          
          {/* Quick stats */}
          {/* <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Visits</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View> */}
        </View>
  
        {/* Quick Actions */}
        {/* <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#e6f7ff' }]}>
                <MaterialIcons name="search" size={24} color="#0080ff" />
              </View>
              <Text style={styles.quickActionText}>Search</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#fff0f0' }]}>
                <MaterialIcons name="favorite-border" size={24} color="#ff4d4d" />
              </View>
              <Text style={styles.quickActionText}>Favorites</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#f0fff0' }]}>
                <MaterialIcons name="notifications-none" size={24} color="#00cc66" />
              </View>
              <Text style={styles.quickActionText}>Alerts</Text>
            </TouchableOpacity>
          </View>
        </View> */}
  
        {/* Recent Activity */}
        {/* <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <MaterialIcons 
                  name={activity.type === 'visit' ? 'visibility' : 'message'} 
                  size={20} 
                  color="#fff" 
                />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityText}>
                  {activity.type === 'visit' ? 'You visited ' : 'You messaged about '}
                  <Text style={styles.activityHighlight}>{activity.property}</Text>
                </Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
            </View>
          ))}
        </View> */}
  
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {[
            { label: "Go to Profile", icon: "person", onPress: () => router.push("/(screens)/pages/profile-page") },
            // { label: "List Your Property", icon: "add", onPress: () => {} },
            { label: "Need Help", icon: "help-outline", onPress: () => router.push("/(screens)/pages/need-support") },
            { label: "Privacy Policy", icon: "lock-outline", onPress: () => router.push("/(screens)/pages/privacy-policy") },
            { label: "Terms of Use", icon: "description", onPress: () => router.push("/(screens)/pages/terms-conditions") },
            { label: "Logout", icon: "logout", onPress: handleLogout },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}    
              onPress={item.onPress}
              style={styles.menuItem}
            >
              <View style={styles.menuIconContainer}>
                <MaterialIcons name={item.icon} size={20} color="#555" />
              </View>
              <Text style={styles.menuItemText}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
  
        {/* App version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
      ) : null}

      {modalVisible && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isLogin ? "Login" : "Register"}
            </Text>

            {!isLogin && (
              <>
                <TextInput
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Phone"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
              </>
            )}

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={isLogin ? handleLogin : handleRegister}
              style={styles.authButton}
            >
              <Text style={styles.authButtonText}>
                {isLogin ? "Login" : "Register"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              style={styles.toggleTextContainer}
            >
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Don't have an account? Register"
                  : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   width: "100%",
  //   height: "100%",
  //   backgroundColor: "white",
  // },
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
