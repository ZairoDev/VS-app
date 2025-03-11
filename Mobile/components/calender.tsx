import React, { useState } from "react";
import { View, Alert } from "react-native";
import { CalendarList, DateData } from "react-native-calendars";

// Define types
type DateRange = { startDate: string; endDate: string };
type MarkedDates = Record<string, { color: string; textColor: string; startingDay?: boolean; endingDay?: boolean }>;

// Blocked dates set for faster lookup
const BLOCKED_DATES: Set<string> = new Set(["2025-03-15", "2025-03-20", "2025-03-25"]);

const Calendar = () => {
  const [range, setRange] = useState<DateRange>({ startDate: "", endDate: "" });
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const handleDayPress = (day: DateData) => {
    const { dateString } = day;

    if (BLOCKED_DATES.has(dateString)) {
      Alert.alert("Date Blocked", "You cannot select this date.");
      return;
    }

    if (!range.startDate || range.endDate) {
      setNewSelection(dateString);
    } else {
      setEndSelection(range.startDate, dateString);
    }
  };

  const setNewSelection = (date: string) => {
    setRange({ startDate: date, endDate: "" });
    setMarkedDates({
      [date]: { startingDay: true, endingDay: true, color: "#00a680", textColor: "#fff" },
    });
  };

  const setEndSelection = (startDate: string, selectedEndDate: string) => {
    if (new Date(startDate) > new Date(selectedEndDate)) return;

    // Adjust end date to avoid blocked dates
    let endDate = getValidEndDate(startDate, selectedEndDate);

    if (!endDate) {
      Alert.alert("Invalid Selection", "No available range due to blocked dates.");
      return;
    }

    const updatedMarkedDates: MarkedDates = {
      [startDate]: { startingDay: true, color: "#00a680", textColor: "#fff" },
    };

    let tempDate = new Date(startDate);
    while (tempDate.toISOString().split("T")[0] < endDate) {
      tempDate.setDate(tempDate.getDate() + 1);
      const dateStr = tempDate.toISOString().split("T")[0];

      if (!BLOCKED_DATES.has(dateStr)) {
        updatedMarkedDates[dateStr] = { color: "#70d7c7", textColor: "#fff" };
      }
    }

    updatedMarkedDates[endDate] = { endingDay: true, color: "#00a680", textColor: "#fff" };

    setRange({ startDate, endDate });
    setMarkedDates(updatedMarkedDates);
  };

  const getValidEndDate = (startDate: string, selectedEndDate: string): string | null => {
    let tempDate = new Date(startDate);
    let direction = new Date(startDate) < new Date(selectedEndDate) ? 1 : -1; // Moving forward or backward

    while (tempDate.toISOString().split("T")[0] !== selectedEndDate) {
      tempDate.setDate(tempDate.getDate() + direction);
      const tempDateStr = tempDate.toISOString().split("T")[0];

      if (BLOCKED_DATES.has(tempDateStr)) {
        // Move endDate to the previous valid date before the blocked date
        tempDate.setDate(tempDate.getDate() - direction);
        return tempDate.toISOString().split("T")[0];
      }
    }

    return selectedEndDate; // If no blocked dates, return as is
  };

  return (
    <View>
      <CalendarList
        markingType="period"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        pastScrollRange={12}
        futureScrollRange={12}
        scrollEnabled={true}
        showScrollIndicator
      />
    </View>
  );
};

export default Calendar;
