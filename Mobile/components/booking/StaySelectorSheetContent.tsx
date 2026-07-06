import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { booking } from "@/Constants/booking-theme";
import { formatMonthYear } from "@/utils/reserve";

const { colors: c, button: btnTheme } = booking;
const INITIAL_VISIBLE_MONTHS = 6;

type MonthOption = {
  value: string;
  label: string;
};

type StaySelectorSheetContentProps = {
  longTerm: boolean;
  unitPrice: number;
  monthOptions: MonthOption[];
  durationOptions: number[];
  tempLongTermStart: string;
  tempLongTermDuration: number;
  selectedDates: { startDate: string; endDate: string };
  markedDates: Record<string, unknown>;
  calendarMinDate: string;
  calendarMaxDate: string;
  onSelectLongTermStart: (value: string) => void;
  onSelectLongTermDuration: (months: number) => void;
  onConfirmLongTerm: () => void;
  onDayPress: (day: { dateString: string }) => void;
};

export function StaySelectorSheetContent({
  longTerm,
  unitPrice,
  monthOptions,
  durationOptions,
  tempLongTermStart,
  tempLongTermDuration,
  selectedDates,
  markedDates,
  calendarMinDate,
  calendarMaxDate,
  onSelectLongTermStart,
  onSelectLongTermDuration,
  onConfirmLongTerm,
  onDayPress,
}: StaySelectorSheetContentProps) {
  const [monthsExpanded, setMonthsExpanded] = useState(false);

  const visibleMonthOptions = useMemo(() => {
    if (monthsExpanded) return monthOptions;
    return monthOptions.slice(0, INITIAL_VISIBLE_MONTHS);
  }, [monthOptions, monthsExpanded]);

  useEffect(() => {
    if (!tempLongTermStart) return;
    const selectedIndex = monthOptions.findIndex((option) => option.value === tempLongTermStart);
    if (selectedIndex >= INITIAL_VISIBLE_MONTHS) {
      setMonthsExpanded(true);
    }
  }, [tempLongTermStart, monthOptions]);

  const showMoreMonthsToggle = monthOptions.length > INITIAL_VISIBLE_MONTHS;

  if (longTerm) {
    return (
      <View style={styles.longTermContainer}>
        <Text style={styles.modalTitle}>Select months</Text>
        <Text style={styles.longTermSubtitle}>
          Long-term properties are booked by month, so choose your move-in month and stay duration.
        </Text>

        <Text style={styles.modalSectionTitle}>Move-in month</Text>
        <View style={styles.monthGrid}>
          {visibleMonthOptions.map((option) => {
            const active = tempLongTermStart === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.monthChip, active && styles.monthChipActive]}
                onPress={() => onSelectLongTermStart(option.value)}
                activeOpacity={0.85}
              >
                <Text style={[styles.monthChipText, active && styles.monthChipTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showMoreMonthsToggle ? (
          <TouchableOpacity
            style={styles.moreMonthsButton}
            onPress={() => setMonthsExpanded((prev) => !prev)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ expanded: monthsExpanded }}
            accessibilityLabel={monthsExpanded ? "Show fewer months" : "Show more months"}
          >
            <Text style={styles.moreMonthsText}>
              {monthsExpanded ? "Show fewer months" : "More months"}
            </Text>
            <Ionicons
              name={monthsExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={c.accent}
            />
          </TouchableOpacity>
        ) : null}

        <Text style={styles.modalSectionTitle}>Duration</Text>
        <View style={styles.durationRow}>
          {durationOptions.map((months) => {
            const active = tempLongTermDuration === months;
            return (
              <TouchableOpacity
                key={months}
                style={[styles.durationChip, active && styles.durationChipActive]}
                onPress={() => onSelectLongTermDuration(months)}
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
              Starting {formatMonthYear(tempLongTermStart)} for {tempLongTermDuration} month
              {tempLongTermDuration > 1 ? "s" : ""}
            </Text>
            <Text style={styles.longTermPreviewSub}>
              Monthly rent: €{unitPrice.toFixed(2)} · Estimated subtotal: €
              {(unitPrice * tempLongTermDuration).toFixed(2)}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.confirmButton} onPress={onConfirmLongTerm}>
          <Text style={styles.confirmButtonText}>Confirm months</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.calendarContainer}>
      <Text style={styles.modalTitle}>Select Dates</Text>
      <Calendar
        markingType="period"
        markedDates={markedDates}
        onDayPress={onDayPress}
        minDate={calendarMinDate}
        maxDate={calendarMaxDate}
        enableSwipeMonths
        scrollEnabled
        pastSwipeRange={0}
        futureSwipeRange={12}
        theme={{
          selectedDayTextColor: c.surface,
          textDayFontSize: 16,
          textMonthFontSize: 18,
          arrowColor: c.accent,
          textDayHeaderFontSize: 14,
          // @ts-expect-error react-native-calendars custom stylesheet key
          "stylesheet.calendar.main": {
            week: { marginTop: 4, marginBottom: 4, flexDirection: "row", justifyContent: "space-around" },
          },
        }}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: c.accent }]} />
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
  );
}

const styles = StyleSheet.create({
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: c.ink },
  calendarContainer: { paddingBottom: 24 },
  longTermContainer: { paddingBottom: 24 },
  longTermSubtitle: {
    marginTop: -6,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 20,
    color: c.inkMuted,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: c.ink,
    marginBottom: 10,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  moreMonthsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 18,
    paddingVertical: 8,
  },
  moreMonthsText: {
    fontSize: 14,
    fontWeight: "700",
    color: c.accent,
  },
  monthChip: {
    width: "48%",
    backgroundColor: c.track,
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  monthChipActive: {
    backgroundColor: c.accentSoft,
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: c.ink,
  },
  monthChipTextActive: {
    color: c.accentPressed,
  },
  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  durationChip: {
    backgroundColor: c.track,
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  durationChipActive: {
    backgroundColor: c.accentSoft,
  },
  durationChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: c.ink,
  },
  durationChipTextActive: {
    color: c.accentPressed,
  },
  longTermPreview: {
    marginTop: 18,
    backgroundColor: c.bg,
    borderWidth: 0,
    borderRadius: 14,
    padding: 14,
  },
  longTermPreviewLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: c.inkPlaceholder,
    marginBottom: 4,
    letterSpacing: 0.4,
  },
  longTermPreviewValue: {
    fontSize: 15,
    fontWeight: "700",
    color: c.ink,
    lineHeight: 21,
  },
  longTermPreviewSub: {
    marginTop: 4,
    fontSize: 13,
    color: c.inkMuted,
  },
  helperText: { fontSize: 14, color: c.inkMuted, textAlign: "center", marginTop: 16 },
  legend: { flexDirection: "row", justifyContent: "center", marginTop: 16, paddingHorizontal: 20 },
  legendItem: { flexDirection: "row", alignItems: "center", marginHorizontal: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 14, color: c.inkMuted },
  confirmButton: {
    backgroundColor: c.accent,
    borderRadius: btnTheme.radius,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginHorizontal: 16,
  },
  confirmButtonText: { color: c.surface, fontSize: 16, fontWeight: "700" },
});
