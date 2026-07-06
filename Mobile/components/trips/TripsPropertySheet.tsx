import React from "react"
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { router } from "expo-router"
import { TAB_BAR_MAP_PADDING, tm } from "@/Constants/trips-map-theme"
import type { MapMarkerProperty } from "@/types"
import { formatMarkerPrice, getMarkerTitle } from "@/utils/trips-map"

type Props = {
  marker: MapMarkerProperty | null
  onClose: () => void
}

export function TripsPropertySheet({ marker, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const visible = !!marker

  const openProperty = () => {
    if (!marker) return
    onClose()
    router.push(`/(screens)/property-info/${marker._id}`)
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      {marker ? (
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, TAB_BAR_MAP_PADDING / 2) + tm.space.lg },
          ]}
        >
          <View style={styles.handle} />
          {marker.propertyCoverFileUrl ? (
            <Image source={{ uri: marker.propertyCoverFileUrl }} style={styles.image} />
          ) : null}
          <Text style={styles.title}>{getMarkerTitle(marker)}</Text>
          {marker.basePrice ? (
            <Text style={styles.price}>
              {formatMarkerPrice(marker.basePrice)}
              <Text style={styles.priceSuffix}> / night</Text>
            </Text>
          ) : null}
          <Pressable style={styles.cta} onPress={openProperty} accessibilityRole="button">
            <Text style={styles.ctaText}>View property</Text>
          </Pressable>
        </View>
      ) : null}
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: tm.colors.surface,
    borderTopLeftRadius: tm.radius.sheet,
    borderTopRightRadius: tm.radius.sheet,
    paddingHorizontal: tm.space.lg,
    paddingTop: tm.space.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: tm.colors.border,
    alignSelf: "center",
    marginBottom: tm.space.md,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: tm.radius.md,
    marginBottom: tm.space.md,
    backgroundColor: tm.colors.skeleton,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: tm.colors.ink,
    marginBottom: tm.space.xs,
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: tm.colors.ink,
    marginBottom: tm.space.lg,
  },
  priceSuffix: {
    fontSize: 14,
    fontWeight: "500",
    color: tm.colors.inkMuted,
  },
  cta: {
    height: 52,
    borderRadius: tm.radius.md,
    backgroundColor: tm.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tm.space.sm,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
})
