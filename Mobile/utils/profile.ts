import type { Booking, UserDataType } from "@/types"

/** Prefer preferredName, else first token of legal name. */
export function getDisplayFirstName(user: UserDataType | null | undefined): string {
  if (!user) return "there"
  const preferred = user.preferredName?.trim()
  if (preferred) return preferred
  const legal = user.name?.trim()
  if (!legal) return "there"
  return legal.split(/\s+/)[0] || legal
}

/** Title-case a display name for profile surfaces. */
export function formatDisplayName(raw: string): string {
  if (!raw.trim()) return "Traveller"
  return raw
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

/** Full display name for profile hero (Airbnb-style identity block). */
export function getDisplayName(user: UserDataType | null | undefined): string {
  if (!user) return "Traveller"
  const preferred = user.preferredName?.trim()
  if (preferred) return formatDisplayName(preferred)
  const legal = user.name?.trim()
  return legal ? formatDisplayName(legal) : "Traveller"
}

export function getInitials(user: UserDataType | null | undefined): string {
  if (!user?.name?.trim()) return "?"
  const parts = user.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/** Guest-facing role label used by Airbnb / Booking-style profiles. */
export function getRoleLabel(user: UserDataType | null | undefined): string | null {
  if (!user?.role) return null
  if (user.role === "Owner") return "Host"
  if (user.role === "Traveller") return "Traveller"
  return null
}

/** Missing fields that booking platforms nudge users to complete. */
export function getProfileGaps(user: UserDataType | null | undefined): string[] {
  if (!user) return []
  const gaps: string[] = []
  if (!user.profilePic?.trim()) gaps.push("photo")
  if (!user.phone?.trim()) gaps.push("phone")
  if (!user.address?.trim()) gaps.push("address")
  if (!user.preferredName?.trim() && !user.name?.trim()) gaps.push("name")
  return gaps
}

export function isProfileIncomplete(user: UserDataType | null | undefined): boolean {
  return getProfileGaps(user).length > 0
}

/** Next upcoming non-cancelled booking (start date today or later), earliest first. */
export function getNextUpcomingBooking(bookings: Booking[]): Booking | null {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const upcoming = bookings
    .filter((b) => b.bookingStatus !== "cancelled")
    .filter((b) => {
      const start = new Date(b.startDate)
      const end = new Date(b.endDate)
      // Include ongoing stays (started but not ended) and future stays
      return end >= startOfToday || start >= startOfToday
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  return upcoming[0] ?? null
}

export function formatDaysUntil(startDate: string, endDate: string): string {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  if (start <= startOfToday && end >= startOfToday) return "Happening now"
  const diffMs = start.getTime() - startOfToday.getTime()
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24))
  if (days === 0) return "Starts today"
  if (days === 1) return "In 1 day"
  return `In ${days} days`
}

/** Airbnb-style stay range: "12 – 15 Apr" or "28 Apr – 2 May". */
export function formatStayRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ""

  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()

  if (sameMonth) {
    const month = start.toLocaleDateString("en-GB", { month: "short" })
    return `${start.getDate()} – ${end.getDate()} ${month}`
  }

  const startLabel = start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
  const endLabel = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
  return `${startLabel} – ${endLabel}`
}
