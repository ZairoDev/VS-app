/**
 * Trips map screen state: fetch, region debounce, selection, bounds API.
 * @see Mobile/docs/TRIPS_MAP_IMPLEMENTATION_TICKETS.md VS-TRIP-020
 */
import { useCallback, useMemo, useRef, useState } from "react"
import { InteractionManager } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import axios from "axios"
import RNMapView, { type Region } from "react-native-maps"
import * as Haptics from "expo-haptics"
import type { MapMarkerProperty, MapMarkersApiResponse, ServerMapCluster } from "@/types"
import { tm, WORLD_REGION } from "@/Constants/trips-map-theme"
import { logTripsMapEvent } from "@/utils/trips-analytics"
import {
  boundsToQueryParams,
  debounce,
  estimateZoomLevel,
  filterMarkersInBounds,
  normalizeMarkerFromApi,
  regionMovedOutsideBounds,
  regionToBounds,
  USE_BOUNDS_API,
  type Bounds,
} from "@/utils/trips-map"

export function useTripsMapScreen() {
  const [allMarkers, setAllMarkers] = useState<MapMarkerProperty[]>([])
  const [serverClusters, setServerClusters] = useState<ServerMapCluster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [debouncedRegion, setDebouncedRegion] = useState<Region>(WORLD_REGION)
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerProperty | null>(null)
  const [showSearchArea, setShowSearchArea] = useState(false)

  const regionRef = useRef<Region>(WORLD_REGION)
  const lastFetchAtRef = useRef<number>(0)
  const lastFetchedBoundsRef = useRef<Bounds | null>(null)
  const mapRef = useRef<InstanceType<typeof RNMapView>>(null)
  const abortRef = useRef<AbortController | null>(null)
  const fetchSeqRef = useRef(0)
  const hasLoggedOpenRef = useRef(false)

  const fetchAllMarkers = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && allMarkers.length > 0 && now - lastFetchAtRef.current < tm.map.cacheTtlMs) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await axios.get<MapMarkersApiResponse>(
        `${process.env.EXPO_PUBLIC_BASE_URL}/properties/getProperties`
      )
      const data = (res.data?.data ?? []).map(normalizeMarkerFromApi)
      setAllMarkers(data)
      setServerClusters([])
      lastFetchAtRef.current = now
      lastFetchedBoundsRef.current = regionToBounds(WORLD_REGION)
      setShowSearchArea(false)
    } catch (e) {
      setError("Unable to load properties on the map.")
      console.error("Trips map fetch error:", e)
    } finally {
      setLoading(false)
    }
  }, [allMarkers.length])

  const fetchMarkersInBounds = useCallback(
    async (region: Region, force = false) => {
      const now = Date.now()
      const bounds = regionToBounds(region)
      const zoom = estimateZoomLevel(region)

      if (
        !force &&
        allMarkers.length > 0 &&
        now - lastFetchAtRef.current < tm.map.cacheTtlMs &&
        !regionMovedOutsideBounds(region, lastFetchedBoundsRef.current)
      ) {
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const seq = ++fetchSeqRef.current

      if (!allMarkers.length) setLoading(true)
      setError(null)

      try {
        const query = boundsToQueryParams(bounds, zoom)
        const res = await axios.get<MapMarkersApiResponse>(
          `${process.env.EXPO_PUBLIC_BASE_URL}/properties/map-markers?${query}`,
          { signal: controller.signal }
        )

        if (seq !== fetchSeqRef.current) return

        const clusters = res.data?.clusters ?? []
        const markers = (res.data?.data ?? []).map(normalizeMarkerFromApi)

        if (clusters.length > 0) {
          setServerClusters(clusters)
          setAllMarkers([])
        } else {
          setAllMarkers(markers)
          setServerClusters([])
        }

        lastFetchAtRef.current = now
        lastFetchedBoundsRef.current = bounds
        setShowSearchArea(false)

        if (__DEV__) {
          const size = JSON.stringify(res.data).length
          console.log(`[trips-map] bounds fetch ~${size} bytes, markers=${markers.length}, clusters=${clusters.length}`)
        }
      } catch (e) {
        if (axios.isCancel(e) || (e as { name?: string })?.name === "CanceledError") return
        if (seq !== fetchSeqRef.current) return

        // Fallback to full list when bounds API unavailable
        if (USE_BOUNDS_API) {
          console.warn("Bounds API failed, falling back to getProperties", e)
          await fetchAllMarkers(true)
        } else {
          setError("Unable to load properties on the map.")
          console.error("Trips map bounds fetch error:", e)
        }
      } finally {
        if (seq === fetchSeqRef.current) setLoading(false)
      }
    },
    [allMarkers.length, fetchAllMarkers]
  )

  const fetchMarkers = useCallback(
    async (force = false, region?: Region) => {
      if (USE_BOUNDS_API) {
        await fetchMarkersInBounds(region ?? regionRef.current, force)
      } else {
        await fetchAllMarkers(force)
      }
    },
    [fetchAllMarkers, fetchMarkersInBounds]
  )

  const debouncedRegionUpdate = useMemo(
    () =>
      debounce((region: Region) => {
        setDebouncedRegion(region)
        if (USE_BOUNDS_API) {
          setShowSearchArea(regionMovedOutsideBounds(region, lastFetchedBoundsRef.current))
        } else {
          setShowSearchArea(
            regionMovedOutsideBounds(region, lastFetchedBoundsRef.current)
          )
        }
      }, tm.map.regionDebounceMs),
    []
  )

  useFocusEffect(
    useCallback(() => {
      let cancelled = false

      const task = InteractionManager.runAfterInteractions(() => {
        if (cancelled) return
        setMapReady(true)
        if (!hasLoggedOpenRef.current) {
          hasLoggedOpenRef.current = true
          logTripsMapEvent("trips_map_open")
        }
        fetchMarkers()
      })

      return () => {
        cancelled = true
        task.cancel()
        setMapReady(false)
        debouncedRegionUpdate.cancel()
        abortRef.current?.abort()
      }
    }, [debouncedRegionUpdate, fetchMarkers])
  )

  const onRegionChangeComplete = useCallback(
    (region: Region) => {
      regionRef.current = region
      debouncedRegionUpdate(region)
    },
    [debouncedRegionUpdate]
  )

  const visibleMarkers = useMemo(
    () =>
      serverClusters.length > 0
        ? []
        : filterMarkersInBounds(allMarkers, debouncedRegion),
    [allMarkers, debouncedRegion, serverClusters.length]
  )

  const onMarkerPress = useCallback((marker: MapMarkerProperty) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    logTripsMapEvent("trips_marker_tap", { propertyId: marker._id })
    setSelectedMarker(marker)
  }, [])

  const onServerClusterPress = useCallback((cluster: ServerMapCluster) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    logTripsMapEvent("trips_cluster_tap", { count: cluster.count })
    mapRef.current?.animateToRegion({
      latitude: cluster.lat,
      longitude: cluster.lng,
      latitudeDelta: debouncedRegion.latitudeDelta / 2,
      longitudeDelta: debouncedRegion.longitudeDelta / 2,
    })
  }, [debouncedRegion.latitudeDelta, debouncedRegion.longitudeDelta])

  const onClientClusterPress = useCallback(() => {
    logTripsMapEvent("trips_cluster_tap")
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedMarker(null)
  }, [])

  const retry = useCallback(() => fetchMarkers(true), [fetchMarkers])

  const searchThisArea = useCallback(() => {
    logTripsMapEvent("trips_search_area")
    if (USE_BOUNDS_API) {
      fetchMarkers(true, regionRef.current)
    } else {
      lastFetchedBoundsRef.current = regionToBounds(regionRef.current)
      setDebouncedRegion({ ...regionRef.current })
      setShowSearchArea(false)
    }
  }, [fetchMarkers])

  return {
    allMarkers,
    visibleMarkers,
    serverClusters,
    loading,
    error,
    mapReady,
    debouncedRegion,
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
  }
}
