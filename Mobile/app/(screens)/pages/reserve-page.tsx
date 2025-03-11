import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function ReservationScreen() {
  const modalizeRef = useRef<Modalize>(null);
  const [selectedDates, setSelectedDates] = useState({
    startDate: '',
    endDate: '',
  });

  const onDayPress = (day: any) => {
    if (!selectedDates.startDate || (selectedDates.startDate && selectedDates.endDate)) {
      setSelectedDates({
        startDate: day.dateString,
        endDate: '',
      });
    } else {
      if (new Date(day.dateString) >= new Date(selectedDates.startDate)) {
        setSelectedDates(prev => ({
          ...prev,
          endDate: day.dateString,
        }));
        modalizeRef.current?.close();
      }
    }
  };

  const getMarkedDates = () => {
    const markedDates: any = {};
    
    if (selectedDates.startDate) {
      markedDates[selectedDates.startDate] = {
        startingDay: true,
        color: '#4F46E5',
        textColor: 'white',
      };
    }

    if (selectedDates.endDate) {
      markedDates[selectedDates.endDate] = {
        endingDay: true,
        color: '#4F46E5',
        textColor: 'white',
      };

      // Mark dates in between
      if (selectedDates.startDate && selectedDates.endDate) {
        let currentDate = new Date(selectedDates.startDate);
        const endDate = new Date(selectedDates.endDate);
        currentDate.setDate(currentDate.getDate() + 1);

        while (currentDate < endDate) {
          markedDates[currentDate.toISOString().split('T')[0]] = {
            color: '#4F46E5',
            textColor: 'white',
          };
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    return markedDates;
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Make a Reservation</Text>
        
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => modalizeRef.current?.open()}
        >
          <View style={styles.dateDisplay}>
            <Ionicons name="calendar-outline" size={24} color="black" />
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateLabel}>Select Dates</Text>
              <Text style={styles.selectedDates}>
                {selectedDates.startDate
                  ? `${formatDate(selectedDates.startDate)}${
                      selectedDates.endDate
                        ? ` - ${formatDate(selectedDates.endDate)}`
                        : ''
                    }`
                  : 'Choose your dates'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Add more reservation form fields here */}
      </View>

      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        modalStyle={styles.modalContent}
      >
        <View style={styles.calendarContainer}>
          <Text style={styles.modalTitle}>Select Dates</Text>
          <Calendar
            markingType="period"
            markedDates={getMarkedDates()}
            onDayPress={onDayPress}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              todayTextColor: '#4F46E5',
              selectedDayBackgroundColor: '#4F46E5',
              selectedDayTextColor: '#ffffff',
            }}
          />
          <Text style={styles.helperText}>
            {!selectedDates.startDate
              ? 'Select your check-in date'
              : !selectedDates.endDate
              ? 'Now select your check-out date'
              : 'Dates selected!'}
          </Text>
        </View>
      </Modalize>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  dateSelector: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTextContainer: {
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  selectedDates: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  modalContent: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  calendarContainer: {
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
});