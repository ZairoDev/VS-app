import React from "react"
import { Platform, StyleSheet } from "react-native"
import MapView from "react-native-map-clustering"
import RNMapView, { PROVIDER_GOOGLE, type Region } from "react-native-maps"
import type { MapMarkerProperty, ServerMapCluster } from "@/types"
import { tm, tripsMapStyle, WORLD_REGION } from "@/Constants/trips-map-theme"
import { TripsMapMarker } from "./TripsMapMarker"
import { TripsServerClusterMarker } from "./TripsServerClusterMarker"

type TripsMapProps = {
  mapRef: React.RefObject<InstanceType<typeof RNMapView> | null>
  initialRegion?: Region
  markers: MapMarkerProperty[]
  serverClusters?: ServerMapCluster[]
  onRegionChangeComplete: (region: Region) => void
  onMarkerPress: (marker: MapMarkerProperty) => void
  onClusterPress?: (cluster: ServerMapCluster) => void
  onClientClusterPress?: () => void
  useCustomMapStyle?: boolean
}

export function TripsMap({
  mapRef,
  initialRegion = WORLD_REGION,
  markers,
  serverClusters = [],
  onRegionChangeComplete,
  onMarkerPress,
  onClusterPress,
  onClientClusterPress,
  useCustomMapStyle = true,
}: TripsMapProps) {
  const showServerClusters = serverClusters.length > 0

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      customMapStyle={useCustomMapStyle ? tripsMapStyle : undefined}
      onRegionChangeComplete={onRegionChangeComplete}
      clusterColor={tm.colors.clusterFill}
      clusterTextColor={tm.colors.clusterText}
      radius={tm.map.clusterRadius}
      maxZoom={tm.map.clusterMaxZoom}
      minZoom={tm.map.clusterMinZoom}
      animationEnabled={Platform.OS === "ios"}
      spiralEnabled={false}
      showsUserLocation={false}
      showsMyLocationButton={false}
      onClusterPress={(cluster) => {
        onClientClusterPress?.()
        const [lng, lat] = cluster.geometry.coordinates
        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: initialRegion.latitudeDelta / 2,
          longitudeDelta: initialRegion.longitudeDelta / 2,
        })
      }}
    >
      {showServerClusters
        ? serverClusters.map((cluster) => (
            <TripsServerClusterMarker
              key={`${cluster.lat}-${cluster.lng}`}
              cluster={cluster}
              onPress={(c) => onClusterPress?.(c)}
            />
          ))
        : markers.map((m) => (
            <TripsMapMarker key={m._id} marker={m} onPress={onMarkerPress} />
          ))}
    </MapView>
  )
}
