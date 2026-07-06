import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { tm } from "@/Constants/trips-map-theme"

export function TripsMapEmptyState() {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name="map-outline" size={40} color={tm.colors.accent} />
      </View>
      <Text style={styles.title}>No properties to show yet</Text>
      <Text style={styles.message}>Explore listings and check back soon.</Text>
      <Pressable
        style={styles.primaryBtn}
        onPress={() => router.push("/(tabs)")}
        accessibilityRole="button"
      >
        <Text style={styles.primaryBtnText}>Explore stays</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tm.space.lg,
    paddingBottom: 80,
    backgroundColor: tm.colors.bg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: tm.colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tm.space.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: tm.colors.ink,
    textAlign: "center",
    marginBottom: tm.space.sm,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: tm.colors.inkSecondary,
    textAlign: "center",
    maxWidth: 300,
    marginBottom: tm.space.lg,
  },
  primaryBtn: {
    width: "100%",
    maxWidth: 280,
    height: 52,
    borderRadius: tm.radius.md,
    backgroundColor: tm.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
})
