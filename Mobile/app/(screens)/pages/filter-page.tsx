import { useEffect } from "react";
import {
  Platform,
  ScrollView,
  View,
  Text,
  Switch,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

// import Slider from "@react-native-community/slider";
import { useNavigation } from "expo-router";

import useStore from "@/store/filter-store";
import { TextInput } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

type CountType = "BEDROOMS" | "BATHROOM" | "BEDS";

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
    setModalVisible,
  } = useStore();

  const navigation = useNavigation();

  const getAppliedFiltersCount = () => {
    let count = 0;

    if (bedrooms !== 0) count++;
    if (beds !== 0) count++;
    if (bathroom !== 0) count++;

    if (allowCooking) count++;
    if (allowParty) count++;
    if (allowPets) count++;
    if (isEnabled) count++;

    if (minPrice !== 10) count++;
    if (maxPrice !== 5000) count++;

  
    return count;
  };

  useEffect(() => {
    if (isFilterChanged) {
      setModalVisible(true);
    }
  }, [
    isEnabled,
    allowCooking,
    allowParty,
    allowPets,
    minPrice,
    maxPrice,
    bedrooms,
    beds,
    bathroom,
  ]);

  const appliedCount = getAppliedFiltersCount();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Filters</Text>
          {appliedCount > 0 ? (
            <View style={styles.appliedPill}>
              <Text style={styles.appliedPillText}>{appliedCount} applied</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={clearFilters}
          style={styles.headerTextBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.headerTextBtnLabel}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: modalVisible ? 110 : 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.rowGrow}>
              <Text style={styles.cardTitle}>Trip type</Text>
              <Text style={styles.cardSubtitle}>
                Toggle for long‑term stays and monthly discounts
              </Text>
            </View>
            <Switch
              trackColor={{
                false: COLORS.switchTrackOff,
                true: COLORS.switchTrackOn,
              }}
              thumbColor={COLORS.switchThumb}
              ios_backgroundColor={COLORS.switchTrackOff}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Price range</Text>
            <Text style={styles.sectionHint}>per night · €</Text>
          </View>

          <View style={styles.priceInputsRow}>
            <View style={styles.priceInputGroup}>
              <Text style={styles.inputLabel}>Min</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputPrefix}>€</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={COLORS.muted}
                  value={minPrice.toString()}
                  onChangeText={(text) => updateMinPrice(text)}
                />
              </View>
            </View>

            <View style={styles.priceDivider} />

            <View style={styles.priceInputGroup}>
              <Text style={styles.inputLabel}>Max</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputPrefix}>€</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="5000"
                  placeholderTextColor={COLORS.muted}
                  value={maxPrice.toString()}
                  onChangeText={(text) => updateMaxPrice(text)}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rooms & beds</Text>
          <Text style={styles.cardSubtitle}>
            Choose the minimum you need
          </Text>

          <View style={styles.divider} />

          {(
            [
              { key: "BEDS", label: "Beds", value: beds },
              { key: "BEDROOMS", label: "Bedrooms", value: bedrooms },
              { key: "BATHROOM", label: "Bathrooms", value: bathroom },
            ] as const
          ).map((item) => (
            <View key={item.key} style={styles.counterRow}>
              <Text style={styles.counterLabel}>{item.label}</Text>

              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[
                    styles.counterBtn,
                    item.value <= 0 && styles.counterBtnDisabled,
                  ]}
                  onPress={() => handleCount(item.key as CountType, "DECREMENT")}
                  activeOpacity={0.7}
                  disabled={item.value <= 0}
                >
                  <Ionicons name="remove" size={18} color={COLORS.text} />
                </TouchableOpacity>

                <View style={styles.counterValuePill}>
                  <Text style={styles.counterValueText}>{item.value}</Text>
                </View>

                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => handleCount(item.key as CountType, "INCREMENT")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>House rules</Text>
          <Text style={styles.cardSubtitle}>
            Only show places that match your preferences
          </Text>

          <View style={styles.divider} />

          <View style={styles.chipsRow}>
            <TouchableOpacity
              onPress={handleAllowCooking}
              activeOpacity={0.8}
              style={[styles.chip, allowCooking && styles.chipActive]}
            >
              <View style={styles.chipIconWrap}>
                <Image
                  style={styles.chipIcon}
                  source={require("@/assets/images/cooking.png")}
                />
              </View>
              <Text style={[styles.chipLabel, allowCooking && styles.chipLabelActive]}>
                Cooking
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAllowParty}
              activeOpacity={0.8}
              style={[styles.chip, allowParty && styles.chipActive]}
            >
              <View style={styles.chipIconWrap}>
                <Image
                  style={styles.chipIcon}
                  source={require("@/assets/images/confetti.png")}
                />
              </View>
              <Text style={[styles.chipLabel, allowParty && styles.chipLabelActive]}>
                Party
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAllowPets}
              activeOpacity={0.8}
              style={[styles.chip, allowPets && styles.chipActive]}
            >
              <View style={styles.chipIconWrap}>
                <Image
                  style={styles.chipIcon}
                  source={require("@/assets/images/pets.png")}
                />
              </View>
              <Text style={[styles.chipLabel, allowPets && styles.chipLabelActive]}>
                Pets
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {modalVisible ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomSecondaryBtn}
            onPress={clearFilters}
            activeOpacity={0.8}
          >
            <Text style={styles.bottomSecondaryText}>Clear</Text>
            {appliedCount > 0 ? (
              <View style={styles.bottomCountDot}>
                <Text style={styles.bottomCountDotText}>{appliedCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomPrimaryBtn}
            onPress={applyFilters}
            activeOpacity={0.85}
          >
            <Text style={styles.bottomPrimaryText}>Show results</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const COLORS = {
  bg: "#FFFFFF",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  shadow: "#000000",
  primary: "#F97316", // orange-500
  primarySoft: "#FFF7ED",
  switchTrackOn: "#FED7AA",
  switchTrackOff: "#E5E7EB",
  switchThumb: "#F97316",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  appliedPill: {
    backgroundColor: COLORS.primarySoft,
    borderColor: "#FFEDD5",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  appliedPillText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  headerTextBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  headerTextBtnLabel: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },

  card: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowGrow: {
    flex: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 10,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  priceInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 12,
  },
  priceInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 12,
    height: 48,
  },
  inputPrefix: {
    fontSize: 14,
    color: COLORS.muted,
    marginRight: 6,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  priceDivider: {
    width: 1,
    height: 38,
    backgroundColor: COLORS.border,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },

  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  counterLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
  },
  counterBtnDisabled: {
    opacity: 0.5,
  },
  counterValuePill: {
    minWidth: 44,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
  },
  counterValueText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  chipsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  chip: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 8,
  },
  chipActive: {
    borderColor: "#FDBA74",
    backgroundColor: COLORS.primarySoft,
  },
  chipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipIcon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  chipLabelActive: {
    color: COLORS.primary,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    gap: 10,
  },
  bottomSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 52,
    backgroundColor: "#FFFFFF",
  },
  bottomSecondaryText: {
    fontWeight: "800",
    color: COLORS.text,
  },
  bottomCountDot: {
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bottomCountDotText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  bottomPrimaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  bottomPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
