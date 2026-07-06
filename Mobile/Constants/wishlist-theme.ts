/** Wishlist screen design tokens — 8pt grid */
export const wl = {
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    pill: 999,
  },
  colors: {
    bg: "#FAFAF9",
    surface: "#FFFFFF",
    ink: "#1C1917",
    inkSecondary: "#57534E",
    inkMuted: "#A8A29E",
    accent: "#FF6600",
    accentSoft: "#FFF4EC",
    border: "#E7E5E4",
    error: "#B91C1C",
    errorSoft: "#FEF2F2",
    star: "#1C1917",
  },
  shadow: {
    card: {
      shadowColor: "#1C1917",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    fab: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
  },
  type: {
    title: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.6 },
    subtitle: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
    cardTitle: { fontSize: 16, fontWeight: "600" as const, letterSpacing: -0.2 },
    cardMeta: { fontSize: 14, fontWeight: "400" as const },
    price: { fontSize: 16, fontWeight: "700" as const },
    badge: { fontSize: 12, fontWeight: "600" as const },
    label: { fontSize: 13, fontWeight: "600" as const },
  },
} as const

export type WishlistSortKey = "default" | "price_asc" | "price_desc" | "name"

export type WishlistFilters = {
  instantOnly: boolean
  propertyType: string | null
}
