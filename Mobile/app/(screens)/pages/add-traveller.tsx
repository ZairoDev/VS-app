"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useTravellerStore } from "@/store/traveller-store"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { Modalize } from "react-native-modalize"
// import { Portal } from "react-native-portalize"

const { width } = Dimensions.get("window")

const AddTraveller = () => {
  const params = useLocalSearchParams()
  const {
    travellers,
    maxAdults,
    maxChildren,
    maxInfants,
    bookingId,
    setLimits,
    addTraveller: addTravellerToStore,
    removeTraveller,
  } = useTravellerStore()

  // Modalize reference
  const modalizeRef = useRef<Modalize>(null)

  // Set booking limits on mount or param change
  useEffect(() => {
    const adults = Math.max(0, Number.parseInt(params.adults?.toString() || "1"))
    const children = Math.max(0, Number.parseInt(params.children?.toString() || "0"))
    const infants = Math.max(0, Number.parseInt(params.infants?.toString() || "0"))
    const id = params.id?.toString() || ""

    if (maxAdults !== adults || maxChildren !== children || maxInfants !== infants || bookingId !== id) {
      setLimits(adults, children, infants, id)
    }
  }, [params])

  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "other">("male")
  const [nationality, setNationality] = useState("")
  const [type, setType] = useState<"adult" | "child" | "infant">("adult")
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  const countByType = useCallback(
    (t: "adult" | "child" | "infant") => travellers.filter((tr) => tr.type === t).length,
    [travellers],
  )

  const remaining = useMemo(
    () => ({
      adult: Math.max(0, maxAdults - countByType("adult")),
      child: Math.max(0, maxChildren - countByType("child")),
      infant: Math.max(0, maxInfants - countByType("infant")),
    }),
    [maxAdults, maxChildren, maxInfants, countByType],
  )

  // Calculate progress
  const totalTravellers = maxAdults + maxChildren + maxInfants
  const addedTravellers = travellers.length
  const progress = totalTravellers > 0 ? (addedTravellers / totalTravellers) * 100 : 0

  const validateTraveller = (): string | null => {
    if (!name.trim()) return "Please enter a name"
    const ageNum = Number.parseInt(age)
    if (isNaN(ageNum)) return "Please enter a valid age"

    if (type === "adult" && ageNum < 13) return "Adults must be 13+ years"
    if (type === "child" && (ageNum < 2 || ageNum > 12)) return "Children must be 2-12 years"
    if (type === "infant" && ageNum >= 2) return "Infants must be under 2 years"

    if (remaining[type] <= 0) return `Maximum ${type}s reached`
    if (!nationality.trim()) return "Please enter nationality"

    return null
  }

  const addTraveller = () => {
    const error = validateTraveller()
    if (error) return Alert.alert("Cannot Add Traveller", error)

    addTravellerToStore({
      name: name.trim(),
      age,
      gender,
      nationality: nationality.trim(),
      type,
    })

    setName("")
    setAge("")
    setGender("male")
    setNationality("")
    modalizeRef.current?.close()

    if (remaining[type] <= 1) {
      if (remaining.child > 0) setType("child")
      else if (remaining.infant > 0) setType("infant")
    }
  }

  const saveAndReturn = () => {
    if (countByType("adult") === 0) {
      return Alert.alert("Cannot Save", "At least one adult is required")
    }
    router.back()
  }

  const openBottomSheet = () => {
    modalizeRef.current?.open()
    setIsBottomSheetOpen(true)
  }

  const renderTypeButton = (t: "adult" | "child" | "infant") => {
    const canSelect = remaining[t] > 0
    const isSelected = type === t

    return (
      <TouchableOpacity
        key={t}
        onPress={() => setType(t)}
        disabled={!canSelect}
        style={[styles.typeButton, isSelected && styles.selectedType, !canSelect && styles.disabledType]}
      >
        <Text
          style={[styles.typeButtonText, isSelected && styles.selectedTypeText, !canSelect && styles.disabledTypeText]}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)} ({remaining[t]})
        </Text>
      </TouchableOpacity>
    )
  }

  const renderTravellerCard = (t: any) => {
    const typeColors = {
      adult: "orange",
      child: "orange",
      infant: "orange",
    }

    return (
      <View key={t.id} style={styles.travellerCard}>
        <View style={styles.travellerCardHeader}>
          <View style={[styles.travellerTypeTag, { backgroundColor: typeColors[t.type as keyof typeof typeColors] }]}>
            <Text style={styles.travellerTypeText}>{t.type.toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={() => removeTraveller(t.id)} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={24} color="#777" />
          </TouchableOpacity>
        </View>

        <Text style={styles.travellerName}>{t.name}</Text>

        <View style={styles.travellerDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{t.age} years</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name={t.gender === "male" ? "male" : t.gender === "female" ? "female" : "person"}
              size={16}
              color="#666"
            />
            <Text style={styles.detailText}>{t.gender}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="flag-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{t.nationality}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Travellers</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {addedTravellers} of {totalTravellers} travellers added
          </Text>
          <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.limitsContainer}>
        <View style={styles.limitItem}>
          <Ionicons name="person" size={20} color="orange" />
          <Text style={styles.limitText}>
            <Text style={styles.limitCount}>
              {countByType("adult")}/{maxAdults}
            </Text>{" "}
            Adults
          </Text>
        </View>
        <View style={styles.limitItem}>
          <Ionicons name="person-outline" size={20} color="orange" />
          <Text style={styles.limitText}>
            <Text style={styles.limitCount}>
              {countByType("child")}/{maxChildren}
            </Text>{" "}
            Children
          </Text>
        </View>
        <View style={styles.limitItem}>
          <FontAwesome5 name="baby" size={20} color="orange" />
          <Text style={styles.limitText}>
            <Text style={styles.limitCount}>
              {countByType("infant")}/{maxInfants}
            </Text>{" "}
            Infants
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {travellers.length > 0 ? (
          <View style={styles.travellerList}>{travellers.map(renderTravellerCard)}</View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={64} color="#ddd" />
            <Text style={styles.emptyStateText}>No travellers added yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap the button below to add travellers</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={openBottomSheet}
          style={styles.addTravellerButton}
          disabled={remaining.adult <= 0 && remaining.child <= 0 && remaining.infant <= 0}
        >
          <Ionicons name="add" size={24} color="orange" />
          <Text style={styles.addTravellerButtonText}>Add Traveller</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={saveAndReturn}
          style={[styles.saveButton, travellers.length === 0 && styles.disabledSaveButton]}
          disabled={travellers.length === 0}
        >
          <Text style={styles.saveButtonText}>Save & Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modalize Bottom Sheet */}
      
        <Modalize
          ref={modalizeRef}
          adjustToContentHeight
          handleStyle={styles.modalizeHandle}
          modalStyle={styles.modalizeContainer}
          HeaderComponent={
            <View style={styles.modalizeHeader}>
              <Text style={styles.bottomSheetTitle}>Add New Traveller</Text>
            </View>
          }
          onClose={() => setIsBottomSheetOpen(false)}
        >
          <View style={styles.bottomSheetContent}>
            <View style={styles.typeContainer}>
              {renderTypeButton("adult")}
              {renderTypeButton("child")}
              {renderTypeButton("infant")}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                placeholder="Enter traveller's full name"
                value={name}
                onChangeText={setName}
                style={styles.formInput}
                autoCorrect={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Age</Text>
              <TextInput
                placeholder="Enter age"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                style={styles.formInput}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nationality</Text>
              <TextInput
                placeholder="Enter nationality"
                value={nationality}
                onChangeText={setNationality}
                style={styles.formInput}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Gender</Text>
              <View style={styles.radioGroup}>
                {["male", "female", "other"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.radioButton, gender === g && styles.radioButtonSelected]}
                    onPress={() => setGender(g as "male" | "female" | "other")}
                  >
                    <Text style={gender === g ? styles.radioButtonTextSelected : styles.radioButtonText}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={addTraveller}
              style={[
                styles.submitButton,
                (!name.trim() || !age.trim() || !nationality.trim()) && styles.disabledSubmitButton,
              ]}
              disabled={!name.trim() || !age.trim() || !nationality.trim()}
            >
              <Text style={styles.submitButtonText}>Add Traveller</Text>
            </TouchableOpacity>
          </View>
        </Modalize>
      
    </SafeAreaView>
  )
}

export default AddTraveller

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#555",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "orange",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "orange",
    borderRadius: 4,
  },
  limitsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  limitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  limitText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#555",
  },
  limitCount: {
    fontWeight: "600",
    color: "#333",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },
  travellerList: {
    paddingTop: 8,
  },
  travellerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  travellerCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  travellerTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  travellerTypeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  removeButton: {
    padding: 4,
  },
  travellerName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  travellerDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "column",
    gap: 12,
  },
  addTravellerButton: {
    // backgroundColor: "#",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "orange",
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  addTravellerButtonText: {
    color: "orange",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: "orange",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledSaveButton: {
    backgroundColor: "#f6c39f",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 8,
  },
  bottomSheetBackground: {
    backgroundColor: "#fff",
  },
  bottomSheetIndicator: {
    backgroundColor: "#ddd",
    width: 40,
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 14,
    color: "#555",
  },
  selectedType: {
    backgroundColor: "orange",
    borderColor: "orange",
  },
  selectedTypeText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabledType: {
    backgroundColor: "#f5f5f5",
    borderColor: "#eee",
  },
  disabledTypeText: {
    color: "#aaa",
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#555",
  },
  formInput: {
    backgroundColor: "#f5f7fa",
    borderWidth: 1,
    borderColor: "#e0e4e8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e4e8",
    alignItems: "center",
  },
  radioButtonSelected: {
    backgroundColor: "orange",
    borderColor: "orange",
  },
  radioButtonText: {
    color: "#555",
  },
  radioButtonTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "orange",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  disabledSubmitButton: {
    backgroundColor: "#f6c39f",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  modalizeContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalizeHandle: {
    backgroundColor: "#ddd",
    width: 40,
    height: 5,
  },
  modalizeHeader: {
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
})
