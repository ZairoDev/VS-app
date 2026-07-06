/**
 * Booking funnel design tokens (property detail, reserve, sheets).
 *
 * Import `booking` for property/reserve screens:
 *   import { booking } from "@/Constants/booking-theme"
 *
 * Aligned with auth palette (stone + orange, 8pt grid). Prefer these tokens
 * over hardcoded hex values in booking-related UI.
 */
export const booking = {
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
    sheet: 24,
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
    accentPressed: "#E55A00",
    accentSoft: "#FFF7ED",
    border: "#E7E5E4",
    divider: "#F5F5F4",
    success: "#16A34A",
    successSoft: "#F0FDF4",
    error: "#B91C1C",
    errorSoft: "#FEF2F2",
    overlay: "rgba(0, 0, 0, 0.65)",
    overlayLight: "rgba(255, 255, 255, 0.92)",
  },
  type: {
    eyebrow: {
      fontSize: 11,
      fontWeight: "600" as const,
      letterSpacing: 1.2,
      textTransform: "uppercase" as const,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700" as const,
      letterSpacing: -0.3,
      lineHeight: 26,
    },
    sectionTitleLarge: {
      fontSize: 22,
      fontWeight: "600" as const,
      letterSpacing: -0.4,
      lineHeight: 28,
    },
    body: {
      fontSize: 15,
      fontWeight: "400" as const,
      lineHeight: 22,
    },
    bodySemibold: {
      fontSize: 15,
      fontWeight: "600" as const,
      lineHeight: 22,
    },
    caption: {
      fontSize: 12,
      fontWeight: "500" as const,
      lineHeight: 18,
    },
    price: {
      fontSize: 20,
      fontWeight: "800" as const,
      letterSpacing: -0.4,
    },
    button: {
      fontSize: 15,
      fontWeight: "700" as const,
      letterSpacing: -0.2,
    },
  },
  shadow: {
    card: {
      shadowColor: "#1C1917",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 1,
    },
    footer: {
      shadowColor: "#1C1917",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 3,
    },
    cta: {
      shadowColor: "#FF6600",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
      elevation: 3,
    },
  },
  button: {
    height: 52,
    radius: 12,
  },
  touch: {
    min: 44,
  },
} as const

export type BookingTheme = typeof booking
