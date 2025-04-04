import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Profile = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={{ padding: 20 }}>
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeading}>Personal Details</Text>

        </View>
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeading}>Additional Details</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: "100%",
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 20,
    height: "7%",
    backgroundColor: "white",
    elevation: 5,
  },
  headerTitle: {
    paddingLeft: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsCard:{
    padding: 10,
    backgroundColor: "white",
    borderRadius: 6,
    position: "relative",
    borderWidth: 1,
    marginBottom: 20,
    elevation: 5,
    height: 100,
  },
  cardHeading:{
    position: "absolute",
    top: -10,
    left: 20,
    backgroundColor: "white",
  }
});
