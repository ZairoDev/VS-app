import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { booking } from "@/Constants/booking-theme";

const { colors: c } = booking;

type TripDetailsCardProps = {
  tripMeta: string;
  selectionTitle: string;
  staySummary: string;
  datesSelected: boolean;
  longTerm: boolean;
  guestSummary: string;
  guestsAdults: number;
  travellerCount: number;
  onOpenStaySelector: () => void;
  onOpenGuests: () => void;
  onOpenTravellers: () => void;
};

export function TripDetailsCard({
  tripMeta,
  selectionTitle,
  staySummary,
  datesSelected,
  longTerm,
  guestSummary,
  guestsAdults,
  travellerCount,
  onOpenStaySelector,
  onOpenGuests,
  onOpenTravellers,
}: TripDetailsCardProps) {
  return (
    <View style={styles.selectorCard}>
      <View style={styles.selectorHeader}>
        <Text style={styles.selectorHeaderTitle}>Trip details</Text>
        <Text style={styles.selectorHeaderMeta}>{tripMeta}</Text>
      </View>

      <TouchableOpacity style={styles.selectorRow} onPress={onOpenStaySelector} activeOpacity={0.7}>
        <View style={styles.selectorIcon}>
          <Ionicons name="calendar-outline" size={20} color={datesSelected ? c.accent : c.inkMuted} />
        </View>
        <View style={styles.selectorBody}>
          <Text style={styles.selectorLabel}>{selectionTitle}</Text>
          <Text style={[styles.selectorValue, !datesSelected && styles.selectorPlaceholder]}>{staySummary}</Text>
          {!datesSelected ? (
            <Text style={styles.selectorSubtext}>
              {longTerm
                ? "Choose the starting month and booking duration."
                : "Choose the stay window to continue."}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.inkPlaceholder} />
      </TouchableOpacity>

      <View style={styles.selectorDivider} />

      <TouchableOpacity style={styles.selectorRow} onPress={onOpenGuests} activeOpacity={0.7}>
        <View style={styles.selectorIcon}>
          <Ionicons name="people-outline" size={20} color={guestsAdults > 0 ? c.accent : c.inkMuted} />
        </View>
        <View style={styles.selectorBody}>
          <Text style={styles.selectorLabel}>Guests</Text>
          <Text style={styles.selectorValue}>{guestSummary}</Text>
          {guestsAdults < 1 ? (
            <Text style={styles.selectorSubtext}>
              {longTerm ? "Set who will stay during the selected months." : "Add adults, children, and infants."}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.inkPlaceholder} />
      </TouchableOpacity>

      <View style={styles.selectorDivider} />

      <TouchableOpacity style={styles.selectorRow} onPress={onOpenTravellers} activeOpacity={0.7}>
        <View style={styles.selectorIcon}>
          <FontAwesome name="address-card-o" size={18} color={travellerCount > 0 ? c.accent : c.inkMuted} />
        </View>
        <View style={styles.selectorBody}>
          <Text style={styles.selectorLabel}>Traveller details</Text>
          <Text style={[styles.selectorValue, travellerCount === 0 && styles.selectorPlaceholder]}>
            {travellerCount > 0
              ? `${travellerCount} traveller${travellerCount > 1 ? "s" : ""} added`
              : "Add passport / ID info"}
          </Text>
          {travellerCount === 0 ? (
            <Text style={styles.selectorSubtext}>Required for booking confirmation.</Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.inkPlaceholder} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorCard: {
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
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
    color: c.ink,
  },
  selectorHeaderMeta: {
    fontSize: 12,
    color: c.inkMuted,
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
    backgroundColor: c.track,
    alignItems: "center",
    justifyContent: "center",
  },
  selectorBody: { flex: 1 },
  selectorLabel: { fontSize: 12, fontWeight: "600", color: c.inkPlaceholder, marginBottom: 3 },
  selectorValue: { fontSize: 15, fontWeight: "600", color: c.ink },
  selectorPlaceholder: { color: c.inkPlaceholder, fontWeight: "500" },
  selectorSubtext: { marginTop: 2, fontSize: 12, color: c.inkMuted },
  selectorDivider: { height: 1, backgroundColor: c.divider, marginLeft: 74 },
});
