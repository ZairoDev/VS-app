import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PropertyInterface } from "@/types";
import { booking } from "@/Constants/booking-theme";
import { getPropertyDisplayName } from "@/utils/property-display";

const { colors: c } = booking;

type ReservePropertyRecapProps = {
  property: PropertyInterface;
  imageUri?: string;
  longTerm: boolean;
  unitPrice: number;
  priceSuffix: string;
  onPress: () => void;
};

export function ReservePropertyRecap({
  property,
  imageUri,
  longTerm,
  unitPrice,
  priceSuffix,
  onPress,
}: ReservePropertyRecapProps) {
  return (
    <Pressable
      style={styles.recapRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${getPropertyDisplayName(property)} details`}
    >
      <Image style={styles.recapThumb} resizeMode="cover" source={{ uri: imageUri }} />
      <View style={styles.recapCopy}>
        <Text style={styles.recapName} numberOfLines={1}>
          {getPropertyDisplayName(property)}
        </Text>
        <Text style={styles.recapMeta} numberOfLines={1}>
          {longTerm ? "Long-term stay" : "Short-term stay"} · €{unitPrice}
          {priceSuffix}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={c.inkPlaceholder} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  recapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 80,
  },
  recapThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: c.track,
  },
  recapCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  recapName: {
    fontSize: 16,
    fontWeight: "700",
    color: c.ink,
    letterSpacing: -0.2,
  },
  recapMeta: {
    fontSize: 13,
    fontWeight: "600",
    color: c.inkMuted,
  },
});
