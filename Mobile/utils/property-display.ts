import type { PropertyInterface } from "@/types"

const FALLBACK_IMAGE = "https://vacationsaga.b-cdn.net/assets/suitcase.png"

function normalizeImageUrl(url: string): string {
  return url.trim()
}

function isValidImageUrl(url: unknown): url is string {
  return typeof url === "string" && url.trim().length > 0
}

export function hasPropertyPhotos(property: PropertyInterface): boolean {
  if (isValidImageUrl(property.propertyCoverFileUrl)) return true
  return [...(property.propertyImages ?? []), ...(property.propertyPictureUrls ?? [])].some(isValidImageUrl)
}

export function getPropertyImages(property: PropertyInterface): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  const add = (url: unknown) => {
    if (!isValidImageUrl(url)) return
    const normalized = normalizeImageUrl(url)
    if (seen.has(normalized)) return
    seen.add(normalized)
    out.push(normalized)
  }

  // Cover first so the hero matches listing cards, then remaining gallery sources.
  add(property.propertyCoverFileUrl)
  for (const url of property.propertyImages ?? []) add(url)
  for (const url of property.propertyPictureUrls ?? []) add(url)

  if (out.length) return out

  return [FALLBACK_IMAGE]
}

export function getPropertyRating(property: PropertyInterface): number | null {
  if (typeof property.rating === "number" && property.rating > 0) {
    return property.rating
  }
  const raw = (property.newReviews || property.reviews || "").trim()
  if (!raw) return null
  const value = parseFloat(raw)
  return Number.isFinite(value) && value > 0 ? value : null
}

export type PropertyTrustSummary =
  | { kind: "rated"; rating: number; reviewCount: number }
  | { kind: "rating_only"; rating: number }
  | { kind: "new" }

export function getPropertyTrustSummary(property: PropertyInterface): PropertyTrustSummary {
  const rating = getPropertyRating(property)
  const reviewCount =
    typeof property.reviewCount === "number" && property.reviewCount > 0
      ? property.reviewCount
      : null

  if (rating != null && reviewCount != null) {
    return { kind: "rated", rating, reviewCount }
  }
  if (rating != null) {
    return { kind: "rating_only", rating }
  }
  return { kind: "new" }
}

export function formatPropertyLocationLine(property: PropertyInterface): string {
  return [property.city, property.country].filter(Boolean).join(" · ")
}

export function getPropertyDisplayName(property: PropertyInterface): string {
  return property.propertyName?.trim() || property.placeName?.trim() || "Property"
}

export function formatTrustRowText(summary: PropertyTrustSummary): string {
  if (summary.kind === "rated") {
    const label = summary.reviewCount === 1 ? "review" : "reviews"
    return `★ ${summary.rating.toFixed(1)} · ${summary.reviewCount} ${label}`
  }
  if (summary.kind === "rating_only") {
    return `★ ${summary.rating.toFixed(1)}`
  }
  return "★ New · Be the first to review"
}

export function formatLocation(property: PropertyInterface): string {
  const parts = [property.city, property.country].filter(Boolean)
  return parts.join(", ") || property.placeName || "Location unavailable"
}

export function formatPrice(property: PropertyInterface): { amount: string; suffix: string } {
  const amount = property.basePrice ?? property.weekendPrice ?? 0
  return {
    amount: `€${amount}`,
    suffix: " night",
  }
}

const PREVIEW_CHAR_LIMIT = 140

export function getStayDescription(property: PropertyInterface): string {
  const candidates = [property.newReviews, property.reviews].filter(Boolean) as string[]
  for (const raw of candidates) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    if (/^\d+(\.\d+)?$/.test(trimmed)) continue
    return trimmed
  }
  return ""
}

export function getStaySpecItems(property: PropertyInterface): string[] {
  const items: string[] = []

  if (property.propertyType || property.size) {
    const type = property.propertyType || "Property"
    const size = property.size ? `, ${property.size}m²` : ""
    items.push(`${type}${size}`)
  }
  if (property.levels) items.push(`Levels ${property.levels}`)
  if (property.floor) {
    const top = property.isTopFloor ? " (top floor)" : ""
    items.push(`Floor ${property.floor}${top}`)
  }
  if (property.kitchen != null) items.push(`Kitchens ${property.kitchen}`)
  if (property.bedrooms != null) items.push(`Bedrooms ${property.bedrooms}`)
  if (property.beds != null) items.push(`Beds ${property.beds}`)

  return items
}

export function getStayExtendedDetails(
  property: PropertyInterface,
): { title: string; value: string }[] {
  const rows: { title: string; value: string }[] = []

  const add = (title: string, value?: string | number | boolean | null) => {
    if (value === undefined || value === null || value === "") return
    if (typeof value === "boolean") {
      rows.push({ title, value: value ? "Yes" : "No" })
      return
    }
    rows.push({ title, value: String(value) })
  }

  add("Rental type", property.rentalType)
  add("Rental form", property.rentalForm)
  add("Property style", property.propertyStyle)
  add("Orientation", property.orientation)
  add("Construction year", property.constructionYear)
  add("Energy class", property.energyClass)
  add("Heating type", property.heatingType)
  add("Heating medium", property.heatingMedium)
  add("Zones", property.zones)
  add("Area", property.area)
  add("Neighbourhood", property.neighbourhood)
  add("Smoking", property.smoking)
  add("Pets", property.pet)
  add("Parties", property.party)
  add("Cooking", property.cooking)
  add(
    "Suitable for students",
    property.isSuitableForStudents === true
      ? "Yes"
      : property.isSuitableForStudents === false
        ? "No"
        : undefined,
  )
  add("Instant booking", property.isInstantBooking ? "Yes" : undefined)

  return rows
}

export function truncateStayDescription(text: string, maxLength = PREVIEW_CHAR_LIMIT): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}

export function shouldShowStayMore(
  description: string,
  specCount: number,
  extendedCount: number,
): boolean {
  return description.length > PREVIEW_CHAR_LIMIT || specCount > 2 || extendedCount > 0
}

type AmenityMap = Record<string, unknown> | null | undefined

function pushTrueKeys(out: string[], set: Set<string>, map: AmenityMap) {
  if (!map) return
  for (const key of Object.keys(map)) {
    if (set.has(key)) continue
    if ((map as Record<string, unknown>)[key] === true) {
      set.add(key)
      out.push(key)
    }
  }
}

export function getActiveAmenities(property: PropertyInterface): string[] {
  const out: string[] = []
  const seen = new Set<string>()

  pushTrueKeys(out, seen, property.generalAmenities as AmenityMap)
  pushTrueKeys(out, seen, property.safeAmenities as AmenityMap)
  pushTrueKeys(out, seen, property.otherAmenities as AmenityMap)

  return out
}

export type AmenityIconFamily =
  | "ionicons"
  | "material-community"
  | "material"
  | "entypo"
  | "feather"
  | "font-awesome-5"

export type AmenityIconDescriptor = {
  family: AmenityIconFamily
  name: string
}

type AmenityIconRule = {
  match: (lower: string) => boolean
  icon: AmenityIconDescriptor
}

function normalizeAmenityKey(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
}

const EXACT_AMENITY_ICONS: Record<string, AmenityIconDescriptor> = {
  "air conditioning": { family: "entypo", name: "air" },
  ac: { family: "entypo", name: "air" },
  "washing machine": { family: "material-community", name: "washing-machine" },
  washer: { family: "material-community", name: "washing-machine" },
  desk: { family: "material", name: "desk" },
  "dedicated workspace": { family: "material", name: "desk" },
  workspace: { family: "material", name: "desk" },
  fridge: { family: "material-community", name: "fridge-industrial-outline" },
  refrigerator: { family: "material-community", name: "fridge-industrial-outline" },
  freezer: { family: "material-community", name: "fridge-industrial-outline" },
  oven: { family: "material-community", name: "toaster-oven" },
  microwave: { family: "material-community", name: "microwave" },
  shower: { family: "material-community", name: "shower" },
  mirror: { family: "material-community", name: "mirror" },
  wardrobe: { family: "material-community", name: "wardrobe-outline" },
  closet: { family: "material-community", name: "wardrobe-outline" },
  kettle: { family: "material-community", name: "kettle-outline" },
  wifi: { family: "ionicons", name: "wifi-outline" },
  "wi fi": { family: "ionicons", name: "wifi-outline" },
  kitchen: { family: "material-community", name: "stove" },
  parking: { family: "ionicons", name: "car-outline" },
  pool: { family: "material-community", name: "pool" },
  heating: { family: "material-community", name: "radiator" },
  heater: { family: "material-community", name: "radiator" },
  tv: { family: "material-community", name: "television" },
  television: { family: "material-community", name: "television" },
  elevator: { family: "material-community", name: "elevator" },
  lift: { family: "material-community", name: "elevator" },
  dryer: { family: "material-community", name: "tumble-dryer" },
  dishwasher: { family: "material-community", name: "dishwasher" },
  bathtub: { family: "material-community", name: "bathtub" },
  toilet: { family: "material-community", name: "toilet" },
  bidet: { family: "material-community", name: "toilet" },
  balcony: { family: "material-community", name: "balcony" },
  terrace: { family: "material-community", name: "balcony" },
  garden: { family: "material-community", name: "flower" },
  bbq: { family: "material-community", name: "barbecue" },
  barbecue: { family: "material-community", name: "barbecue" },
  iron: { family: "material-community", name: "iron" },
  "hair dryer": { family: "material-community", name: "hair-dryer" },
  towels: { family: "material-community", name: "hanger" },
  linens: { family: "material-community", name: "bed" },
  bedding: { family: "material-community", name: "bed" },
  crib: { family: "material-community", name: "baby-carriage" },
  "high chair": { family: "material-community", name: "baby-carriage-outline" },
  fireplace: { family: "material-community", name: "fireplace" },
  fan: { family: "material-community", name: "fan" },
  coffee: { family: "material-community", name: "coffee-maker" },
  "coffee maker": { family: "material-community", name: "coffee-maker" },
  "hot tub": { family: "material-community", name: "hot-tub" },
  jacuzzi: { family: "material-community", name: "hot-tub" },
  gym: { family: "material-community", name: "dumbbell" },
  fitness: { family: "material-community", name: "dumbbell" },
  sofa: { family: "material-community", name: "sofa" },
  hangers: { family: "material-community", name: "hanger" },
  pillows: { family: "material-community", name: "pillow" },
  blinds: { family: "material-community", name: "blinds" },
  curtains: { family: "material-community", name: "curtains" },
  "smoke detector": { family: "material-community", name: "smoke-detector" },
  "smoke alarm": { family: "material-community", name: "smoke-detector" },
  "carbon monoxide": { family: "material-community", name: "alarm-light" },
  "fire extinguisher": { family: "material-community", name: "fire-extinguisher" },
  "first aid": { family: "material-community", name: "medical-bag" },
  "security camera": { family: "material-community", name: "cctv" },
  cctv: { family: "material-community", name: "cctv" },
  lock: { family: "material-community", name: "lock" },
  "step free": { family: "material-community", name: "wheelchair-accessibility" },
  accessible: { family: "material-community", name: "wheelchair-accessibility" },
  beach: { family: "material-community", name: "beach" },
  lake: { family: "material-community", name: "waves" },
  ski: { family: "material-community", name: "ski" },
  stove: { family: "material-community", name: "stove" },
  cookware: { family: "material-community", name: "pot-steam" },
  "dining table": { family: "material-community", name: "table-furniture" },
  shampoo: { family: "material-community", name: "shampoo" },
  toiletries: { family: "material-community", name: "hand-wash" },
  soap: { family: "material-community", name: "hand-wash" },
  "outdoor furniture": { family: "material-community", name: "seat-outline" },
  patio: { family: "material-community", name: "seat-outline" },
  sea: { family: "material-community", name: "waves" },
  ocean: { family: "material-community", name: "waves" },
  mountain: { family: "material-community", name: "image-filter-hdr" },
  view: { family: "ionicons", name: "eye-outline" },
  breakfast: { family: "material-community", name: "food-croissant" },
  pets: { family: "material-community", name: "paw" },
  "pet friendly": { family: "material-community", name: "paw" },
  smoking: { family: "material-community", name: "smoking" },
  "no smoking": { family: "material-community", name: "smoking-off" },
  airbnb: { family: "font-awesome-5", name: "airbnb" },
  essentials: { family: "material-community", name: "package-variant" },
}

const AMENITY_ICON_RULES: AmenityIconRule[] = [
  {
    match: (lower) => lower.includes("air") && (lower.includes("condition") || lower.includes("con")),
    icon: { family: "entypo", name: "air" },
  },
  {
    match: (lower) => /\bac\b/.test(lower) || lower.includes("a/c"),
    icon: { family: "entypo", name: "air" },
  },
  {
    match: (lower) => lower.includes("washing") || lower.includes("washer"),
    icon: { family: "material-community", name: "washing-machine" },
  },
  {
    match: (lower) => lower.includes("dryer") || lower.includes("tumble"),
    icon: { family: "material-community", name: "tumble-dryer" },
  },
  {
    match: (lower) => lower.includes("desk") || lower.includes("workspace") || lower.includes("work space"),
    icon: { family: "material", name: "desk" },
  },
  {
    match: (lower) => lower.includes("fridge") || lower.includes("refrigerator") || lower.includes("freezer"),
    icon: { family: "material-community", name: "fridge-industrial-outline" },
  },
  {
    match: (lower) => lower.includes("oven") || lower.includes("toaster"),
    icon: { family: "material-community", name: "toaster-oven" },
  },
  {
    match: (lower) => lower.includes("microwave"),
    icon: { family: "material-community", name: "microwave" },
  },
  {
    match: (lower) => lower.includes("shower"),
    icon: { family: "material-community", name: "shower" },
  },
  {
    match: (lower) => lower.includes("mirror"),
    icon: { family: "material-community", name: "mirror" },
  },
  {
    match: (lower) => lower.includes("wardrobe") || lower.includes("closet"),
    icon: { family: "material-community", name: "wardrobe-outline" },
  },
  {
    match: (lower) => lower.includes("kettle"),
    icon: { family: "material-community", name: "kettle-outline" },
  },
  {
    match: (lower) => lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("wi fi"),
    icon: { family: "ionicons", name: "wifi-outline" },
  },
  {
    match: (lower) => lower.includes("kitchen") || lower.includes("cooktop") || lower.includes("stove"),
    icon: { family: "material-community", name: "stove" },
  },
  {
    match: (lower) => lower.includes("dishwasher"),
    icon: { family: "material-community", name: "dishwasher" },
  },
  {
    match: (lower) => lower.includes("parking") || lower.includes("garage"),
    icon: { family: "ionicons", name: "car-outline" },
  },
  {
    match: (lower) => lower.includes("pool") || lower.includes("swimming"),
    icon: { family: "material-community", name: "pool" },
  },
  {
    match: (lower) => lower.includes("heating") || lower.includes("heater") || lower.includes("radiator"),
    icon: { family: "material-community", name: "radiator" },
  },
  {
    match: (lower) => lower.includes("tv") || lower.includes("television"),
    icon: { family: "material-community", name: "television" },
  },
  {
    match: (lower) => lower.includes("elevator") || lower.includes("lift"),
    icon: { family: "material-community", name: "elevator" },
  },
  {
    match: (lower) => lower.includes("bathtub") || lower.includes("bath tub"),
    icon: { family: "material-community", name: "bathtub" },
  },
  {
    match: (lower) => lower.includes("toilet") || lower.includes("bidet"),
    icon: { family: "material-community", name: "toilet" },
  },
  {
    match: (lower) => lower.includes("balcony") || lower.includes("terrace"),
    icon: { family: "material-community", name: "balcony" },
  },
  {
    match: (lower) => lower.includes("garden") || lower.includes("yard"),
    icon: { family: "material-community", name: "flower" },
  },
  {
    match: (lower) => lower.includes("bbq") || lower.includes("barbecue") || lower.includes("grill"),
    icon: { family: "material-community", name: "barbecue" },
  },
  {
    match: (lower) => lower.includes("iron"),
    icon: { family: "material-community", name: "iron" },
  },
  {
    match: (lower) => lower.includes("hair") && lower.includes("dry"),
    icon: { family: "material-community", name: "hair-dryer" },
  },
  {
    match: (lower) => lower.includes("towel"),
    icon: { family: "material-community", name: "hanger" },
  },
  {
    match: (lower) => lower.includes("linen") || lower.includes("bedding") || lower.includes("bed sheet"),
    icon: { family: "material-community", name: "bed" },
  },
  {
    match: (lower) => lower.includes("crib") || lower.includes("cot"),
    icon: { family: "material-community", name: "baby-carriage" },
  },
  {
    match: (lower) => lower.includes("high chair") || lower.includes("highchair"),
    icon: { family: "material-community", name: "baby-carriage-outline" },
  },
  {
    match: (lower) => lower.includes("fireplace"),
    icon: { family: "material-community", name: "fireplace" },
  },
  {
    match: (lower) => lower.includes("fan"),
    icon: { family: "material-community", name: "fan" },
  },
  {
    match: (lower) => lower.includes("coffee"),
    icon: { family: "material-community", name: "coffee-maker" },
  },
  {
    match: (lower) => lower.includes("hot tub") || lower.includes("jacuzzi"),
    icon: { family: "material-community", name: "hot-tub" },
  },
  {
    match: (lower) => lower.includes("gym") || lower.includes("fitness"),
    icon: { family: "material-community", name: "dumbbell" },
  },
  {
    match: (lower) => lower.includes("sofa") || lower.includes("couch"),
    icon: { family: "material-community", name: "sofa" },
  },
  {
    match: (lower) => lower.includes("hanger"),
    icon: { family: "material-community", name: "hanger" },
  },
  {
    match: (lower) => lower.includes("pillow"),
    icon: { family: "material-community", name: "pillow" },
  },
  {
    match: (lower) => lower.includes("blind") || lower.includes("curtain") || lower.includes("shade"),
    icon: { family: "material-community", name: "blinds" },
  },
  {
    match: (lower) => lower.includes("smoke"),
    icon: { family: "material-community", name: "smoke-detector" },
  },
  {
    match: (lower) => lower.includes("carbon monoxide") || lower.includes("co alarm"),
    icon: { family: "material-community", name: "alarm-light" },
  },
  {
    match: (lower) => lower.includes("fire exting"),
    icon: { family: "material-community", name: "fire-extinguisher" },
  },
  {
    match: (lower) => lower.includes("first aid"),
    icon: { family: "material-community", name: "medical-bag" },
  },
  {
    match: (lower) => lower.includes("security") || lower.includes("cctv") || lower.includes("camera"),
    icon: { family: "material-community", name: "cctv" },
  },
  {
    match: (lower) => lower.includes("lock"),
    icon: { family: "material-community", name: "lock" },
  },
  {
    match: (lower) => lower.includes("wheelchair") || lower.includes("step free") || lower.includes("accessible"),
    icon: { family: "material-community", name: "wheelchair-accessibility" },
  },
  {
    match: (lower) => lower.includes("beach"),
    icon: { family: "material-community", name: "beach" },
  },
  {
    match: (lower) => lower.includes("lake") || lower.includes("sea") || lower.includes("ocean") || lower.includes("waterfront"),
    icon: { family: "material-community", name: "waves" },
  },
  {
    match: (lower) => lower.includes("ski"),
    icon: { family: "material-community", name: "ski" },
  },
  {
    match: (lower) => lower.includes("cookware") || lower.includes("pots") || lower.includes("pans"),
    icon: { family: "material-community", name: "pot-steam" },
  },
  {
    match: (lower) => lower.includes("dining") || lower.includes("table"),
    icon: { family: "material-community", name: "table-furniture" },
  },
  {
    match: (lower) => lower.includes("shampoo") || lower.includes("conditioner"),
    icon: { family: "material-community", name: "shampoo" },
  },
  {
    match: (lower) => lower.includes("toiletries") || lower.includes("soap"),
    icon: { family: "material-community", name: "hand-wash" },
  },
  {
    match: (lower) => lower.includes("patio") || lower.includes("outdoor furniture"),
    icon: { family: "material-community", name: "seat-outline" },
  },
  {
    match: (lower) => lower.includes("mountain") || lower.includes("scenic"),
    icon: { family: "material-community", name: "image-filter-hdr" },
  },
  {
    match: (lower) => lower.includes("view"),
    icon: { family: "ionicons", name: "eye-outline" },
  },
  {
    match: (lower) => lower.includes("breakfast"),
    icon: { family: "material-community", name: "food-croissant" },
  },
  {
    match: (lower) => lower.includes("pet"),
    icon: { family: "material-community", name: "paw" },
  },
  {
    match: (lower) => lower.includes("no smoking") || lower.includes("non smoking"),
    icon: { family: "material-community", name: "smoking-off" },
  },
  {
    match: (lower) => lower.includes("smoking"),
    icon: { family: "material-community", name: "smoking" },
  },
]

const DEFAULT_AMENITY_ICON: AmenityIconDescriptor = {
  family: "ionicons",
  name: "checkmark-circle-outline",
}

export function getAmenityIcon(name: string): AmenityIconDescriptor {
  const normalized = normalizeAmenityKey(name)
  const exact = EXACT_AMENITY_ICONS[normalized]
  if (exact) return exact

  for (const rule of AMENITY_ICON_RULES) {
    if (rule.match(normalized)) return rule.icon
  }

  return DEFAULT_AMENITY_ICON
}

export type GoodToKnowIconName =
  | "shield-checkmark-outline"
  | "flash-outline"
  | "document-text-outline"
  | "list-outline"

export type GoodToKnowItem =
  | {
      id: string
      icon: GoodToKnowIconName
      title: string
      text: string
      kind: "info"
    }
  | {
      id: string
      icon: GoodToKnowIconName
      title: string
      text: string
      kind: "link"
      actionLabel: string
    }

function appendPolicyPart(parts: string[], value: unknown) {
  if (typeof value !== "string") return
  const trimmed = value.trim()
  if (trimmed) parts.push(trimmed)
}

export function getPropertyPolicySummary(property: PropertyInterface): string | null {
  const parts: string[] = []

  if (property.smoking?.trim()) parts.push(`Smoking: ${property.smoking.trim()}`)
  if (property.pet?.trim()) parts.push(`Pets: ${property.pet.trim()}`)
  if (property.party?.trim()) parts.push(`Parties: ${property.party.trim()}`)
  if (property.cooking?.trim()) parts.push(`Cooking: ${property.cooking.trim()}`)

  for (const rule of property.additionalRules ?? []) {
    appendPolicyPart(parts, rule)
  }

  if (!parts.length) return null

  return parts.slice(0, 4).join(" · ")
}

export function buildGoodToKnowItems(
  property: PropertyInterface | undefined,
  options?: { longTerm?: boolean },
): GoodToKnowItem[] {
  const longTerm = options?.longTerm ?? false
  const items: GoodToKnowItem[] = [
    {
      id: "secure",
      icon: "shield-checkmark-outline",
      title: "Secure reservation",
      text: "Your request is shared safely with the host.",
      kind: "info",
    },
    {
      id: "confirmation",
      icon: "flash-outline",
      title: "Confirmation timing",
      text: longTerm
        ? "After checkout, the host reviews your long-term request. You'll be notified when it's confirmed."
        : "After checkout, the host reviews your booking request. You'll be notified when it's confirmed.",
      kind: "info",
    },
  ]

  const policySummary = property ? getPropertyPolicySummary(property) : null

  if (policySummary) {
    items.push({
      id: "policy",
      icon: "document-text-outline",
      title: "House rules & policies",
      text: policySummary,
      kind: "info",
    })
  } else {
    items.push({
      id: "policy-link",
      icon: "list-outline",
      title: "House rules",
      text: "Cancellation and house rules are listed on the property page.",
      kind: "link",
      actionLabel: "See property rules on listing",
    })
  }

  return items.slice(0, 3)
}
