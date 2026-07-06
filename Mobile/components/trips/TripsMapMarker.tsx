import React, { memo, useState } from "react"
import { Image, Platform, StyleSheet, View } from "react-native"
import { Marker } from "react-native-maps"
import type { MapMarkerProperty } from "@/types"
import { hasValidCenter } from "@/utils/trips-map"
import { tm } from "@/Constants/trips-map-theme"

type Props = {
  marker: MapMarkerProperty
  onPress: (marker: MapMarkerProperty) => void
}

function TripsMapMarkerComponent({ marker, onPress }: Props) {
  const [tracking, setTracking] = useState(Platform.OS === "ios")

  if (!hasValidCenter(marker)) return null

  return (
    <Marker
      identifier={marker._id}
      coordinate={{
        latitude: marker.center.lat,
        longitude: marker.center.lng,
      }}
      tracksViewChanges={tracking}
      onPress={() => onPress(marker)}
    >
      <Image
        source={require("@/assets/images/map-pin.png")}
        style={styles.pin}
        resizeMode="contain"
        onLayout={() => setTracking(false)}
      />
    </Marker>
  )
}

export const TripsMapMarker = memo(TripsMapMarkerComponent)

const styles = StyleSheet.create({
  pin: {
    width: 32,
    height: 40,
  },
})
