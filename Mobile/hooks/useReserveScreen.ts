import { useRef, useState, useMemo, useEffect } from "react";
import { Animated, Alert } from "react-native";
import { router } from "expo-router";
import axios from "axios";
import { Modalize } from "react-native-modalize";
import { useCouponStore } from "@/store/coupon-store";
import { useAuthStore } from "@/store/auth-store";
import { useTravellerStore } from "@/store/traveller-store";
import { PropertyInterface } from "@/types";
import { booking } from "@/Constants/booking-theme";
import { getPropertyImages } from "@/utils/property-display";
import {
  addMonthsToDateString,
  buildBlockedDatesMap,
  buildMonthOptions,
  buildReserveCtaLabel,
  buildStaySummary,
  buildTripMeta,
  computeBillDetails,
  diffInMonths,
  formatGuestSummary,
  getUnitPrice,
  isLongTerm,
  type GuestCounts,
} from "@/utils/reserve";

const { colors: c } = booking;
const DURATION_OPTIONS = [6, 9, 12];

export function useReserveScreen(propertyId: string | string[] | undefined) {
  const id = propertyId;
  const { travellers } = useTravellerStore();
  const { setLimits } = useTravellerStore();
  const { user } = useAuthStore();
  const modalizeRef = useRef<Modalize>(null);
  const guestModalizeRef = useRef<Modalize>(null);
  const travellerModalizeRef = useRef<Modalize>(null);
  const couponModalizeRef = useRef<Modalize>(null);

  const [selectedDates, setSelectedDates] = useState({ startDate: "", endDate: "" });
  const [tempLongTermStart, setTempLongTermStart] = useState("");
  const [tempLongTermDuration, setTempLongTermDuration] = useState(6);
  const [property, setProperty] = useState<PropertyInterface>();
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [propertyError, setPropertyError] = useState<string | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [guests, setGuests] = useState<GuestCounts>({ adults: 1, children: 0, infants: 0 });
  const [tempGuests, setTempGuests] = useState<GuestCounts>({ adults: 1, children: 0, infants: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quotationExpanded, setQuotationExpanded] = useState(false);

  const blockedDates = useMemo(() => buildBlockedDatesMap(property), [property]);
  const { appliedCoupon, resetCoupon } = useCouponStore();
  const { clearTravellers } = useTravellerStore();

  useEffect(() => {
    setQuotationExpanded(false);
  }, [selectedDates.startDate, selectedDates.endDate]);

  const reloadProperty = async () => {
    setPropertyLoading(true);
    setPropertyError(null);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/properties/getParticularProperty`,
        { propertyId: id },
      );
      setProperty(response.data.data);
    } catch {
      setProperty(undefined);
      setPropertyError("We couldn't load this property. Please try again.");
    } finally {
      setPropertyLoading(false);
    }
  };

  useEffect(() => {
    reloadProperty();
  }, []);

  const unitPrice = getUnitPrice(property);
  const longTerm = isLongTerm(property);
  const priceSuffix = longTerm ? "/month" : "/night";
  const propertyRecapImage = useMemo(
    () => (property ? getPropertyImages(property)[0] : undefined),
    [property],
  );
  const monthOptions = useMemo(() => buildMonthOptions(12), []);

  const billDetails = useMemo(
    () => computeBillDetails(selectedDates, unitPrice, longTerm, appliedCoupon),
    [selectedDates, appliedCoupon, unitPrice, longTerm],
  );

  const payableAnim = useRef(new Animated.Value(0)).current;
  const [payableAnimatedValue, setPayableAnimatedValue] = useState(0);

  useEffect(() => {
    const listenerId = payableAnim.addListener(({ value }) => setPayableAnimatedValue(value));
    return () => payableAnim.removeListener(listenerId);
  }, [payableAnim]);

  useEffect(() => {
    const next = Number(billDetails.payableNow) || 0;
    Animated.timing(payableAnim, {
      toValue: next,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [billDetails.payableNow, payableAnim]);

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
    setLimits(guests.adults, guests.children, guests.infants, String(id ?? ""));
    travellerModalizeRef.current?.open();
  };

  const handleConfirmGuests = () => {
    setGuests({ ...tempGuests });
    guestModalizeRef.current?.close();
  };

  const updateGuestCount = (type: keyof GuestCounts, increment: boolean) => {
    setTempGuests((prev) => {
      const newCount = increment ? prev[type] + 1 : prev[type] - 1;
      if (newCount < 0) return prev;
      if (type === "adults" && newCount === 0) return prev;
      return { ...prev, [type]: newCount };
    });
  };

  const onDayPress = (day: { dateString: string }) => {
    if (blockedDates[day.dateString]) return;
    if (day.dateString === selectedDates.startDate) {
      setSelectedDates({ startDate: "", endDate: "" });
      return;
    }
    if (day.dateString === selectedDates.endDate) {
      setSelectedDates((prev) => ({ ...prev, endDate: "" }));
      return;
    }
    if (!selectedDates.startDate || (selectedDates.startDate && selectedDates.endDate)) {
      setSelectedDates({ startDate: day.dateString, endDate: "" });
    } else if (new Date(day.dateString) >= new Date(selectedDates.startDate)) {
      const start = new Date(selectedDates.startDate);
      const end = new Date(day.dateString);
      let blocked = false;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (blockedDates[d.toISOString().split("T")[0]]) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        setSelectedDates((prev) => ({ ...prev, endDate: day.dateString }));
        modalizeRef.current?.close();
      }
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

  const markedDates = useMemo(() => {
    const dates: Record<string, object> = {
      ...Object.keys(blockedDates).reduce(
        (acc, date) => ({
          ...acc,
          [date]: { disabled: true, disableTouchEvent: true, selectedColor: c.error, selectedTextColor: "white" },
        }),
        {},
      ),
    };
    if (selectedDates.startDate) {
      dates[selectedDates.startDate] = { startingDay: true, color: c.accent, textColor: "white" };
    }
    if (selectedDates.endDate) {
      dates[selectedDates.endDate] = { endingDay: true, color: c.accent, textColor: "white" };
      const cur = new Date(selectedDates.startDate);
      const endD = new Date(selectedDates.endDate);
      cur.setDate(cur.getDate() + 1);
      while (cur < endD) {
        const ds = cur.toISOString().split("T")[0];
        if (!blockedDates[ds]) dates[ds] = { color: c.accentPressed, textColor: "white" };
        cur.setDate(cur.getDate() + 1);
      }
    }
    return dates;
  }, [selectedDates.startDate, selectedDates.endDate, blockedDates]);

  const travellerCount = (travellers ?? []).length;
  const datesSelected = !!(selectedDates.startDate && selectedDates.endDate);
  const selectionTitle = longTerm ? "Months" : "Dates";
  const selectionButtonText = longTerm ? "Select months" : "Select dates";
  const staySummary = buildStaySummary(longTerm, datesSelected, selectedDates, billDetails.totalUnits);
  const tripMeta = buildTripMeta(datesSelected, guests.adults, travellerCount);
  const reserveCtaLabel = buildReserveCtaLabel(
    isSubmitting,
    propertyLoading,
    datesSelected,
    travellerCount,
    selectionButtonText,
  );

  const handleCheckout = async () => {
    if (isSubmitting) return;

    if (!user?._id) {
      Alert.alert("Login required", "Please log in to complete your booking.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log in", onPress: () => router.push("/(tabs)/Menu") },
      ]);
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

    if (travellerCount < 1) {
      Alert.alert(
        "Traveller details required",
        "Please add passport / ID info for at least one traveller before sending your booking request.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add travellers",
            onPress: () => {
              setLimits(guests.adults, guests.children, guests.infants, String(id ?? ""));
              travellerModalizeRef.current?.open();
            },
          },
        ],
      );
      return;
    }

    if (billDetails.payableNow <= 0) {
      Alert.alert("Invalid amount", "We couldn't calculate the payable amount. Please re-select your dates.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(
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
        { headers: { "Content-Type": "application/json" } },
      );

      resetCoupon();
      clearTravellers();
      setSelectedDates({ startDate: "", endDate: "" });
      setSuccessVisible(true);
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        response?: { status?: number; data?: { message?: string; error?: string } };
      };
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error;

      if (status === 409) {
        Alert.alert(
          "Dates unavailable",
          backendMsg ?? "These dates are already booked for this property. Please choose different dates.",
        );
        try {
          const refreshed = await axios.post(
            `${process.env.EXPO_PUBLIC_BASE_URL}/properties/getParticularProperty`,
            { propertyId: id },
          );
          setProperty(refreshed.data.data);
        } catch {
          // ignore refresh failures
        }
      } else if (status === 400) {
        Alert.alert("Can't create booking", backendMsg ?? "Some booking details are missing or invalid.");
      } else if (err?.message === "Network Error") {
        Alert.alert("Network error", "Couldn't reach the server. Check your internet connection and try again.");
      } else {
        Alert.alert("Something went wrong", backendMsg ?? "We couldn't create your booking. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReserveCtaPress = () => {
    if (isSubmitting || propertyLoading || !property) return;
    if (!datesSelected) {
      handleStaySelectorOpen();
      return;
    }
    if (travellerCount < 1) {
      handleAddTraveller();
      return;
    }
    handleCheckout();
  };

  return {
    id,
    property,
    propertyLoading,
    propertyError,
    successVisible,
    setSuccessVisible,
    guests,
    tempGuests,
    isSubmitting,
    quotationExpanded,
    setQuotationExpanded,
    selectedDates,
    tempLongTermStart,
    tempLongTermDuration,
    unitPrice,
    longTerm,
    priceSuffix,
    propertyRecapImage,
    monthOptions,
    durationOptions: DURATION_OPTIONS,
    billDetails,
    payableAnimatedValue,
    calendarConfig,
    markedDates,
    datesSelected,
    selectionTitle,
    staySummary,
    tripMeta,
    reserveCtaLabel,
    travellerCount,
    appliedCoupon,
    modalizeRef,
    guestModalizeRef,
    travellerModalizeRef,
    couponModalizeRef,
    reloadProperty,
    handleGuestModalOpen,
    handleStaySelectorOpen,
    handleAddTraveller,
    handleConfirmGuests,
    updateGuestCount,
    onDayPress,
    handleConfirmLongTermStay,
    setTempLongTermStart,
    setTempLongTermDuration,
    handleReserveCtaPress,
    formatGuestSummary: () => formatGuestSummary(guests),
  };
}
