import type { PropertyInterface } from "@/types";

export type GuestCounts = {
  adults: number;
  children: number;
  infants: number;
};

export type ReserveBillDetails = {
  totalUnits: number;
  basePrice: number;
  discountedPrice: number;
  platformFee: number;
  total: number;
  couponDiscount: number;
  payableNow: number;
};

export type ReserveDateSelection = {
  startDate: string;
  endDate: string;
};

export function buildBlockedDatesMap(property: PropertyInterface | undefined): Record<string, true> {
  const raw: unknown = (property as PropertyInterface & { datesPerPortion?: unknown })?.datesPerPortion;
  const list = Array.isArray(raw) ? raw : [];
  const out: Record<string, true> = {};
  for (const item of list) {
    if (typeof item === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item)) {
      out[item] = true;
    }
  }
  return out;
}

export function toDateOnlyString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addMonthsToDateString(dateString: string, months: number) {
  const base = new Date(`${dateString}T00:00:00`);
  return toDateOnlyString(new Date(base.getFullYear(), base.getMonth() + months, 1));
}

export function diffInMonths(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
}

export function formatMonthYear(date: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function buildMonthOptions(count = 12) {
  const now = new Date();
  const firstMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return Array.from({ length: count }, (_, index) => {
    const optionDate = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1);
    return {
      value: toDateOnlyString(optionDate),
      label: optionDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    };
  });
}

export function isLongTerm(p?: PropertyInterface) {
  return (p?.rentalType ?? "").toLowerCase().includes("long");
}

export function getUnitPrice(p?: PropertyInterface) {
  if (isLongTerm(p)) {
    const m = p?.basePriceLongTerm;
    return m && m > 0 ? m : p?.basePrice ?? 0;
  }
  return p?.basePrice ?? 0;
}

export function formatReserveDate(date: string) {
  return date
    ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : "";
}

export function formatGuestSummary(guests: GuestCounts) {
  const parts: string[] = [];
  if (guests.adults) parts.push(`${guests.adults} adult${guests.adults !== 1 ? "s" : ""}`);
  if (guests.children) parts.push(`${guests.children} child${guests.children !== 1 ? "ren" : ""}`);
  if (guests.infants) parts.push(`${guests.infants} infant${guests.infants !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

export function computeBillDetails(
  selectedDates: ReserveDateSelection,
  unitPrice: number,
  longTerm: boolean,
  appliedCoupon?: { discountType: string; discountValue: number } | null,
): ReserveBillDetails {
  if (!selectedDates.startDate || !selectedDates.endDate) {
    return {
      totalUnits: 0,
      basePrice: 0,
      discountedPrice: 0,
      platformFee: 0,
      total: 0,
      couponDiscount: 0,
      payableNow: 0,
    };
  }
  const totalUnits = longTerm
    ? diffInMonths(selectedDates.startDate, selectedDates.endDate)
    : Math.ceil(
        Math.abs(
          new Date(selectedDates.endDate).getTime() - new Date(selectedDates.startDate).getTime(),
        ) / (1000 * 60 * 60 * 24),
      );
  const basePrice = totalUnits * unitPrice;
  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount =
      appliedCoupon.discountType === "percentage"
        ? (appliedCoupon.discountValue / 100) * basePrice
        : appliedCoupon.discountValue;
  }
  const platformFee = longTerm ? unitPrice : 75;
  const discountedPrice = Math.max(0, basePrice - couponDiscount);
  const payableNow = platformFee;
  const total = payableNow;
  return { totalUnits, basePrice, discountedPrice, platformFee, total, couponDiscount, payableNow };
}

export function buildStaySummary(
  longTerm: boolean,
  datesSelected: boolean,
  selectedDates: ReserveDateSelection,
  totalUnits: number,
) {
  if (longTerm) {
    return datesSelected
      ? `${formatMonthYear(selectedDates.startDate)} · ${totalUnits} month${totalUnits > 1 ? "s" : ""}`
      : "Select move-in month & duration";
  }
  return datesSelected
    ? `${formatReserveDate(selectedDates.startDate)} → ${formatReserveDate(selectedDates.endDate)}`
    : "Select check-in & check-out";
}

export function buildTripMeta(datesSelected: boolean, guestsAdults: number, travellerCount: number) {
  const completedRequired = [datesSelected, guestsAdults > 0, travellerCount > 0].filter(Boolean).length;
  const stepsLeft = 3 - completedRequired;
  return stepsLeft === 0 ? "Ready to book" : `${stepsLeft} step${stepsLeft > 1 ? "s" : ""} left`;
}

export function buildReserveCtaLabel(
  isSubmitting: boolean,
  propertyLoading: boolean,
  datesSelected: boolean,
  travellerCount: number,
  selectionButtonText: string,
) {
  if (isSubmitting) return "Sending request…";
  if (propertyLoading) return "Loading…";
  if (!datesSelected) return selectionButtonText;
  if (travellerCount < 1) return "Add traveller details";
  return "Request booking";
}
