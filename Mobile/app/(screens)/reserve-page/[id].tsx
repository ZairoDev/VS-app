import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Pressable,
  Image,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { Modalize } from "react-native-modalize";
import { Calendar } from "react-native-calendars";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCouponStore } from "@/store/coupon-store";
import { useAuthStore } from "../../../store/auth-store";
import { useTravellerStore } from "@/store/traveller-store";
import { PropertyInterface, Traveller } from "../../../types";
import axios from "axios";

const { height, width } = Dimensions.get("window");

const BLOCKED_DATES: { [key: string]: boolean } = {
  "2025-04-14": true,
  "2025-04-15": true,
  "2025-04-20": true,
  "2025-04-21": true,
};

const ORANGE = "#ff7900";
const DIVIDER = "#f0f0f0";
const BG = "#F7F7F5";
const TEXT = "#18181B";
const MUTED = "#71717A";
const CARD = "#FFFFFF";
const BORDER = "#ECECEC";

function toDateOnlyString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonthsToDateString(dateString: string, months: number) {
  const base = new Date(`${dateString}T00:00:00`);
  return toDateOnlyString(new Date(base.getFullYear(), base.getMonth() + months, 1));
}

function diffInMonths(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
}

function formatMonthYear(date: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function buildMonthOptions(count = 12) {
  const now = new Date();
  const firstMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return Array.from({ length: count }, (_, index) => {
    const optionDate = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1);
    return {
      value: toDateOnlyString(optionDate),
      label: optionDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    };
  });
}

function isLongTerm(p?: PropertyInterface) {
  return (p?.rentalType ?? "").toLowerCase().includes("long");
}

function getUnitPrice(p?: PropertyInterface) {
  if (isLongTerm(p)) {
    const m = p?.basePriceLongTerm;
    return m && m > 0 ? m : p?.basePrice ?? 0;
  }
  return p?.basePrice ?? 0;
}

export default function ReservationScreen() {
  const { id } = useLocalSearchParams();
  const { travellers } = useTravellerStore();
  const { user } = useAuthStore();
  const modalizeRef = useRef<Modalize>(null);
  const guestModalizeRef = useRef<Modalize>(null);

  const [selectedDates, setSelectedDates] = useState({ startDate: "", endDate: "" });
  const [tempLongTermStart, setTempLongTermStart] = useState("");
  const [tempLongTermDuration, setTempLongTermDuration] = useState(6);
  const [property, setProperty] = useState<PropertyInterface>();
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0 });
  const [tempGuests, setTempGuests] = useState({ adults: 1, children: 0, infants: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { appliedCoupon, resetCoupon } = useCouponStore();
  const { clearTravellers } = useTravellerStore();

  useEffect(() => {
    async function load() {
      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_BASE_URL}/properties/getParticularProperty`,
          { propertyId: id }
        );
        setProperty(response.data.data);
      } catch {
        console.log("error in fetching particular property");
      }
    }
    load();
  }, []);

  const unitPrice = getUnitPrice(property);
  const longTerm = isLongTerm(property);
  const priceSuffix = longTerm ? "/month" : "/night";
  const monthOptions = useMemo(() => buildMonthOptions(12), []);
  const durationOptions = [6, 9, 12];

  const billDetails = useMemo(() => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      return {
        totalUnits: 0,
        basePrice: 0,
        discountedPrice: 0,
        platformFee: 0,
        total: 0,
        couponDiscount: 0,
        payableNow: 0,
      };
    }
    const totalUnits = longTerm
      ? diffInMonths(selectedDates.startDate, selectedDates.endDate)
      : Math.ceil(
        Math.abs(
          new Date(selectedDates.endDate).getTime() - new Date(selectedDates.startDate).getTime()
        ) / (1000 * 60 * 60 * 24)
      );
    const basePrice = totalUnits * unitPrice;
    let couponDiscount = 0;
    if (appliedCoupon) {
      couponDiscount = appliedCoupon.discountType === "percentage"
        ? (appliedCoupon.discountValue / 100) * basePrice
        : appliedCoupon.discountValue;
    }
    const platformFee = longTerm ? unitPrice : 75;
    const discountedPrice = Math.max(0, basePrice - couponDiscount);
    // Pricing is only a quotation; user pays platform fee only.
    const payableNow = platformFee;
    const total = payableNow;
    return { totalUnits, basePrice, discountedPrice, platformFee, total, couponDiscount, payableNow };
  }, [selectedDates.startDate, selectedDates.endDate, appliedCoupon, unitPrice, longTerm]);

  const calendarConfig = useMemo(() => {
    const today = new Date();
    const future = new Date();
    future.setMonth(future.getMonth() + 12);
    return { minDate: today.toISOString().split("T")[0], maxDate: future.toISOString().split("T")[0] };
  }, []);

  const handleGuestModalOpen = () => {
    setTempGuests({ ...guests });
    guestModalizeRef.current?.open();
  };

  const handleStaySelectorOpen = () => {
    if (longTerm) {
      setTempLongTermStart(selectedDates.startDate || monthOptions[0]?.value || "");
      setTempLongTermDuration(diffInMonths(selectedDates.startDate, selectedDates.endDate) || 6);
    }
    modalizeRef.current?.open();
  };

  const handleAddTraveller = () => {
    router.push({
      pathname: "/(screens)/pages/add-traveller",
      params: {
        id: id,
        adults: guests.adults.toString(),
        children: guests.children.toString(),
        infants: guests.infants.toString(),
        existingTravellers: JSON.stringify(travellers),
      },
    });
  };

  const handleConfirmGuests = () => {
    setGuests({ ...tempGuests });
    guestModalizeRef.current?.close();
  };

  const updateGuestCount = (type: "adults" | "children" | "infants", increment: boolean) => {
    setTempGuests((prev) => {
      const newCount = increment ? prev[type] + 1 : prev[type] - 1;
      if (newCount < 0) return prev;
      if (type === "adults" && newCount === 0) return prev;
      return { ...prev, [type]: newCount };
    });
  };

  const onDayPress = (day: any) => {
    if (BLOCKED_DATES[day.dateString]) return;
    if (day.dateString === selectedDates.startDate) { setSelectedDates({ startDate: "", endDate: "" }); return; }
    if (day.dateString === selectedDates.endDate) { setSelectedDates((p) => ({ ...p, endDate: "" })); return; }
    if (!selectedDates.startDate || (selectedDates.startDate && selectedDates.endDate)) {
      setSelectedDates({ startDate: day.dateString, endDate: "" });
    } else if (new Date(day.dateString) >= new Date(selectedDates.startDate)) {
      const start = new Date(selectedDates.startDate);
      const end = new Date(day.dateString);
      let blocked = false;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (BLOCKED_DATES[d.toISOString().split("T")[0]]) { blocked = true; break; }
      }
      if (!blocked) { setSelectedDates((p) => ({ ...p, endDate: day.dateString })); modalizeRef.current?.close(); }
    }
  };

  const handleConfirmLongTermStay = () => {
    if (!tempLongTermStart) return;
    if (tempLongTermDuration < 6) {
      Alert.alert("Minimum stay", "Long-term bookings must be at least 6 months.");
      return;
    }
    setSelectedDates({
      startDate: tempLongTermStart,
      endDate: addMonthsToDateString(tempLongTermStart, tempLongTermDuration),
    });
    modalizeRef.current?.close();
  };

  const getMarkedDates = useMemo(() => {
    const markedDates: any = {
      ...Object.keys(BLOCKED_DATES).reduce((acc, date) => ({
        ...acc,
        [date]: { disabled: true, disableTouchEvent: true, selectedColor: "#FF6B6B", selectedTextColor: "white" },
      }), {}),
    };
    if (selectedDates.startDate) markedDates[selectedDates.startDate] = { startingDay: true, color: ORANGE, textColor: "white" };
    if (selectedDates.endDate) {
      markedDates[selectedDates.endDate] = { endingDay: true, color: ORANGE, textColor: "white" };
      let cur = new Date(selectedDates.startDate);
      const endD = new Date(selectedDates.endDate);
      cur.setDate(cur.getDate() + 1);
      while (cur < endD) {
        const ds = cur.toISOString().split("T")[0];
        if (!BLOCKED_DATES[ds]) markedDates[ds] = { color: "#FFA53F", textColor: "white" };
        cur.setDate(cur.getDate() + 1);
      }
    }
    return markedDates;
  }, [selectedDates.startDate, selectedDates.endDate]);

  const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "";

  const getGuestSummary = () => {
    const parts: string[] = [];
    if (guests.adults) parts.push(`${guests.adults} adult${guests.adults !== 1 ? "s" : ""}`);
    if (guests.children) parts.push(`${guests.children} child${guests.children !== 1 ? "ren" : ""}`);
    if (guests.infants) parts.push(`${guests.infants} infant${guests.infants !== 1 ? "s" : ""}`);
    return parts.join(", ");
  };

  const travellerCount = (travellers ?? []).length;
  const datesSelected = !!(selectedDates.startDate && selectedDates.endDate);
  const selectionTitle = longTerm ? "Months" : "Dates";
  const selectionButtonText = longTerm ? "Select Months" : "Select Dates";
  const staySummary = longTerm
    ? (datesSelected
      ? `${formatMonthYear(selectedDates.startDate)} · ${billDetails.totalUnits} month${billDetails.totalUnits > 1 ? "s" : ""}`
      : "Select move-in month & duration")
    : (datesSelected
      ? `${formatDate(selectedDates.startDate)} → ${formatDate(selectedDates.endDate)}`
      : "Select check-in & check-out");

  const handleCheckout = async () => {
    if (isSubmitting) return;

    // --- Pre-submit validation ---
    if (!user?._id) {
      Alert.alert(
        "Login required",
        "Please log in to complete your booking.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log in", onPress: () => router.push("/(tabs)/Menu") },
        ]
      );
      return;
    }

    if (!property?._id || !property?.userId) {
      Alert.alert("Please wait", "Property details are still loading. Try again in a moment.");
      return;
    }

    if (!selectedDates.startDate || !selectedDates.endDate) {
      Alert.alert("Select dates", "Please choose your stay dates first.");
      return;
    }

    if (guests.adults < 1) {
      Alert.alert("Add guests", "At least one adult guest is required.");
      return;
    }

    if (billDetails.payableNow <= 0) {
      Alert.alert(
        "Invalid amount",
        "We couldn't calculate the payable amount. Please re-select your dates."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/traveller-booking/create-booking/`,
        {
          propertyId: property._id,
          userId: property.userId,
          travellerId: user._id,
          startDate: selectedDates.startDate,
          endDate: selectedDates.endDate,
          guests,
          travellers,
          price: billDetails.payableNow,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Booking created:", response.data?._id ?? response.data);

      // Reset cart-like state so it doesn't leak into the next reservation.
      resetCoupon();
      clearTravellers();
      setSelectedDates({ startDate: "", endDate: "" });

      Alert.alert(
        "Booking created",
        "Your booking request has been sent. You can track it under My Bookings.",
        [
          {
            text: "View bookings",
            onPress: () => router.replace("/(tabs)/Booking"),
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error("Booking error:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });

      const status = error?.response?.status;
      const backendMsg: string | undefined =
        error?.response?.data?.message || error?.response?.data?.error;

      // Surface the real cause so the user knows what to do.
      if (status === 409) {
        Alert.alert(
          "Dates unavailable",
          backendMsg ?? "These dates are already booked for this property. Please choose different dates."
        );
      } else if (status === 400) {
        Alert.alert(
          "Can't create booking",
          backendMsg ?? "Some booking details are missing or invalid."
        );
      } else if (error?.message === "Network Error") {
        Alert.alert(
          "Network error",
          "Couldn't reach the server. Check your internet connection and try again."
        );
      } else {
        Alert.alert(
          "Something went wrong",
          backendMsg ?? "We couldn't create your booking. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const GuestTypeSelector = ({
    type, title, subtitle, value,
  }: { type: "adults" | "children" | "infants"; title: string; subtitle: string; value: number }) => (
    <View style={styles.guestTypeContainer}>
      <View style={styles.guestTypeInfo}>
        <Text style={styles.guestTypeTitle}>{title}</Text>
        <Text style={styles.guestTypeSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.guestTypeControls}>
        <TouchableOpacity
          style={[styles.guestTypeButton, value === (type === "adults" ? 1 : 0) && styles.guestTypeButtonDisabled]}
          onPress={() => updateGuestCount(type, false)}
          disabled={type === "adults" ? value <= 1 : value <= 0}
        >
          <Ionicons name="remove" size={20} color={value === (type === "adults" ? 1 : 0) ? "#A1A1AA" : ORANGE} />
        </TouchableOpacity>
        <Text style={styles.guestTypeValue}>{value}</Text>
        <TouchableOpacity style={styles.guestTypeButton} onPress={() => updateGuestCount(type, true)}>
          <Ionicons name="add" size={20} color={ORANGE} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const steps = [
    {
      icon: "calendar-outline" as const,
      label: longTerm ? "Select months" : "Select dates",
      sub: longTerm ? "Choose move-in month and duration" : "Choose check-in & check-out",
      done: datesSelected,
    },
    {
      icon: "people-outline" as const,
      label: "Add guests",
      sub: `${getGuestSummary()} selected`,
      done: guests.adults > 0,
    },
    {
      icon: "person-outline" as const,
      label: "Traveller details",
      sub: travellerCount > 0 ? `${travellerCount} traveller${travellerCount > 1 ? "s" : ""} added` : "Passport/ID info needed",
      done: travellerCount > 0,
    },
    {
      icon: "pricetag-outline" as const,
      label: "Apply coupon",
      sub: appliedCoupon ? `${appliedCoupon.code} applied` : "Optional discount",
      done: !!appliedCoupon,
    },
  ];

  const bookingHighlights = [
    {
      icon: "shield-checkmark-outline" as const,
      title: "Secure reservation",
      text: "Your request is shared safely with the host.",
    },
    {
      icon: "flash-outline" as const,
      title: "Fast confirmation",
      text: "Complete the steps to send your booking request.",
    },
    {
      icon: "receipt-outline" as const,
      title: "Clear pricing",
      text: `See the full ${longTerm ? "monthly" : "nightly"} cost before checkout.`,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reserve</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Property hero card */}
        <View style={styles.heroCard}>
          <Image
            style={styles.heroImage}
            resizeMode="cover"
            source={{ uri: property?.propertyCoverFileUrl }}
          />
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {longTerm ? "Long-term stay" : "Short-term stay"}
              </Text>
            </View>
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.heroInfoLeft}>
              <Text style={styles.heroVsid} numberOfLines={1}>VSID · {property?.VSID}</Text>
              <Text style={styles.heroName} numberOfLines={2}>{property?.propertyName || property?.placeName}</Text>
              <View style={styles.heroMeta}>
                {property?.beds ? (
                  <View style={styles.heroMetaChip}>
                    <Ionicons name="bed-outline" size={13} color="#6b7280" />
                    <Text style={styles.heroMetaText}>{property.beds} beds</Text>
                  </View>
                ) : null}
                {property?.bathroom ? (
                  <View style={styles.heroMetaChip}>
                    <Ionicons name="water-outline" size={13} color="#6b7280" />
                    <Text style={styles.heroMetaText}>{property.bathroom} bath</Text>
                  </View>
                ) : null}
                {property?.guests ? (
                  <View style={styles.heroMetaChip}>
                    <Ionicons name="person-outline" size={13} color="#6b7280" />
                    <Text style={styles.heroMetaText}>{property.guests} guests</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={styles.heroPriceBlock}>
              <Text style={styles.heroPriceValue}>€{unitPrice}</Text>
              <Text style={styles.heroPriceSuffix}>{priceSuffix}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionIntro}>
          <Text style={styles.sectionEyebrow}>BOOKING FLOW</Text>
          <Text style={styles.sectionHeading}>Plan your stay</Text>
          <Text style={styles.sectionDescription}>
            {longTerm
              ? "Choose a move-in month, set the number of months, add guests, then review the final amount before checkout."
              : "Select dates, confirm guests, add traveller details, then review the final amount before checkout."}
          </Text>
        </View>

        {/* Selector card */}
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <Text style={styles.selectorHeaderTitle}>Trip details</Text>
            <Text style={styles.selectorHeaderMeta}>
              {datesSelected ? `${billDetails.totalUnits} ${longTerm ? "month" : "night"}${billDetails.totalUnits > 1 ? "s" : ""}` : "3 steps left"}
            </Text>
          </View>
          {/* Dates row */}
          <TouchableOpacity
            style={styles.selectorRow}
            onPress={handleStaySelectorOpen}
            activeOpacity={0.7}
          >
            <View style={styles.selectorIcon}>
              <Ionicons name="calendar-outline" size={20} color={datesSelected ? ORANGE : "#6b7280"} />
            </View>
            <View style={styles.selectorBody}>
              <Text style={styles.selectorLabel}>{selectionTitle}</Text>
              <Text style={[styles.selectorValue, !datesSelected && styles.selectorPlaceholder]}>
                {staySummary}
              </Text>
              {!datesSelected ? (
                <Text style={styles.selectorSubtext}>
                  {longTerm
                    ? "Choose the starting month and booking duration."
                    : "Choose the stay window to unlock checkout."}
                </Text>
              ) : longTerm ? (
                <Text style={styles.selectorSubtext}>
                  Ends {formatMonthYear(selectedDates.endDate)}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.selectorDivider} />

          {/* Guests row */}
          <TouchableOpacity style={styles.selectorRow} onPress={handleGuestModalOpen} activeOpacity={0.7}>
            <View style={styles.selectorIcon}>
              <Ionicons name="people-outline" size={20} color="#6b7280" />
            </View>
            <View style={styles.selectorBody}>
              <Text style={styles.selectorLabel}>Guests</Text>
              <Text style={styles.selectorValue}>{getGuestSummary()}</Text>
              <Text style={styles.selectorSubtext}>
                {longTerm ? "Set who will stay during the selected months." : "Add adults, children, and infants."}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.selectorDivider} />

          {/* Travellers row */}
          <TouchableOpacity style={styles.selectorRow} onPress={handleAddTraveller} activeOpacity={0.7}>
            <View style={styles.selectorIcon}>
              <FontAwesome name="address-card-o" size={18} color={travellerCount > 0 ? ORANGE : "#6b7280"} />
            </View>
            <View style={styles.selectorBody}>
              <Text style={styles.selectorLabel}>Traveller details</Text>
              <Text style={[styles.selectorValue, travellerCount === 0 && styles.selectorPlaceholder]}>
                {travellerCount > 0 ? `${travellerCount} traveller${travellerCount > 1 ? "s" : ""} added` : "Add passport / ID info"}
              </Text>
              <Text style={styles.selectorSubtext}>Required for booking confirmation.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Coupon row — always visible */}
        <Pressable
          onPress={() => router.push("/(screens)/pages/apply-coupon")}
          style={styles.couponRow}
        >
          <MaterialIcons name="discount" size={20} color={appliedCoupon ? "#16a34a" : ORANGE} />
          <Text style={[styles.couponText, appliedCoupon && styles.couponApplied]}>
            {appliedCoupon ? `Coupon "${appliedCoupon.code}" applied` : "Apply a coupon code"}
          </Text>
          <Text style={styles.couponHint}>{appliedCoupon ? "Discount added to total" : "Optional"}</Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>

        {/* Bill breakdown (only once dates selected) */}
        {datesSelected ? (
          <View style={styles.billCard}>
            <Text style={styles.billTitle}>Quotation</Text>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                {longTerm
                  ? `Monthly rent`
                  : `€${unitPrice} × ${billDetails.totalUnits} night(s)`}
              </Text>
              <Text style={styles.billAmount}>
                {longTerm ? `€${unitPrice.toFixed(2)}/month` : `€${billDetails.basePrice.toFixed(2)}`}
              </Text>
            </View>

            {longTerm ? (
              <>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Move-in month</Text>
                <Text style={styles.billAmount}>{formatMonthYear(selectedDates.startDate)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Duration</Text>
                <Text style={styles.billAmount}>
                  {billDetails.totalUnits} month{billDetails.totalUnits > 1 ? "s" : ""}
                </Text>
              </View>
              </>
            ) : null}

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Platform fee{longTerm ? " (1 month rent)" : ""}</Text>
              <Text style={styles.billAmount}>€{billDetails.platformFee.toFixed(2)}</Text>
            </View>

            {appliedCoupon ? (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: "#16a34a" }]}>Coupon discount</Text>
                <Text style={[styles.billAmount, { color: "#16a34a" }]}>
                  -€{billDetails.couponDiscount.toFixed(2)}
                </Text>
              </View>
            ) : null}

            <View style={styles.billDivider} />

            <View style={styles.billRow}>
              <Text style={styles.billTotalLabel}>Payable now</Text>
              <Text style={styles.billTotalAmount}>€{billDetails.payableNow.toFixed(2)}</Text>
            </View>
          </View>
        ) : (
          /* Steps guide — fills the space when nothing is selected */
          <View style={styles.stepsCard}>
            <View style={styles.stepsHeader}>
              <View>
                <Text style={styles.stepsTitle}>Finish your booking</Text>
                <Text style={styles.stepsSubtitle}>A quick guide to get this reservation ready.</Text>
              </View>
              <View style={styles.stepsPill}>
                <Text style={styles.stepsPillText}>
                  {steps.filter((s) => s.done).length}/{steps.length}
                </Text>
              </View>
            </View>
            {steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepIconWrap, step.done && styles.stepIconDone]}>
                  {step.done
                    ? <Ionicons name="checkmark" size={16} color="#ffffff" />
                    : <Ionicons name={step.icon} size={16} color={ORANGE} />}
                </View>
                <View style={styles.stepText}>
                  <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>{step.label}</Text>
                  <Text style={styles.stepSub}>{step.sub}</Text>
                </View>
                <View style={[styles.stepStatus, step.done && styles.stepStatusDone]}>
                  <Text style={[styles.stepStatusText, step.done && styles.stepStatusTextDone]}>
                    {step.done ? "Done" : "Pending"}
                  </Text>
                </View>
                {i < steps.length - 1 && <View style={styles.stepConnector} />}
              </View>
            ))}
          </View>
        )}

        <View style={styles.highlightsCard}>
          <Text style={styles.highlightsTitle}>Why book here</Text>
          {bookingHighlights.map((item, index) => (
            <View key={item.title} style={[styles.highlightRow, index === bookingHighlights.length - 1 && styles.highlightRowLast]}>
              <View style={styles.highlightIconWrap}>
                <Ionicons name={item.icon} size={18} color={ORANGE} />
              </View>
              <View style={styles.highlightTextWrap}>
                <Text style={styles.highlightTitle}>{item.title}</Text>
                <Text style={styles.highlightText}>{item.text}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Cancellation policy notice */}
        <View style={styles.policyRow}>
          <Ionicons name="information-circle-outline" size={16} color="#9ca3af" />
          <Text style={styles.policyText}>
            Free cancellation within 24 hrs · 70% refund up to 7 days before check-in
          </Text>
        </View>
      </ScrollView>

      {/* Sticky checkout bar */}
      <View style={styles.footer}>
        {datesSelected ? (
          <View style={styles.footerLeft}>
            <Text style={styles.footerTotal}>
              €{billDetails.payableNow.toFixed(2)}
            </Text>
            <Text style={styles.footerTotalSub}>
              platform fee only
            </Text>
          </View>
        ) : (
          <View style={styles.footerLeft}>
            <Text style={styles.footerTotal}>€{unitPrice}</Text>
            <Text style={styles.footerTotalSub}>{priceSuffix}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.checkoutBtn,
            !datesSelected && styles.checkoutBtnMuted,
            isSubmitting && styles.checkoutBtnDisabled,
          ]}
          onPress={datesSelected ? handleCheckout : handleStaySelectorOpen}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          <Text style={styles.checkoutBtnText}>
            {isSubmitting
              ? "Creating booking…"
              : datesSelected
                ? "Proceed to Checkout"
                : selectionButtonText}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar bottom sheet */}
      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        modalStyle={styles.modalStyle}
        scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEventThrottle: 16 }}
      >
        {longTerm ? (
          <View style={styles.longTermContainer}>
            <Text style={styles.modalTitle}>Select months</Text>
            <Text style={styles.longTermSubtitle}>
              Long-term properties are booked by month, so choose your move-in month and stay duration.
            </Text>

            <Text style={styles.modalSectionTitle}>Move-in month</Text>
            <View style={styles.monthGrid}>
              {monthOptions.map((option) => {
                const active = tempLongTermStart === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.monthChip, active && styles.monthChipActive]}
                    onPress={() => setTempLongTermStart(option.value)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.monthChipText, active && styles.monthChipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.modalSectionTitle}>Duration</Text>
            <View style={styles.durationRow}>
              {durationOptions.map((months) => {
                const active = tempLongTermDuration === months;
                return (
                  <TouchableOpacity
                    key={months}
                    style={[styles.durationChip, active && styles.durationChipActive]}
                    onPress={() => setTempLongTermDuration(months)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.durationChipText, active && styles.durationChipTextActive]}>
                      {months} month{months > 1 ? "s" : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {tempLongTermStart ? (
              <View style={styles.longTermPreview}>
                <Text style={styles.longTermPreviewLabel}>Booking summary</Text>
                <Text style={styles.longTermPreviewValue}>
                  Starting {formatMonthYear(tempLongTermStart)} for {tempLongTermDuration} month{tempLongTermDuration > 1 ? "s" : ""}
                </Text>
                <Text style={styles.longTermPreviewSub}>
                  Monthly rent: €{unitPrice.toFixed(2)} · Estimated subtotal: €{(unitPrice * tempLongTermDuration).toFixed(2)}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLongTermStay}>
              <Text style={styles.confirmButtonText}>Confirm months</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.calendarContainer}>
            <Text style={styles.modalTitle}>Select Dates</Text>
            <Calendar
              markingType="period"
              markedDates={getMarkedDates}
              onDayPress={onDayPress}
              minDate={calendarConfig.minDate}
              maxDate={calendarConfig.maxDate}
              enableSwipeMonths
              scrollEnabled
              pastSwipeRange={0}
              futureSwipeRange={12}
              theme={{
                selectedDayTextColor: "#ffffff",
                textDayFontSize: 16,
                textMonthFontSize: 18,
                arrowColor: ORANGE,
                textDayHeaderFontSize: 14,
                // @ts-ignore
                "stylesheet.calendar.main": {
                  week: { marginTop: 4, marginBottom: 4, flexDirection: "row", justifyContent: "space-around" },
                },
              }}
            />
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: ORANGE }]} />
                <Text style={styles.legendText}>Selected</Text>
              </View>
            </View>
            <Text style={styles.helperText}>
              {!selectedDates.startDate
                ? "Select your check-in date"
                : !selectedDates.endDate
                  ? "Now select your check-out date"
                  : "Tap a selected date to unselect it"}
            </Text>
          </View>
        )}
      </Modalize>

      {/* Guest picker bottom sheet */}
      <Modalize ref={guestModalizeRef} adjustToContentHeight modalStyle={styles.modalStyle}>
        <View style={styles.guestContainer}>
          <Text style={styles.modalTitle}>Who's coming?</Text>
          <GuestTypeSelector type="adults" title="Adults" subtitle="Age 13+" value={tempGuests.adults} />
          <GuestTypeSelector type="children" title="Children" subtitle="Ages 2–12" value={tempGuests.children} />
          <GuestTypeSelector type="infants" title="Infants" subtitle="Under 2" value={tempGuests.infants} />
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmGuests}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </Modalize>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CARD,
    borderBottomWidth: 0,
  },
  headerBack: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#F4F4F5" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: TEXT },

  scrollContent: { padding: 16, paddingBottom: 110, gap: 10 },

  /* Hero property card */
  heroCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 0,
  },
  heroImage: { width: "100%", height: 176 },
  heroTopRow: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT,
  },
  heroInfo: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  heroInfoLeft: { flex: 1 },
  heroVsid: { fontSize: 11, color: "#9ca3af", fontWeight: "600", marginBottom: 4 },
  heroName: { fontSize: 17, fontWeight: "700", color: TEXT, lineHeight: 23, marginBottom: 10 },
  heroMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  heroMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  heroMetaText: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  heroPriceBlock: {
    alignItems: "flex-end",
    paddingHorizontal: 0,
    paddingVertical: 0,
    minWidth: 86,
  },
  heroPriceValue: { fontSize: 20, fontWeight: "800", color: TEXT },
  heroPriceSuffix: { fontSize: 12, color: "#A16207", fontWeight: "700", marginTop: 2 },

  sectionIntro: {
    paddingHorizontal: 2,
    marginTop: 2,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A1A1AA",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT,
  },
  sectionDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },

  /* Selector card */
  selectorCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 0,
    overflow: "hidden",
  },
  selectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  selectorHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
  },
  selectorHeaderMeta: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "600",
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  selectorIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
  },
  selectorBody: { flex: 1 },
  selectorLabel: { fontSize: 12, fontWeight: "600", color: "#9ca3af", marginBottom: 3 },
  selectorValue: { fontSize: 15, fontWeight: "600", color: TEXT },
  selectorPlaceholder: { color: "#9ca3af", fontWeight: "500" },
  selectorSubtext: { marginTop: 2, fontSize: 12, color: MUTED },
  selectorDivider: { height: 1, backgroundColor: "#F6F6F6", marginLeft: 74 },

  /* Coupon row */
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  couponText: { flex: 1, fontSize: 15, color: TEXT, fontWeight: "600" },
  couponApplied: { color: "#16a34a" },
  couponHint: { fontSize: 12, color: MUTED, fontWeight: "600" },

  /* Bill card */
  billCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 0,
    padding: 16,
    gap: 12,
  },
  billTitle: { fontSize: 16, fontWeight: "700", color: TEXT },
  billRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  billLabel: { fontSize: 15, color: "#6b7280", fontWeight: "500" },
  billAmount: { fontSize: 15, color: TEXT, fontWeight: "600" },
  billDivider: { height: 1, backgroundColor: DIVIDER },
  billTotalLabel: { fontSize: 17, fontWeight: "700", color: TEXT },
  billTotalAmount: { fontSize: 17, fontWeight: "800", color: TEXT },

  /* Steps guide */
  stepsCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 0,
    padding: 16,
  },
  stepsHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  stepsTitle: { fontSize: 16, fontWeight: "700", color: TEXT },
  stepsSubtitle: { marginTop: 4, fontSize: 13, lineHeight: 18, color: MUTED },
  stepsPill: {
    backgroundColor: "#F4F4F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  stepsPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: MUTED,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 20, position: "relative" },
  stepIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
  },
  stepIconDone: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  stepText: { flex: 1, paddingTop: 2 },
  stepLabel: { fontSize: 14, fontWeight: "700", color: TEXT },
  stepLabelDone: { color: "#16a34a" },
  stepSub: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  stepStatus: {
    paddingHorizontal: 0,
    paddingVertical: 2,
    marginTop: 2,
  },
  stepStatusDone: {
    backgroundColor: "transparent",
  },
  stepStatusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#71717A",
  },
  stepStatusTextDone: {
    color: "#16a34a",
  },
  stepConnector: {
    position: "absolute",
    left: 17,
    top: 40,
    width: 1,
    height: 16,
    backgroundColor: "#E5E7EB",
  },

  highlightsCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 0,
    padding: 16,
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 10,
  },
  highlightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  highlightRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  highlightIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
  },
  highlightTextWrap: { flex: 1 },
  highlightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
  },
  highlightText: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },

  /* Policy */
  policyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 4,
  },
  policyText: { flex: 1, fontSize: 12, color: "#9ca3af", lineHeight: 18 },

  /* Sticky footer */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: "#F3F3F3",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
    elevation: 3,
  },
  footerLeft: { flex: 1 },
  footerTotal: { fontSize: 20, fontWeight: "800", color: TEXT },
  footerTotalSub: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  checkoutBtn: {
    flex: 1,
    backgroundColor: ORANGE,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  checkoutBtnMuted: { backgroundColor: "#F97316" },
  checkoutBtnDisabled: { opacity: 0.6 },
  checkoutBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "800" },

  /* Modal shared */
  modalStyle: { padding: 20, backgroundColor: CARD },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: TEXT },

  calendarContainer: { paddingBottom: 24 },
  longTermContainer: { paddingBottom: 24 },
  longTermSubtitle: {
    marginTop: -6,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 10,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  monthChip: {
    width: "48%",
    backgroundColor: "#F7F7F7",
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  monthChipActive: {
    backgroundColor: "#FBEBDD",
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT,
  },
  monthChipTextActive: {
    color: "#C2410C",
  },
  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  durationChip: {
    backgroundColor: "#F7F7F7",
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  durationChipActive: {
    backgroundColor: "#FBEBDD",
  },
  durationChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT,
  },
  durationChipTextActive: {
    color: "#C2410C",
  },
  longTermPreview: {
    marginTop: 18,
    backgroundColor: "#FAFAFA",
    borderWidth: 0,
    borderRadius: 14,
    padding: 14,
  },
  longTermPreviewLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#A1A1AA",
    marginBottom: 4,
    letterSpacing: 0.4,
  },
  longTermPreviewValue: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
    lineHeight: 21,
  },
  longTermPreviewSub: {
    marginTop: 4,
    fontSize: 13,
    color: MUTED,
  },
  helperText: { fontSize: 14, color: "#6b7280", textAlign: "center", marginTop: 16 },
  legend: { flexDirection: "row", justifyContent: "center", marginTop: 16, paddingHorizontal: 20 },
  legendItem: { flexDirection: "row", alignItems: "center", marginHorizontal: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 14, color: "#6b7280" },

  guestContainer: { paddingBottom: 24 },
  guestTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  guestTypeInfo: { flex: 1 },
  guestTypeTitle: { fontSize: 16, fontWeight: "600", color: TEXT },
  guestTypeSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  guestTypeControls: { flexDirection: "row", alignItems: "center" },
  guestTypeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  guestTypeButtonDisabled: { opacity: 0.5 },
  guestTypeValue: { fontSize: 18, fontWeight: "600", marginHorizontal: 16, minWidth: 24, textAlign: "center" },
  confirmButton: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginHorizontal: 16,
  },
  confirmButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
