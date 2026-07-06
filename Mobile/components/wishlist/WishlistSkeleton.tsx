import React from "react"
import { StyleSheet, View } from "react-native"
import { wl } from "@/Constants/wishlist-theme"

function SkeletonBlock({
  width,
  height,
  radius = wl.radius.sm,
  style,
}: {
  width: number | `${number}%`
  height: number
  radius?: number
  style?: object
}) {
  return <View style={[styles.block, { width, height, borderRadius: radius }, style]} />
}

export function WishlistSkeletonList() {
  return (
    <View style={styles.wrap}>
      {[0, 1].map((i) => (
        <View key={i} style={styles.card}>
          <SkeletonBlock width="100%" height={260} radius={wl.radius.xl} />
          <View style={styles.body}>
            <SkeletonBlock width="75%" height={18} />
            <SkeletonBlock width="50%" height={14} style={{ marginTop: wl.space.sm }} />
            <View style={styles.row}>
              <SkeletonBlock width={72} height={14} />
              <SkeletonBlock width={56} height={14} />
            </View>
            <SkeletonBlock width={100} height={20} style={{ marginTop: wl.space.md }} />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: wl.space.lg,
    paddingTop: wl.space.md,
  },
  card: {
    marginBottom: wl.space.xxl,
    backgroundColor: wl.colors.surface,
    borderRadius: wl.radius.xl,
    overflow: "hidden",
  },
  block: {
    backgroundColor: "#E7E5E4",
    opacity: 0.7,
  },
  body: {
    padding: wl.space.lg,
  },
  row: {
    flexDirection: "row",
    gap: wl.space.md,
    marginTop: wl.space.md,
  },
})
