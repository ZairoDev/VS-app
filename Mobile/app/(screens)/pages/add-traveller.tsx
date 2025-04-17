import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Modalize } from "react-native-modalize";
// import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Checkbox } from "react-native-paper";

interface Traveller {
  id: string;
  name: string;
  age: string;
  gender: string;
  nationality: string;
  selected: boolean;
}

const AddTraveller = () => {
  const modalizeRef = useRef<Modalize>(null);
  const [travellers, setTravellers] = useState<Traveller[]>([
    {
      id: "1",
      name: "Aniket Yadav",
      age: "21",
      gender: "Male",
      nationality: "India",
      selected: false,
    },
  ]);

  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("Male");
  const [nationality, setNationality] = useState<string>("");

  const [open, setOpen] = useState<boolean>(false);
  const [items, setItems] = useState([
    { label: "India", value: "India" },
    { label: "USA", value: "USA" },
    { label: "Canada", value: "Canada" },
  ]);

  const openModal = () => {
    modalizeRef.current?.open();
  };

  const addTraveller = () => {
    if (name && age) {
      const newTraveller: Traveller = {
        id: Date.now().toString(),
        name,
        age,
        gender,
        nationality,
        selected: false,
      };
      setTravellers([...travellers, newTraveller]);
      modalizeRef.current?.close();
      resetForm();
    }
  };

  const resetForm = () => {
    setName("");
    setAge("");
    setGender("Male");
    setNationality("India");
  };

  const toggleSelect = (id: string) => {
    const updatedTravellers = travellers.map((traveller) =>
      traveller.id === id
        ? { ...traveller, selected: !traveller.selected }
        : traveller
    );
    setTravellers(updatedTravellers);
  };

  const handleSelectTravellers = () => {
    const selectedTravellers = travellers.filter(
      (traveller) => traveller.selected
    );
    console.log("Selected Travellers:", selectedTravellers);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Traveller</Text>
      </View>

      <Text style={styles.modalTitle}>Add your fellow explorers!</Text>
      <SectionList
        sections={[{ title: "Saved Travellers", data: travellers }]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Checkbox
                status={item.selected ? "checked" : "unchecked"}
                onPress={() => toggleSelect(item.id)}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.travellerName}>{item.name}</Text>
                <Text style={styles.travellerInfo}>
                  {item.gender} • {item.age} yr • {item.nationality}
                </Text>
              </View>
              <Icon name="more-vert" size={20} />
            </View>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity onPress={openModal} style={styles.addTraveller}>
            <Icon name="add" size={20} color="orange" />
            <Text style={styles.addTravellerText}>Add New Traveller</Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity
        style={styles.selectButton}
        onPress={handleSelectTravellers}
      >
        <Text style={styles.selectButtonText}>Select Travellers</Text>
      </TouchableOpacity>

      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        modalStyle={styles.modalContent}
      >
        <View style={styles.formContainer}>
          <Text style={styles.modalTitle}>Tell us about the traveller!</Text>

          <View style={styles.genderContainer}>
            {["Male", "Female", "Transgender"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.genderButton,
                  gender === item && styles.genderButtonSelected,
                ]}
                onPress={() => setGender(item)}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === item && styles.genderTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Age"
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
      
          <TextInput
            placeholder="Country"
            style={styles.input}
            value={nationality}
            onChangeText={setNationality}
          />

          <TouchableOpacity style={styles.saveButton} onPress={addTraveller}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Modalize>
    </SafeAreaView>
  );
};

export default AddTraveller;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  subtitle: {
    fontSize: 14,
    color: "#6c757d",
    marginHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  travellerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  travellerInfo: {
    fontSize: 12,
    color: "#6c757d",
  },
  addTraveller: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  addTravellerText: {
    fontSize: 16,
    color: "orange",
    marginLeft: 5,
  },
  selectButton: {
    backgroundColor: "orange",
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  formContainer: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  genderButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  genderButtonSelected: {
    backgroundColor: "orange",
  },
  genderText: {
    fontSize: 14,
    color: "#333",
  },
  genderTextSelected: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdown: {
    height: 40,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "orange",
    padding: 15,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});
