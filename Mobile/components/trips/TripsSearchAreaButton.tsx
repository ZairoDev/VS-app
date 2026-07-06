import React from "react"
import { Pressable, StyleSheet, Text } from "react-native"
import { TAB_BAR_MAP_PADDING, tm } from "@/Constants/trips-map-theme"

type Props = {
  visible: boolean
  onPress: () => void
}

export function TripsSearchAreaButton({ visible, onPress }: Props) {
  if (!visible) return null

  return (
    <Pressable
      style={styles.pill}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Search this area"
    >
      <Text style={styles.label}>Search this area</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    backgroundColor: tm.colors.surface,
    paddingHorizontal: tm.space.lg,
    paddingVertical: tm.space.sm,
    borderRadius: tm.radius.pill,
    borderWidth: 1,
    borderColor: tm.colors.border,
    shadowColor: tm.colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
    marginBottom: TAB_BAR_MAP_PADDING,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: tm.colors.ink,
  },
})
