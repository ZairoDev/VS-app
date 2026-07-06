import React from "react"
import { StyleSheet, View } from "react-native"
import { useIsFocused } from "@react-navigation/native"
import { useTripsMapScreen } from "@/hooks/useTripsMapScreen"
import {
  TripsMap,
  TripsMapSkeleton,
  TripsMapEmptyState,
  TripsMapErrorState,
  TripsPropertySheet,
  TripsSearchAreaButton,
} from "@/components/trips"

export default function TripsScreen() {
  const isFocused = useIsFocused()
  const {
    allMarkers,
    visibleMarkers,
    serverClusters,
    loading,
    error,
    mapReady,
    selectedMarker,
    mapRef,
    showSearchArea,
    onRegionChangeComplete,
    onMarkerPress,
    onServerClusterPress,
    onClientClusterPress,
    clearSelection,
    retry,
    searchThisArea,
  } = useTripsMapScreen()

  const hasMapData = allMarkers.length > 0 || serverClusters.length > 0
  const showMap = isFocused && mapReady && !loading && !error && hasMapData

  return (
    <View style={styles.root}>
      {loading || !mapReady ? <TripsMapSkeleton /> : null}
      {!loading && error ? <TripsMapErrorState message={error} onRetry={retry} /> : null}
      {!loading && !error && !hasMapData ? <TripsMapEmptyState /> : null}
      {showMap ? (
        <>
          <TripsMap
            mapRef={mapRef}
            markers={visibleMarkers}
            serverClusters={serverClusters}
            onRegionChangeComplete={onRegionChangeComplete}
            onMarkerPress={onMarkerPress}
            onClusterPress={onServerClusterPress}
            onClientClusterPress={onClientClusterPress}
            useCustomMapStyle
          />
          <TripsSearchAreaButton visible={showSearchArea} onPress={searchThisArea} />
        </>
      ) : null}
      <TripsPropertySheet marker={selectedMarker} onClose={clearSelection} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
