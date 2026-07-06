import React, { memo, useState } from "react"
import { Platform, StyleSheet, Text, View } from "react-native"
import { Marker } from "react-native-maps"
import type { ServerMapCluster } from "@/types"
import { tm } from "@/Constants/trips-map-theme"

type Props = {
  cluster: ServerMapCluster
  onPress: (cluster: ServerMapCluster) => void
}

function TripsServerClusterMarkerComponent({ cluster, onPress }: Props) {
  const [tracking, setTracking] = useState(Platform.OS === "ios")
  const id = `cluster-${cluster.lat}-${cluster.lng}`

  return (
    <Marker
      identifier={id}
      coordinate={{ latitude: cluster.lat, longitude: cluster.lng }}
      tracksViewChanges={tracking}
      onPress={() => onPress(cluster)}
    >
      <View style={styles.bubble} onLayout={() => setTracking(false)}>
        <Text style={styles.count}>{cluster.count}</Text>
      </View>
    </Marker>
  )
}

export const TripsServerClusterMarker = memo(TripsServerClusterMarkerComponent)

const styles = StyleSheet.create({
  bubble: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tm.colors.clusterFill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  count: {
    color: tm.colors.clusterText,
    fontSize: 13,
    fontWeight: "700",
  },
})
