import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { booking } from "@/Constants/booking-theme";

const { colors: c, radius: r } = booking;

type ReserveHeaderProps = {
  onBack: () => void;
};

export function ReserveHeader({ onBack }: ReserveHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.headerBack}>
        <Ionicons name="chevron-back" size={22} color={c.ink} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Reserve</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: c.surface,
    borderBottomWidth: 0,
  },
  headerBack: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: r.md,
    backgroundColor: c.track,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: c.ink },
});
