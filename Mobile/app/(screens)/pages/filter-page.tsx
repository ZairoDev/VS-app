import { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

// import Slider from "@react-native-community/slider";
import { useNavigation ,router} from "expo-router";

import useStore from "@/store/filter-store";
import { TextInput } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

type CountType = "BEDROOMS" | "BATHROOM" | "BEDS";
type OperationType = "INCREMENT" | "DECREMENT";

export default function FilterPage() {
  const {
    isEnabled, 
    bedrooms, 
    beds, 
    bathroom, 
    minPrice,
    maxPrice,
    isFilterChanged, 
    modalVisible, 
    allowCooking, 
    allowParty, 
    allowPets,
    toggleSwitch,
    handleCount,
    handleAllowCooking,
    handleAllowParty,
    handleAllowPets,
    applyFilters,
    clearFilters,
    updateMinPrice,
    updateMaxPrice,
    setModalVisible
  } = useStore();
  
  const navigation=useNavigation()

  const getAppliedFiltersCount = () => {
    let count = 0;
    
    if (bedrooms !== 0) count++;
    if (beds !== 0) count++;
    if (bathroom !== 0) count++;
    
    if (allowCooking) count++;
    if (allowParty) count++;
    if (allowPets) count++;
    if (isEnabled) count++;
  
    return count;
  };

  useEffect(() => {
    if (isFilterChanged) {
      setModalVisible(true);
    }
  },[isEnabled, allowCooking, allowParty, allowPets, minPrice, maxPrice, bedrooms, beds, bathroom,]);

  return (
    <View
      style={{
        backgroundColor: "white",
        height: "100%",
        width: "100%",
        gap: 30,
      }}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
      </View>
      <View style={styles.switchContainer}>
        <Text>Tap to Long term</Text>
        <Switch
          trackColor={{ false: "#c4c3c5", true: "#c4c3c5" }}
          thumbColor={isEnabled ? "orange" : "orange"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>

      <View style={styles.priceRangeContainer}>
        <Text style={{ fontSize: 15 }}>Price Range in €</Text>
        <View style={styles.inputContainer}>
        {/* Minimum Price Input */}
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Min Price"
          value={minPrice.toString()}
          onChangeText={(text) => updateMinPrice(text)}
        />

        <Text style={{ fontSize: 18, marginHorizontal: 10 }}> - </Text>

        {/* Maximum Price Input */}
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Max Price"
          value={maxPrice.toString()}
          onChangeText={(text) => updateMaxPrice(text)}
        />
      </View>
      </View>

      <View style={styles.amenitiesFiltersContainer}>
        {["BEDS", "BEDROOMS", "BATHROOM"].map((type) => (
          <View key={type} style={styles.amenitiesContainer}>
            <Text style={{ fontSize: 18 }}>{type}</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleCount(type as CountType, "DECREMENT")}
              >
                <Text style={{ fontSize: 18 }}>-</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, marginHorizontal: 15 }}>
                {type === "BEDS"
                  ? beds
                  : type === "BEDROOMS"
                  ? bedrooms
                  : bathroom}
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleCount(type as CountType, "INCREMENT")}
              >
                <Text style={{ fontSize: 18 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.allowFiltersContainer}>
        <TouchableOpacity onPress={handleAllowCooking} style={{ display: "flex", alignItems: "center" }}>
          <View
            style={{
              borderWidth: 1,
              padding: 8,
              borderRadius: 10,
              borderColor: allowCooking?"orange":"#c1c2c3"
            }}
          >
            <Image
              style={styles.iconImageStyle}
              // source={allowCooking?require("@/assets/images/cooking.png"):require("@/assets/images/cooking raw.png")}
              source={require("@/assets/images/cooking.png")}
            />
          </View>
          <Text style={{color:allowCooking?"orange":"black",fontWeight:allowCooking?500:300}}>Cooking</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAllowParty} style={{ display: "flex", alignItems: "center" }}>
          <View
            style={{
              borderWidth: 1,
              padding: 8,
              borderRadius: 10,
              borderColor: allowParty?"orange":"#c1c2c3"
            }}
          >
            <Image
              style={styles.iconImageStyle}
              // source={allowParty?require("@/assets/images/confetti.png"):require("@/assets/images/confetti raw.png")}
              source={require("@/assets/images/confetti.png")}
            />
          </View>
          <Text style={{color:allowParty?"orange":"black",fontWeight:allowParty?500:300}}>Party</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAllowPets} style={{ display: "flex", alignItems: "center" }}>
          <View
            style={{
              borderWidth: 1,
              padding: 8,
              borderRadius: 10,
              borderColor: allowPets?"orange":"#c1c2c3"
            }}
          >
            <Image
              style={styles.iconImageStyle}
              // source={allowPets?require("@/assets/images/pets.png"):require("@/assets/images/paws-raw1.png")}
              source={require("@/assets/images/pets.png")}
            />
          </View>
          <Text style={{color:allowPets?"orange":"black",fontWeight:allowPets?500:300}}>Pets</Text>
        </TouchableOpacity>
      </View>

      {modalVisible && (
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={{ fontSize: 16, borderBottomWidth:1, paddingBottom:3}}>
              Clear All ({getAppliedFiltersCount()})
              </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.buttonText}>Apply Filters </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    padding: 10,
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 15,
  },
  iconImageStyle: {
    width: 70,
    height: 70,
  },
  amenitiesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  allowFiltersContainer: {
    display: "flex",
    flexDirection: "row",
    borderRadius: 20,
    height: 130,
    justifyContent: "space-evenly",
    alignItems: "center",
    marginHorizontal: 15,
    elevation: 8,
    backgroundColor: "#fff",
  },
  priceRangeContainer: {
    paddingVertical: 20,
    elevation: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 15,
    display: "flex",
    alignItems: "center",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    borderWidth: 1,
    borderRadius: 50,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  amenitiesFiltersContainer: {
    height: "25%",
    elevation: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 15,
    display: "flex",
    padding: 20,
    justifyContent: "space-evenly",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    elevation: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  applyButton: {
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 10,
  },
  clearButton: {
    padding: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 20,
    height: "7%",
    backgroundColor: "#fff",
    elevation: 5,
    
  },
  
  headerTitle: {
    paddingLeft:10,
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    width: "40%",
    borderRadius: 5,
    textAlign: "center",
  },
});
