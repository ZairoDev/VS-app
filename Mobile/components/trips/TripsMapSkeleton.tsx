import React from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { tm } from "@/Constants/trips-map-theme"

export function TripsMapSkeleton() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={tm.colors.accent} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: tm.colors.skeleton,
    alignItems: "center",
    justifyContent: "center",
  },
})
