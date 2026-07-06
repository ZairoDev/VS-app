import React from "react";
import { StyleSheet, View } from "react-native";
import { booking } from "@/Constants/booking-theme";

const { colors: c } = booking;

export function ReserveSkeleton() {
  return (
    <>
      <View style={styles.recapSkeleton} />
      <View style={styles.skeletonBlock}>
        <View style={[styles.skeletonLine, { width: "44%" }]} />
        <View style={[styles.skeletonLine, { width: "68%" }]} />
        <View style={[styles.skeletonLine, { width: "56%" }]} />
      </View>
      <View style={styles.skeletonBlock}>
        <View style={[styles.skeletonLine, { width: "40%" }]} />
        <View style={[styles.skeletonLine, { width: "92%", height: 18 }]} />
        <View style={[styles.skeletonLine, { width: "84%", height: 18 }]} />
        <View style={[styles.skeletonLine, { width: "76%", height: 18 }]} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  recapSkeleton: {
    height: 80,
    borderRadius: 18,
    backgroundColor: c.track,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  skeletonBlock: {
    borderRadius: 18,
    backgroundColor: c.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    padding: 16,
    gap: 12,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: c.border,
    opacity: 0.7,
  },
});
