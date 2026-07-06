/**
 * Trips map analytics stub (VS-TRIP-073).
 * Replace console.log with your analytics SDK when integrated.
 */
export type TripsMapAnalyticsEvent =
  | "trips_map_open"
  | "trips_marker_tap"
  | "trips_cluster_tap"
  | "trips_search_area"

export function logTripsMapEvent(
  event: TripsMapAnalyticsEvent,
  payload?: Record<string, string | number | boolean>
): void {
  if (__DEV__) {
    console.log(`[trips-map] ${event}`, payload ?? {})
  }
}
