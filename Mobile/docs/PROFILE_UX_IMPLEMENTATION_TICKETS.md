# Vacation Saga — Profile / Account UX Implementation Tickets

**Document version:** 1.0  
**Created:** 2026-07-04  
**Source:** Profile screen UX audit (`Menu.tsx` — Account / Profile tab)  
**Audience:** Mobile engineers, UI implementers, QA  
**Primary file today:** `Mobile/app/(tabs)/Menu.tsx`  
**Related screens:** `Mobile/app/(tabs)/_layout.tsx`, `Mobile/app/(screens)/pages/profile-page.tsx`, auth components under `Mobile/components/auth/`

---

## How to use this document

Each ticket is written to be **copy-pasted into Jira, Linear, or GitHub Issues**. Fields are consistent:

| Field | Meaning |
|-------|---------|
| **ID** | Internal reference (e.g. `VS-PROF-001`) |
| **Priority** | P0 = ship / clarity blocker · P1 = strong UX · P2 = polish / delight |
| **Epic** | Grouping for sprint planning |
| **Estimate** | Rough eng effort (0.5 day, 1 day, 2 days, etc.) |
| **Cause** | Why this exists (user pain or design debt from the audit) |
| **Outcome** | What users will experience after completion |
| **Dependencies** | Tickets or work that must land first |
| **Instructions** | Step-by-step implementation guide for the assignee |
| **Acceptance criteria** | Definition of done for QA |
| **Files** | Primary touchpoints (verify paths before editing) |
| **Out of scope** | What this ticket must *not* expand into |

**Recommended sprint order:** Epic 0 → Epic 1 (P0 IA) → Epic 2–3 (header + visual system) → Epic 4 (logout) → Epic 5–6 (value features) → Epic 7–8 (motion + a11y) → Epic 9 (cleanup).

**Design north star (from audit):** This tab is **“who I am + what’s next in my travel life”**, not a second navigation menu. Align with stone + orange tokens already used in booking/wishlist/auth (`#FAFAF9`, `#1C1917`, `#FF6600`).

**Target information architecture (end state):**

```
┌─────────────────────────────────────┐
│  [soft brand wash]                  │
│  Avatar*    Hi, {name}          ›   │
│             Traveller · Verified    │
│             email                   │
├─────────────────────────────────────┤
│  ┌─ Next trip ───────────────────┐  │  ← only if upcoming booking
│  │  Villa · City · In N days     │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  ACCOUNT                            │
│  Personal information            ›  │
│  Saved travellers                ›  │  ← may be placeholder route
│  Notifications                   ›  │  ← may be placeholder route
├─────────────────────────────────────┤
│  SUPPORT                            │
│  Help & support                  ›  │
│  Privacy policy                  ›  │
│  Terms of use                    ›  │
├─────────────────────────────────────┤
│         [ Log out ]                 │  ← button, not chevron row
│         Vacation Saga · 1.2.0       │
└─────────────────────────────────────┘
* tap avatar → photo actions
  tap name row → personal info
```

**Explicitly removed from end state:** Wishlist / Bookings / Trips quick-action row (duplicates bottom tabs).

---

## Epic 0 — Design system foundation

> **Goal:** One token source for the profile/account surface so later tickets do not invent new hex values.  
> **Do this first.** Most UI tickets depend on shared tokens.

---

### VS-PROF-000 — Create profile design tokens

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Design system |
| **Estimate** | 0.5 day |

#### Cause
`Menu.tsx` and `profile-page.tsx` use ad-hoc colors (`#333`, `#666`, `#aaa`, `#e74c3c`, `#2980b9`, `#27ae60`, `#FF7F11`) while booking, wishlist, and auth already share a stone + orange system (`booking-theme.ts`, `wishlist-theme.ts`, `auth-theme.ts`). Users perceive the profile tab as a different product; engineers will keep drifting without a single source of truth.

#### Outcome
A `profile-theme.ts` (or a documented re-export of `booking` / `auth` tokens) is the only palette/spacing/radius source for profile work. New UI imports tokens instead of hardcoding hex.

#### Dependencies
- None (foundational). Prefer aligning values with existing `booking` / `auth` tokens rather than inventing a third palette.

#### Instructions

1. **Create** `Mobile/Constants/profile-theme.ts`.
2. **Export** tokens aligned with booking/auth (do **not** invent new oranges or grays):
   ```ts
   /**
    * Profile / Account tab design tokens (8pt grid).
    * Import `profile` for Menu tab and profile-page:
    *   import { profile } from "@/Constants/profile-theme"
    *
    * Values intentionally match booking/auth stone + orange.
    */
   export const profile = {
     space: {
       xs: 4,
       sm: 8,
       md: 16,
       lg: 24,
       xl: 32,
       xxl: 40,
     },
     radius: {
       sm: 8,
       md: 12,
       lg: 16,
       xl: 20,
       avatar: 999,
       pill: 999,
     },
     colors: {
       bg: "#FAFAF9",
       surface: "#FFFFFF",
       track: "#F5F5F4",
       ink: "#1C1917",
       inkSecondary: "#57534E",
       inkMuted: "#78716C",
       inkPlaceholder: "#A8A29E",
       accent: "#FF6600",
       accentSoft: "#FFF7ED",
       border: "#E7E5E4",
       divider: "#F5F5F4",
       danger: "#B91C1C",
       dangerSoft: "#FEF2F2",
       overlay: "rgba(0,0,0,0.45)",
     },
     type: {
       eyebrow: {
         fontSize: 11,
         fontWeight: "600" as const,
         letterSpacing: 1.2,
         textTransform: "uppercase" as const,
       },
       displayName: {
         fontSize: 26,
         fontWeight: "700" as const,
         letterSpacing: -0.4,
         lineHeight: 32,
       },
       body: { fontSize: 16, fontWeight: "500" as const, lineHeight: 22 },
       meta: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
       sectionLabel: {
         fontSize: 11,
         fontWeight: "700" as const,
         letterSpacing: 1.1,
         textTransform: "uppercase" as const,
       },
       row: { fontSize: 16, fontWeight: "500" as const },
       caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
     },
     size: {
       avatar: 80,
       iconWell: 40,
       rowMinHeight: 56,
       photoBadge: 36,
     },
     shadow: {
       card: {
         shadowColor: "#1C1917",
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.06,
         shadowRadius: 10,
         elevation: 2,
       },
     },
   } as const
   ```
3. Add a one-line re-export in `auth-theme.ts` **only if** the team prefers one entry point: `export { profile } from "./profile-theme"`. Optional.
4. **Do not** migrate `Menu.tsx` styles in this ticket — tokens file only.
5. Keep TypeScript clean (`as const` where helpful).

#### Acceptance criteria
- [ ] `profile-theme.ts` exists and exports `space`, `colors`, `radius`, `type`, `size`, `shadow`.
- [ ] Accent is `#FF6600`; page bg is `#FAFAF9`; ink is `#1C1917`.
- [ ] File header documents import usage.
- [ ] No runtime breakage; project typechecks for the new file.

#### Out of scope
- Changing any screen UI.
- Refactoring booking/wishlist tokens.

#### Files
- `Mobile/Constants/profile-theme.ts` (new)
- `Mobile/Constants/auth-theme.ts` (optional re-export)

---

## Epic 1 — Information architecture (P0)

> **Goal:** Fix mental model, naming, and redundant navigation before visual polish.  
> Users must understand this tab is **Profile / Account**, not a generic menu.

---

### VS-PROF-001 — Rename tab from “Menu” to “Profile”

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Information architecture |
| **Estimate** | 0.5 day |

#### Cause
The bottom tab is labeled **Menu** with a hamburger icon (`Ionicons` `menu`). Airbnb, Booking.com, and MakeMyTrip use **Profile / Account / Me** with a person (or avatar) icon. “Menu” reads like a drawer and does not signal personal identity. The screen header already says “Account”, so tab and content disagree.

#### Outcome
Users open a tab clearly named **Profile** (or **Account** — pick one product word and use it everywhere). Icon is a person outline; when logged in, optionally show a small avatar later (VS-PROF-014).

#### Dependencies
- None. Can ship alone.

#### Instructions

1. Open `Mobile/app/(tabs)/_layout.tsx`.
2. Find the `Tabs.Screen` with `name="Menu"`.
3. Change `options`:
   - `title: "Profile"` (product decision: **Profile** preferred over Account for tab brevity).
   - Replace icon: use `Ionicons` `person-outline` (inactive) pattern consistent with other tabs — other tabs pass `color` into the icon; do the same:
     ```tsx
     tabBarIcon: ({ color }) => (
       <Ionicons name="person-outline" color={color} size={26} />
     )
     ```
   - Keep `tabBarLabelStyle` consistent with siblings (`fontSize: 11`).
4. **Do not rename the route file** `Menu.tsx` in this ticket unless you also update every `router.push("/(tabs)/Menu")` and `google-auth` redirect. Prefer **label/icon only** to avoid a wide rename. If you do rename the file to `Profile.tsx`, grep the whole `Mobile/` tree for `Menu` route references and update them in the same PR.
5. Grep for user-facing copy that says “Menu” in profile context and align if needed.
6. Confirm `tabBarActiveTintColor` remains brand orange (today `'orange'` — note VS-PROF-003 may later set it to `#FF6600`; not required here).

#### Acceptance criteria
- [ ] Tab label reads **Profile**.
- [ ] Tab icon is a person icon, not hamburger.
- [ ] Tapping the tab still opens the same screen (auth when logged out, account when logged in).
- [ ] No broken deep links / Google auth return path if route file was renamed.

#### Out of scope
- Redesigning the tab bar chrome.
- Avatar-in-tab-bar (see VS-PROF-014).

#### Files
- `Mobile/app/(tabs)/_layout.tsx`
- `Mobile/app/google-auth.tsx` (only if route path changes)
- Any `router.push("/(tabs)/Menu")` call sites (only if route path changes)

---

### VS-PROF-002 — Remove redundant quick actions (Wishlist / Bookings / Trips)

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Information architecture |
| **Estimate** | 0.5 day |

#### Cause
The profile screen’s first interactive block is a three-card row: **Wishlist**, **Bookings**, **Trips**. Those destinations are already primary bottom tabs (`Wishlist`, `Booking`, `Trips`). Duplication wastes prime real estate under the avatar, creates “where do I go?” ambiguity, and makes the profile feel like a second navigation bar. World-class booking apps do not re-list tab destinations as the hero of Profile.

Additionally, the quick action label **Trips** conflicts with the tab bar label **Map** for the same `Trips` screen (naming inconsistency — fixed partly by removal; full naming fix is VS-PROF-003).

#### Outcome
Profile no longer shows Wishlist / Bookings / Trips shortcuts. Scroll starts with identity header, then account/support sections (and later upcoming trip card from VS-PROF-010). Users use the tab bar for those destinations.

#### Dependencies
- None strictly. Best after or with VS-PROF-001 so the tab is already understood as Profile.

#### Instructions

1. Open `Mobile/app/(tabs)/Menu.tsx`.
2. **Delete** the `quickActions` array (labels Wishlist, Bookings, Trips and their `router.push` handlers).
3. **Delete** the JSX block that maps `quickActions` into `quickActionCard` UI (the “Quick actions” section under the profile header).
4. **Delete** unused styles: `quickActionsRow`, `quickActionCard`, `quickActionIcon`, `quickActionLabel`.
5. Do **not** replace with another shortcut row in this ticket. Upcoming trip is VS-PROF-010; new account rows are VS-PROF-011.
6. Visually check spacing: after removal, header should flow into the first section divider / account group with consistent padding (`paddingBottom` on header ~24, then section).

#### Acceptance criteria
- [ ] No Wishlist / Bookings / Trips cards on the profile screen.
- [ ] Bottom tabs still navigate to those screens.
- [ ] No dead code / unused styles for quick actions.
- [ ] Layout does not leave a large empty gap (header → account section is tight and intentional).

#### Out of scope
- Building replacement shortcuts.
- Changing tab bar items.

#### Files
- `Mobile/app/(tabs)/Menu.tsx`

---

### VS-PROF-003 — Align product naming (Trips vs Map) and tab active color token

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Information architecture |
| **Estimate** | 0.5 day |

#### Cause
`Trips.tsx` is shown in the tab bar as **Map** (`title: "Map"`) but was labeled **Trips** in profile quick actions. Even after removing quick actions, the tab bar still says Map while product language elsewhere may say trips. Inconsistent naming breaks trust. Separately, `tabBarActiveTintColor: 'orange'` is a CSS named color, not brand `#FF6600`.

#### Outcome
One product name for the trips/map tab everywhere in the app chrome. Tab active tint matches brand accent.

#### Dependencies
- Product decision required (document in PR): prefer **Trips** for a booking app unless the screen is purely a map explorer with no trip semantics. Default recommendation from audit: **Trips**.

#### Instructions

1. Confirm with PM/design if not already decided: tab label **Trips** vs **Map**.
2. Update `Mobile/app/(tabs)/_layout.tsx`:
   - `Tabs.Screen name="Trips"` → `title: "Trips"` (if that is the decision).
   - Keep map icon if the screen is map-first, or switch to a suitcase/calendar icon if trips-first — note choice in PR.
3. Set `tabBarActiveTintColor` to `#FF6600` (or import from `profile.colors.accent` / `booking.colors.accent` if you can import constants into the layout file cleanly).
4. Grep `Mobile/` for user-facing `"Map"` strings tied to this tab and align.
5. Do not rename the file `Trips.tsx` unless necessary.

#### Acceptance criteria
- [ ] Tab label matches the agreed product name.
- [ ] Active tab color is `#FF6600`, not generic `orange`.
- [ ] No remaining profile UI that calls the same destination by a different name.

#### Out of scope
- Redesigning the Trips/Map screen content.

#### Files
- `Mobile/app/(tabs)/_layout.tsx`

---

### VS-PROF-004 — Relabel “Go to Profile” and make header open personal info

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Information architecture |
| **Estimate** | 0.5–1 day |

#### Cause
The account section’s first row is **Go to Profile** while the user is already on the profile/account hub. That copy implies navigation *away* from the current place. The real destination is `/(screens)/pages/profile-page` — personal information editing. Airbnb-style apps make the identity header tappable and label the row **Personal information** / **Edit profile**.

#### Outcome
Row label is **Personal information** (subtitle optional: “Name, phone, address”). Tapping the avatar+name header row (excluding the photo edit control) navigates to the same screen.

#### Dependencies
- VS-PROF-000 helpful but not required (can hardcode styles temporarily; prefer tokens if available).

#### Instructions

1. In `Menu.tsx`, update `accountItems`:
   - Change `label: "Go to Profile"` → `label: "Personal information"`.
   - Keep `icon: "person"` (or switch to Feather `user` if VS-PROF-008 standardizes icons).
   - Keep `onPress: () => router.push("/(screens)/pages/profile-page")`.
2. Optionally add a `subtitle` field to menu items (e.g. `"Name, phone, address"`) rendered under the label in 13px muted text — only if it does not crowd the row. If you add subtitles, do it for this row only in this ticket.
3. Wrap the profile text block (`welcomeText`, `nameText`, `profileMetaText`) in a `TouchableOpacity` (or `Pressable`) that calls the same `router.push("/(screens)/pages/profile-page")`.
4. Add a chevron on the right of the header text row to signal navigation (small, `#A8A29E`).
5. Ensure the photo edit control remains a **separate** touch target and does **not** trigger navigation to profile-page (stop propagation by keeping it as its own `TouchableOpacity` sibling, not a child of the header pressable — current structure already has edit as sibling of image; keep text wrap pressable separate from image container).
6. Update accessibility: header pressable `accessibilityRole="button"`, `accessibilityLabel="Personal information"`, `accessibilityHint="Opens your personal details"`.

#### Acceptance criteria
- [ ] No user-visible string “Go to Profile”.
- [ ] Row reads **Personal information** and opens `profile-page`.
- [ ] Tapping name/email area opens `profile-page`.
- [ ] Tapping edit-photo control does **not** open `profile-page`.
- [ ] VoiceOver/TalkBack labels make sense.

#### Out of scope
- Redesigning `profile-page.tsx` (see VS-PROF-009 for token migration there).

#### Files
- `Mobile/app/(tabs)/Menu.tsx`

---

### VS-PROF-005 — Restructure menu groups (Account vs Support) and copy

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Information architecture |
| **Estimate** | 0.5 day |

#### Cause
Legal links (Privacy, Terms) sit in their own **LEGAL** block while Help sits under **ACCOUNT**. Help is support, not account settings. Grouping is slightly off for a hospitality app mental model.

#### Outcome
Two clear groups:
- **ACCOUNT** — Personal information (+ later travellers, notifications)
- **SUPPORT** — Help & support, Privacy policy, Terms of use

Logout remains separate (VS-PROF-007).

#### Dependencies
- VS-PROF-004 (personal information label should already be correct).

#### Instructions

1. Rename section label `LEGAL` → `SUPPORT`.
2. Move **Need Help** out of `accountItems` into the support group.
3. Relabel **Need Help** → **Help & support** (friendlier, matches booking apps).
4. Keep routes:
   - Help → `/(screens)/pages/need-support`
   - Privacy → `/(screens)/pages/privacy-policy`
   - Terms → `/(screens)/pages/terms-conditions`
5. Order in SUPPORT: Help first, then Privacy, then Terms.
6. ACCOUNT group may only contain Personal information until VS-PROF-011 adds more rows — that is fine; a short account list is better than wrong grouping.

#### Acceptance criteria
- [ ] Section labels are ACCOUNT and SUPPORT only (plus logout block).
- [ ] Help is under SUPPORT, not ACCOUNT.
- [ ] Copy is **Help & support**, not **Need Help**.
- [ ] All three support destinations still open correctly.

#### Out of scope
- New screens for travellers/notifications.

#### Files
- `Mobile/app/(tabs)/Menu.tsx`

---

## Epic 2 — Profile header & photo UX

> **Goal:** Identity block feels complete, tappable, and trustworthy. Photo change has proper affordance and feedback.

---

### VS-PROF-006 — Enrich profile header (greeting, role, verification, truncation)

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Profile header |
| **Estimate** | 1 day |

#### Cause
Header shows static eyebrow **Account**, full `user.name`, and `user.email`. It omits role (`Owner` | `Traveller`), verification (`isVerified`), and a human greeting. Long names/emails can overflow without `numberOfLines`. Feels like a settings dump, not a personal travel identity.

#### Outcome
Header reads as a personal identity card:

```
Profile
Hi, Priya                    [chevron]
Traveller · Verified
priya@email.com
```

(or role pill + verified check). Name and email truncate gracefully.

#### Dependencies
- VS-PROF-000 (tokens).
- VS-PROF-004 (header already navigates to personal info).

#### Instructions

1. Import `profile` from `@/Constants/profile-theme`.
2. Replace eyebrow **Account** with **Profile** (or remove eyebrow and use greeting as primary — prefer greeting as primary display).
3. Display name logic:
   - Prefer `user.preferredName` if non-empty, else first token of `user.name`, else `user.name`.
   - Format: `Hi, {displayName}` or just `{displayName}` — pick one; audit recommends `Hi, {name}` for warmth.
4. Meta line under name:
   - Show `user.role` when present (`Traveller` / `Owner`).
   - If `user.isVerified`, append ` · Verified` or a small check icon in `profile.colors.accent` or success green from booking tokens (`#16A34A`) — use success only for verified check, not for decoration.
5. Email: `numberOfLines={1}` `ellipsizeMode="tail"`.
6. Name: `numberOfLines={1}` `ellipsizeMode="tail"`.
7. Apply typography from `profile.type.displayName` and `profile.type.meta`.
8. Colors from `profile.colors.*` only.
9. Remove unused style `profileSupportText` if still present and unused.

#### Acceptance criteria
- [ ] Greeting or clear personal name hierarchy is visible.
- [ ] Role shown when available on `user`.
- [ ] Verified state shown when `user.isVerified === true`.
- [ ] Long name/email do not overflow layout.
- [ ] No hardcoded gray/orange hex outside tokens.

#### Out of scope
- Editing role (read-only display).
- Verification flow / KYC.

#### Files
- `Mobile/app/(tabs)/Menu.tsx`
- `Mobile/types.ts` (read-only; fields already exist on `UserDataType`)

---

### VS-PROF-007 — Profile photo: affordance, loading, toast, action sheet

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Profile header |
| **Estimate** | 1–2 days |

#### Cause
Photo edit is a tiny pencil badge (~26pt) below the 44pt minimum touch target, with no `accessibilityLabel`. Upload has no loading UI; success/failure uses blocking `Alert.alert`. Default avatar is a random Pixabay URL, not brand-owned. Feels unfinished and easy to mis-tap.

#### Outcome
Camera badge (min 36pt), clear loading on avatar, non-blocking success/error feedback, optional action sheet (Library / Cancel). Branded fallback avatar.

#### Dependencies
- VS-PROF-000.
- Existing upload path: `pickImageFromGallery`, `uploadToBunny`, `updateProfilePicInDB`, `handleEditProfilePhoto` in `Menu.tsx` — **reuse**, do not rewrite storage unless broken.

#### Instructions

1. **Badge UI**
   - Replace `edit` icon with `photo-camera` or `camera-alt` (MaterialIcons) or Feather `camera`.
   - Size badge container to at least `profile.size.photoBadge` (36).
   - Use `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` if visual is 36 but needs 44pt effective target.
   - Style: white surface, `profile.colors.border`, subtle shadow optional.
   - `accessibilityLabel="Change profile photo"`.
   - `accessibilityRole="button"`.

2. **Loading state**
   - Add `const [isPhotoUploading, setIsPhotoUploading] = useState(false)`.
   - In `handleEditProfilePhoto`: set true before upload, false in `finally`.
   - While uploading: avatar `opacity: 0.5` + centered `ActivityIndicator` overlay on the image (not full-screen modal).
   - Disable badge press while uploading.

3. **Feedback**
   - Replace success `Alert.alert("Success", "Profile photo updated!")` with a lightweight pattern already used in the app if one exists; otherwise a simple absolute-positioned toast `View` at bottom of the profile scroll (“Photo updated”) that auto-dismisses after 2s, **or** `Alert` only on failure.
   - Prefer: success toast; failure `Alert` or error toast with retry message.
   - Do not leave the user with no feedback on failure.

4. **Action sheet (recommended)**
   - On badge press, show `ActionSheetIOS` on iOS and a simple modal/action list on Android: **Choose from library**, **Cancel**.
   - Wire library option to existing `pickImageFromGallery`.
   - Camera capture is optional in this ticket; if `ImagePicker.launchCameraAsync` is easy and permissions are handled, include **Take photo**; otherwise library-only is acceptable — note in PR.

5. **Default avatar**
   - Prefer a local asset under `Mobile/assets/images/` (add a neutral branded silhouette if none exists).
   - Stop using the Pixabay CDN URL as the primary fallback.
   - If no designer asset yet, use a local placeholder or initials avatar (`View` with first letter of name on `profile.colors.accentSoft` background) — initials are acceptable and often better than a random stock icon.

6. **Security note (do not expand scope):** Bunny `AccessKey` is used client-side today. Do not “fix” upload architecture in this ticket; only improve UX around the existing flow. File a separate security ticket if needed.

#### Acceptance criteria
- [ ] Photo control meets ≥44pt effective touch target.
- [ ] Uploading shows in-avatar loading and blocks double-submit.
- [ ] Success does not rely solely on a blocking alert (toast or inline).
- [ ] Failure is visible to the user.
- [ ] Default/missing photo is branded or initials-based, not Pixabay.
- [ ] Screen reader announces “Change profile photo”.

#### Out of scope
- Moving Bunny upload to backend.
- Image cropping redesign beyond existing `allowsEditing: true`.

#### Files
- `Mobile/app/(tabs)/Menu.tsx`
- `Mobile/assets/images/` (optional new placeholder)

---

## Epic 3 — Visual system & layout

> **Goal:** Profile matches wishlist/booking: stone background, white cards, 8pt grid, monochrome icons.

---

### VS-PROF-008 — Migrate Menu.tsx to profile tokens and card layout

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Visual system |
| **Estimate** | 1–2 days |

#### Cause
Profile uses white page bg, thick 8px gray band dividers, rainbow-adjacent icon colors (removed with quick actions but menu wells still use flat `#f6f6f6`), and off-grid sizes (avatar 82, icon well 34). Looks dated vs `#FAFAF9` card-based wishlist/booking UI.

#### Outcome
Page background `profile.colors.bg`. Account/support groups sit in white cards with `radius.lg`, hairline border or light shadow. No thick gray band dividers. All spacing on 8pt grid. Icons monochrome ink on `track` or `accentSoft` wells.

#### Dependencies
- **VS-PROF-000** (required).
- VS-PROF-002 (quick actions removed so you do not restyle dead UI).
- VS-PROF-005 recommended so section structure is final.

#### Instructions

1. Import `profile` from `@/Constants/profile-theme`.
2. Set `container.backgroundColor` to `profile.colors.bg`.
3. **Remove** `sectionDivider` bands entirely.
4. Wrap each menu group (ACCOUNT, SUPPORT, logout block) in a card:
   ```tsx
   <View style={styles.card}>
     <Text style={styles.sectionLabel}>ACCOUNT</Text>
     {renderMenuGroup(...)}
   </View>
   ```
5. Card style:
   - `backgroundColor: profile.colors.surface`
   - `borderRadius: profile.radius.lg`
   - `borderWidth: StyleSheet.hairlineWidth` or `1`, `borderColor: profile.colors.border`
   - Optional `...profile.shadow.card`
   - Horizontal margin: `profile.space.md` or `lg` (16 or 24 — pick one and use everywhere)
   - Vertical gap between cards: `profile.space.md`
6. Section label: use `profile.type.sectionLabel` + `profile.colors.inkMuted`; padding inside card top.
7. Menu rows:
   - `minHeight: profile.size.rowMinHeight`
   - Icon well: `profile.size.iconWell`, `borderRadius: profile.radius.md`, background `profile.colors.track`, icon color `profile.colors.inkSecondary`
   - Label: `profile.colors.ink`, `profile.type.row`
   - Chevron: `profile.colors.inkPlaceholder`
   - Separator between rows: hairline `profile.colors.divider`, not heavy borders; last row no border
8. Header aura: change gradient orange from `255,127,17` to accent-based `rgba(255,102,0,...)` to match `#FF6600`.
9. Avatar: `profile.size.avatar` (80), border white or surface.
10. Brand footer: muted colors from tokens; keep version string.
11. Delete unused styles (`profileSupportText`, old divider styles, any leftover quick action styles).
12. Screenshot before/after for QA.

#### Acceptance criteria
- [ ] No thick gray full-bleed section bands.
- [ ] Page bg is `#FAFAF9`; cards are white.
- [ ] Avatar is 80pt; icon wells 40pt.
- [ ] No raw hex in `Menu.tsx` styles except inside token file.
- [ ] Visual alignment with wishlist/booking warmth (stone + orange).

#### Out of scope
- Microinteractions (Epic 7).
- profile-page migration (VS-PROF-009).

#### Files
- `Mobile/app/(tabs)/Menu.tsx`

---

### VS-PROF-009 — Migrate profile-page.tsx to the same tokens and icon family

| | |
|---|---|
| **Priority** | P1 |
| **Epic** | Visual system |
| **Estimate** | 1 day |

#### Cause
`profile-page.tsx` uses Feather icons and hardcoded colors (`#Fea850`, `#5f5f5f`, `#1a1a1a`) while `Menu.tsx` uses MaterialIcons. Navigating Profile tab → Personal information feels like two different apps.

#### Outcome
Personal information screen shares bg, ink, accent, card treatment, and one icon family with the Profile tab.

#### Dependencies
- **VS-PROF-000**.
- VS-PROF-008 recommended first so the hub and detail match in one release train.

#### Instructions

1. Import `profile` from `@/Constants/profile-theme`.
2. Replace page/header/card colors with tokens.
3. Accent on edit actions: `profile.colors.accent` (fix `#Fea850`).
4. Page background `profile.colors.bg`; cards `profile.colors.surface`.
5. **Icon family decision (document in PR):** either
   - (A) Convert Menu.tsx rows to Feather, or
   - (B) Convert profile-page to MaterialIcons.
   - Prefer **one** family for all account surfaces. Auth may already use a family — match auth if possible.
6. Keep `EditModal` behavior; only restyle if it uses conflicting colors (include in this ticket if modal is small).
7. StatusBar: `dark-content` on stone bg is fine.

#### Acceptance criteria
- [ ] profile-page uses profile tokens for colors/spacing.
- [ ] Edit action accent is `#FF6600`.
- [ ] Icon family matches Profile tab.
- [ ] Edit/save flows still work.

#### Out of scope
- New fields on the user model.
- Changing API update payload.

#### Files
- `Mobile/app/(screens)/pages/profile-page.tsx`
- `Mobile/components/edit` (EditModal — only if colors need alignment)
- `Mobile/app/(tabs)/Menu.tsx` (only if switching icon family there)

---

## Epic 4 — Logout & session safety

---

### VS-PROF-010 — Logout confirmation and non-navigation treatment

| | |
|---|---|
| **Priority** | P0 |
| **Epic** | Session / trust |
| **Estimate** | 0.5–1 day |

#### Cause
Logout is rendered as a menu row with **chevron-right**, identical to navigational rows. Chevrons mean “another screen.” Logout is a destructive action. There is no confirmation — easy mis-tap signs the user out and destroys in-progress mental context.

**Note on ID:** This ticket ID is VS-PROF-010 in the logout epic; upcoming trip is VS-PROF-011 in the feature epic below. *(If your tracker already reserved numbers differently, keep titles as source of truth.)*

Wait - I need to fix ID collision. In my outline I had:
- VS-PROF-010 upcoming trip
- VS-PROF-007 logout in epic 4

Let me renumber properly in the file. Looking at what I wrote:
- VS-PROF-007 is photo
- I started Epic 4 with VS-PROF-010 for logout - conflict with upcoming trip

I'll use:
- VS-PROF-010 — Logout
- VS-PROF-011 — Upcoming trip
- VS-PROF-012 — Account menu expansion
- etc.

And fix the erroneous note in logout ticket. Let me rewrite the file carefully with clean IDs.

Actually looking at my write content again - I have VS-PROF-007 as photo, then Epic 4 VS-PROF-010 logout, but in Epic 5 I was going to use VS-PROF-010 for upcoming trip. I need consistent numbering:

000 tokens
001 rename tab
002 remove quick actions
003 naming trips/map
004 personal information label
005 restructure groups
006 enrich header
007 photo UX
008 migrate Menu visual
009 migrate profile-page
010 logout
011 upcoming trip
012 account rows expansion
013 owner block
014 microinteractions press/haptics
015 entrance animation + login transition
016 accessibility pass
017 extract components
018 tab bar avatar (optional P2)

I'll continue writing from logout with correct IDs and fix the mistaken note.