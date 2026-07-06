import React, { useMemo, useState } from "react"
import { Image, Platform, StyleSheet, Text, View } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { Ionicons } from "@expo/vector-icons"
import { booking } from "@/Constants/booking-theme"

const { colors: c } = booking

const MAP_HEIGHT = 180
const PREVIEW_DELTA = 0.012

type PropertyMapPreviewProps = {
  latitude?: number | null
  longitude?: number | null
  label?: string
}

function buildStaticMapUri(latitude: number, longitude: number): string | null {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) return null

  const params = new URLSearchParams({
    center: `${latitude},${longitude}`,
    zoom: "14",
    size: "640x360",
    scale: "2",
    maptype: "roadmap",
    markers: `color:0xFF6600|${latitude},${longitude}`,
    key: apiKey,
  })

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`
}

function LiveMapPreview({
  latitude,
  longitude,
  label,
}: {
  latitude: number
  longitude: number
  label?: string
}) {
  const region = {
    latitude,
    longitude,
    latitudeDelta: PREVIEW_DELTA,
    longitudeDelta: PREVIEW_DELTA,
  }

  return (
    <View style={styles.mapWrap} accessibilityLabel={label ?? "Map preview"}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        liteMode={Platform.OS === "android"}
        pointerEvents="none"
      >
        <Marker coordinate={{ latitude, longitude }} tracksViewChanges={false}>
          <Ionicons name="location-sharp" size={28} color={c.accent} />
        </Marker>
      </MapView>
    </View>
  )
}

export function PropertyMapPreview({ latitude, longitude, label }: PropertyMapPreviewProps) {
  const [staticFailed, setStaticFailed] = useState(false)

  const hasCoords =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)

  const staticMapUri = useMemo(() => {
    if (!hasCoords) return null
    return buildStaticMapUri(latitude!, longitude!)
  }, [hasCoords, latitude, longitude])

  if (!hasCoords) {
    return (
      <View style={styles.fallback} accessibilityLabel="Map preview unavailable">
        <Ionicons name="map-outline" size={22} color={c.inkMuted} />
        <Text style={styles.fallbackTitle}>Exact location shared after booking</Text>
        <Text style={styles.fallbackSub}>Tap to open the area in Maps</Text>
      </View>
    )
  }

  if (staticMapUri && !staticFailed) {
    return (
      <View style={styles.mapWrap} accessibilityLabel={label ?? "Map preview"}>
        <Image
          source={{ uri: staticMapUri }}
          style={styles.mapImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          onError={() => setStaticFailed(true)}
        />
      </View>
    )
  }

  return <LiveMapPreview latitude={latitude!} longitude={longitude!} label={label} />
}

const styles = StyleSheet.create({
  mapWrap: {
    height: MAP_HEIGHT,
    backgroundColor: c.track,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.border,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    height: MAP_HEIGHT,
    backgroundColor: c.track,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 20,
  },
  fallbackTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: c.inkMuted,
    textAlign: "center",
  },
  fallbackSub: {
    fontSize: 12,
    fontWeight: "600",
    color: c.inkPlaceholder,
    textAlign: "center",
  },
})
