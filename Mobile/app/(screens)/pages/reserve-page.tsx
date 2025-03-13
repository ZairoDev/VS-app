import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Modalize } from "react-native-modalize";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const BLOCKED_DATES: { [key: string]: boolean } = {
  "2025-04-14": true,
  "2025-04-15": true,
  "2025-04-20": true,
  "2025-04-21": true,
};

export default function ReservationScreen() {
  const modalizeRef = useRef<Modalize>(null);
  const [selectedDates, setSelectedDates] = useState({
    startDate: "",
    endDate: "",
  });

  const calendarConfig = useMemo(() => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 12);

    return {
      minDate: today.toISOString().split("T")[0],
      maxDate: futureDate.toISOString().split("T")[0],
    };
  }, []);

  const onDayPress = (day: any) => {
    if (BLOCKED_DATES[day.dateString]) {
      return;
    }

    if (day.dateString === selectedDates.startDate) {
      setSelectedDates({
        startDate: "",
        endDate: "",
      });
      return;
    }

    if (day.dateString === selectedDates.endDate) {
      setSelectedDates((prev) => ({
        ...prev,
        endDate: "",
      }));
      return;
    }

    // Normal date selection logic
    if (
      !selectedDates.startDate ||
      (selectedDates.startDate && selectedDates.endDate)
    ) {
      // Check if any dates between start and potential end date are blocked
      setSelectedDates({
        startDate: day.dateString,
        endDate: "",
      });
    } else {
      if (new Date(day.dateString) >= new Date(selectedDates.startDate)) {
        // Check if any dates in the range are blocked
        const start = new Date(selectedDates.startDate);
        const end = new Date(day.dateString);
        let hasBlockedDates = false;

        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
          const dateString = d.toISOString().split("T")[0];
          if (BLOCKED_DATES[dateString]) {
            hasBlockedDates = true;
            break;
          }
        }

        if (!hasBlockedDates) {
          setSelectedDates((prev) => ({
            ...prev,
            endDate: day.dateString,
          }));
          modalizeRef.current?.close();
        }
      }
    }
  };

  const getMarkedDates = useMemo(() => {
    const markedDates: any = {
      ...(BLOCKED_DATES &&
        Object.keys(BLOCKED_DATES).reduce(
          (acc, date) => ({
            ...acc,
            [date]: {
              disabled: true,
              disableTouchEvent: true,
              selectedColor: "#FF6B6B",
              selectedTextColor: "white",
            },
          }),
          {}
        )),
    };

    if (selectedDates.startDate) {
      markedDates[selectedDates.startDate] = {
        startingDay: true,
        color: "#ff7900",
        textColor: "white",
      };
    }

    if (selectedDates.endDate) {
      markedDates[selectedDates.endDate] = {
        endingDay: true,
        color: "#ff7900",
        textColor: "white",
      };

      // Mark dates in between
      if (selectedDates.startDate && selectedDates.endDate) {
        let currentDate = new Date(selectedDates.startDate);
        const endDate = new Date(selectedDates.endDate);
        currentDate.setDate(currentDate.getDate() + 1);

        while (currentDate < endDate) {
          const dateString = currentDate.toISOString().split("T")[0];
          if (!BLOCKED_DATES[dateString]) {
            markedDates[dateString] = {
              color: "#FFA53F",
              textColor: "white",
            };
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    return markedDates;
  }, [selectedDates.startDate, selectedDates.endDate]);

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getHelperText = () => {
    if (!selectedDates.startDate) {
      return "Select your check-in date";
    }
    if (!selectedDates.endDate) {
      return "Now select your check-out date (or tap check-in date to unselect)";
    }
    return "Tap a selected date to unselect it";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Make a Reservation</Text>

        <View style={styles.reservationInfo}>
          <View style={styles.dateSelector}>
            <View style={styles.dateDisplay}>
              <View >
                <Text style={styles.dateLabel}>Dates</Text>
                <Text style={styles.selectedDates}>
                  {selectedDates.startDate
                    ? `${formatDate(selectedDates.startDate)}${
                        selectedDates.endDate
                          ? ` - ${formatDate(selectedDates.endDate)}`
                          : ""
                      }`
                    : "Select dates"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => modalizeRef.current?.open()}>
              <Ionicons name="calendar-outline" size={32} color="#111111" />
            </TouchableOpacity>
          </View>
          <View>
            <Text>Hello world</Text>
          </View>
        </View>
      </View>

      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        modalStyle={styles.modalContent}
        scrollViewProps={{
          showsVerticalScrollIndicator: false,
          scrollEventThrottle: 16,
        }}
      >
        <View style={styles.calendarContainer}>
          <Text style={styles.modalTitle}>Select Dates</Text>
          <Calendar
            markingType="period"
            markedDates={getMarkedDates}
            onDayPress={onDayPress}
            minDate={calendarConfig.minDate}
            maxDate={calendarConfig.maxDate}
            enableSwipeMonths={true}
            scrollEnabled={true}
            pastSwipeRange={0}
            futureSwipeRange={12}
            theme={{
              // todayTextColor: '#FF7900',
              // selectedDayBackgroundColor: '#FF7900',
              selectedDayTextColor: "#ffffff",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              arrowColor: "#ff7900",
              textDayHeaderFontSize: 14,
              "stylesheet.calendar.main": {
                week: {
                  marginTop: 4,
                  marginBottom: 4,
                  flexDirection: "row",
                  justifyContent: "space-around",
                },
              },
            }}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#4F46E5" }]}
              />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            {/* <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.legendText}>Unavailable</Text>
            </View> */}
          </View>
          <Text style={styles.helperText}>{getHelperText()}</Text>
        </View>
      </Modalize>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
    color: "#1a1a1a",
  },
  dateSelector: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
     
  },
  reservationInfo:{
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  selectedDates: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",   
  },
  modalContent: {
    padding: 20,
    backgroundColor: "#ffffff",
  },
  calendarContainer: {
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1a1a1a",
  },
  helperText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
