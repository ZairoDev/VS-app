import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth-store";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { UserDataType } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EditModal from "@/components/edit";

interface ProfileFieldProps{
  icon: string;
  label: string;
  value: string;
  actionText: string;
  description?: string;
  onEdit?: () => void;
}

const ProfileCard = ({
  icon,
  label,
  value,
  actionText,
  description,
  onEdit,
}: ProfileFieldProps) => {
  const isEmpty = value === "Not provided";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Feather name={icon as any} size={20} color="#555" />
        </View>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={isEmpty ? styles.emptyValue : styles.valueText}>
          {value}
        </Text>
        {description && (
          <Text style={styles.descriptionText}>{description}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          { backgroundColor: "transparent"},
        ]}
        onPress={onEdit}
      >
        <Text
          style={[styles.actionText, { color:  "#Fea850" }]}
        >
          {" "}
          {actionText}{" "}
        </Text>
        <Feather
          name={isEmpty ? "plus" : "edit-2"}
          size={16}
          color={ "#Fea850"}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>
    </View>
  );
};

const ProfilePage = () => {
   const { user,setUser} = useAuthStore();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldKey, setFieldKey] = useState("");
  const [fieldValue, setFieldValue] = useState("");

  const handleEdit = (label: string,key: string, value: string) => {
    setFieldLabel(label);
    setFieldKey(key);
    setFieldValue(value);
    setModalVisible(true);
  };

  const saveChanges = async (newValue: string) => {
    try{
      const res= await axios.put(`${process.env.EXPO_PUBLIC_BASE_URL}/user/update`,{
        [fieldKey]:newValue,
        userId:user?._id
      });

      const updatedUser: UserDataType = {
        ...(user as UserDataType),
        [fieldKey]: newValue,
      };
      
      setUser(updatedUser);
      await AsyncStorage.setItem("authUser", JSON.stringify(updatedUser));

    }catch(error){
      console.error("Error saving changes:", error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#Fea850" />

      <LinearGradient colors={["#fea850", "orange"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Profile Details</Text>
          <Text style={styles.headerSubtitle}>
            Manage your personal information
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>
          <ProfileCard
            icon="user"
            label="Legal name"
            value={user?.name || "Not provided"}
            actionText={user?.name ? "Edit" : "Add"}
            onEdit={() => handleEdit("Legal name", "name", user?.name || "")}
          />
          <ProfileCard
            icon="smile"
            label="Preferred first name"
            value={ user?.name || "Not provided"}
            actionText={user?.name ? "Edit" : "Add"}
          />
          <ProfileCard
            icon="phone"
            label="Phone number"
            value={user?.phone || "Not provided"}
            actionText={user?.phone ? "Edit" : "Add"}
            description="Contact number (for confirmed guests and service providers to get in touch)."
          />
          <ProfileCard
            icon="mail"
            label="Email"
            value={user?.email || "Not provided"}
            actionText={user?.email ? "Edit" : "Add"}
          />
          <ProfileCard
            icon="map-pin"
            label="Address"
            value={ user?.address || "Not provided"}
            actionText={user?.address ? "Edit" : "Add"}
          />
          <ProfileCard
            icon="alert-circle"
            label="Emergency contact"
            value={user?.emergencyContact || "Not provided"}
            actionText={user?.emergencyContact ? "Edit" : "Add"}
          />
        </View>
      </ScrollView>

      <EditModal
        visible={modalVisible}
        label={fieldLabel}
        value={fieldValue}
        onClose={() => setModalVisible(false)}
        onSave={saveChanges}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    // marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTextContainer: { paddingLeft: 10 },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 5,
  },
  content: { flex: 1, paddingHorizontal: 20 },
  cardsContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardLabel: { fontSize: 16, fontWeight: "600", color: "#555" },
  cardContent: { marginBottom: 16 },
  valueText: { fontSize: 18, color: "#333", marginBottom: 6 },
  emptyValue: {
    fontSize: 16,
    color: "#AAAAAA",
    fontStyle: "italic",
    marginBottom: 6,
  },
  descriptionText: { fontSize: 14, color: "#777", lineHeight: 20 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "transparent",
    borderColor: "orange",
  },
  actionText: { fontSize: 14, fontWeight: "600" },
});

export default ProfilePage;