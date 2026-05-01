import React, { useState } from "react";

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
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <Feather name={icon as any} size={18} color="#5f5f5f" />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={isEmpty ? styles.emptyValue : styles.valueText}>
            {value}
          </Text>
        {description && (
          <Text style={styles.descriptionText}>{description}</Text>
        )}
      </View>
      </View>
      {onEdit ? (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>{actionText}</Text>
          <Feather
            name={isEmpty ? "plus" : "edit-2"}
            size={14}
            color={"#Fea850"}
            style={styles.actionIcon}
          />
        </TouchableOpacity>
      ) : (
        <Text style={styles.staticMeta}>Verified</Text>
      )}
    </View>
  );
};

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
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
      await axios.put(`${process.env.EXPO_PUBLIC_BASE_URL}/user/update`,{
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={styles.headerBackdrop} pointerEvents="none">
          <View style={styles.headerAuraPrimary} />
          <View style={styles.headerAuraSecondary} />
          <View style={styles.headerAccentLine} />
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Profile Details</Text>
          <Text style={styles.headerSubtitle}>
            Manage your personal information
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introBlock}>
          <Text style={styles.introEyebrow}>ACCOUNT</Text>
          <Text style={styles.introTitle}>Personal information</Text>
          <Text style={styles.introText}>
            Keep your contact details and identity information up to date for smoother bookings and support.
          </Text>
        </View>

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
            value={ user?.preferredName || "Not provided"}
            actionText={user?.preferredName ? "Edit" : "Add"}
            onEdit={() => handleEdit("Preffered name", "preferredName", user?.preferredName || "")}
          />
          <ProfileCard
            icon="phone"
            label="Phone number"
            value={user?.phone || "Not provided"}
            actionText={user?.phone ? "Edit" : "Add"}
            description="Contact number (for confirmed guests and service providers to get in touch)."
            onEdit={() => handleEdit("Phone number", "phone", user?.phone || "")}
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
            onEdit={() => handleEdit("Address", "address", user?.address || "")}
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
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  headerBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerAuraPrimary: {
    position: "absolute",
    top: -42,
    right: -12,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(254, 168, 80, 0.10)",
  },
  headerAuraSecondary: {
    position: "absolute",
    top: 16,
    left: -30,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 228, 196, 0.55)",
  },
  headerAccentLine: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 0,
    height: 1,
    backgroundColor: "#F1F1F1",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: { paddingLeft: 12, flex: 1 },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#1A1A1A" },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  content: { flex: 1 },
  introBlock: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  introEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A1A1AA",
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  introText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    paddingRight: 16,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowContent: { flex: 1 },
  cardLabel: { fontSize: 13, fontWeight: "600", color: "#8A8A8A", marginBottom: 6 },
  valueText: { fontSize: 17, color: "#1A1A1A", marginBottom: 4, fontWeight: "500" },
  emptyValue: {
    fontSize: 16,
    color: "#AAAAAA",
    fontStyle: "italic",
    marginBottom: 4,
  },
  descriptionText: { fontSize: 13, color: "#777", lineHeight: 19 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingTop: 2,
  },
  actionText: { fontSize: 14, fontWeight: "700", color: "#Fea850" },
  actionIcon: { marginLeft: 4 },
  staticMeta: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9A9A9A",
    paddingTop: 4,
  },
}); 

export default ProfilePage;