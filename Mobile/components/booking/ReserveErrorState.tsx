import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { booking } from "@/Constants/booking-theme";

const { colors: c, shadow: sh, button: btnTheme } = booking;

type ReserveErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ReserveErrorState({ message, onRetry }: ReserveErrorStateProps) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>Couldn't load property</Text>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={[styles.errorBtn, styles.retryBtn]} onPress={onRetry} activeOpacity={0.85}>
        <Text style={styles.retryBtnText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  errorCard: {
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    padding: 16,
    gap: 10,
  },
  errorTitle: { fontSize: 16, fontWeight: "800", color: c.ink },
  errorText: { fontSize: 13, lineHeight: 18, color: c.inkMuted, fontWeight: "600" },
  errorBtn: { marginTop: 6 },
  retryBtn: {
    backgroundColor: c.accent,
    borderRadius: btnTheme.radius,
    height: btnTheme.height,
    alignItems: "center",
    justifyContent: "center",
    ...sh.cta,
  },
  retryBtnText: { color: c.surface, fontSize: 15, fontWeight: "800" },
});
