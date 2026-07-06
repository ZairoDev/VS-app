import type { MapMarkerProperty } from "@/types"
import type { Region } from "react-native-maps"
import { tm } from "@/Constants/trips-map-theme"

export type Bounds = {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export function regionToBounds(region: Region): Bounds {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region
  return {
    minLat: latitude - latitudeDelta / 2,
    maxLat: latitude + latitudeDelta / 2,
    minLng: longitude - longitudeDelta / 2,
    maxLng: longitude + longitudeDelta / 2,
  }
}

export function isInBounds(lat: number, lng: number, bounds: Bounds): boolean {
  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  )
}

export function hasValidCenter(
  p: MapMarkerProperty
): p is MapMarkerProperty & { center: { lat: number; lng: number } } {
  const c = p.center
  return (
    !!c &&
    typeof c.lat === "number" &&
    typeof c.lng === "number" &&
    Number.isFinite(c.lat) &&
    Number.isFinite(c.lng)
  )
}

/**
 * Viewport filter with a hard cap — safety net alongside client-side clustering.
 */
export function filterMarkersInBounds(
  all: MapMarkerProperty[],
  region: Region,
  options?: { maxCount?: number }
): MapMarkerProperty[] {
  const max = options?.maxCount ?? tm.map.maxVisibleMarkers
  const bounds = regionToBounds(region)
  const visible: MapMarkerProperty[] = []

  for (const p of all) {
    if (!hasValidCenter(p)) continue
    if (!isInBounds(p.center.lat, p.center.lng, bounds)) continue
    visible.push(p)
    if (visible.length >= max) break
  }
  return visible
}

export function estimateZoomLevel(region: Region): number {
  return Math.log2(360 / region.latitudeDelta)
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number
): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null
  const debounced = ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T & { cancel: () => void }
  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }
  return debounced
}

export function formatMarkerPrice(basePrice?: number): string {
  if (typeof basePrice !== "number" || !Number.isFinite(basePrice)) return ""
  return `€${Math.round(basePrice)}`
}

export function getMarkerTitle(p: MapMarkerProperty): string {
  return p.title || p.propertyName || "Property"
}

export function boundsToQueryParams(bounds: Bounds, zoom?: number): string {
  const p = new URLSearchParams({
    north: String(bounds.maxLat),
    south: String(bounds.minLat),
    east: String(bounds.maxLng),
    west: String(bounds.minLng),
  })
  if (typeof zoom === "number" && Number.isFinite(zoom)) {
    p.set("zoom", String(Math.round(zoom)))
  }
  return p.toString()
}

/** True when the current region center moved outside the last-fetched bounds. */
export function regionMovedOutsideBounds(
  region: Region,
  lastBounds: Bounds | null,
  threshold = tm.map.searchAreaThreshold
): boolean {
  if (!lastBounds) return false

  const current = regionToBounds(region)
  const latSpan = lastBounds.maxLat - lastBounds.minLat
  const lngSpan = lastBounds.maxLng - lastBounds.minLng
  const padLat = latSpan * threshold
  const padLng = lngSpan * threshold

  const padded = {
    minLat: lastBounds.minLat - padLat,
    maxLat: lastBounds.maxLat + padLat,
    minLng: lastBounds.minLng - padLng,
    maxLng: lastBounds.maxLng + padLng,
  }

  return !(
    current.minLat >= padded.minLat &&
    current.maxLat <= padded.maxLat &&
    current.minLng >= padded.minLng &&
    current.maxLng <= padded.maxLng
  )
}

export function normalizeMarkerFromApi(
  raw: MapMarkerProperty & { location?: { coordinates?: [number, number] } }
): MapMarkerProperty {
  if (hasValidCenter(raw)) return raw

  const coords = raw.location?.coordinates
  if (Array.isArray(coords) && coords.length >= 2) {
    return {
      ...raw,
      center: { lat: coords[1], lng: coords[0] },
    }
  }

  return raw
}

export const USE_BOUNDS_API =
  process.env.EXPO_PUBLIC_USE_BOUNDS_API === "true" ||
  process.env.EXPO_PUBLIC_USE_BOUNDS_API === "1"
