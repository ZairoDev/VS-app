import { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import Slider from "@react-native-community/slider";

type CountType = "BEDROOMS" | "BATHROOMS" | "BEDS";
type OperationType = "INCREMENT" | "DECREMENT";

export default function FilterPage() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [priceRange, setPriceRange] = useState(10);
  const [isFilterChanged, setIsFilterChanged] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [allowCooking, setAllowCooking] = useState(false);
  const [allowParty, setAllowParty] = useState(false);
  const [allowPets, setAllowPets] = useState(false);

  const toggleSwitch = () =>{ setIsEnabled((prev) => !prev); setIsFilterChanged(true)};
  const handleAllowCooking = () =>{ setAllowCooking((prev) => !prev); setIsFilterChanged(true)};
  const handleAllowParty = () =>{ setAllowParty((prev) => !prev); setIsFilterChanged(true)};
  const handleAllowPets = () =>{ setAllowPets((prev) => !prev); setIsFilterChanged(true)};


  const handleCount = (type: CountType, operation: OperationType) => {
    setIsFilterChanged(true);
    switch (type) {
      case "BEDROOMS":
        setBedrooms((prev) =>
          Math.max(1, prev + (operation === "INCREMENT" ? 1 : -1))
        );
        break;
      case "BATHROOMS":
        setBathrooms((prev) =>
          Math.max(1, prev + (operation === "INCREMENT" ? 1 : -1))
        );
        break;
      case "BEDS":
        setBeds((prev) =>
          Math.max(1, prev + (operation === "INCREMENT" ? 1 : -1))
        );
        break;
    }
  };

  const applyFilters = () => {
    setModalVisible(false);
  };

  const clearFilters = () => {
    setBedrooms(1);
    setBeds(1);
    setBathrooms(1);
    setPriceRange(10);
    setIsEnabled(false);
    setIsFilterChanged(false);
    setModalVisible(false);
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    
    if (bedrooms !== 1) count++;
    if (beds !== 1) count++;
    if (bathrooms !== 1) count++;
    if (priceRange !== 10) count++;
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
  }, [bedrooms, beds, bathrooms, priceRange, isEnabled,allowCooking,allowParty,allowPets]);

  return (
    <View
      style={{
        backgroundColor: "white",
        height: "100%",
        width: "100%",
        gap: 30,
      }}
    >
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
        <Text style={{ fontSize: 15 }}>Price Range: €{priceRange}</Text>
        <Slider
          style={{ width: "100%", height: 40 }}
          value={priceRange}
          onValueChange={(value) => {
            setPriceRange(value);
            setIsFilterChanged(true);
          }}
          minimumValue={10}
          maximumValue={11}
          step={1}
          minimumTrackTintColor="#000000"
          maximumTrackTintColor="#000000"
          thumbTintColor="orange"
        />
      </View>

      <View style={styles.amenitiesFiltersContainer}>
        {["BEDS", "BEDROOMS", "BATHROOMS"].map((type) => (
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
                  : bathrooms}
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
              borderColor: allowCooking?"orange":"black"
            }}
          >
            <Image
              style={styles.iconImageStyle}
              source={allowCooking?require("@/assets/images/cooking.png"):require("@/assets/images/cooking raw.png")}
            />
          </View>
          <Text style={{color:allowCooking?"orange":"black"}}>Cooking</Text>
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
              borderColor: allowPets?"orange":"black"
            }}
          >
            <Image
              style={styles.iconImageStyle}
              source={allowPets?require("@/assets/images/pets.png"):require("@/assets/images/paws-raw1.png")}
            />
          </View>
          <Text style={{color:allowPets?"orange":"black"}}>Pets</Text>
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
    marginTop: 25,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // borderWidth:1,
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
    // borderWidth:1,
    backgroundColor: "#fff",
  },
  priceRangeContainer: {
    // borderWidth:1,
    padding: 10,
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
});
