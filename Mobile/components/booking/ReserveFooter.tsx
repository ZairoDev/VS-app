import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { booking } from "@/Constants/booking-theme";

const { colors: c, shadow: sh, button: btnTheme } = booking;

type ReserveFooterProps = {
  datesSelected: boolean;
  payableAnimatedValue: number;
  unitPrice: number;
  priceSuffix: string;
  ctaLabel: string;
  isSubmitting: boolean;
  propertyLoading: boolean;
  propertyReady: boolean;
  bottomInset: number;
  onCtaPress: () => void;
};

export function ReserveFooter({
  datesSelected,
  payableAnimatedValue,
  unitPrice,
  priceSuffix,
  ctaLabel,
  isSubmitting,
  propertyLoading,
  propertyReady,
  bottomInset,
  onCtaPress,
}: ReserveFooterProps) {
  const disabled = isSubmitting || propertyLoading || !propertyReady;

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, 12) }]}>
      {datesSelected ? (
        <View style={styles.footerLeft}>
          <Text style={styles.footerTotal}>€{payableAnimatedValue.toFixed(2)}</Text>
          <Text style={styles.footerTotalSub}>Due today</Text>
        </View>
      ) : (
        <View style={styles.footerLeft}>
          <Text style={styles.footerTotal}>€{unitPrice}</Text>
          <Text style={styles.footerTotalSub}>{priceSuffix}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.ctaBtn,
          !datesSelected && styles.ctaBtnMuted,
          disabled && styles.ctaBtnDisabled,
        ]}
        onPress={onCtaPress}
        activeOpacity={0.85}
        disabled={disabled}
      >
        <Text style={[styles.ctaBtnText, !datesSelected && styles.ctaBtnTextMuted]}>{ctaLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: c.divider,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...sh.footer,
  },
  footerLeft: { flex: 1 },
  footerTotal: { fontSize: 20, fontWeight: "800", color: c.ink },
  footerTotalSub: { fontSize: 12, color: c.inkMuted, fontWeight: "600" },
  ctaBtn: {
    flex: 1,
    backgroundColor: c.accent,
    borderRadius: btnTheme.radius,
    height: btnTheme.height,
    alignItems: "center",
    justifyContent: "center",
    ...sh.cta,
  },
  ctaBtnMuted: {
    backgroundColor: c.accentSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.accent,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { color: c.surface, fontSize: 15, fontWeight: "800" },
  ctaBtnTextMuted: { color: c.accent },
});
