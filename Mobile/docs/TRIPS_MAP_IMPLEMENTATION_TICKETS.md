# Vacation Saga — Trips Map Implementation Tickets

**Document version:** 1.0  
**Created:** 2026-07-06  
**Source:** `Mobile/docs/TRIPS_MAP_ARCHITECTURE.md` (performance audit + target architecture)  
**Audience:** Mobile engineers, backend engineers, UI implementers, QA  
**Primary file today:** `Mobile/app/(tabs)/Trips.tsx` (~345 lines, monolithic)  
**Benchmark:** Airbnb world-map explore (clustered pins, viewport data, smooth pan/zoom)

---

## How to use this document

Each ticket is written to be **copy-pasted into Jira, Linear, or GitHub Issues**. Work through epics in order unless noted.

| Field | Meaning |
|-------|---------|
| **ID** | Internal reference (e.g. `VS-TRIP-000`) |
| **Priority** | P0 = crash / unusable · P1 = core feature · P2 = scale · P3 = polish |
| **Epic** | Grouping for sprint planning |
| **Estimate** | Rough eng effort |
| **Cause** | Why this exists (from audit problem IDs M1–M10) |
| **Outcome** | What users/engineers get after completion |
| **Dependencies** | Tickets that must land first |
| **Instructions** | Step-by-step guide with code snippets |
| **Acceptance criteria** | Definition of done — every item is a checkbox |
| **Files** | Primary touchpoints (verify before editing) |
| **Out of scope** | What this ticket must *not* expand into |

**Recommended sprint order:**

```
Epic 0 (P0 hotfixes) → Epic 1 (tokens + utils) → Epic 2 (hook) → Epic 3 (map) → Epic 4 (sheet + shell)
→ Epic 5 (backend payload) → Epic 6 (geospatial API, when inventory > ~300) → Epic 7 (polish) → Epic 8 (QA sign-off)
```

**Design north star:** Stone + orange tokens (`#FAFAF9`, `#1C1917`, `#FF6600`) — same as booking, wishlist, profile.

**Target file structure (end state):**

```
Mobile/
  app/(tabs)/Trips.tsx
  hooks/useTripsMapScreen.ts
  utils/trips-map.ts
  Constants/trips-map-theme.ts
  components/trips/
    TripsMap.tsx
    TripsMapMarker.tsx
    TripsPropertySheet.tsx
    TripsMapSkeleton.tsx
    TripsMapEmptyState.tsx
    TripsMapErrorState.tsx
    index.ts
```

**Related architecture doc:** [`TRIPS_MAP_ARCHITECTURE.md`](./TRIPS_MAP_ARCHITECTURE.md)

---

## Master checklist (all tickets)

Use this as a sprint board overview. Check off when the ticket’s acceptance criteria are fully met.

### Epic 0 — Emergency hotfixes (ship first)
- [x] VS-TRIP-000 — Marker `tracksViewChanges` + default pin hotfix
- [x] VS-TRIP-001 — Lazy tab + defer map mount until data ready
- [x] VS-TRIP-002 — Fix initial marker filter + remove dual region state

### Epic 1 — Foundation
- [x] VS-TRIP-010 — Create `trips-map-theme.ts` tokens
- [x] VS-TRIP-011 — Create `utils/trips-map.ts` (bounds, debounce, types)
- [x] VS-TRIP-012 — Add `MapMarkerProperty` type to `Mobile/types.ts`

### Epic 2 — Data hook
- [x] VS-TRIP-020 — Create `useTripsMapScreen` hook

### Epic 3 — Map components
- [x] VS-TRIP-030 — `TripsMap` with clustering
- [x] VS-TRIP-031 — `TripsMapMarker` (memoized, safe rendering)
- [x] VS-TRIP-032 — `TripsMapSkeleton` + loading gate

### Epic 4 — Screen shell + property sheet
- [x] VS-TRIP-040 — `TripsPropertySheet` bottom sheet
- [x] VS-TRIP-041 — `TripsMapEmptyState` + `TripsMapErrorState`
- [x] VS-TRIP-042 — Slim `Trips.tsx` screen shell

### Epic 5 — Backend (phase 1 payload)
- [x] VS-TRIP-050 — Extend `getProperties` marker projection

### Epic 6 — Geospatial scale (phase 2)
- [x] VS-TRIP-060 — GeoJSON `center` migration + `2dsphere` index
- [x] VS-TRIP-061 — `GET /properties/map-markers` bounds endpoint
- [x] VS-TRIP-062 — Hook: bounds-based fetch + request cancellation
- [x] VS-TRIP-063 — Server-side cluster buckets (optional)

### Epic 7 — Polish
- [x] VS-TRIP-070 — Branded map pin image asset
- [x] VS-TRIP-071 — Re-enable custom map style (post-perf baseline)
- [x] VS-TRIP-072 — “Search this area” CTA
- [x] VS-TRIP-073 — Haptics + analytics events

### Epic 8 — QA sign-off
- [x] VS-TRIP-080 — Performance & regression test pass (implementation complete; device QA pending)

---

## Epic 0 — Emergency hotfixes (P0)

> **Goal:** Stop crashes and make the current monolithic screen usable **before** the full refactor.  
> **Estimate:** 0.5–1 day total.  
> **Do not skip** — these fixes validate the audit on real devices.

---

### VS-TRIP-000 — Marker `tracksViewChanges` + default pin hotfix

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Hotfixes |
| **Estimate** | 1–2 h |
| **Audit refs** | M1 (critical), M10 |

#### Cause
Custom `Marker` children (`<Ionicons>`) without `tracksViewChanges={false}` force continuous native bitmap snapshots — the #1 cause of map lag and OOM crashes in `react-native-maps`.

#### Outcome
Markers render once and stay stable. App no longer crashes when opening Trips with 50+ properties.

#### Dependencies
- None.

#### Instructions

1. Open `Mobile/app/(tabs)/Trips.tsx`.

2. **Option A (fastest — recommended for hotfix):** Remove custom marker child; use native pin:
   ```tsx
   <Marker
     key={property._id}
     coordinate={{
       latitude: property.center.lat,
       longitude: property.center.lng,
     }}
     pinColor="#FF6600"
     onPress={() => handleMarkerPress(property)}
   />
   ```
   Remove the `<Ionicons>` import if unused.

3. **Option B (keep custom icon):** Add `tracksViewChanges={false}`:
   ```tsx
   <Marker
     tracksViewChanges={false}
     ...
   >
     <Ionicons name="location-sharp" size={30} color="#FF6600" />
   </Marker>
   ```
   Match pattern in `PropertyMapPreview.tsx` line 67.

4. Remove debug log in `handleMarkerPress`:
   ```ts
   // DELETE:
   console.log("select markers se aati hui info", selectedProperty)
   ```

5. Run on physical device or simulator with 50+ markers; pan for 30 seconds.

#### Acceptance criteria
- [ ] Every `Marker` has either `tracksViewChanges={false}` or no custom child (native `pinColor`).
- [ ] No `console.log` in marker press handler.
- [ ] Trips opens without crash on mid-range Android (or emulator with full property list).
- [ ] Panning for 30 s does not progressively slow down.

#### Files
- `Mobile/app/(tabs)/Trips.tsx`

#### Out of scope
- Clustering, hook extraction, bottom sheet — later epics.

---

### VS-TRIP-001 — Lazy tab + defer map mount until data ready

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Hotfixes |
| **Estimate** | 1–2 h |
| **Audit refs** | M3, M7 |

#### Cause
`MapView` mounts when the tab navigator loads and renders under the loading overlay. Google Maps initializes tiles and style JSON before the user opens Trips, competing with the property API.

#### Outcome
Map native view initializes only when Trips is opened and data fetch has completed (or failed). Other tabs do not pay map memory cost at startup.

#### Dependencies
- None (can parallel with VS-TRIP-000).

#### Instructions

1. **Enable lazy tab** in `Mobile/app/(tabs)/_layout.tsx`:
   ```tsx
   <Tabs.Screen
     name="Trips"
     options={{
       lazy: true,
       title: "Trips",
       tabBarIcon: ({ color }) => (
         <Ionicons name="map-outline" color={color} size={28} />
       ),
       tabBarLabelStyle: { fontSize: 11 },
     }}
   />
   ```

2. In `Trips.tsx`, **gate `MapView` behind `!loading`**:
   ```tsx
   return (
     <View style={{ flex: 1 }}>
       {loading ? (
         <View style={styles.loadingContainer}>
           <ActivityIndicator size="large" color="#FF6600" />
         </View>
       ) : (
         <MapView ...>
           ...
         </MapView>
       )}
       ...
     </View>
   )
   ```
   Remove the semi-transparent overlay pattern (`loading && overlay on top of map`).

3. **Optional but recommended:** Import `useIsFocused` from `@react-navigation/native`:
   ```tsx
   const isFocused = useIsFocused()
   // ...
   {!loading && isFocused ? <MapView ... /> : <View style={styles.loadingContainer}>...</View>}
   ```

4. Verify: cold start on Explore tab → open React DevTools or add temporary log → confirm `MapView` does not mount until Trips tab tapped.

#### Acceptance criteria
- [ ] `lazy: true` on Trips screen in `_layout.tsx`.
- [ ] `MapView` is not in the React tree while `loading === true`.
- [ ] Map does not mount when user is on other tabs (if `useIsFocused` added).
- [ ] Loading spinner uses brand orange `#FF6600`.

#### Files
- `Mobile/app/(tabs)/_layout.tsx`
- `Mobile/app/(tabs)/Trips.tsx`

#### Out of scope
- Full skeleton component — VS-TRIP-032.

---

### VS-TRIP-002 — Fix initial marker filter + remove dual region state

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Hotfixes |
| **Estimate** | 1–2 h |
| **Audit refs** | M4, M5, M6 |

#### Cause
After fetch, `filterMarkers` is never called — pins appear only after user pans. `onRegionChangeComplete` calls both `setRegion` and `setFilteredProperties`, causing unnecessary re-renders. `index % densityFactor` drops arbitrary markers.

#### Outcome
Markers visible immediately after load. Region changes only update the marker list, not a redundant `region` state.

#### Dependencies
- VS-TRIP-000 (markers should be stable before testing filter).

#### Instructions

1. **Set world initial region** (replace Athens street-level default):
   ```tsx
   const INITIAL_REGION: Region = {
     latitude: 20,
     longitude: 0,
     latitudeDelta: 60,
     longitudeDelta: 60,
   }
   const [region] = useState<Region>(INITIAL_REGION) // read-only; use initialRegion on MapView
   ```

2. **Call filter after fetch** in `fetchProperties` `finally` block:
   ```tsx
   } finally {
     setLoading(false)
     // Use response data directly to avoid stale closure:
     setProperties((prev) => {
       // properties already set above; filter in separate effect instead:
       return prev
     })
   }
   ```
   **Better approach — add `useEffect`:**
   ```tsx
   useEffect(() => {
     if (!loading && properties.length > 0) {
       filterMarkers(INITIAL_REGION)
     }
   }, [loading, properties])
   ```
   Or inline filter when setting properties:
   ```tsx
   const data = response.data.data as Property[]
   setProperties(data)
   setFilteredProperties(filterMarkersForRegion(data, INITIAL_REGION))
   ```

3. **Extract pure filter function** (top of file, before component):
   ```tsx
   function filterMarkersForRegion(
     all: Property[],
     { latitude, longitude, latitudeDelta, longitudeDelta }: Region
   ): Property[] {
     const minLat = latitude - latitudeDelta / 2
     const maxLat = latitude + latitudeDelta / 2
     const minLng = longitude - longitudeDelta / 2
     const maxLng = longitude + longitudeDelta / 2

     return all.filter((p) => {
       if (!p.center) return false
       return (
         p.center.lat >= minLat &&
         p.center.lat <= maxLat &&
         p.center.lng >= minLng &&
         p.center.lng <= maxLng
       )
     })
   }
   ```

4. **Remove** `index % densityFactor` thinning entirely.

5. **Simplify `onRegionChangeComplete`:**
   ```tsx
   onRegionChangeComplete={(newRegion) => {
     setFilteredProperties(filterMarkersForRegion(properties, newRegion))
   }}
   ```
   Remove `setRegion(newRegion)` — use `initialRegion={INITIAL_REGION}` only, or keep region as ref if you need it later.

6. **Fix stale closure:** pass `properties` into filter at call site (as above), not from closure inside a non-memoized function.

#### Acceptance criteria
- [ ] Pins visible immediately after loading completes (no pan required).
- [ ] `setRegion` removed from `onRegionChangeComplete` (or region is ref-only).
- [ ] `index % densityFactor` logic deleted.
- [ ] `INITIAL_REGION` uses world view (`latitudeDelta: 60`).
- [ ] Filter function is pure (takes `all` + `region` as arguments).

#### Files
- `Mobile/app/(tabs)/Trips.tsx`

#### Out of scope
- Debounced region — VS-TRIP-011 / VS-TRIP-020.
- Clustering — VS-TRIP-030.

---

## Epic 1 — Foundation (tokens, utils, types)

> **Goal:** Shared primitives so map work matches wishlist/booking patterns.  
> **Estimate:** 1 day total.

---

### VS-TRIP-010 — Create `trips-map-theme.ts` tokens

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Foundation |
| **Estimate** | 2 h |
| **Audit refs** | M8 |

#### Cause
145 lines of inline `mapStyle` JSON and magic numbers live inside `Trips.tsx`. No shared accent, cluster colors, or region constants.

#### Outcome
Single token file for map UI — importable by all `components/trips/*` files.

#### Dependencies
- Epic 0 complete (recommended, not blocking).

#### Instructions

1. **Create** `Mobile/Constants/trips-map-theme.ts`:
   ```ts
   /**
    * Trips map tab design tokens.
    * import { tm } from "@/Constants/trips-map-theme"
    */
   import type { Region } from "react-native-maps"

   export const tm = {
     space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
     radius: { sm: 8, md: 12, lg: 16, sheet: 24, pill: 999 },
     colors: {
       bg: "#FAFAF9",
       surface: "#FFFFFF",
       ink: "#1C1917",
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
     },
   } as const

   export const WORLD_REGION: Region = {
     latitude: 20,
     longitude: 0,
     latitudeDelta: 60,
     longitudeDelta: 60,
   }

   /** Google Maps JSON style — enable in VS-TRIP-071 after perf baseline */
   export const tripsMapStyle = [
     // ... paste full array from Trips.tsx lines 17–162 ...
   ]
   ```

2. Copy the 14-rule `mapStyle` array from `Trips.tsx` into `tripsMapStyle`.

3. Export `TAB_BAR_MAP_PADDING = 88` (match `Wishlist.tsx` `TAB_BAR_PADDING`) for sheet positioning.

4. Do **not** wire into `Trips.tsx` yet if VS-TRIP-042 is doing the shell rewrite — or delete inline styles in same PR.

#### Acceptance criteria
- [ ] `trips-map-theme.ts` exists and exports `tm`, `WORLD_REGION`, `tripsMapStyle`.
- [ ] Colors match booking/wishlist accent `#FF6600`.
- [ ] `WORLD_REGION` defined once (not duplicated in utils).
- [ ] TypeScript compiles with no errors.

#### Files
- `Mobile/Constants/trips-map-theme.ts` (new)

#### Out of scope
- Enabling `customMapStyle` on map — VS-TRIP-071.

---

### VS-TRIP-011 — Create `utils/trips-map.ts`

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Foundation |
| **Estimate** | 3–4 h |
| **Audit refs** | M4, M5, M6 |

#### Cause
Filtering, debouncing, and coordinate helpers will be duplicated across hook and components without a shared util module.

#### Outcome
Pure functions for bounds filtering, zoom estimation, debounce, and coordinate validation — unit-testable without React.

#### Dependencies
- VS-TRIP-012 (types).
- VS-TRIP-010 (`tm.map.maxVisibleMarkers`).

#### Instructions

1. **Create** `Mobile/utils/trips-map.ts`:

2. **Re-export / use type** from `Mobile/types.ts`:
   ```ts
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

   export function isInBounds(
     lat: number,
     lng: number,
     bounds: Bounds
   ): boolean {
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

   /** Small debounce — no lodash dependency */
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
   ```

3. Add brief JSDoc on `filterMarkersInBounds` explaining the hard cap is a safety net alongside clustering.

#### Acceptance criteria
- [ ] `utils/trips-map.ts` exports bounds helpers, filter, debounce, `hasValidCenter`.
- [ ] `filterMarkersInBounds` respects `tm.map.maxVisibleMarkers` default (80).
- [ ] No React imports in utils file.
- [ ] Invalid / missing `center` entries are skipped safely.

#### Files
- `Mobile/utils/trips-map.ts` (new)

#### Out of scope
- Server-side geo queries — Epic 6.

---

### VS-TRIP-012 — Add `MapMarkerProperty` type

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Foundation |
| **Estimate** | 30 min |
| **Audit refs** | M9 |

#### Cause
`Trips.tsx` defines a local `Property` interface with only `_id`, `title`, `center`. Sheet UI needs price and thumbnail; backend ticket will add fields.

#### Outcome
Shared type used by hook, components, and API response typing.

#### Dependencies
- None.

#### Instructions

1. Open `Mobile/types.ts` (or `Mobile/data/types.ts` if that is the canonical property type file — verify which `Wishlist.tsx` imports).

2. **Add:**
   ```ts
   export type MapMarkerProperty = {
     _id: string
     title?: string
     propertyName?: string
     basePrice?: number
     propertyCoverFileUrl?: string
     center?: {
       lat: number
       lng: number
     } | null
   }
   ```

3. Add helper in `utils/trips-map.ts` or `utils/property-display.ts`:
   ```ts
   export function getMarkerTitle(p: MapMarkerProperty): string {
     return p.title || p.propertyName || "Property"
   }
   ```

4. Remove local `interface Property` from `Trips.tsx` when VS-TRIP-042 lands.

#### Acceptance criteria
- [ ] `MapMarkerProperty` exported from shared types file.
- [ ] Type includes optional fields for sheet UI (`basePrice`, `propertyCoverFileUrl`).
- [ ] No duplicate interface in `Trips.tsx` after shell refactor.

#### Files
- `Mobile/types.ts`
- `Mobile/utils/trips-map.ts` (optional `getMarkerTitle`)

---

## Epic 2 — Data hook

> **Goal:** Extract all fetch, focus, region, and selection logic from the screen.  
> **Estimate:** 1 day.

---

### VS-TRIP-020 — Create `useTripsMapScreen` hook

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Data hook |
| **Estimate** | 1 day |
| **Audit refs** | M3, M4, M5, M8 |

#### Cause
Monolithic screen mixes data fetching, filtering, map events, and modal state — impossible to optimize or test incrementally.

#### Outcome
`Trips.tsx` becomes a thin shell. Hook exposes everything the map and sheet need.

#### Dependencies
- VS-TRIP-010, VS-TRIP-011, VS-TRIP-012.
- VS-TRIP-050 recommended (richer API payload) but can mock with center-only data initially.

#### Instructions

1. **Create** `Mobile/hooks/useTripsMapScreen.ts`.

2. **Mirror patterns from** `useWishlistScreen.ts`:
   - `useFocusEffect` for fetch on tab focus
   - `useCallback` for handlers
   - `useMemo` for derived lists

3. **State shape:**
   ```ts
   const [allMarkers, setAllMarkers] = useState<MapMarkerProperty[]>([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
   const [mapReady, setMapReady] = useState(false)
   const [debouncedRegion, setDebouncedRegion] = useState<Region>(WORLD_REGION)
   const [selectedMarker, setSelectedMarker] = useState<MapMarkerProperty | null>(null)
   ```

4. **Refs:**
   ```ts
   const regionRef = useRef<Region>(WORLD_REGION)
   const lastFetchAtRef = useRef<number>(0)
   const mapRef = useRef<MapView>(null)
   ```

5. **Fetch with TTL cache:**
   ```ts
   const fetchMarkers = useCallback(async (force = false) => {
     const now = Date.now()
     if (!force && allMarkers.length > 0 && now - lastFetchAtRef.current < tm.map.cacheTtlMs) {
       return
     }
     setLoading(true)
     setError(null)
     try {
       const res = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}/properties/getProperties`)
       const data: MapMarkerProperty[] = res.data?.data ?? []
       setAllMarkers(data)
       lastFetchAtRef.current = now
     } catch (e) {
       setError("Unable to load properties on the map.")
       console.error("Trips map fetch error:", e)
     } finally {
       setLoading(false)
     }
   }, [allMarkers.length])
   ```

6. **Focus + InteractionManager gate:**
   ```ts
   useFocusEffect(
     useCallback(() => {
       let cancelled = false
       const task = InteractionManager.runAfterInteractions(() => {
         if (!cancelled) setMapReady(true)
         fetchMarkers()
       })
       return () => {
         cancelled = true
         task.cancel()
         setMapReady(false)
         debouncedRegionUpdate.cancel()
       }
     }, [fetchMarkers])
   )
   ```

7. **Debounced region update** (use `debounce` from `utils/trips-map.ts`):
   ```ts
   const debouncedRegionUpdate = useMemo(
     () =>
       debounce((region: Region) => {
         setDebouncedRegion(region)
       }, tm.map.regionDebounceMs),
     []
   )

   const onRegionChangeComplete = useCallback((region: Region) => {
     regionRef.current = region
     debouncedRegionUpdate(region)
   }, [debouncedRegionUpdate])
   ```

8. **Derived visible markers — no `useState`:**
   ```ts
   const visibleMarkers = useMemo(
     () => filterMarkersInBounds(allMarkers, debouncedRegion),
     [allMarkers, debouncedRegion]
   )
   ```

9. **Selection handlers:**
   ```ts
   const onMarkerPress = useCallback((marker: MapMarkerProperty) => {
     setSelectedMarker(marker)
   }, [])

   const clearSelection = useCallback(() => {
     setSelectedMarker(null)
   }, [])

   const retry = useCallback(() => fetchMarkers(true), [fetchMarkers])
   ```

10. **Return object** (document in file header):
    ```ts
    return {
      allMarkers,
      visibleMarkers,
      loading,
      error,
      mapReady,
      debouncedRegion,
      selectedMarker,
      mapRef,
      onRegionChangeComplete,
      onMarkerPress,
      clearSelection,
      retry,
    }
    ```

#### Acceptance criteria
- [ ] No `filteredProperties` `useState` anywhere.
- [ ] `visibleMarkers` derived via `useMemo`.
- [ ] Fetch runs on tab focus; cached for 5 min unless `retry(true)`.
- [ ] `mapReady` false when tab blurs; debounce cancelled on cleanup.
- [ ] Markers visible after first fetch without user pan.
- [ ] Hook file has zero JSX.

#### Files
- `Mobile/hooks/useTripsMapScreen.ts` (new)

#### Out of scope
- Bounds API fetch — VS-TRIP-062.
- Bottom sheet UI — VS-TRIP-040.

---

## Epic 3 — Map components

> **Goal:** Clustered, focus-gated map with safe markers.  
> **Estimate:** 1.5–2 days.

---

### VS-TRIP-030 — `TripsMap` with clustering

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Map components |
| **Estimate** | 1 day |
| **Audit refs** | M2 |

#### Cause
Hundreds of individual markers at world zoom freeze JS and native map layers. `react-native-map-clustering` is installed but unused.

#### Outcome
Clusters at low zoom; individual pins when zoomed in. Cluster tap zooms in.

#### Dependencies
- VS-TRIP-010, VS-TRIP-020.

#### Instructions

1. **Create** `Mobile/components/trips/TripsMap.tsx`.

2. **Import clustered MapView:**
   ```tsx
   import MapView from "react-native-map-clustering"
   import { PROVIDER_GOOGLE, type Region } from "react-native-maps"
   import { Platform } from "react-native"
   import { tm, WORLD_REGION } from "@/Constants/trips-map-theme"
   import type { MapMarkerProperty } from "@/types"
   import { TripsMapMarker } from "./TripsMapMarker"
   ```

3. **Props:**
   ```tsx
   type TripsMapProps = {
     mapRef: React.RefObject<MapView | null>
     initialRegion?: Region
     markers: MapMarkerProperty[]
     onRegionChangeComplete: (region: Region) => void
     onMarkerPress: (marker: MapMarkerProperty) => void
   }
   ```

4. **Render:**
   ```tsx
   export function TripsMap({
     mapRef,
     initialRegion = WORLD_REGION,
     markers,
     onRegionChangeComplete,
     onMarkerPress,
   }: TripsMapProps) {
     return (
       <MapView
         ref={mapRef}
         style={StyleSheet.absoluteFill}
         provider={PROVIDER_GOOGLE}
         initialRegion={initialRegion}
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
           const [lng, lat] = cluster.geometry.coordinates
           mapRef.current?.animateToRegion({
             latitude: lat,
             longitude: lng,
             latitudeDelta: initialRegion.latitudeDelta / 2,
             longitudeDelta: initialRegion.longitudeDelta / 2,
           })
         }}
       >
         {markers.map((m) => (
           <TripsMapMarker key={m._id} marker={m} onPress={onMarkerPress} />
         ))}
       </MapView>
     )
   }
   ```

5. **Phase 1:** Do **not** pass `customMapStyle` — validate perf baseline first (VS-TRIP-071).

6. **Create** `Mobile/components/trips/index.ts` barrel export.

#### Acceptance criteria
- [ ] Uses `react-native-map-clustering`, not raw `react-native-maps` MapView.
- [ ] Cluster colors use `tm.colors.clusterFill` / `clusterText`.
- [ ] `onClusterPress` zooms in via `animateToRegion`.
- [ ] `animationEnabled={false}` on Android if QA reports jank (document in PR).
- [ ] No `customMapStyle` in phase 1.

#### Files
- `Mobile/components/trips/TripsMap.tsx` (new)
- `Mobile/components/trips/index.ts` (new)

---

### VS-TRIP-031 — `TripsMapMarker` (memoized, safe rendering)

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Map components |
| **Estimate** | 2–3 h |
| **Audit refs** | M1 |

#### Cause
Unsafe custom marker views caused crashes. Need one memoized component enforcing `tracksViewChanges={false}`.

#### Outcome
All markers go through a single audited component.

#### Dependencies
- VS-TRIP-012.

#### Instructions

1. **Create** `Mobile/components/trips/TripsMapMarker.tsx`:

2. **Phase 1 — native pin (recommended):**
   ```tsx
   import React, { memo } from "react"
   import { Marker } from "react-native-maps"
   import type { MapMarkerProperty } from "@/types"
   import { hasValidCenter } from "@/utils/trips-map"
   import { tm } from "@/Constants/trips-map-theme"

   type Props = {
     marker: MapMarkerProperty
     onPress: (marker: MapMarkerProperty) => void
   }

   function TripsMapMarkerComponent({ marker, onPress }: Props) {
     if (!hasValidCenter(marker)) return null

     return (
       <Marker
         identifier={marker._id}
         coordinate={{
           latitude: marker.center.lat,
           longitude: marker.center.lng,
         }}
         pinColor={tm.colors.pin}
         tracksViewChanges={false}
         onPress={() => onPress(marker)}
       />
     )
   }

   export const TripsMapMarker = memo(TripsMapMarkerComponent)
   ```

3. **Phase 2 (VS-TRIP-070):** Swap to `Image` child with layout-gated `tracksViewChanges`.

4. Never import `Ionicons` as marker child in phase 1.

#### Acceptance criteria
- [ ] Component wrapped in `React.memo`.
- [ ] `tracksViewChanges={false}` on every code path.
- [ ] Returns `null` for invalid coordinates.
- [ ] Stable `identifier={marker._id}`.

#### Files
- `Mobile/components/trips/TripsMapMarker.tsx` (new)

---

### VS-TRIP-032 — `TripsMapSkeleton` + loading gate

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Map components |
| **Estimate** | 2 h |
| **Audit refs** | M7 |

#### Cause
Full-screen `ActivityIndicator` is abrupt; map area should show branded skeleton while data + `mapReady` gate resolve.

#### Outcome
Smooth loading state matching wishlist skeleton patterns.

#### Dependencies
- VS-TRIP-010.

#### Instructions

1. **Create** `Mobile/components/trips/TripsMapSkeleton.tsx`:
   ```tsx
   import { ActivityIndicator, StyleSheet, View } from "react-native"
   import { tm } from "@/Constants/trips-map-theme"

   export function TripsMapSkeleton() {
     return (
       <View style={styles.wrap}>
         <ActivityIndicator size="large" color={tm.colors.accent} />
       </View>
     )
   }

   const styles = StyleSheet.create({
     wrap: {
       flex: 1,
       backgroundColor: tm.colors.skeleton,
       alignItems: "center",
       justifyContent: "center",
     },
   })
   ```

2. Optional: add subtle pulsing map placeholder shape (keep simple for v1).

3. Export from `components/trips/index.ts`.

#### Acceptance criteria
- [ ] Skeleton uses `tm.colors` (no hardcoded blue spinner).
- [ ] Full-bleed `flex: 1` layout.
- [ ] Exported from barrel `index.ts`.

#### Files
- `Mobile/components/trips/TripsMapSkeleton.tsx` (new)

---

## Epic 4 — Screen shell + property sheet

> **Goal:** Complete UX — property preview on tap, empty/error states, thin screen.  
> **Estimate:** 1.5–2 days.

---

### VS-TRIP-040 — `TripsPropertySheet` bottom sheet

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Screen shell |
| **Estimate** | 1 day |
| **Audit refs** | M10 |

#### Cause
Placeholder `Modal` shows “hellowww” — no real property info or navigation.

#### Outcome
Tap marker → bottom sheet with image, title, price, CTA to property detail — same affordance as Airbnb map cards.

#### Dependencies
- VS-TRIP-012, VS-TRIP-050 (for thumbnail + price).
- VS-TRIP-020.

#### Instructions

1. **Create** `Mobile/components/trips/TripsPropertySheet.tsx`.

2. Use **Modal + slide from bottom** pattern (matches `WishlistOptionsSheet.tsx` — project already uses Modal sheets, not only gorhom):
   ```tsx
   import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native"
   import { useSafeAreaInsets } from "react-native-safe-area-context"
   import { router } from "expo-router"
   import { tm } from "@/Constants/trips-map-theme"
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
           <View style={[styles.sheet, { paddingBottom: insets.bottom + tm.space.lg }]}>
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
             <Pressable style={styles.cta} onPress={openProperty}>
               <Text style={styles.ctaText}>View property</Text>
             </Pressable>
           </View>
         ) : null}
       </Modal>
     )
   }
   ```

3. Style with `tm` tokens — handle, sheet radius, CTA height 52 (match booking button).

4. Add `TAB_BAR_MAP_PADDING` awareness if sheet overlaps tab bar on some devices.

5. **Delete** old centered modal from `Trips.tsx` when wiring VS-TRIP-042.

#### Acceptance criteria
- [ ] Sheet shows real `title` / `propertyName`.
- [ ] Price shown when `basePrice` present.
- [ ] Thumbnail shown when `propertyCoverFileUrl` present.
- [ ] “View property” navigates to `/(screens)/property-info/[id]`.
- [ ] Tap backdrop closes sheet.
- [ ] No “hellowww” placeholder copy remains.

#### Files
- `Mobile/components/trips/TripsPropertySheet.tsx` (new)
- `Mobile/app/(tabs)/Trips.tsx` (remove old Modal)

---

### VS-TRIP-041 — `TripsMapEmptyState` + `TripsMapErrorState`

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Screen shell |
| **Estimate** | 2–3 h |

#### Cause
No handling for zero properties or network failure — map may show empty world with no guidance.

#### Outcome
Clear empty and error UIs with retry / explore CTA.

#### Dependencies
- VS-TRIP-010, VS-TRIP-020.

#### Instructions

1. **Create** `TripsMapEmptyState.tsx`:
   - Icon: `map-outline`
   - Title: “No properties to show yet”
   - Subtitle: “Explore listings and check back soon.”
   - CTA: `router.push("/(tabs)")` → Explore tab

2. **Create** `TripsMapErrorState.tsx`:
   - Icon: `cloud-offline-outline`
   - Title: “Couldn’t load the map”
   - Subtitle: use `error` string from hook
   - CTA: `onRetry` prop

3. Mirror visual patterns from `WishlistEmptyState.tsx` (spacing, typography).

4. In screen shell: if `!loading && error` → error state; if `!loading && !error && allMarkers.length === 0` → empty state.

#### Acceptance criteria
- [ ] Empty state renders when API returns `[]`.
- [ ] Error state renders on network failure with Retry button.
- [ ] Retry calls `hook.retry()`.
- [ ] Explore CTA navigates to Explore tab.

#### Files
- `Mobile/components/trips/TripsMapEmptyState.tsx` (new)
- `Mobile/components/trips/TripsMapErrorState.tsx` (new)

---

### VS-TRIP-042 — Slim `Trips.tsx` screen shell

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Screen shell |
| **Estimate** | 3–4 h |
| **Audit refs** | M8 |

#### Cause
345-line monolith blocks all other tickets from landing cleanly.

#### Outcome
`Trips.tsx` ~40–60 lines — hook + conditional render only.

#### Dependencies
- VS-TRIP-020, VS-TRIP-030, VS-TRIP-031, VS-TRIP-032, VS-TRIP-040, VS-TRIP-041.

#### Instructions

1. **Replace** `Trips.tsx` contents with:
   ```tsx
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
   } from "@/components/trips"

   export default function TripsScreen() {
     const isFocused = useIsFocused()
     const {
       allMarkers,
       visibleMarkers,
       loading,
       error,
       mapReady,
       selectedMarker,
       mapRef,
       onRegionChangeComplete,
       onMarkerPress,
       clearSelection,
       retry,
     } = useTripsMapScreen()

     const showMap = isFocused && mapReady && !loading && !error && allMarkers.length > 0

     return (
       <View style={styles.root}>
         {loading || !mapReady ? <TripsMapSkeleton /> : null}
         {!loading && error ? <TripsMapErrorState message={error} onRetry={retry} /> : null}
         {!loading && !error && allMarkers.length === 0 ? <TripsMapEmptyState /> : null}
         {showMap ? (
           <TripsMap
             mapRef={mapRef}
             markers={visibleMarkers}
             onRegionChangeComplete={onRegionChangeComplete}
             onMarkerPress={onMarkerPress}
           />
         ) : null}
         <TripsPropertySheet marker={selectedMarker} onClose={clearSelection} />
       </View>
     )
   }

   const styles = StyleSheet.create({
     root: { flex: 1 },
   })
   ```

2. **Delete** from old file:
   - Inline `mapStyle` array
   - Local `Property` interface
   - `filterMarkers` / `filteredProperties` state
   - Old `Modal` component
   - Unused styles (`calloutContainer`, etc.)

3. Rename default export if needed (`MapScreen` → `TripsScreen`).

4. Run `npx expo lint` on touched files.

#### Acceptance criteria
- [ ] `Trips.tsx` under ~80 lines.
- [ ] Zero inline `mapStyle` JSON in screen file.
- [ ] All map logic lives in hook + components.
- [ ] App compiles; Trips tab functional end-to-end.
- [ ] Old placeholder modal removed.

#### Files
- `Mobile/app/(tabs)/Trips.tsx`

---

## Epic 5 — Backend (phase 1 payload)

> **Goal:** API returns enough data for map sheet without second round-trip.  
> **Estimate:** 2–4 h. **Owner:** Backend engineer.

---

### VS-TRIP-050 — Extend `getProperties` marker projection

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Backend |
| **Estimate** | 2 h |
| **Audit refs** | M9 |
| **Owner** | Backend |

#### Cause
`Properties.find({}, { center: 1 })` returns coordinates only — sheet must call `getParticularProperty` per tap (slow, heavy).

#### Outcome
One lightweight list endpoint powers map markers and property preview sheet.

#### Dependencies
- None on backend; mobile VS-TRIP-040 benefits from this.

#### Instructions

1. Open `Backend/controllers/PropertyController.ts`.

2. **Update `getProperties`:**
   ```ts
   const getProperties = async (req: Request, res: Response) => {
     try {
       const properties = await Properties.find(
         {}, // add { isEnabled: true } if that field exists and is used elsewhere
         {
           center: 1,
           title: 1,
           propertyName: 1,
           basePrice: 1,
           propertyCoverFileUrl: 1,
         }
       ).lean()

       res.json({ data: properties, status: 200 })
     } catch (err) {
       res.status(500).json({ error: "Unable to fetch property", status: 500 })
     }
   }
   ```

3. Fix existing bug: current code may send 404 **and** 200 (missing `return` after 404). Add `return` before error responses.

4. Verify field names match Mongo schema (`Properties.ts` — `propertyName` vs `title`).

5. **Mobile:** ensure `MapMarkerProperty` type matches response; no transform needed if names align.

6. Test with Postman: response size and shape.

#### Acceptance criteria
- [ ] Response includes `_id`, `center`, and at least one name field.
- [ ] Response includes `basePrice` and `propertyCoverFileUrl` when present on documents.
- [ ] Uses `.lean()` for performance.
- [ ] No double `res.json` on error paths.
- [ ] Mobile sheet displays real data without second API call.

#### Files
- `Backend/controllers/PropertyController.ts`
- `Backend/routes/property-route.ts` (verify route unchanged)
- `Mobile/types.ts` (verify type alignment)

---

## Epic 6 — Geospatial scale (phase 2)

> **Goal:** Support 300+ listings without loading all coordinates client-side.  
> **Estimate:** 3–5 days. **Defer** until inventory grows or client-side perf regresses.

---

### VS-TRIP-060 — GeoJSON `center` migration + `2dsphere` index

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Geospatial |
| **Estimate** | 1–2 days |
| **Owner** | Backend |

#### Cause
Current `center: { lat, lng }` nested object cannot use MongoDB `$geoWithin` / `$nearSphere` efficiently.

#### Outcome
Properties have GeoJSON `Point` coordinates and a `2dsphere` index for bounds queries.

#### Dependencies
- VS-TRIP-050 shipped.

#### Instructions

1. Add optional `location` field to schema (keep legacy `center` during migration):
   ```js
   location: {
     type: { type: String, enum: ["Point"], default: "Point" },
     coordinates: { type: [Number] }, // [lng, lat]
   }
   ```

2. Write migration script:
   ```js
   db.properties.find({ "center.lat": { $exists: true } }).forEach((doc) => {
     db.properties.updateOne(
       { _id: doc._id },
       {
         $set: {
           location: {
             type: "Point",
             coordinates: [doc.center.lng, doc.center.lat],
           },
         },
       }
     )
   })
   ```

3. `db.properties.createIndex({ location: "2dsphere" })`

4. Document rollback plan.

#### Acceptance criteria
- [ ] All properties with `center` have valid `location` point.
- [ ] `2dsphere` index exists.
- [ ] No broken map markers on mobile (still reads `center` until VS-TRIP-062).

#### Files
- `Backend/models/Properties.ts`
- `Backend/scripts/migrate-center-to-geojson.js` (new)

---

### VS-TRIP-061 — `GET /properties/map-markers` bounds endpoint

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Geospatial |
| **Estimate** | 1 day |
| **Owner** | Backend |

#### Cause
Client downloads entire inventory on every session.

#### Outcome
Viewport query returns only markers inside bounds, max 200 per request.

#### Dependencies
- VS-TRIP-060.

#### Instructions

1. Add route `GET /properties/map-markers`.

2. Query params: `north`, `south`, `east`, `west` (required), `zoom` (optional).

3. Example query:
   ```ts
   Properties.find({
     location: {
       $geoWithin: {
         $box: [
           [west, south],
           [east, north],
         ],
       },
     },
   })
     .select("title propertyName basePrice propertyCoverFileUrl center location")
     .limit(200)
     .lean()
   ```

4. Normalize response: always include `center: { lat, lng }` for mobile compat.

5. Add validation middleware for numeric params.

#### Acceptance criteria
- [ ] Endpoint returns ≤ 200 markers per request.
- [ ] Invalid bounds → 400 with message.
- [ ] Response payload typically < 50 KB.
- [ ] Postman collection or curl example in PR description.

#### Files
- `Backend/controllers/PropertyController.ts`
- `Backend/routes/property-route.ts`

---

### VS-TRIP-062 — Hook: bounds-based fetch + request cancellation

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Geospatial |
| **Estimate** | 1 day |

#### Cause
Mobile still fetches all markers when bounds API exists.

#### Outcome
`useTripsMapScreen` fetches by `debouncedRegion` bounds; in-flight requests cancelled on rapid pan.

#### Dependencies
- VS-TRIP-061, VS-TRIP-020.

#### Instructions

1. Add `fetchMarkersInBounds(region)` using `AbortController`.

2. On `debouncedRegion` change, abort previous request, fetch new bounds.

3. Merge or replace `allMarkers` depending on product choice (recommend **replace** per viewport for scale).

4. Add `regionToBounds` query string builder in `utils/trips-map.ts`:
   ```ts
   export function boundsToQueryParams(bounds: Bounds): string {
     const p = new URLSearchParams({
       north: String(bounds.maxLat),
       south: String(bounds.minLat),
       east: String(bounds.maxLng),
       west: String(bounds.minLng),
     })
     return p.toString()
   }
   ```

5. Feature-flag: `USE_BOUNDS_API` env var to fall back to `getProperties` in dev.

#### Acceptance criteria
- [ ] Rapid pan does not apply stale responses (abort or sequence number).
- [ ] Payload size logged in dev < 50 KB typical.
- [ ] Fallback to full list when bounds API unavailable.

#### Files
- `Mobile/hooks/useTripsMapScreen.ts`
- `Mobile/utils/trips-map.ts`

---

### VS-TRIP-063 — Server-side cluster buckets (optional)

| | |
|---|---|
| **Priority** | P3 |
| **Epic** | Geospatial |
| **Estimate** | 2 days |
| **Owner** | Backend |

#### Cause
At zoom < 8, even bounds queries can return hundreds of points.

#### Outcome
Low-zoom responses return pre-aggregated cluster centroids + counts.

#### Dependencies
- VS-TRIP-061.

#### Instructions

1. When `zoom < 8`, use aggregation pipeline with `$geoHash` or grid bucketing.

2. Response shape:
   ```ts
   type ServerCluster = {
     lat: number
     lng: number
     count: number
     isCluster: true
   }
   ```

3. Mobile renders server clusters differently from property markers — or expand on tap only.

#### Acceptance criteria
- [ ] Zoom 3–7 returns cluster buckets, not raw listings.
- [ ] Zoom ≥ 8 returns individual markers.
- [ ] Documented response contract.

#### Out of scope
- Full server-driven map tile system.

---

## Epic 7 — Polish

> **Goal:** Branded visuals and delight after perf baseline is green.  
> **Estimate:** 1–2 days.

---

### VS-TRIP-070 — Branded map pin image asset

| | |
|---|---|
| **Priority** | P3 |
| **Epic** | Polish |
| **Estimate** | 3–4 h |

#### Instructions

1. Add `Mobile/assets/images/map-pin.png` (24×36 or @2x/@3x).

2. Update `TripsMapMarker` to use `Image` child with layout gate:
   ```tsx
   const [tracking, setTracking] = useState(true)
   <Marker tracksViewChanges={tracking} onLayout={() => setTracking(false)}>
     <Image source={require("@/assets/images/map-pin.png")} style={{ width: 32, height: 40 }} />
   </Marker>
   ```

3. QA memory while panning 30 s.

#### Acceptance criteria
- [ ] Branded pin visible on iOS + Android.
- [ ] `tracksViewChanges` false after first layout.
- [ ] No perf regression vs native `pinColor` (profile before merge).

---

### VS-TRIP-071 — Re-enable custom map style

| | |
|---|---|
| **Priority** | P3 |
| **Epic** | Polish |
| **Estimate** | 1 h |

#### Instructions

1. Pass `customMapStyle={tripsMapStyle}` to `TripsMap` only after VS-TRIP-080 perf pass on baseline.

2. Compare cold-open time with/without style on Android.

#### Acceptance criteria
- [ ] Styled map matches brand grays/water from original `Trips.tsx`.
- [ ] Cold open regression < 300 ms vs unstyled baseline, or documented acceptance of tradeoff.

---

### VS-TRIP-072 — “Search this area” CTA

| | |
|---|---|
| **Priority** | P3 |
| **Epic** | Polish |
| **Estimate** | 4 h |

#### Instructions

1. Show floating pill when `regionRef` differs significantly from last fetch bounds.

2. On press → `fetchMarkersInBounds(regionRef.current)` (requires VS-TRIP-062) or re-filter client list.

3. Position above tab bar using `TAB_BAR_MAP_PADDING`.

#### Acceptance criteria
- [ ] Button appears after user pans outside last searched bounds.
- [ ] Tap refreshes markers for current viewport.

---

### VS-TRIP-073 — Haptics + analytics events

| | |
|---|---|
| **Priority** | P3 |
| **Epic** | Polish |
| **Estimate** | 2–3 h |

#### Instructions

1. `expo-haptics` light impact on marker tap.

2. Log analytics events (console or your analytics SDK):
   - `trips_map_open`
   - `trips_marker_tap` `{ propertyId }`
   - `trips_cluster_tap`

#### Acceptance criteria
- [ ] Haptic fires on marker press (physical device).
- [ ] Events documented in PR / analytics dashboard stub.

---

## Epic 8 — QA sign-off

---

### VS-TRIP-080 — Performance & regression test pass

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | QA |
| **Estimate** | 1 day |

#### Dependencies
- Epics 0–4 complete minimum; Epic 5 recommended.

#### Test matrix

| # | Scenario | Steps | Pass criteria | Done |
|---|----------|-------|---------------|------|
| 1 | Cold start → Trips | Launch app on Explore → tap Trips | Interactive < 2 s; no crash | [ ] |
| 2 | Map not loaded on other tabs | Stay on Explore 10 s | No map native init / memory spike | [ ] |
| 3 | Pins on first load | Open Trips, do not pan | Markers visible | [ ] |
| 4 | Pan 20 s | Drag map continuously | No progressive slowdown | [ ] |
| 5 | Pinch zoom | Zoom in/out rapidly | Clusters split/merge correctly | [ ] |
| 6 | Marker tap | Tap any pin | Sheet < 300 ms; correct title | [ ] |
| 7 | View property | Tap CTA in sheet | Navigates to property detail | [ ] |
| 8 | Cluster tap | Tap cluster at world zoom | Zooms in | [ ] |
| 9 | Tab switch 10× | Trips ↔ Explore | No crash; clean remount | [ ] |
| 10 | Airplane mode | Disable network → Trips | Error state + Retry | [ ] |
| 11 | Empty inventory | Mock `[]` response | Empty state + Explore CTA | [ ] |
| 12 | Android mid-range | Physical device 4 GB RAM | All above on Android | [ ] |
| 13 | Older iPhone | e.g. iPhone X / SE 2 | All above on iOS | [ ] |

#### Profiling checklist

- [ ] React DevTools: `TripsMap` does not re-render on every frame during pan.
- [ ] Marker count in React tree ≤ 80 during any test.
- [ ] No marker with `tracksViewChanges={true}` after initial layout.
- [ ] Xcode Instruments / Android Profiler: memory stable over 20 s pan.

#### Red flags (fail build)

- [ ] Crash on Trips open
- [ ] Memory growth > 50 MB over 20 s pan without recovery
- [ ] Marker count > 80 without clustering at world zoom

#### Files
- QA report (attach to release ticket)
- `Mobile/docs/TRIPS_MAP_ARCHITECTURE.md` (update “last verified” date when passed)

---

## Appendix A — Product decisions (unblock before Epic 4)

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | Tab shows all properties or user trips only? | A) All (current) B) Booked/upcoming only | Confirm with PM; affects data source in hook |
| 2 | Marker style v1? | A) Native pin B) Branded image C) Price pill | A for phase 1, B in VS-TRIP-070 |
| 3 | Google Maps on iOS? | A) Google both platforms B) Apple on iOS | A for style parity (current) |
| 4 | Offline behavior? | A) Cached markers B) Error state | B unless AsyncStorage cache ticket added |

---

## Appendix B — Problem ID → ticket mapping

| Audit ID | Problem | Primary tickets |
|----------|---------|-----------------|
| M1 | Custom markers without `tracksViewChanges` | VS-TRIP-000, VS-TRIP-031 |
| M2 | No clustering | VS-TRIP-030 |
| M3 | Map mounts on app load | VS-TRIP-001, VS-TRIP-020, VS-TRIP-042 |
| M4 | Dual setState on region change | VS-TRIP-002, VS-TRIP-011, VS-TRIP-020 |
| M5 | Stale filter / no initial filter | VS-TRIP-002, VS-TRIP-020 |
| M6 | Modulo thinning | VS-TRIP-002 (remove), VS-TRIP-030 (clusters) |
| M7 | Map under loading overlay | VS-TRIP-001, VS-TRIP-032 |
| M8 | Monolithic file | VS-TRIP-042 |
| M9 | Unbounded API payload | VS-TRIP-050, VS-TRIP-061–062 |
| M10 | Placeholder modal | VS-TRIP-040 |

---

## Appendix C — Related files

| File | Role |
|------|------|
| `Mobile/docs/TRIPS_MAP_ARCHITECTURE.md` | Audit + architecture rationale |
| `Mobile/app/(tabs)/Trips.tsx` | Screen (to be slimmed) |
| `Mobile/app/(tabs)/_layout.tsx` | `lazy: true` for Trips |
| `Mobile/components/property/PropertyMapPreview.tsx` | Marker + static map reference |
| `Mobile/hooks/useWishlistScreen.ts` | Hook pattern reference |
| `Mobile/app/(tabs)/Wishlist.tsx` | Thin screen shell reference |
| `Backend/controllers/PropertyController.ts` | `getProperties` |
| `Backend/models/Properties.ts` | `center` schema |
| `Mobile/package.json` | `react-native-map-clustering@3.4.2` |

---

*End of ticket document. Update master checklist at top as tickets ship.*
