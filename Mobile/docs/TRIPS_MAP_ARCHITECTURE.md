# Trips Map — Performance Audit & Architecture Guide

**Document version:** 1.1  
**Created:** 2026-07-06  
**Primary file audited:** `Mobile/app/(tabs)/Trips.tsx` (~345 lines)  
**Related backend:** `GET /properties/getProperties` → `PropertyController.getProperties`  
**Benchmark:** Airbnb world-map explore (clustered pins, viewport-based data, smooth pan/zoom)  
**Audience:** Mobile engineers, backend engineers, QA  
**Implementation tickets:** [`TRIPS_MAP_IMPLEMENTATION_TICKETS.md`](./TRIPS_MAP_IMPLEMENTATION_TICKETS.md) — full checklist, step-by-step guides, acceptance criteria

---

## Executive summary

The Trips tab renders a full-screen Google Map with one custom `Marker` per visible property. On real devices this causes **severe jank, memory pressure, and occasional native crashes** — especially on Android and on older iPhones.

The root cause is not “maps are slow.” It is a combination of:

1. **Custom marker views** (`Ionicons` as `Marker` children) without `tracksViewChanges={false}` — a well-known `react-native-maps` footgun that forces continuous native re-snapshotting.
2. **No clustering** despite `react-native-map-clustering` already being in `package.json`.
3. **Map mounts and runs even when the user is on other tabs**, because the screen is a monolithic tab with no focus/lazy lifecycle.
4. **Client-side filtering on every pan/zoom** with two `setState` calls per gesture, re-mounting markers constantly.
5. **All property coordinates fetched at once** with no viewport/bounds API.

This document defines the **target architecture**, a **phased rollout**, and **copy-pasteable implementation tickets** so the map behaves like Airbnb’s: fast first paint, stable frame rate while panning, clusters at low zoom, property cards on tap.

---

## 1. Current implementation audit

### 1.1 What exists today

| Area | Current behavior | File |
|------|------------------|------|
| Screen | Single component `MapScreen` — fetch, filter, map, modal, styles | `Trips.tsx` |
| Data | `GET /properties/getProperties` returns **all** properties, projection `{ center: 1 }` only | `PropertyController.ts` |
| Map | `MapView` + `PROVIDER_GOOGLE` + 14-rule `customMapStyle` | `Trips.tsx` |
| Markers | One `<Marker>` per filtered property, child = `<Ionicons size={30} />` | `Trips.tsx` |
| Visibility filter | Bounding-box filter + `index % densityFactor` on `onRegionChangeComplete` | `Trips.tsx` |
| Clustering | **Not used** (`react-native-map-clustering` installed, zero imports) | — |
| Tab lifecycle | No `useFocusEffect` / `useIsFocused`; map always mounted | `Trips.tsx`, `_layout.tsx` |
| Property sheet | Placeholder `Modal` (“hellowww”) | `Trips.tsx` |

### 1.2 Reference pattern already in the codebase

`PropertyMapPreview.tsx` already follows several best practices that Trips ignores:

```67:69:Mobile/components/property/PropertyMapPreview.tsx
        <Marker coordinate={{ latitude, longitude }} tracksViewChanges={false}>
          <Ionicons name="location-sharp" size={28} color={c.accent} />
        </Marker>
```

It also prefers **Google Static Maps API images** before falling back to a live map, and uses `liteMode` on Android for non-interactive previews. Trips should adopt the marker flag at minimum; the full static-map approach is optional for the interactive tab.

### 1.3 Problems identified (ranked by performance impact)

| ID | Problem | Why it causes lag / crashes | Severity |
|----|---------|----------------------------|----------|
| **M1** | Custom `Marker` children without `tracksViewChanges={false}` | Each marker re-renders into a bitmap on every map frame until tracking stops. With N markers this pegs CPU/GPU and can OOM-crash the app. | **Critical** |
| **M2** | No marker clustering | At world/country zoom, even 200–500 markers is enough to freeze the JS thread and choke the native map layer. Airbnb uses clusters, not individual pins, at low zoom. | **Critical** |
| **M3** | `MapView` mounts when the tab navigator loads | Expo Router tabs mount all screens by default. Google Maps initializes tiles, style JSON, and the native view **before the user opens Trips**. | **High** |
| **M4** | `onRegionChangeComplete` → `setRegion` + `setFilteredProperties` | Every pan/zoom end triggers a full React re-render and marker reconciliation. Dual state updates amplify work. | **High** |
| **M5** | `filterMarkers` uses stale `properties` closure | Function is not memoized; first region events may run with `properties === []`. After fetch completes, **no initial filter runs** — markers appear only after user pans. | **High** (correctness + UX) |
| **M6** | Naive `index % densityFactor` thinning | Drops arbitrary markers, not spatially distributed ones. At medium zoom you still render too many; at high zoom you hide valid pins. | **Medium** |
| **M7** | Map renders under loading overlay | `MapView` is in the tree while `loading === true`, so tile fetch + marker setup compete with the property API call on first open. | **Medium** |
| **M8** | Monolithic 345-line screen | No separation of data hook, map layer, and UI sheet — hard to optimize incrementally or test. | **Medium** (maintainability) |
| **M9** | `getProperties` returns unbounded list | As inventory grows, payload size and client memory scale linearly. No `_id`+`title`+`price` in projection for callouts. | **Medium** (scale) |
| **M10** | `console.log` in `handleMarkerPress` with stale `selectedProperty` | Minor; shows handler was not finished. Not a perf issue but signals incomplete feature. | **Low** |

### 1.4 Observed user-facing symptoms (mapped to causes)

| Symptom | Most likely cause(s) |
|---------|---------------------|
| App freezes when opening Trips | M3 + M1 + M2 (map init + custom markers + no clusters) |
| Crash after map appears | M1 (marker snapshot memory) + M2 (too many native annotations) |
| Lag while panning/zooming | M4 + M1 (re-render storm per region change) |
| No pins until user moves map | M5 (missing post-fetch filter) |
| Pins jump or disappear oddly | M6 (modulo thinning) |

---

## 2. Target architecture

### 2.1 High-level diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Trips.tsx (thin screen shell)                                   │
│    └─ useTripsMapScreen()          ← data, region, selection   │
│         ├─ fetch markers (bounds-aware API or cached full set)   │
│         ├─ debounced region                                      │
│         └─ focus / interaction gating                            │
│    └─ <TripsMap />                  ← only mounts when focused   │
│         └─ ClusteredMapView         ← react-native-map-clustering│
│              └─ TripsMapMarker[]     ← tracksViewChanges=false   │
│    └─ <TripsPropertySheet />        ← bottom sheet on pin tap    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend (phase 2)                                               │
│    GET /properties/map-markers?north=&south=&east=&west=&zoom=   │
│    → [{ id, lat, lng, title, basePrice, thumbnailUrl }]          │
│    optional: server-side cluster buckets at zoom < 10            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Proposed file structure

Align with existing feature folders (`components/wishlist/`, `hooks/useWishlistScreen.ts`, `Constants/wishlist-theme.ts`):

```
Mobile/
  app/(tabs)/Trips.tsx                 # ~40 lines: layout + hook + children
  hooks/useTripsMapScreen.ts           # fetch, region, selection, focus
  utils/trips-map.ts                   # bounds math, debounce helpers, caps
  Constants/trips-map-theme.ts         # map style JSON, cluster colors, pin tokens
  components/trips/
    TripsMap.tsx                       # Clustered MapView wrapper
    TripsMapMarker.tsx                 # memoized marker (native pin or image)
    TripsPropertySheet.tsx             # @gorhom/bottom-sheet property preview
    TripsMapSkeleton.tsx               # placeholder before map ready
    TripsMapEmptyState.tsx             # no properties / error
    index.ts
```

### 2.3 Data layer

#### Phase 1 — Client-side (ship quickly)

Keep `GET /properties/getProperties` but extend backend projection:

```ts
// Target response shape per marker
type MapMarkerProperty = {
  _id: string
  title: string
  basePrice?: number
  center: { lat: number; lng: number }
  propertyCoverFileUrl?: string  // optional for sheet preview
}
```

Store the full list in the hook once. Derive **visible markers with `useMemo`**, not `useState`:

```ts
const visibleMarkers = useMemo(
  () => filterMarkersInBounds(allMarkers, debouncedRegion, { maxCount: 80 }),
  [allMarkers, debouncedRegion]
)
```

**Hard cap:** never render more than **80** markers at once (Airbnb effectively caps via clustering; this is the client-side equivalent).

#### Phase 2 — Bounds API (scale)

```http
GET /properties/map-markers?north=..&south=..&east=..&west=..&zoom=12
```

- Return only markers inside bounds.
- At `zoom < 8`, return pre-clustered buckets from MongoDB `$geoWithin` + `$bucket` or a dedicated geospatial index.
- Paginate or limit to 200 records per request.

Add a `2dsphere` index on `center` if not present:

```js
// Properties schema — use GeoJSON Point for Mongo geospatial queries
center: {
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number], index: "2dsphere" } // [lng, lat]
}
```

*Note: current schema uses `{ lat, lng }` nested object — migration ticket required for true geo queries.*

### 2.4 Map layer

#### Use clustering (already a dependency)

Replace `react-native-maps` `MapView` import:

```ts
import MapView from "react-native-map-clustering"
```

Recommended props (tune in QA):

| Prop | Suggested value | Why |
|------|-----------------|-----|
| `clusterColor` | `#FF6600` (brand accent) | Matches booking/wishlist tokens |
| `clusterTextColor` | `#FFFFFF` | Contrast |
| `radius` | `52` | Cluster merge distance |
| `maxZoom` | `14` | Stop clustering when zoomed in |
| `minZoom` | `1` | |
| `animationEnabled` | `false` on Android | Reduces jank during cluster split |
| `spiralEnabled` | `false` | Simpler layout |
| `tracksViewChanges` | `false` on every `Marker` | **Mandatory** |

#### Marker rendering strategy (pick one per phase)

| Phase | Approach | Performance | Visual |
|-------|----------|-------------|--------|
| **A (quick win)** | Default pin — no child view | Best | Generic red pin |
| **B** | `Image` marker with local `require()` asset | Very good | Branded pin |
| **C** | Price pill (Airbnb-style) | Requires cached bitmap / `tracksViewChanges={false}` after first layout | Best UX |

**Do not** use live `Ionicons` / `Text` children on markers without `tracksViewChanges={false}` and a post-layout flip to `false`.

Pattern for custom markers:

```tsx
const [ready, setReady] = useState(Platform.OS === "ios")

<Marker tracksViewChanges={!ready} onLayout={() => setReady(false)}>
  <Image source={require("@/assets/images/map-pin.png")} style={styles.pin} />
</Marker>
```

### 2.5 Lifecycle & mount gating

**Problem M3:** Map initializes on app launch.

**Fix — three layers (use all):**

1. **Tab lazy loading** in `app/(tabs)/_layout.tsx`:

```tsx
<Tabs.Screen name="Trips" options={{ lazy: true, ... }} />
```

2. **Focus gate** in `Trips.tsx`:

```tsx
const isFocused = useIsFocused()
// ...
{isFocused ? <TripsMap ... /> : <TripsMapSkeleton />}
```

3. **Defer heavy work** after transitions (same pattern as `index.tsx`):

```tsx
useFocusEffect(
  useCallback(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setMapReady(true)
      fetchMarkers()
    })
    return () => {
      task.cancel()
      setMapReady(false)
    }
  }, [])
)
```

When the tab blurs, unmount `MapView` or set `cacheEnabled={false}` to release native memory.

### 2.6 Region change handling

**Replace** `onRegionChangeComplete` + dual `setState` with:

1. `onRegionChangeComplete` → update a **ref** (`regionRef.current = region`) — no re-render.
2. **Debounced** (200 ms) update to state used by `useMemo` filter — one state slice: `debouncedRegion`.
3. Do **not** store `region` in state unless UI needs it (e.g. “search this area” button).

```ts
import debounce from "lodash.debounce" // add dependency OR small inline debounce in utils/trips-map.ts
```

### 2.7 Property selection UI

Replace the centered `Modal` with `@gorhom/bottom-sheet` (already in project) — same pattern as wishlist/booking sheets:

- Tap cluster → zoom in (`mapRef.animateToRegion`).
- Tap marker → open `TripsPropertySheet` with thumbnail, title, price, CTA to `property-info/[id]`.
- Sheet unmounts when closed; map stays mounted (if focused).

### 2.8 Map styling

Move the 14-rule `mapStyle` array to `Constants/trips-map-theme.ts` (module-level constant). Consider:

- **Phase 1:** Ship with default map style (no `customMapStyle`) to validate perf baseline.
- **Phase 2:** Re-enable styled map once clustering + markers are stable.

Styled maps add native parsing cost on first load (M7 contributor).

### 2.9 Initial region

Current default: Athens (`37.9838, 23.7275`) with `latitudeDelta: 0.04` (street level) — wrong for a **world** map.

**Target:**

```ts
const WORLD_REGION = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 60,
  longitudeDelta: 60,
}
```

After markers load, optionally `fitToCoordinates` once (with edge padding) — **only on first load**, not on every focus.

---

## 3. What will work vs what won’t

| Proposal | Verdict | Notes |
|----------|---------|-------|
| Add `tracksViewChanges={false}` to all markers | ✅ **Do immediately** | Single biggest win; matches `PropertyMapPreview` |
| Switch to `react-native-map-clustering` | ✅ **Do in phase 1** | Dependency already installed |
| Lazy tab + focus-gated map mount | ✅ **Do in phase 1** | Stops paying map cost on other tabs |
| `useMemo` + debounced region instead of `filteredProperties` state | ✅ **Do in phase 1** | Cuts re-renders while panning |
| Cap visible markers at 80 | ✅ **Do in phase 1** | Safety net even with clustering |
| Default pin markers (no custom view) for v1 | ✅ **Recommended** | Prove stability before branded pins |
| Bounds-based API + geo index | ✅ **Phase 2** | Required before thousands of listings |
| Keep `index % densityFactor` thinning | ❌ **Remove** | Replace with clustering + hard cap |
| Render map while `loading` overlay shows | ❌ **Remove** | Show skeleton until data **and** map gate ready |
| Live `Ionicons` markers without tracking fix | ❌ **Remove** | Primary crash source |
| Fetch all properties on every tab focus | ⚠️ **Cache** | Fetch once per session; refresh on pull-to-refresh or 5-min TTL |
| Apple Maps on iOS instead of Google | ⚠️ **Optional** | Better perf on iOS but style/API parity differs — product call |

---

## 4. Phased implementation plan

> **Full ticket breakdown:** Every task has step-by-step instructions, code snippets, and checkbox acceptance criteria in [`TRIPS_MAP_IMPLEMENTATION_TICKETS.md`](./TRIPS_MAP_IMPLEMENTATION_TICKETS.md).

### Phase 0 — Hotfixes (0.5–1 day) → Epic 0

| Ticket | Summary |
|--------|---------|
| VS-TRIP-000 | `tracksViewChanges` + default pin hotfix |
| VS-TRIP-001 | Lazy tab + defer map mount until data ready |
| VS-TRIP-002 | Fix initial marker filter + remove dual region state |

**Acceptance:** Trips opens without crash on mid-range Android; panning stays usable with &lt;100 properties.

---

### Phase 1 — Feature module refactor (2–4 days) → Epics 1–4 + Epic 5

| Ticket | Summary |
|--------|---------|
| VS-TRIP-010 | `trips-map-theme.ts` tokens |
| VS-TRIP-011 | `utils/trips-map.ts` |
| VS-TRIP-012 | `MapMarkerProperty` type |
| VS-TRIP-020 | `useTripsMapScreen` hook |
| VS-TRIP-030 | `TripsMap` with clustering |
| VS-TRIP-031 | `TripsMapMarker` |
| VS-TRIP-032 | `TripsMapSkeleton` |
| VS-TRIP-040 | `TripsPropertySheet` |
| VS-TRIP-041 | Empty + error states |
| VS-TRIP-042 | Slim `Trips.tsx` shell |
| VS-TRIP-050 | Backend marker payload |

---

### Phase 2 — Geospatial scale (3–5 days) → Epic 6

| Ticket | Summary |
|--------|---------|
| VS-TRIP-060 | GeoJSON migration + `2dsphere` index |
| VS-TRIP-061 | `GET /properties/map-markers` bounds API |
| VS-TRIP-062 | Bounds-based hook fetch + abort |
| VS-TRIP-063 | Server-side cluster buckets (optional) |

---

### Phase 3 — Polish (1–2 days) → Epic 7

| Ticket | Summary |
|--------|---------|
| VS-TRIP-070 | Branded pin asset |
| VS-TRIP-071 | Re-enable custom map style |
| VS-TRIP-072 | “Search this area” CTA |
| VS-TRIP-073 | Haptics + analytics |

### Phase 4 — QA sign-off → Epic 8

| Ticket | Summary |
|--------|---------|
| VS-TRIP-080 | 13-scenario perf + regression matrix |

---

## 6. QA & performance checklist

### Devices

Test on at least:

- 1 × Android mid-range (4 GB RAM)
- 1 × older iPhone (e.g. iPhone X / SE 2)
- 1 × high-end device (sanity)

### Scenarios

| # | Scenario | Pass criteria |
|---|----------|---------------|
| 1 | Cold start → open Trips | First interactive frame &lt; 2 s; no crash |
| 2 | Pan world map 20 s | No growing memory; no white flashes |
| 3 | Pinch zoom in/out rapidly | FPS stays usable; clusters split/merge correctly |
| 4 | Tap marker | Sheet opens &lt; 300 ms; correct property |
| 5 | Tap cluster | Map zooms in; more pins/clusters appear |
| 6 | Switch to Explore and back 10× | No crash; map re-mounts cleanly |
| 7 | Airplane mode | Empty/error state, not hang |
| 8 | 0 properties | Empty state illustration + CTA to Explore |

### Profiling tools

- React Native DevTools → highlight re-renders on `TripsMap`.
- Xcode Instruments → Allocations while panning (iOS).
- Android Studio Profiler → Memory while panning.

**Red flags:** `Marker` count in React tree &gt; 80; `tracksViewChanges` true; map mounted while `isFocused === false`.

---

## 7. Code smells to remove from `Trips.tsx`

When refactoring, delete or replace:

```ts
// ❌ Stale log — selectedProperty is one render behind
console.log("select markers se aati hui info", selectedProperty)

// ❌ Dual setState on every region change
onRegionChangeComplete={(newRegion) => {
  setRegion(newRegion)
  filterMarkers(newRegion)
}}

// ❌ Arbitrary thinning
.filter((_, index) => index % densityFactor === 0)

// ❌ Custom icon child without tracksViewChanges
<Marker ...>
  <Ionicons name="location-sharp" size={30} color="red" />
</Marker>
```

---

## 8. Recommended sprint order

See **Master checklist** and per-ticket dependencies in [`TRIPS_MAP_IMPLEMENTATION_TICKETS.md`](./TRIPS_MAP_IMPLEMENTATION_TICKETS.md).

```
Epic 0 (VS-TRIP-000 → 002)  — ship first, stops crashes
    ↓
Epic 1 (VS-TRIP-010 → 012)  — tokens, utils, types
    ↓
Epic 2 (VS-TRIP-020)        — hook
    ↓
Epic 3 (VS-TRIP-030 → 032)  — map components (parallel)
    ↓
Epic 4 (VS-TRIP-040 → 042)  — sheet + shell
    ↓
Epic 5 (VS-TRIP-050)        — backend payload
    ↓
Epic 8 (VS-TRIP-080)        — QA sign-off
    ↓
Epic 6–7                    — scale + polish when needed
```

---

## 9. Open questions for product

1. **Trips scope:** Show **all platform properties** (current) or only **user’s booked/upcoming trips**? The tab is named “Trips” but behaves like “Explore map.”
2. **Marker design:** Generic pin for v1 vs price pills (extra eng in phase 3).
3. **Google vs Apple Maps on iOS:** Style parity vs native performance.
4. **Offline:** Show last cached markers or block with message?

---

## 10. Related files

| File | Role |
|------|------|
| `Mobile/app/(tabs)/Trips.tsx` | Current implementation (to be slimmed) |
| `Mobile/app/(tabs)/_layout.tsx` | Add `lazy: true` for Trips |
| `Mobile/components/property/PropertyMapPreview.tsx` | Reference for marker + static map patterns |
| `Backend/controllers/PropertyController.ts` | `getProperties` endpoint |
| `Backend/models/Properties.ts` | `center` schema |
| `Mobile/package.json` | `react-native-map-clustering`, `react-native-maps` |

---

*End of architecture document.*

**Next step:** Work through [`TRIPS_MAP_IMPLEMENTATION_TICKETS.md`](./TRIPS_MAP_IMPLEMENTATION_TICKETS.md) — copy tickets into Jira/Linear/GitHub Issues and check off the master checklist as you ship.

For UX patterns on bottom sheets and tokens, see `BOOKING_UX_IMPLEMENTATION_TICKETS.md` and `PROFILE_UX_IMPLEMENTATION_TICKETS.md`.
