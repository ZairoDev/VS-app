/**
 * Profile tab design tokens (8pt grid).
 * Aligned with Airbnb / Booking-style account surfaces:
 * generous identity hero, sentence-case section titles, stone + orange brand.
 *
 *   import { profile } from "@/Constants/profile-theme"
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
    accentWash: "rgba(255, 102, 0, 0.08)",
    peachWash: "rgba(255, 228, 196, 0.45)",
    border: "#E7E5E4",
    divider: "#F5F5F4",
    danger: "#B91C1C",
    dangerSoft: "#FEF2F2",
    success: "#16A34A",
    successSoft: "#F0FDF4",
    overlay: "rgba(0,0,0,0.45)",
  },
  type: {
    pageTitle: {
      fontSize: 30,
      fontWeight: "700" as const,
      letterSpacing: -0.6,
      lineHeight: 36,
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: "600" as const,
      letterSpacing: 1.2,
      textTransform: "uppercase" as const,
    },
    displayName: {
      fontSize: 28,
      fontWeight: "700" as const,
      letterSpacing: -0.5,
      lineHeight: 34,
    },
    body: { fontSize: 16, fontWeight: "500" as const, lineHeight: 22 },
    meta: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
    /** Airbnb-style section titles: sentence case, not micro-caps. */
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700" as const,
      letterSpacing: -0.3,
      lineHeight: 26,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700" as const,
      letterSpacing: 1.1,
      textTransform: "uppercase" as const,
    },
    row: { fontSize: 16, fontWeight: "500" as const },
    caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
    link: {
      fontSize: 15,
      fontWeight: "600" as const,
      lineHeight: 20,
    },
  },
  size: {
    avatar: 72,
    avatarHero: 88,
    iconWell: 36,
    rowMinHeight: 54,
    photoBadge: 28,
  },
  shadow: {
    card: {
      shadowColor: "#1C1917",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
    hero: {
      shadowColor: "#1C1917",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 4,
    },
  },
  appName: "Vacation Saga",
  appVersion: "1.0.0",
} as const

export type ProfileTheme = typeof profile
