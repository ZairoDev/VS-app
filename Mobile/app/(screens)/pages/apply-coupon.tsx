import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";

const ApplyCoupon = () => {
  const [couponCode, setCouponCode] = useState("");
  const [isApplied, setIsApplied] = useState(false);

  const handleApplyCoupon = () => {
    if (couponCode.trim() === "") {
      Alert.alert("Error", "Please enter a valid coupon code.");
      return;
    }


    if (couponCode === "SAVE10") {
      setIsApplied(true);
      
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apply Coupon</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Enter Coupon Code</Text>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
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
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
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
});

export default ApplyCoupon;
