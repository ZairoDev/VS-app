# Reservation Page — UX Audit & Engineering Tickets

**Document version:** 1.0  
**Created:** 2026-07-02  
**Primary file audited:** `Mobile/app/(screens)/reserve-page/[id].tsx` (~1,606 lines)  
**Supporting components:** `TravellerSheet`, `CouponSheet`, `BookingSuccessModal`, `booking-theme` tokens  
**Route:** `/(screens)/reserve-page/[id]` (navigated from Property Detail “Reserve” CTA)

---

## Step 1 — Reference patterns (short research)

Before auditing the implementation, these booking/checkout patterns were used as benchmarks:

| Product | What they do well | Takeaway for Vacation Saga |
|---------|-------------------|------------------------------|
| **Airbnb** | Dates/guests in focused sheets; total price surfaced early; trust copy only when relevant; account not required until commit | One task per surface; show “due today” vs full stay cost clearly; don’t stack marketing blocks above the form |
| **OpenTable** | Party size → date → time as a tight sequence; review screen before confirm; minimal fields on main path | Chunk required inputs into a scannable list with one primary CTA; review step before payment |
| **Calendly** | Single-column flow; calendar + time slots; few fields; instant confirmation state | Remove duplicate instructions; every line on screen should advance the booking |
| **Shopify / Baymard-style checkout** | Persistent order summary; progressive steps; optional fields collapsed; guest checkout | Sticky price + one progress indicator; coupons/policies secondary |
| **Booking.com (accommodation)** | Property recap is compact; dates/guests editable inline; price breakdown expandable | Hero should be a recap chip, not a second property detail page |

**Shared principles:** progressive disclosure, visual hierarchy, reduced cognitive load, pricing transparency before commit, single-column mobile layout.

---

## 1. Current State Summary

The reservation screen is a **single monolithic React component** (`ReservationScreen` in `reserve-page/[id].tsx`) with four Modalize bottom sheets mounted at all times.

### Page structure (top → bottom, scroll)

| # | Section | Component / code | Always visible? | Notes |
|---|---------|------------------|-----------------|-------|
| A | **Header** | `styles.header` | Yes | Back + “Reserve” title |
| B | **Property hero card** | `heroCard` | After load | Cover image (`propertyCoverFileUrl` only), stay-type badge, **VSID**, name, bed/bath/guest chips, unit price |
| C | **Section intro** | `sectionIntro` | Yes | Eyebrow “BOOKING FLOW”, heading “Plan your stay”, 2-line instructional paragraph |
| D | **Trip details card** | `selectorCard` | Yes | Header “Trip details” + meta (`X steps left` / `Ready to checkout`); 3 tappable rows: Dates/Months, Guests, Traveller details — each with **label + value + subtext** |
| E | **Coupon row** | `couponRow` | Yes | Full-width row: icon, “Apply a coupon code”, “Optional”, chevron → `CouponSheet` |
| F | **Price summary OR steps guide** | `billCard` **or** `stepsCard` | Conditional | If dates selected → “Price summary” (Stay quotation + Due today). Else → “Finish your booking” 4-step checklist (dates, guests, travellers, coupon) with Done/Pending badges |
| G | **Why book here** | `highlightsCard` | Yes | 3 marketing bullets (secure, fast, clear pricing) |
| H | **Cancellation policy** | `policyRow` | Yes | Hardcoded: “Free cancellation within 24 hrs · 70% refund up to 7 days…” |
| I | **Sticky footer** | `styles.footer` | Yes | Left: animated “Due today” or unit price; Right: CTA (`Select Dates` → `Proceed to Checkout`) |

### Bottom sheets (progressive inputs)

| Sheet | Trigger | Content |
|-------|---------|---------|
| Calendar / long-term | Dates row | Short-term: `react-native-calendars` period picker. Long-term: month grid + 6/9/12 month chips |
| Guests | Guests row | Adults / children / infants steppers |
| Travellers | Traveller row | `TravellerSheet` — passport/ID form + list |
| Coupon | Coupon row | `CouponSheet` — code input + available coupons list |

### State & business logic (relevant to UX)

- Property fetched via `POST /properties/getParticularProperty`.
- Pricing: **Stay quotation** (nights × rate or monthly rent) vs **Due today** (€75 short-term platform fee or 1 month rent long-term). Coupon discounts quotation only.
- Checkout: `POST /traveller-booking/create-booking/` — validates login, dates, guests; **does not validate traveller count** despite UI copy saying traveller details are “Required”.
- Success: `BookingSuccessModal` → My Bookings.

### What was already improved (prior `VS-BOOK-03x` work)

Tokens, skeleton loading, bill split (quotation vs due today), traveller/coupon sheets, step counter in trip header, footer safe area, animated price ticker — these are **good foundations** but the page still presents **too many simultaneous sections**.

---

## 2. Problems Identified

| ID | Problem | Why it hurts UX | Principle | Severity |
|----|---------|-----------------|-----------|----------|
| **P1** | **Duplicate progress systems** — Trip header meta (`2 steps left`), steps card (4/4 pill + Done/Pending), footer CTA label, and step icons in rows all communicate progress | Users must reconcile 3–4 progress indicators; increases cognitive load and feels “busy” | Cognitive load / redundancy | **High** |
| **P2** | **Steps card + trip details card overlap** — Before dates are selected, the steps card repeats the same four tasks already listed in the selector card (+ coupon row) | Same information twice on one scroll; Hick’s Law — more parallel choices without new value | Redundancy / Hick’s Law | **High** |
| **P3** | **Section intro paragraph** restates what selector subtexts already say | Extra reading before action; violates “one screen, one job” | Progressive disclosure | **High** |
| **P4** | **Marketing block always on screen** — “Why book here” (3 items) + hardcoded cancellation policy below the form | Trust content competes with task completion; policy may be wrong for this property | Visual hierarchy | **High** |
| **P5** | **Hero card is a mini property-detail page** — large image, VSID, meta chips, price — user just came from property detail | Repeated context; VSID is internal metadata, not booking-relevant | Information hierarchy | **Medium** |
| **P6** | **Selector rows are verbose** — 3 text lines per row (label, value, helper subtext) even when complete | Vertical density; harder to scan 3 tasks quickly | Scanability | **Medium** |
| **P7** | **Coupon promoted twice** — dedicated row + step #4 in checklist | Optional discount feels mandatory; adds visual weight | Signal-to-noise | **Medium** |
| **P8** | **Bill card appears abruptly** — swapping steps card for full price summary changes scroll height and content model | Layout shift / change of mental model when dates selected | Consistency | **Medium** |
| **P9** | **Traveller “required” copy vs no checkout validation** | Trust break if users skip travellers and booking still succeeds (or fails opaquely later) | Error prevention / trust | **High** |
| **P10** | **Hardcoded cancellation policy** | Legal/trust risk if property rules differ | Accuracy / trust | **Medium** |
| **P11** | **Hero uses only `propertyCoverFileUrl`** — not merged gallery | Inconsistent with property detail; may show wrong/missing image | Consistency | **Low** |
| **P12** | **1,606-line single file** — all layout, sheets, styles inline | Slow iteration; higher risk of inconsistent UX tweaks | Maintainability (enables UX drift) | **Medium** |
| **P13** | **CTA copy “Proceed to Checkout”** but no separate payment WebView on this screen — booking is created immediately | Expectation mismatch; users may think another step exists | Mental model | **Medium** |
| **P14** | **Long-term month grid shows 12 chips** in sheet without search | Many options at once; fine for MVP but heavy on small phones | Hick’s Law | **Low** |

---

## 3. What Will Work vs What Won’t

| Proposed change | Verdict | Reasoning (tied to references) |
|-----------------|---------|--------------------------------|
| **Remove steps card entirely; keep trip details + footer as sole progress** | ✅ **Will work** | Airbnb/Calendly use one checklist surface, not two. Trip card already has completion via icon color + `tripMeta`. |
| **Remove “BOOKING FLOW / Plan your stay” intro block** | ✅ **Will work** | OpenTable leads with inputs, not essay. Header title “Reserve” is sufficient. |
| **Shrink hero to compact recap** (thumbnail, name, dates summary when set, due-today price) | ✅ **Will work** | Booking.com checkout recap pattern; user already saw full detail on previous screen. |
| **Hide VSID on reserve screen** | ✅ **Will work** | Internal ID erodes premium positioning (same fix as property detail VS-BOOK-010). |
| **Collapse “Why book here” into expandable “Good to know”** | ✅ **Will work** | Progressive disclosure; Baymard — policies/trust below fold or behind link. |
| **Move coupon to inside price summary** (“Add coupon” text link) | ✅ **Will work** | Shopify pattern — discounts secondary to primary total. |
| **Make stay quotation collapsible** (“Show stay breakdown”) with due-today always visible | ✅ **Will work** | Airbnb total-first pattern; reduces sticker shock while keeping transparency. |
| **Validate travellers at checkout OR label optional** | ✅ **Must do** | Error prevention; align copy with backend contract. |
| **Replace hardcoded cancellation with API/property rules** | ✅ **Will work** if data exists; ⚠️ blocked if not | Trust at scale (Airbnb lesson). |
| **Convert to true multi-page checkout (dates page → guests page → pay)** | ⚠️ **Won’t work short-term** | High eng cost; current sheets already modalize inputs — better to simplify single scroll than rebuild flow. |
| **Remove traveller collection entirely** | ❌ **Won’t work without product sign-off** | May be legally/operationally required for cross-border rentals — **assumption: required until PM confirms**. |
| **Remove sticky footer** | ❌ **Won’t work** | Mobile booking needs persistent price + CTA (OpenTable, Airbnb). |
| **Show all bill line items always before dates** | ❌ **Won’t work** | Empty/zero states add noise; keep price summary gated on date selection. |
| **Keep 4-step animated checklist AND trip card** | ❌ **Won’t work** | Directly causes P1/P2 overload; pick one. |

---

## 4. Recommended Direction

### Target information architecture

**Goal:** One calm, task-oriented screen — “complete your trip” — with trust/legal content progressive, not parallel.

#### Visible by default (above fold priority)

1. Compact property recap (no VSID)
2. Trip details card (3 rows max; subtext only when incomplete)
3. Sticky footer: **Due today** + primary CTA

#### Visible after dates selected

4. Price summary card:
   - **Due today** (expanded, primary)
   - Stay quotation (collapsed by default, expandable)
   - Coupon as inline link inside this card

#### Progressive / collapsed

5. “Good to know” accordion: cancellation, secure booking, how confirmation works
6. All heavy inputs remain in bottom sheets (calendar, guests, travellers, coupon)

#### Removed from main scroll

- Section intro (“BOOKING FLOW…”)  
- Steps guide card (`stepsCard`)  
- Standalone coupon row  
- Standalone “Why book here” card  

### ASCII wireframe (target)

```
┌─────────────────────────────────────┐
│ ←  Reserve                          │
├─────────────────────────────────────┤
│ ┌────┐  Villa Aurora · Athens       │
│ │img │  Short-term · €120/night     │  ← compact recap (tap → property detail)
│ └────┘                              │
├─────────────────────────────────────┤
│ Trip details          1 step left   │
│ ┌─────────────────────────────────┐ │
│ │ 📅  Dates    12 Jul → 18 Jul    >│ │
│ │ 👥  Guests   2 adults           >│ │
│ │ 🪪  Travellers  Add details     >│ │  ← subtext only if incomplete
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Price summary                       │  ← only when dates set
│ ┌─────────────────────────────────┐ │
│ │ DUE TODAY              €75.00   │ │
│ │ Platform reservation fee        │ │
│ │ ─────────────────────────────── │ │
│ │ Stay quotation      Show breakdown│ │  ← collapsed
│ │ [Add coupon code]               │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ▸ Good to know                      │  ← collapsed accordion
└─────────────────────────────────────┘
│ Due today €75.00  [ Request booking ]│  ← sticky footer
└─────────────────────────────────────┘
```

### CTA language

Rename **“Proceed to Checkout”** → **“Request booking”** or **“Send booking request”** to match immediate API action and success modal (“Request sent”).

---

## 5. Inspiration References

1. **Airbnb** — Total/due-today pricing clarity before commit; inputs in overlays not on main scroll.  
2. **OpenTable** — Sequential party → date → time; one review moment before confirm.  
3. **Calendly** — Minimal copy; single-column; confirmation state is unmistakable.  
4. **Baymard / Shopify checkout** — Optional fields deprioritized; order summary persistent in footer.  
5. **Booking.com** — Compact property recap on checkout, not full listing reprise.

---

## 6. Assumptions & open questions

| # | Assumption | Needs product/legal confirmation? |
|---|------------|-----------------------------------|
| A1 | Traveller passport/ID details are **required** for compliance | **Yes** — if optional, change copy and validation; if required, enforce at checkout |
| A2 | Hardcoded cancellation text is **not** authoritative | **Yes** — replace with `property` rules or static CMS content |
| A3 | Platform fee (€75 / 1 month rent) model stays as-is | **Yes** — UX should not change pricing rules |
| A4 | Coupon remains **optional** | Likely yes — should not occupy primary row |
| A5 | Users may book without re-viewing full property gallery on reserve | **Yes** — compact thumbnail is enough |
| A6 | No separate payment WebView in this release — “checkout” = create booking request | **Yes** — CTA copy should reflect this |

---

## 7. Engineering Tickets

Tickets are dependency-ordered. IDs use `VS-RES-` prefix to distinguish from completed `VS-BOOK-03x` polish work.

---

### VS-RES-001 — Remove duplicate progress UI (steps card + intro copy)

| Field | Detail |
|-------|--------|
| **Problem** | P1, P2, P3 — duplicate progress and instructional copy |
| **Solution** | Delete `sectionIntro` block and entire `stepsCard` branch (lines ~627–635, ~785–829). Rely on `selectorCard` header `tripMeta` + row icon states + footer CTA for progress. |
| **Acceptance criteria** | (1) Main scroll has no “BOOKING FLOW” or “Finish your booking” card. (2) Progress still visible via trip header meta. (3) No regression to date/guest/traveller flows. |
| **Effort** | **S** |
| **Priority** | **P0** |
| **Files** | `reserve-page/[id].tsx` |
| **Depends on** | — |

---

### VS-RES-002 — Compact property recap hero

| Field | Detail |
|-------|--------|
| **Problem** | P5, P11 — hero repeats property detail; wrong image source |
| **Solution** | Replace `heroCard` with a **horizontal recap row**: 56×56 thumbnail via `getPropertyImages(property)[0]`, property name (1 line), stay type + unit price inline. Remove VSID. Optional chevron → back to property detail. Target height ~72–88px (vs current ~280px). |
| **Acceptance criteria** | (1) Hero vertical space reduced by ≥50%. (2) VSID not shown. (3) Thumbnail uses merged gallery helper. (4) Name and price still readable. |
| **Effort** | **M** |
| **Priority** | **P0** |
| **Files** | `reserve-page/[id].tsx`, `utils/property-display.ts` |
| **Depends on** | — |

---

### VS-RES-003 — Simplify selector rows (conditional subtext)

| Field | Detail |
|-------|--------|
| **Problem** | P6 — three lines per row always |
| **Solution** | Show `selectorSubtext` **only when row is incomplete**. When complete, row = icon + label + value + chevron (2 lines max). Traveller row: hide “Required for booking confirmation” until user attempts checkout without travellers (if required). |
| **Acceptance criteria** | (1) Completed date row shows no helper subtext. (2) Incomplete rows still show one helper line. (3) Row tap targets unchanged (≥44px). |
| **Effort** | **S** |
| **Priority** | **P1** |
| **Depends on** | VS-RES-001 |

---

### VS-RES-004 — Relocate coupon into price summary

| Field | Detail |
|-------|--------|
| **Problem** | P7 — coupon row adds noise |
| **Solution** | Remove standalone `couponRow`. Inside `billCard`, add text button “Add coupon code” / applied state chip. Opens same `CouponSheet`. When no dates selected, coupon entry unavailable (disabled hint). |
| **Acceptance criteria** | (1) No standalone coupon card on main scroll. (2) Coupon still applicable and reflected in quotation. (3) Applied coupon visible in price summary. |
| **Effort** | **S** |
| **Priority** | **P1** |
| **Depends on** | VS-RES-001 |
| **Files** | `reserve-page/[id].tsx` |

---

### VS-RES-005 — Collapsible stay quotation in price summary

| Field | Detail |
|-------|--------|
| **Problem** | P8 — bill card heavy; quotation competes with due today |
| **Solution** | Default view: **Due today** group expanded. “Stay quotation” group collapsed behind “Show breakdown” toggle (Pressable). Expanded shows nights/months, base price, coupon discount, footnote. Footer sticky amount unchanged (due today only). |
| **Acceptance criteria** | (1) On date select, due today visible without scrolling on iPhone 14-sized viewport. (2) Breakdown expands/collapses without layout jump in footer. (3) Animated price ticker still targets payable amount. |
| **Effort** | **M** |
| **Priority** | **P1** |
| **Depends on** | VS-RES-004 |
| **Files** | `reserve-page/[id].tsx` |

---

### VS-RES-006 — “Good to know” accordion (trust + policy)

| Field | Detail |
|-------|--------|
| **Problem** | P4, P10 — marketing + policy always visible; policy hardcoded |
| **Solution** | Replace `highlightsCard` + `policyRow` with single collapsed `GoodToKnowAccordion`: secure booking, confirmation timing, cancellation policy. Policy text from property fields if available (`additionalRules`, smoking/pet strings) else fallback to legal-approved static copy — **flag content with PM**. |
| **Acceptance criteria** | (1) Collapsed by default. (2) Expanded shows ≤3 items. (3) No hardcoded policy on main scroll when collapsed. (4) If no policy data, show “See property rules on listing” link back to detail. |
| **Effort** | **M** |
| **Priority** | **P1** |
| **Depends on** | VS-RES-001 |
| **Files** | `reserve-page/[id].tsx`, new `components/booking/GoodToKnowAccordion.tsx` |

---

### VS-RES-007 — Traveller requirement alignment (validation or copy)

| Field | Detail |
|-------|--------|
| **Problem** | P9 — copy says required; `handleCheckout` does not check `travellerCount` |
| **Solution** | **Option A (if required):** Block checkout with inline alert if `travellerCount < 1` (or `< guests.adults` per business rule); open traveller sheet. **Option B (if optional):** Change subtext to “Optional — add for faster confirmation”. Implement per PM decision. |
| **Acceptance criteria** | (1) UI copy matches enforcement. (2) No successful booking when required data missing. (3) QA test: checkout with 0 travellers behaves as documented. |
| **Effort** | **S** |
| **Priority** | **P0** |
| **Depends on** | — |
| **Files** | `reserve-page/[id].tsx`, possibly backend contract doc |

---

### VS-RES-008 — CTA label & disabled state clarity

| Field | Detail |
|-------|--------|
| **Problem** | P13 — “Proceed to Checkout” implies another step |
| **Solution** | CTA states: `Select dates` → `Add traveller details` (if required & missing) → `Request booking` (when ready). Loading: `Sending request…`. Disable when `propertyLoading` or submitting. |
| **Acceptance criteria** | (1) No “Checkout” string on screen. (2) CTA reflects next blocking action. (3) Success modal still shows after submit. |
| **Effort** | **S** |
| **Priority** | **P1** |
| **Depends on** | VS-RES-007 |
| **Files** | `reserve-page/[id].tsx` |

---

### VS-RES-009 — Extract reserve sections into components

| Field | Detail |
|-------|--------|
| **Problem** | P12 — monolith hinders consistent UX iteration |
| **Solution** | Extract: `ReserveHeader`, `ReservePropertyRecap`, `TripDetailsCard`, `PriceSummaryCard`, `ReserveFooter`, sheet wrappers unchanged. Pass typed props; no behavior change in first pass. |
| **Acceptance criteria** | (1) `reserve-page/[id].tsx` under ~400 lines. (2) Zero visual diff in screenshot comparison. (3) All sheets still open/close correctly. |
| **Effort** | **L** |
| **Priority** | **P2** |
| **Depends on** | VS-RES-001 through VS-RES-006 |
| **Files** | `components/booking/*`, `reserve-page/[id].tsx` |

---

### VS-RES-010 — Reduce scroll jump when dates first selected

| Field | Detail |
|-------|--------|
| **Problem** | P8 — swapping steps card for bill card shifts content |
| **Solution** | After VS-RES-001/005, reserve fixed slot for price summary: show placeholder card (“Select dates to see pricing”) same min-height as collapsed price summary (~120px) before dates chosen. |
| **Acceptance criteria** | (1) Selecting dates does not move trip details card vertically by >24px. (2) Footer does not cover newly revealed content. |
| **Effort** | **S** |
| **Priority** | **P2** |
| **Depends on** | VS-RES-001, VS-RES-005 |
| **Files** | `reserve-page/[id].tsx` |

---

### VS-RES-011 — Long-term month picker progressive disclosure

| Field | Detail |
|-------|--------|
| **Problem** | P14 — 12 month chips at once |
| **Solution** | Show next 6 months by default + “More months” expands to 12. Or horizontal scroll single row. Keep duration chips as-is. |
| **Acceptance criteria** | (1) ≤6 month chips visible initially on 390px width. (2) All 12 months still reachable. (3) Confirm button unchanged. |
| **Effort** | **S** |
| **Priority** | **P2** |
| **Depends on** | — |
| **Files** | `reserve-page/[id].tsx` |

---

## 8. Suggested implementation order

```
Phase 1 (P0 — de-clutter)
  VS-RES-001 → VS-RES-002 → VS-RES-007

Phase 2 (P1 — hierarchy)
  VS-RES-003 → VS-RES-004 → VS-RES-005 → VS-RES-006 → VS-RES-008

Phase 3 (P2 — polish & maintainability)
  VS-RES-010 → VS-RES-011 → VS-RES-009
```

**Estimated impact:** Phase 1 alone removes ~40% of above-the-fold content (intro + steps card + hero shrink), directly addressing the “overloaded and overwhelming” feedback.

---

## 9. QA checklist (post-implementation)

- [ ] Short-term: select dates → guests → travellers → request booking — no duplicate progress UI
- [ ] Long-term: month + duration → same flow
- [ ] Coupon apply/remove reflected in collapsed/expanded quotation
- [ ] Footer shows due today only (not full stay total)
- [ ] Traveller enforcement matches copy
- [ ] Screen reader: trip rows announce completion state
- [ ] iPhone SE + iPad widths: recap row and price summary readable
- [ ] No console warnings from removed steps card animations

---

*End of document.*
