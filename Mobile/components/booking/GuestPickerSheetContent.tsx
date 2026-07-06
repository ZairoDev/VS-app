import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { booking } from "@/Constants/booking-theme";
import type { GuestCounts } from "@/utils/reserve";

const { colors: c, button: btnTheme } = booking;

type GuestPickerSheetContentProps = {
  guests: GuestCounts;
  onUpdateGuestCount: (type: keyof GuestCounts, increment: boolean) => void;
  onConfirm: () => void;
};

function GuestTypeSelector({
  type,
  title,
  subtitle,
  value,
  onUpdateGuestCount,
}: {
  type: keyof GuestCounts;
  title: string;
  subtitle: string;
  value: number;
  onUpdateGuestCount: (type: keyof GuestCounts, increment: boolean) => void;
}) {
  const minValue = type === "adults" ? 1 : 0;
  const atMin = value <= minValue;

  return (
    <View style={styles.guestTypeContainer}>
      <View style={styles.guestTypeInfo}>
        <Text style={styles.guestTypeTitle}>{title}</Text>
        <Text style={styles.guestTypeSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.guestTypeControls}>
        <TouchableOpacity
          style={[styles.guestTypeButton, atMin && styles.guestTypeButtonDisabled]}
          onPress={() => onUpdateGuestCount(type, false)}
          disabled={atMin}
        >
          <Ionicons name="remove" size={20} color={atMin ? c.inkPlaceholder : c.accent} />
        </TouchableOpacity>
        <Text style={styles.guestTypeValue}>{value}</Text>
        <TouchableOpacity style={styles.guestTypeButton} onPress={() => onUpdateGuestCount(type, true)}>
          <Ionicons name="add" size={20} color={c.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function GuestPickerSheetContent({ guests, onUpdateGuestCount, onConfirm }: GuestPickerSheetContentProps) {
  return (
    <View style={styles.guestContainer}>
      <Text style={styles.modalTitle}>Who's coming?</Text>
      <GuestTypeSelector
        type="adults"
        title="Adults"
        subtitle="Age 13+"
        value={guests.adults}
        onUpdateGuestCount={onUpdateGuestCount}
      />
      <GuestTypeSelector
        type="children"
        title="Children"
        subtitle="Ages 2–12"
        value={guests.children}
        onUpdateGuestCount={onUpdateGuestCount}
      />
      <GuestTypeSelector
        type="infants"
        title="Infants"
        subtitle="Under 2"
        value={guests.infants}
        onUpdateGuestCount={onUpdateGuestCount}
      />
      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: c.ink },
  guestContainer: { paddingBottom: 24 },
  guestTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
  },
  guestTypeInfo: { flex: 1 },
  guestTypeTitle: { fontSize: 16, fontWeight: "600", color: c.ink },
  guestTypeSubtitle: { fontSize: 14, color: c.inkMuted, marginTop: 2 },
  guestTypeControls: { flexDirection: "row", alignItems: "center" },
  guestTypeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: c.track,
    justifyContent: "center",
    alignItems: "center",
  },
  guestTypeButtonDisabled: { opacity: 0.5 },
  guestTypeValue: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: "center",
  },
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
