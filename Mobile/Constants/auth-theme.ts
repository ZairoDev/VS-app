/** Authentication screens — premium hospitality design tokens (8pt grid) */
export { booking, type BookingTheme } from "./booking-theme"
export { profile, type ProfileTheme } from "./profile-theme"

export const auth = {
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
  colors: {
    bg: "#FAFAF9",
    surface: "#FFFFFF",
    track: "#F5F5F4",
    ink: "#1C1917",
    inkSecondary: "#57534E",
    inkMuted: "#A8A29E",
    inkPlaceholder: "#78716C",
    accent: "#FF6600",
    accentPressed: "#E55A00",
    accentSoft: "#FFF7ED",
    border: "#E7E5E4",
    borderFocus: "#1C1917",
    divider: "#E7E5E4",
    error: "#B91C1C",
    errorSoft: "#FEF2F2",
    googleBorder: "#747775",
    googleText: "#1F1F1F",
  },
  shadow: {
    subtle: {
      shadowColor: "#1C1917",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    },
    indicator: {
      shadowColor: "#1C1917",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    cta: {
      shadowColor: "#FF6600",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 3,
    },
  },
  type: {
    display: {
      fontSize: 32,
      fontWeight: "600" as const,
      letterSpacing: -0.8,
      lineHeight: 38,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 24,
    },
    label: {
      fontSize: 13,
      fontWeight: "500" as const,
      letterSpacing: 0.1,
    },
    input: {
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 22,
    },
    button: {
      fontSize: 17,
      fontWeight: "600" as const,
      letterSpacing: -0.2,
    },
    link: {
      fontSize: 14,
      fontWeight: "500" as const,
    },
    segment: {
      fontSize: 15,
      fontWeight: "500" as const,
    },
    segmentActive: {
      fontSize: 15,
      fontWeight: "600" as const,
    },
  },
  touch: {
    min: 44,
    inputHeight: 48,
    buttonHeight: 56,
    segmentHeight: 48,
  },
} as const
