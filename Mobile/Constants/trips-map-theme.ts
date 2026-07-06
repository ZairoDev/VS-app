/**
 * Trips map tab design tokens.
 * import { tm, WORLD_REGION, tripsMapStyle } from "@/Constants/trips-map-theme"
 */
import type { Region } from "react-native-maps"

export const tm = {
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 8, md: 12, lg: 16, sheet: 24, pill: 999 },
  colors: {
    bg: "#FAFAF9",
    surface: "#FFFFFF",
    ink: "#1C1917",
    inkSecondary: "#57534E",
    inkMuted: "#78716C",
    accent: "#FF6600",
    accentSoft: "#FFF7ED",
    border: "#E7E5E4",
    clusterFill: "#FF6600",
    clusterText: "#FFFFFF",
    pin: "#FF6600",
    error: "#B91C1C",
    skeleton: "#E7E5E4",
  },
  map: {
    maxVisibleMarkers: 80,
    regionDebounceMs: 200,
    cacheTtlMs: 5 * 60 * 1000,
    clusterRadius: 52,
    clusterMaxZoom: 14,
    clusterMinZoom: 1,
    searchAreaThreshold: 0.15,
  },
} as const

export const WORLD_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 60,
  longitudeDelta: 60,
}

export const TAB_BAR_MAP_PADDING = 88

export const tripsMapStyle = [
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#444444" }],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ visibility: "on" }, { color: "#817a7a" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "geometry.stroke",
    stylers: [{ visibility: "on" }, { color: "#685757" }],
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#f2f2f2" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [{ saturation: -100 }, { lightness: 45 }],
  },
  {
    featureType: "road.highway",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ visibility: "on" }, { color: "#e8ecf0" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      { visibility: "on" },
      { weight: "2.02" },
      { lightness: "-3" },
      { saturation: "9" },
      { gamma: "0.90" },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ weight: "2.11" }],
  },
  {
    featureType: "water",
    elementType: "geometry.stroke",
    stylers: [{ visibility: "on" }, { hue: "#ff5900" }],
  },
]
