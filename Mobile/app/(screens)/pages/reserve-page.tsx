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
import { router } from "expo-router";
import { StatusBar } from "react-native";
import { Image } from "react-native";
import {  Plus, Minus } from 'lucide-react-native';

const { height } = Dimensions.get("window");

const BLOCKED_DATES: { [key: string]: boolean } = {
  "2025-04-14": true,
  "2025-04-15": true,
  "2025-04-20": true,
  "2025-04-21": true,
};

export default function ReservationScreen() {
  const modalizeRef = useRef<Modalize>(null);
  const guestModalizeRef = useRef<Modalize>(null);
  const [selectedDates, setSelectedDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [tempGuests, setTempGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
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

  const handleGuestModalOpen = () => {
    // Set temporary state to current guest values when opening modal
    setTempGuests({ ...guests });
    guestModalizeRef.current?.open();
  };

  const handleConfirmGuests = () => {
    // Update main guest state with temporary values
    setGuests({ ...tempGuests });
    guestModalizeRef.current?.close();
  };

  const updateGuestCount = (type: "adults" | "children" | "infants" , increment: boolean)=>{
    setGuests(prev=>{
      const newCount = increment? prev[type]+1 : prev[type]-1;

      if(newCount<0)return prev;
      if(type === "adults" && newCount===0)return prev;

      const totalGuests = (type === "adults" ? newCount : prev.adults)+(type === "children"? newCount :prev.children);


      return {
        ...prev,
        [type]: newCount,
        
      }

    })
  }

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

  const getGuestSummary = () => {
    const parts = [];
    if (guests.adults) parts.push(`${guests.adults} adult${guests.adults !== 1 ? 's' : ''}`);
    if (guests.children) parts.push(`${guests.children} child${guests.children !== 1 ? 'ren' : ''}`);
    if (guests.infants) parts.push(`${guests.infants} infant${guests.infants !== 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  const GuestTypeSelector = ({ 
    type, 
    title, 
    subtitle,
    value,
  }: { 
    type: 'adults' | 'children' | 'infants';
    title: string;
    subtitle: string;
    value: number;
  }) => (
    <View style={styles.guestTypeContainer}>
      <View style={styles.guestTypeInfo}>
        <Text style={styles.guestTypeTitle}>{title}</Text>
        <Text style={styles.guestTypeSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.guestTypeControls}>
        <TouchableOpacity
          style={[
            styles.guestTypeButton,
            value === (type === 'adults' ? 1 : 0) && styles.guestTypeButtonDisabled
          ]}
          onPress={() => updateGuestCount(type, false)}
          disabled={type === 'adults' ? value <= 1 : value <= 0}
        >
          <Minus size={20} color={value === (type === 'adults' ? 1 : 0) ? '#A1A1AA' : '#4F46E5'} />
        </TouchableOpacity>
        <Text style={styles.guestTypeValue}>{value}</Text>
        <TouchableOpacity
          style={styles.guestTypeButton}
          onPress={() => updateGuestCount(type, true)}
        >
          <Plus size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={false} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reserve</Text>
      </View>
      <View style={styles.content}>
        <View>
          <Image
            style={{ width: 200, height: 100, borderRadius: 10 }}
            resizeMode="cover"
            source={{
              uri: "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            }}
          />
          <Text>Property ka naam</Text>
          <Text>Property ka thoda sa description</Text>
        </View>

        <View style={styles.reservationInfo}>
          <View style={styles.dateSelector}>
            <View style={styles.dateDisplay}>
              <View>
                <Text style={styles.label}>Dates</Text>
                <Text style={styles.selectedText}>
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
          <View style={styles.guestSelector}>
            <View style={styles.dateDisplay}>
              <View>
                <Text style={styles.label}>Guests</Text>
                <Text style={styles.selectedText}>{getGuestSummary()}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => guestModalizeRef.current?.open()}>
              <Ionicons name="person-add-outline" size={32} color="#111111" />
            </TouchableOpacity>
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
      <Modalize
        ref={guestModalizeRef}
        adjustToContentHeight
        modalStyle={styles.modalContent}
        scrollViewProps={{
          showsVerticalScrollIndicator: false,
          scrollEventThrottle: 16,
        }}
      >
       <View style={styles.guestContainer}>
          <Text style={styles.modalTitle}>Who's coming?</Text>
          
          <GuestTypeSelector
            type="adults"
            title="Adults"
            subtitle="Age 13+"
            value={tempGuests.adults}
          />
          
          <GuestTypeSelector
            type="children"
            title="Children"
            subtitle="Ages 2-12"
            value={tempGuests.children}
          />
          
          <GuestTypeSelector
            type="infants"
            title="Infants"
            subtitle="Under 2"
            value={tempGuests.infants}
          />

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmGuests}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
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
    backgroundColor: "maroon",
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
    borderWidth: 1,
    justifyContent: "space-between",
  },
  guestSelector: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "space-between",
  },
  reservationInfo: {
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

  selectedText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  label: {
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
  guestContainer: {
    paddingBottom: 24,
  },
  guestTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  guestTypeInfo: {
    flex: 1,
  },
  guestTypeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  guestTypeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  guestTypeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestTypeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestTypeButtonDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.5,
  },
  guestTypeValue: {
    fontSize: 18,
    fontWeight: '500',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  guestHelperText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 16,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
