import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";

// Define the Coupon interface
interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  minOrderValue: number;
}

const ApplyCoupon = () => {
  const [couponCode, setCouponCode] = useState<string>("");
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [coupon, setCoupon] = useState<Coupon[]>([]);

  // Fetch coupons on component load
  useEffect(() => {
    getCoupon();
  }, []);

  // Fetch all coupons
  const getCoupon = async () => {
    try {
      const response = await axios.get<{ coupons: Coupon[] }>(
        `${process.env.EXPO_PUBLIC_BASE_URL}/coupon/get-all`
      );
      setCoupon(response.data.coupons); // Correctly set the entire array
      console.log("Coupons fetched:", response.data.coupons);
    } catch (error) {
      console.log("Error in fetching coupons", error);
    }
  };

  // Apply coupon logic
  const handleApplyCoupon = () => {
    if (couponCode.trim() === "") {
      Alert.alert("Error", "Please enter a valid coupon code.");
      return;
    }

    const foundCoupon = coupon.find((c) => c.code === couponCode.trim());

    if (foundCoupon) {
      setIsApplied(true);
      Alert.alert(
        "Success",
        `🎉 Coupon "${foundCoupon.code}" applied successfully!`
      );
    } else {
      Alert.alert("Error", "Invalid coupon code.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply Coupon</Text>
      </View>
      

      <View style={styles.card}>
       

        <TextInput
          style={styles.input}
          placeholder="Enter your coupon code"
          value={couponCode}
          onChangeText={(text) => setCouponCode(text)}
        />

        <TouchableOpacity
          style={[styles.button, isApplied && styles.buttonDisabled]}
          onPress={handleApplyCoupon}
          disabled={isApplied}
        >
          <Text style={styles.buttonText}>
            {isApplied ? "Coupon Applied" : "Apply Coupon"}
          </Text>
        </TouchableOpacity>

        {isApplied && (
          <Text style={styles.successMessage}>
            🎉 Coupon successfully applied!
          </Text>
        )}
      </View>

      <View style={styles.couponList}>
  <Text style={styles.listTitle}>Available Coupons</Text>
  {coupon.length > 0 ? (
    coupon.map((c: Coupon) => (
      <TouchableOpacity
        key={c._id}
        style={styles.couponCard}
        onPress={() => setCouponCode(c.code)}
      >
        <View style={styles.couponHeader}>
          <View style={styles.checkbox}>
            {couponCode === c.code && <View style={styles.checked} />}
          </View>

          <View style={styles.codeBox}>
            <Text style={styles.couponCode}>{c.code}</Text>
          </View>
        </View>

        <Text style={styles.saveText}>
          Save{" "}
          {c.discountType === "percentage"
            ? `₹${((c.discountValue / 100) * c.minOrderValue).toFixed(2)}`
            : `₹${c.discountValue}`}
        </Text>

        <Text style={styles.discountText}>
          {c.discountType === "percentage"
            ? `${c.discountValue}% off on minimum purchase of ₹${c.minOrderValue}`
            : `Flat ₹${c.discountValue} off on minimum purchase of ₹${c.minOrderValue}`}
        </Text>

        <Text style={styles.expiryText}>
          Expires on: {new Date(c.expiryDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",             
          })}{" "}
       
        </Text>
      </TouchableOpacity>
    ))
  ) : (
    <Text style={styles.noCoupons}>No coupons available.</Text>
  )}
</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#ff8300",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  successMessage: {
    marginTop: 10,
    fontSize: 14,
    color: "green",
    textAlign: "center",
  },
  couponList: {
    margin: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  couponCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  couponHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ff8300",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: "#ff8300",
    borderRadius: 2,
  },
  codeBox: {
    borderWidth: 1,
    borderColor: "#ff8300",
    borderStyle: "dashed",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  couponCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ff8300",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 4,
    color: "#333",
  },
  discountText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  expiryText: {
    fontSize: 12,
    color: "#888",
  },
  noCoupons: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
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
});

export default ApplyCoupon;
