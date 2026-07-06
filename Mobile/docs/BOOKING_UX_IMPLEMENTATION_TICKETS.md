# Vacation Saga — Booking UX/UI Implementation Tickets

**Document version:** 1.0  
**Created:** 2026-06-30  
**Source:** Booking funnel UX audit (Property Detail → Reserve → Sheets)  
**Audience:** Mobile engineers, UI implementers, QA  

---

## How to use this document

Each ticket below is written to be **copy-pasted into Jira, Linear, or GitHub Issues**. Fields are consistent:

| Field | Meaning |
|-------|---------|
| **ID** | Internal reference (e.g. `VS-BOOK-001`) |
| **Priority** | P0 = ship blocker / trust issue · P1 = strong UX · P2 = polish |
| **Epic** | Grouping for sprint planning |
| **Cause** | Why this exists (user pain or design debt) |
| **Outcome** | What users will experience after completion |
| **Dependencies** | Tickets or work that must land first |
| **Instructions** | Step-by-step implementation guide |
| **Acceptance criteria** | Definition of done for QA |
| **Files** | Primary touchpoints (verify before editing) |

**Recommended sprint order:** Epic 0 → Epic 1 (P0) → Epic 2 (P1) → Epic 3 (P2).

---

## Epic 0 — Design system foundation

> **Goal:** One visual language across auth, property detail, and reserve.  
> **Do this first.** Most UI tickets depend on shared tokens.

---

### VS-BOOK-000 — Create shared booking design tokens

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Design system |
| **Estimate** | 0.5–1 day |

#### Cause
Colors, radii, and spacing are defined independently in `property-info/[id].tsx`, `reserve-page/[id].tsx`, `Constants/Styles.ts`, and `Constants/auth-theme.ts`. Users perceive the app as inconsistent; engineers duplicate values and drift occurs (`#FF6600`, `#ff7900`, `#FC941E`, `orange`).

#### Outcome
A single `booking-theme.ts` (or extension of `auth-theme.ts`) becomes the source of truth for all booking screens. New UI work imports tokens instead of hardcoding hex values.

#### Dependencies
- None (foundational).

#### Instructions

1. **Create** `Mobile/Constants/booking-theme.ts`.
2. **Export** tokens aligned with existing auth palette (stone + orange):
   ```ts
   export const booking = {
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
       divider: "#F5F5F4",
       success: "#16A34A",
       error: "#B91C1C",
     },
     type: {
       eyebrow: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 1.2 },
       sectionTitle: { fontSize: 20, fontWeight: "700" as const },
       body: { fontSize: 15, lineHeight: 22 },
       caption: { fontSize: 12, lineHeight: 18 },
     },
     shadow: { card: { shadowColor: "#1C1917", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 } },
     button: { height: 52, radius: 12 },
   }
   ```
3. **Re-export** from `Mobile/Constants/auth-theme.ts` if you prefer one entry point: `export { booking } from './booking-theme'`.
4. **Do not refactor all screens in this ticket** — only create the file and document usage in a short comment at the top.
5. **Update** `globalStyles.btn` background to `booking.colors.accent` in a follow-up ticket (VS-BOOK-001).

#### Acceptance criteria
- [ ] `booking-theme.ts` exists and exports space, colors, radius, typography scales.
- [ ] Values match auth screen orange (`#FF6600`) and stone backgrounds.
- [ ] No runtime imports break; file is TypeScript-clean.
- [ ] README or file header explains: *“Import `booking` for property/reserve screens.”*

#### Files
- `Mobile/Constants/booking-theme.ts` (new)
- `Mobile/Constants/auth-theme.ts` (optional re-export)

---

### VS-BOOK-001 — Migrate Property Detail & Reserve to design tokens

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Design system |
| **Estimate** | 1–2 days |

#### Cause
Inline color literals and mismatched oranges undermine brand trust and make bulk redesigns expensive.

#### Outcome
`property-info/[id].tsx` and `reserve-page/[id].tsx` use `booking.colors.*`, `booking.space.*`, and `booking.radius.*` for all new/changed styles. Visual appearance should be substantially the same except unified orange and backgrounds.

#### Dependencies
- **VS-BOOK-000** (tokens file must exist).

#### Instructions

1. Import `booking` from `@/Constants/booking-theme`.
2. **Reserve page:** Replace local constants:
   - `ORANGE` → `booking.colors.accent`
   - `BG` → `booking.colors.bg`
   - `TEXT` → `booking.colors.ink`
   - `MUTED` → `booking.colors.inkMuted`
   - `CARD` → `booking.colors.surface`
   - `BORDER` / `DIVIDER` → `booking.colors.border` / `booking.colors.divider`
3. **Property page:** Replace `#FF6600`, `orange`, `#ff7f11`, `#f8f9fa` section backgrounds with token equivalents.
4. **globalStyles:** Update `btn.backgroundColor` to `booking.colors.accent`; align `borderRadius` to `booking.button.radius`.
5. **StayInfoSheet:** Import accent/border from tokens (already close to auth palette).
6. Run app on iOS + Android simulator; screenshot property + reserve before/after.
7. **Do not** change layout or copy in this ticket — colors/tokens only.

#### Acceptance criteria
- [ ] No hardcoded `#ff7900`, `orange`, or `#FC941E` in property-info, reserve-page, or StayInfoSheet.
- [ ] Primary CTA orange is `#FF6600` everywhere in booking funnel.
- [ ] Background on reserve scroll area is `#FAFAF9` (or token `bg`).
- [ ] QA visual pass on both platforms.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`
- `Mobile/app/(screens)/reserve-page/[id].tsx`
- `Mobile/components/property/StayInfoSheet.tsx`
- `Mobile/Constants/Styles.ts`

---

## Epic 1 — Property Detail Page (P0)

> **Goal:** Fix information hierarchy, trust, and broken amenities before polish.  
> **Primary file:** `Mobile/app/(screens)/property-info/[id].tsx`

---

### VS-BOOK-010 — Property hero: name, location, and review row

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Property Detail |
| **Estimate** | 1 day |

#### Cause
The first content block after photos shows **VS ID** and **country only**. Booking platforms (Airbnb, Booking.com) lead with **property name** and **city + country** because users decide emotionally before reading metadata. Internal IDs (`VS ID`) erode premium positioning.

#### Outcome
Users immediately see property name, full location line, and a review/trust row. VS ID moves to secondary meta (small, muted).

#### Dependencies
- **VS-BOOK-001** recommended (tokens for typography) but not blocking.

#### Instructions

1. Open `renderPropertyInfo()` in `property-info/[id].tsx`.
2. **Restructure** top of section (before property type tag or immediately after):
   ```
   [Property Name]     ← property.propertyName || property.placeName, 26px, bold, ink
   [City · Country]    ← [property.city, property.country].filter(Boolean).join(' · ')
   [Trust row]         ← see step 4
   [Property type pill]← keep, move below trust row
   [VS ID meta]        ← fontSize 12, muted: "VS ID · {property.VSID}"
   ```
3. **Remove** standalone `vsidText` prominent placement; demote to meta line.
4. **Trust row** (placeholder until reviews API exists):
   - If `property.rating` / review count exist on `PropertyInterface`, display: `★ {rating} · {count} reviews`.
   - Else: `★ New · Be the first to review` (muted, 14px).
   - Check `PropertyInterface` in `Mobile/types` or `data/types`; extend type if fields missing (coordinate with backend ticket if needed).
5. **Location:** Replace country-only `locationContainer` with city + country; keep `location` icon.
6. **Remove duplicate** one-line host from top if VS-BOOK-014 consolidates host (optional in same PR if small).
7. Add `accessibilityLabel` on property name heading.

#### Acceptance criteria
- [ ] Property name is the largest text in the first content section.
- [ ] City and country shown when available (graceful fallback to country-only).
- [ ] VS ID visible but not the primary headline.
- [ ] Review row renders (real data or empty state copy).
- [ ] No layout overlap with carousel or back button.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`
- `Mobile/types` or property type definition (if extending)

---

### VS-BOOK-011 — Quick facts chips with labels (guests, beds, baths, size)

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Property Detail |
| **Estimate** | 0.5 day |

#### Cause
`detailsRow` shows raw numbers (`4`, `2`) without labels. Users must infer meaning from icons alone — poor accessibility and slower scanning.

#### Outcome
Each chip reads e.g. `4 guests`, `2 beds`, `1 bath`, `85 m²`.

#### Dependencies
- **VS-BOOK-010** (layout order) recommended.

#### Instructions

1. In `detailsRow` / `detailBox`, change `detailText` to formatted strings:
   - `{property?.guests} guests` (handle singular: `1 guest`)
   - `{property?.bedrooms} bed` / `beds` (confirm field: `bedrooms` vs `beds` on interface)
   - `{property?.bathroom} bath` / `baths`
   - `{property?.size}` — append `m²` if numeric and unit not in string
2. Use `booking.type.caption` or 14px medium for chip text.
3. Ensure chips wrap on narrow screens (`flexWrap: 'wrap'` on row if needed).
4. VoiceOver: `accessibilityLabel={`${n} guests`}` per chip.

#### Acceptance criteria
- [ ] Every chip has a human-readable label, not a bare number.
- [ ] Singular/plural grammar correct for 1 guest, 1 bed, etc.
- [ ] Chips remain in a single row or wrap cleanly on small devices.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`

---

### VS-BOOK-012 — Loading & empty states for Property Detail

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Property Detail |
| **Estimate** | 1 day |

#### Cause
`getproperty()` runs with no loading UI; screen flashes empty then populates. Users on slow networks see a broken layout — common cause of bounce before Reserve.

#### Outcome
Skeleton placeholders for gallery + content while fetching; explicit error/retry state on failure.

#### Dependencies
- None (can reuse patterns from `WishlistSkeleton` if applicable).

#### Instructions

1. Add `loading` and `error` state to `PropertyInfo` component.
2. Set `loading true` before axios call; `false` in `finally`; set `error` message in `catch`.
3. **While loading:** Render skeleton:
   - Gray `View` blocks: 300px gallery, title lines, 4 chip placeholders, paragraph lines.
   - Reuse shimmer if project has one; else static `#E7E5E4` rounded rects.
4. **On error:** Centered message + “Try again” button calling `getproperty()`.
5. **Footer:** Disable Reserve button while `!property` or `loading`; show skeleton price or “—”.
6. Do not block carousel back button during load.

#### Acceptance criteria
- [ ] No flash of “No images” / empty sections during initial load on throttled network.
- [ ] Error state offers retry.
- [ ] Reserve CTA disabled until property loaded.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`
- Optional: `Mobile/components/property/PropertyDetailSkeleton.tsx` (new)

---

### VS-BOOK-013 — Amenities preview: fix filter, add icons, improve CTA

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Property Detail |
| **Estimate** | 1.5 days |

#### Cause
Preview filters only `generalAmenities[item] == true` with `index < 16`, ignoring `safeAmenities` and `otherAmenities`. “View All..” uses legacy orange button styling. Text-only pills lack scanability vs Airbnb icon grids.

#### Outcome
Preview shows up to 8–10 amenities from **all** amenity maps with icons. CTA reads “Show all amenities” as text link or subtle outlined pill.

#### Dependencies
- **VS-BOOK-001** (tokens)
- **VS-BOOK-020** (amenities sheet) can ship in parallel but sheet should match CTA copy

#### Instructions

1. **Create helper** `getActiveAmenities(property)` in `Mobile/utils/property-display.ts`:
   - Merge `generalAmenities`, `safeAmenities`, `otherAmenities`.
   - Return `string[]` of keys where value is `true`.
2. **Icon map:** Add `getAmenityIcon(name: string): Ionicons name` — default `checkmark-circle-outline`; map common names (WiFi → `wifi`, Kitchen → `restaurant-outline`, etc.).
3. Replace `renderAmenities` preview loop to use merged list, `.slice(0, 10)`.
4. Each `amenityItem`: row or pill with icon + label.
5. Replace `viewAllButton` / `View All..` with:
   ```tsx
   <Pressable onPress={handleOpenBottomsheet}>
     <Text style={showAllLink}>Show all {totalCount} amenities</Text>
     <Ionicons name="chevron-forward" size={16} color={accent} />
   </Pressable>
   ```
6. Remove `backgroundColor: 'orange'` pill style.

#### Acceptance criteria
- [ ] Amenities from all three maps appear in preview and count.
- [ ] Each preview item has an icon.
- [ ] CTA shows total count; no double-dot “..” copy.
- [ ] Tapping CTA still opens amenities Modalize.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`
- `Mobile/utils/property-display.ts`

---

### VS-BOOK-014 — Remove or replace hardcoded host trust metrics

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Property Detail — Trust |
| **Estimate** | 0.5 day (+ backend if real metrics needed) |

#### Cause
`renderHostInfo` displays “Response rate - 100%” and “Fast response - within a few hours” without data source. Fake metrics destroy trust if users discover they’re static — worse than showing nothing.

#### Outcome
Host section shows only **verified** fields: name, avatar, join year, languages. Optional badges only when API provides them.

#### Dependencies
- Check `UserDataType` for `responseRate`, `responseTime`, `isVerified` fields.

#### Instructions

1. Audit `UserDataType` / API `getUser` response.
2. **If fields exist:** Bind conditionally:
   ```tsx
   {users?.responseRate != null && (
     <Text>Response rate · {users.responseRate}%</Text>
   )}
   ```
3. **If fields do not exist:** Remove hardcoded lines entirely for this release.
4. Add “Verified host” badge only when `users?.isVerified === true` (or equivalent).
5. Consolidate duplicate “Hosted by {name}” in `renderPropertyInfo` — keep single host block in `renderHostInfo` with compact link at top: “Hosted by X →” scrolling to host section (optional `scrollTo` ref).

#### Acceptance criteria
- [ ] No static “100%” or “within a few hours” unless from API.
- [ ] Host section does not contradict backend data.
- [ ] Product/legal sign-off on any trust copy.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`
- Backend contract doc if new fields needed

---

### VS-BOOK-015 — Section typography unification (Property Detail)

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Property Detail |
| **Estimate** | 0.5 day |

#### Cause
`sectionTitle` uses 22px semibold while `blockHeading` uses ALL CAPS 16px regular for Check-in and House Rules. Inconsistent hierarchy feels like two products.

#### Outcome
All sections use: optional eyebrow (11px uppercase muted) + title (20px bold). No random ALL CAPS blocks.

#### Dependencies
- **VS-BOOK-001**

#### Instructions

1. Create shared styles `sectionEyebrow`, `sectionTitle` using `booking.type`.
2. Update `renderThingsToKnow`:
   - Eyebrow: `STAY POLICIES` or remove eyebrow
   - Title: `Check-in & check-out` (sentence case)
   - Subsection: `House rules` with `sectionTitle` at 17px or shared subsection style
3. Remove rainbow `ruleDotColors`; use neutral `ruleRow` with `Ionicons` `ellipse` or `remove-outline` in `inkMuted`.
4. Apply same header pattern to Amenities, Pricing, Host, Stay Information.

#### Acceptance criteria
- [ ] All major sections share title styling.
- [ ] No ALL CAPS 16px headings unless eyebrow token.
- [ ] House rules use neutral icons, not random color dots.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`

---

### VS-BOOK-016 — Reorder Property Detail sections

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Property Detail — IA |
| **Estimate** | 0.5 day |

#### Cause
Pricing appears before check-in/host, and there is no map. Users researching a stay want policies and host before deep pricing tables; price is already in sticky footer.

#### Outcome
Section order matches booking mental model.

#### Dependencies
- **VS-BOOK-010**, **VS-BOOK-015** (content blocks stable)

#### Instructions

1. In `renderItem` content container, reorder calls to:
   ```
   renderPropertyInfo()      // name, stay info (includes about)
   renderAmenities()
   renderThingsToKnow()      // check-in + house rules
   renderHostInfo()
   renderPricingCard()       // move down — or collapse to “View pricing details”
   ```
2. **Optional:** Add placeholder `renderLocationSection()` stub for VS-BOOK-017.
3. Ensure `flatListContainer` `paddingBottom` still clears sticky footer.
4. Update any scroll-linked analytics if present.

#### Acceptance criteria
- [ ] Order matches list above.
- [ ] Sticky footer still shows price + Reserve.
- [ ] No section duplicated.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`

---

### VS-BOOK-017 — Location section with map placeholder

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Property Detail |
| **Estimate** | 1–2 days |

#### Cause
Only `country` is shown; no map or address. Location is a top-3 decision factor for vacation rentals.

#### Outcome
“Where you’ll stay” section with city/country, optional address line, and map preview (static or `react-native-maps`).

#### Dependencies
- **VS-BOOK-016** (section slot)
- Property must expose `latitude`, `longitude` or `address` — verify `PropertyInterface`

#### Instructions

1. Check property fields for coordinates; if missing, create backend ticket VS-BE-xxx.
2. Add `renderLocationSection()`:
   - Title: `Where you'll stay`
   - Text: full address or city, state, country
   - Map: 200px height, rounded 16, `pointerEvents="none"` if non-interactive preview
   - Tap map → open native maps or full-screen map modal
3. If no coordinates: show illustrated placeholder + text “Exact location provided after booking” (if policy applies).
4. Use `booking.colors.border` on map card.

#### Acceptance criteria
- [ ] Location section visible on property detail.
- [ ] Map renders when lat/lng present; graceful fallback when absent.
- [ ] No precise address shown if business rules require hiding it.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`
- `PropertyInterface` type / API

---

### VS-BOOK-020 — Amenities bottom sheet redesign

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Property Detail — Sheets |
| **Estimate** | 1 day |

#### Cause
Amenities Modalize uses `adjustToContentHeight` + `childrenStyle={{ height: 500 }}` with no header, no handle, and poor scroll behavior for long lists.

#### Outcome
Sheet matches Stay Info quality: handle, title, categorized list, reliable scroll.

#### Dependencies
- **VS-BOOK-013** (merged amenity list helper)
- **VS-BOOK-001** (tokens)
- Pattern from Stay Info sheet (`modalHeight` + `disableScrollIfPossible={false}`)

#### Instructions

1. Create `Mobile/components/property/AmenitiesSheet.tsx` (mirror `StayInfoSheet` structure):
   - Handle bar, title “Amenities”, close button
   - Group amenities: Essentials (general), Safety, Other — or single grid if categorization unknown
   - Icon + label per row
2. Replace amenities `Modalize` config:
   ```tsx
   modalHeight={Math.round(screenHeight * 0.88)}
   disableScrollIfPossible={false}
   withHandle={false}  // custom handle inside sheet
   scrollViewProps={{ nestedScrollEnabled: true, bounces: true }}
   ```
3. Remove `childrenStyle={{ height: 500 }}`.
4. Pass merged amenity list from `getActiveAmenities(property)`.

#### Acceptance criteria
- [ ] Sheet has title and close control.
- [ ] 30+ amenities scroll smoothly on iOS and Android.
- [ ] Visual style consistent with `StayInfoSheet`.

#### Files
- `Mobile/components/property/AmenitiesSheet.tsx` (new)
- `Mobile/app/(screens)/property-info/[id].tsx`

---

### VS-BOOK-021 — Property footer: fix false affordance & safe area

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Property Detail |
| **Estimate** | 0.25 day |

#### Cause
`priceContainer` is `TouchableOpacity` with no `onPress` — users tap price expecting breakdown. Footer already uses safe area insets; verify Reserve button uses token styles.

#### Outcome
Price is display-only; Reserve is clear primary action.

#### Dependencies
- **VS-BOOK-001**

#### Instructions

1. Change `TouchableOpacity` wrapping price to `View`.
2. Optionally: tap price opens pricing section scroll (`scrollTo` ref) or lightweight breakdown sheet — document choice in PR.
3. Align `reserveButton` with `booking.button` height/radius.
4. Ensure `paddingBottom: Math.max(insets.bottom, 16)` remains.

#### Acceptance criteria
- [ ] Price is not styled as a button unless it performs an action.
- [ ] Reserve CTA meets 52px min touch target.
- [ ] Home indicator does not overlap footer on iPhone.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`

---

### VS-BOOK-022 — Replace FlatList anti-pattern with ScrollView

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Property Detail — Tech debt |
| **Estimate** | 0.25 day |

#### Cause
`FlatList` with `data={[1]}` adds complexity without virtualization benefit for a static detail page.

#### Outcome
Single `ScrollView` with ListHeaderComponent content inlined — easier maintenance.

#### Dependencies
- None.

#### Instructions

1. Replace `FlatList` with `ScrollView` + `contentContainerStyle={styles.flatListContainer}`.
2. Move header (carousel) and body sections into ScrollView children.
3. Remove `keyExtractor` / `renderItem` hack.
4. Test scroll performance with long amenities/rules — should be fine.

#### Acceptance criteria
- [ ] Same visual result; no FlatList with fake single item.
- [ ] Scroll smooth end-to-end.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`

---

## Epic 2 — Reserve Page (P0–P1)

> **Goal:** Clarify pricing, fix footer, improve booking flow continuity.  
> **Primary file:** `Mobile/app/(screens)/reserve-page/[id].tsx`

---

### VS-BOOK-030 — Pricing clarity: quotation vs payable now

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Reserve — Pricing |
| **Estimate** | 1 day |

#### Cause
Bill card shows full stay cost and coupon discount, but **Payable now** equals only platform fee (€75 or 1 month rent). Users think checkout is broken or coupon ignored — major conversion killer.

#### Outcome
Two visually distinct blocks: **Stay quotation** (informational) and **Due today** (actual charge) with explanatory copy.

#### Dependencies
- **VS-BOOK-001** (tokens)
- Product confirmation on fee messaging

#### Instructions

1. Restructure `billCard` into:
   **Section A — Stay quotation** (muted card or labeled group)
   - Nightly/monthly line items (existing rows)
   - Subtotal: `Stay total` → `€{discountedPrice}`
   - Coupon row if applied (affects stay total only — state explicitly)

   **Section B — Payment today**
   - Info icon + `Due today` label
   - Amount: `€{payableNow}`
   - Caption: `Platform reservation fee. Rental payment is arranged with the host after confirmation.` (adjust copy with product)

2. **Footer** left block:
   - Large: `€{payableNow}`
   - Small: `Due today` not `platform fee only` alone

3. If coupon does not affect `payableNow`, add note under coupon: `Applies to stay total`.

4. Add `billDetails` comment in code explaining business rule for future devs.

#### Acceptance criteria
- [ ] User can explain difference between stay total and due today without support.
- [ ] Coupon interaction documented in UI when it doesn’t reduce due today.
- [ ] Product/legal approves fee disclaimer copy.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`

---

### VS-BOOK-031 — Reserve footer safe area & CTA states

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Reserve — Footer |
| **Estimate** | 0.5 day |

#### Cause
Footer uses `position: 'absolute'` without bottom safe inset — cramped on notched iPhones. `checkoutBtnMuted` uses same orange as enabled state — no visual affordance for incomplete steps.

#### Outcome
Footer respects safe area; disabled/missing-dates CTA is visually distinct but still tappable to open date picker.

#### Dependencies
- **VS-BOOK-001**

#### Instructions

1. Import `useSafeAreaInsets` from `react-native-safe-area-context`.
2. Wrap footer: `paddingBottom: Math.max(insets.bottom, 12)`.
3. **CTA states:**
   - `datesSelected === false`: background `#FDBA74` or `booking.colors.accent` at 0.5 opacity OR outline style; label stays `Select dates`
   - `isSubmitting`: opacity 0.6 + label `Creating booking…`
   - `datesSelected && !isSubmitting`: full accent fill
4. Do not use `disabled={!datesSelected}` — keep press opening date sheet.

#### Acceptance criteria
- [ ] Footer clears home indicator on iPhone 14+ simulator.
- [ ] Undated state CTA looks visually different from ready checkout.
- [ ] Submitting state non-interactive.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`

---

### VS-BOOK-032 — Dynamic trip header step counter

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Reserve — UX |
| **Estimate** | 0.25 day |

#### Cause
`selectorHeaderMeta` shows hardcoded `"3 steps left"` instead of computing remaining steps from `steps` array.

#### Outcome
Header shows accurate `X steps left` or `Ready to checkout` when all required steps done.

#### Dependencies
- None.

#### Instructions

1. Reuse existing `steps` array (dates, guests, travellers, coupon optional).
2. Define **required** steps: first 3 (coupon optional — do not count toward blocking).
3. ```ts
   const requiredSteps = steps.slice(0, 3)
   const doneCount = requiredSteps.filter(s => s.done).length
   const left = requiredSteps.length - doneCount
   const meta = left === 0 ? 'Ready to checkout' : `${left} step${left > 1 ? 's' : ''} left`
   ```
4. Replace hardcoded string in `selectorHeaderMeta`.

#### Acceptance criteria
- [ ] Counter updates when dates/guests/travellers completed.
- [ ] Shows “Ready to checkout” when all required steps done.
- [ ] Coupon optional does not block “ready” state.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`

---

### VS-BOOK-033 — Calendar & guest Modalize scroll fix

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Reserve — Sheets |
| **Estimate** | 0.5 day |

#### Cause
Same class of bug as Stay Info sheet: `adjustToContentHeight` on long-term month grid and guest sheet can prevent scrolling / clip content.

#### Outcome
Date and guest sheets scroll reliably on small screens and long-term month lists.

#### Dependencies
- Pattern from Stay Info fix (VS-BOOK-040)

#### Instructions

1. **Calendar modal** (`modalizeRef`):
   - Add `modalHeight={Math.round(height * 0.88)}`
   - Remove `adjustToContentHeight`
   - Add `disableScrollIfPossible={false}`
   - `scrollViewProps={{ nestedScrollEnabled: true, bounces: true }}`

2. **Guest modal** (`guestModalizeRef`): same pattern.

3. Test long-term flow with 12-month grid + duration chips on iPhone SE.

#### Acceptance criteria
- [ ] Short-term calendar fully visible and scrollable if needed.
- [ ] Long-term month grid scrolls on small devices.
- [ ] Guest selector accessible without clipping confirm button.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`

---

### VS-BOOK-034 — Replace hardcoded BLOCKED_DATES with API or property calendar

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Reserve — Data |
| **Estimate** | 1–2 days |

#### Cause
`BLOCKED_DATES` uses static April 2025 strings — stale, wrong for real bookings, causes confusion in QA and production.

#### Outcome
Unavailable dates come from backend (booked/blocked) per property.

#### Dependencies
- **Backend ticket required:** endpoint returning blocked date strings or ranges for `propertyId`
- Property fetch or dedicated availability API

#### Instructions

1. **Backend:** Document expected shape: `{ blockedDates: string[] }` ISO `YYYY-MM-DD`.
2. On property load (or on calendar open), fetch availability for `id`.
3. Replace `BLOCKED_DATES` constant with `blockedDates` state.
4. Merge into `getMarkedDates` disabled logic.
5. On 409 conflict from checkout, refresh blocked dates.
6. Show loading indicator on calendar while fetching.

#### Acceptance criteria
- [ ] No hardcoded 2025 dates in reserve page.
- [ ] Booked dates disabled on calendar per property.
- [ ] Network failure shows toast; calendar still usable for selection with warning.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`
- Backend: availability endpoint

---

### VS-BOOK-035 — Traveller details as bottom sheet (flow continuity)

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Reserve — Flow |
| **Estimate** | 2–3 days |

#### Cause
Tapping “Traveller details” navigates to `add-traveller` screen — user leaves booking context, loses scroll position, feels disjointed vs Airbnb single-page checkout.

#### Outcome
Traveller add/edit opens in Modalize on Reserve page; deep link to full page remains for complex edge cases if needed.

#### Dependencies
- **VS-BOOK-033** (sheet patterns)
- Existing `add-traveller` form logic — extract shared form component

#### Instructions

1. Extract form from `add-traveller.tsx` into `Mobile/components/booking/TravellerForm.tsx`.
2. Create `TravellerSheet.tsx` wrapping list of travellers + “Add traveller” + form.
3. Wire `useTravellerStore` same as today.
4. Replace `router.push` on traveller row with `travellerSheetRef.open()`.
5. Keep `add-traveller` route for backward compatibility or redirect with params.
6. Validate passport fields before allowing checkout — surface inline errors.

#### Acceptance criteria
- [ ] User can add traveller without leaving Reserve screen.
- [ ] Traveller count updates in trip details row.
- [ ] Checkout validation unchanged functionally.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`
- `Mobile/components/booking/TravellerSheet.tsx` (new)
- `Mobile/app/(screens)/pages/add-traveller.tsx` (refactor)

---

### VS-BOOK-036 — Coupon flow: sheet or inline vs full navigation

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Reserve — Flow |
| **Estimate** | 1 day |

#### Cause
`apply-coupon` route breaks booking flow similar to travellers.

#### Outcome
Coupon entry via bottom sheet on Reserve; applied state reflected immediately in bill card.

#### Dependencies
- **VS-BOOK-030** (bill structure)
- `useCouponStore` unchanged

#### Instructions

1. Read `apply-coupon` page; extract input + validation into `CouponSheet.tsx`.
2. Open sheet from `couponRow` press.
3. On success: close sheet, `billDetails` recalculates via existing store.
4. Deprecate navigation push or keep as fallback.

#### Acceptance criteria
- [ ] Apply/remove coupon without leaving Reserve.
- [ ] Bill card updates on apply.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`
- `Mobile/app/(screens)/pages/apply-coupon.tsx`
- `Mobile/components/booking/CouponSheet.tsx` (new)

---

### VS-BOOK-037 — Reserve page loading skeleton

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Reserve |
| **Estimate** | 0.5 day |

#### Cause
Hero card and price render empty until property loads — jarring transition.

#### Outcome
Skeleton hero + selector card while `property` undefined.

#### Dependencies
- **VS-BOOK-012** pattern

#### Instructions

1. Track `loading` on property fetch.
2. Show skeleton matching `heroCard` + `selectorCard` layout.
3. Disable footer CTA until loaded.

#### Acceptance criteria
- [ ] No empty hero image flash.
- [ ] CTA disabled during load.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`

---

### VS-BOOK-038 — Visual consistency: card spacing & borders on Reserve

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Reserve — Polish |
| **Estimate** | 0.5 day |

#### Cause
`scrollContent` uses `gap: 10` while design system uses 16–24; cards have no border, weak separation on `BG`.

#### Outcome
16px gap between cards; optional `hairlineWidth` border `booking.colors.border` on cards; remove amber `#A16207` price suffix — use `inkMuted`.

#### Dependencies
- **VS-BOOK-001**

#### Instructions

1. `scrollContent`: `gap: 16`, `padding: 16`.
2. Add to `heroCard`, `selectorCard`, `billCard`, `stepsCard`, `highlightsCard`:
   `borderWidth: StyleSheet.hairlineWidth, borderColor: booking.colors.border`
3. `heroPriceSuffix`: color → `booking.colors.inkMuted`.

#### Acceptance criteria
- [ ] Consistent 16px vertical rhythm between major blocks.
- [ ] Cards visually match Stay Info sheet borders.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`

---

### VS-BOOK-039 — Selector row completion states (icon color)

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Reserve — Polish |
| **Estimate** | 0.25 day |

#### Cause
Only dates icon turns orange when done; guests icon stays gray even when configured.

#### Outcome
Each row icon uses accent when step `done`, muted when pending.

#### Dependencies
- None.

#### Instructions

1. Guests row: `color={guests.adults > 0 ? accent : muted}` (same pattern as dates).
2. Optional: subtle green checkmark on right when done, replace chevron.

#### Acceptance criteria
- [ ] Dates, guests, travellers rows reflect completion visually.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`

---

## Epic 3 — Stay Info & shared sheets

---

### VS-BOOK-040 — Stay Info sheet: dynamic height with scroll cap

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Sheets |
| **Estimate** | 0.5 day |

#### Cause
Fixed `modalHeight` 88% leaves empty space for short descriptions after scroll fix.

#### Outcome
Short content → shorter sheet; long content → scroll at 88% cap.

#### Dependencies
- Current Stay Info implementation

#### Instructions

1. Evaluate Modalize `adjustToContentHeight` with `modalHeight={STAY_INFO_SHEET_HEIGHT}` — read Modalize docs: **cannot use both** per invariant.
2. Alternative: measure content with `onLayout` on `StayInfoSheet` root; set sheet height `Math.min(contentHeight + handlePadding, STAY_INFO_SHEET_HEIGHT)` via state ref on open.
3. Keep `disableScrollIfPossible={false}` always.
4. Test with 2-line and 20-paragraph descriptions.

#### Acceptance criteria
- [ ] Short stays: sheet does not occupy 88% empty space.
- [ ] Long stays: scroll works.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`
- `Mobile/components/property/StayInfoSheet.tsx`

---

## Epic 4 — Micro-interactions & delight (P2)

> **Goal:** Memorable moments without blocking core flows.  
> **Use** `react-native-reanimated` + `expo-haptics` where already in project.

---

### VS-BOOK-050 — Wishlist heart spring + haptic

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Micro-interactions |
| **Estimate** | 0.5 day |

#### Cause
Wishlist toggle has no feedback — feels unresponsive vs Airbnb save animation.

#### Outcome
Heart scales 1 → 1.3 → 1 on toggle; light impact haptic on success.

#### Dependencies
- `expo-haptics` in project (add if missing)
- Reanimated if doing spring on UI thread

#### Instructions

1. Wrap heart icon in `Animated.View`.
2. On `handleWishlistToggle` success: `withSequence(withSpring(1.3), withSpring(1))`.
3. `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`.
4. Respect `wishlistBusy` — no double animation.

#### Acceptance criteria
- [ ] Animation runs only on successful toggle.
- [ ] No jank on Android low-end device.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`

---

### VS-BOOK-051 — Carousel photo counter crossfade

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Micro-interactions |
| **Estimate** | 0.5 day |

#### Cause
Photo pill text swaps abruptly on carousel snap.

#### Outcome
Counter fades out/in on index change.

#### Dependencies
- None.

#### Instructions

1. On `onSnapToItem`, trigger `FadeOut` / `FadeIn` on pill text (Reanimated 2/3).
2. Duration 150ms.

#### Acceptance criteria
- [ ] Counter updates smoothly on swipe.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`

---

### VS-BOOK-052 — Reserve price ticker on date change

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Micro-interactions |
| **Estimate** | 1 day |

#### Cause
Payable amount jumps instantly — misses opportunity to reinforce value clarity.

#### Outcome
Footer and bill totals animate count-up over ~300ms when `payableNow` changes.

#### Dependencies
- **VS-BOOK-030** (pricing structure stable)

#### Instructions

1. Use `react-native-reanimated` shared value or simple `Animated.Value` listener.
2. On `billDetails.payableNow` change, interpolate displayed number.
3. Skip animation on initial mount.

#### Acceptance criteria
- [ ] Numbers animate on date/guest/coupon changes.
- [ ] No animation loop or wrong final value.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`

---

### VS-BOOK-053 — Booking step completion animation

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Micro-interactions |
| **Estimate** | 0.5 day |

#### Cause
Step checkmarks appear statically — weak sense of progress.

#### Outcome
When step flips to `done`, icon background scales in with checkmark.

#### Dependencies
- None.

#### Instructions

1. In `steps.map`, wrap `stepIconWrap` with entering animation when `step.done` becomes true (`LayoutAnimation` or Reanimated `entering`).
2. Optional: row background flash `#F0FDF4` fading out.

#### Acceptance criteria
- [ ] Completing dates/guests shows brief celebratory feedback.
- [ ] Does not re-animate on every re-render.

#### Files
- `Mobile/app/(screens)/reserve-page/[id].tsx`

---

### VS-BOOK-054 — Sticky footer slide-up on property load

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Micro-interactions |
| **Estimate** | 0.25 day |

#### Cause
Footer appears before content loads — can feel abrupt.

#### Outcome
Footer translates up from bottom once `property` is defined.

#### Dependencies
- **VS-BOOK-012**

#### Instructions

1. `translateY: 100` → `0` with spring when `property` set.
2. Use `pointerEvents` none while hidden.

#### Acceptance criteria
- [ ] Single entrance animation per page visit.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`

---

### VS-BOOK-055 — Booking success screen (replace Alert)

| | |
|---|---|
| **Priority** | P2 |
| **Epic** | Micro-interactions |
| **Estimate** | 1 day |

#### Cause
`Alert.alert` for booking success feels native-system, not branded or memorable.

#### Outcome
Full-screen or modal success with illustration, “Request sent”, CTA to My Bookings.

#### Dependencies
- Checkout flow in `handleCheckout`

#### Instructions

1. Create `BookingSuccessModal.tsx` with check illustration (Lottie optional).
2. On 200 response, show modal instead of Alert.
3. Primary: `View bookings` → `router.replace("/(tabs)/Booking")`.
4. Secondary: dismiss stays on reserve or goes home — product decision.

#### Acceptance criteria
- [ ] No system Alert on success path.
- [ ] User can reach Booking tab in one tap.

#### Files
- `Mobile/components/booking/BookingSuccessModal.tsx` (new)
- `Mobile/app/(screens)/reserve-page/[id].tsx`

---

## Epic 5 — Reviews & social proof (P1 — needs backend)

---

### VS-BOOK-060 — Reviews module on Property Detail

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Trust |
| **Estimate** | 2–3 days (+ backend) |

#### Cause
No ratings or reviews — users cannot validate quality; audit identified as P0 trust gap.

#### Outcome
Reviews section with average rating, count, and 2–3 preview cards; “Show all reviews” sheet.

#### Dependencies
- **Backend:** reviews by `propertyId`
- **VS-BOOK-010** (trust row at top should use same data)

#### Instructions

1. API: `GET /properties/:id/reviews` → `{ average, count, items[] }`.
2. Add `renderReviewsSection()` after Stay Information.
3. Preview: 2 reviews max, avatar, name, date, stars, excerpt.
4. Sheet for full list with pagination.
5. Empty state: encourage first booking — match VS-BOOK-010 placeholder.

#### Acceptance criteria
- [ ] Reviews render when API returns data.
- [ ] Empty state when count 0.
- [ ] Top trust row and reviews section use same numbers.

#### Files
- `Mobile/app/(screens)/property-info/[id].tsx`
- `Mobile/components/property/ReviewsSheet.tsx` (new)
- Backend reviews API

---

## Dependency graph (summary)

```
VS-BOOK-000 (tokens)
    ├── VS-BOOK-001 (migrate colors)
    ├── VS-BOOK-013, 015, 020, 021, 030, 031, 038
    └── all polish tickets

VS-BOOK-010 (hero hierarchy)
    ├── VS-BOOK-011 (chips)
    ├── VS-BOOK-016 (section order)
    └── VS-BOOK-060 (reviews — shared trust data)

VS-BOOK-013 (amenity helper)
    └── VS-BOOK-020 (amenities sheet)

VS-BOOK-030 (pricing clarity)
    ├── VS-BOOK-052 (price ticker)
    └── VS-BOOK-036 (coupon sheet)

VS-BOOK-033 (modal scroll)
    └── VS-BOOK-035 (traveller sheet)

Backend (parallel)
    ├── VS-BOOK-034 (blocked dates)
    └── VS-BOOK-060 (reviews)
```

---

## Suggested sprint allocation

| Sprint | Tickets | Theme |
|--------|---------|-------|
| **Sprint 1** | 000, 001, 010, 011, 012, 013, 014, 020, 030, 031 | Foundation + P0 trust/hierarchy + pricing clarity |
| **Sprint 2** | 015, 016, 021, 032, 033, 037, 034 (if API ready), 060 (if API ready) | IA, sheets, data |
| **Sprint 3** | 017, 035, 036, 038, 039, 040, 022 | Flow continuity + polish |
| **Sprint 4** | 050–055 | Micro-interactions + success moment |

---

## QA regression checklist (booking funnel)

Run before each release touching these screens:

- [ ] Property detail loads with slow network (3G throttle).
- [ ] Stay Information sheet scrolls for long description.
- [ ] Amenities sheet scrolls for 25+ items.
- [ ] Wishlist works logged in / redirects logged out.
- [ ] Reserve: short-term date range selects and closes calendar.
- [ ] Reserve: long-term month + duration confirms correctly.
- [ ] Guest stepper respects min adults = 1.
- [ ] Payable now copy matches product rules; coupon behavior clear.
- [ ] Checkout succeeds and navigates to Bookings.
- [ ] Footer safe area on iPhone with home indicator.
- [ ] Android back button closes sheets before exiting screen.

---

## Ticket index

| ID | Title | Priority |
|----|-------|----------|
| VS-BOOK-000 | Shared booking design tokens | P0 |
| VS-BOOK-001 | Migrate screens to tokens | P0 |
| VS-BOOK-010 | Property hero name/location/reviews | P0 |
| VS-BOOK-011 | Quick facts with labels | P0 |
| VS-BOOK-012 | Property loading skeleton | P0 |
| VS-BOOK-013 | Amenities preview fix + icons | P0 |
| VS-BOOK-014 | Remove fake host metrics | P0 |
| VS-BOOK-015 | Section typography unification | P1 |
| VS-BOOK-016 | Reorder property sections | P1 |
| VS-BOOK-017 | Location / map section | P1 |
| VS-BOOK-020 | Amenities sheet redesign | P0 |
| VS-BOOK-021 | Footer price affordance | P1 |
| VS-BOOK-022 | ScrollView refactor | P2 |
| VS-BOOK-030 | Pricing quotation vs due today | P0 |
| VS-BOOK-031 | Reserve footer safe area + CTA states | P0 |
| VS-BOOK-032 | Dynamic step counter | P1 |
| VS-BOOK-033 | Calendar/guest sheet scroll | P1 |
| VS-BOOK-034 | API blocked dates | P1 |
| VS-BOOK-035 | Traveller bottom sheet | P1 |
| VS-BOOK-036 | Coupon bottom sheet | P2 |
| VS-BOOK-037 | Reserve loading skeleton | P1 |
| VS-BOOK-038 | Reserve card spacing/borders | P2 |
| VS-BOOK-039 | Selector completion icons | P2 |
| VS-BOOK-040 | Stay sheet dynamic height | P2 |
| VS-BOOK-050 | Wishlist heart animation | P2 |
| VS-BOOK-051 | Photo counter crossfade | P2 |
| VS-BOOK-052 | Price ticker | P2 |
| VS-BOOK-053 | Step completion animation | P2 |
| VS-BOOK-054 | Footer slide-up | P2 |
| VS-BOOK-055 | Booking success modal | P2 |
| VS-BOOK-060 | Reviews module | P1 |

---

*End of document. For questions, reference the original UX audit conversation or assign epic owner in your project tracker.*
