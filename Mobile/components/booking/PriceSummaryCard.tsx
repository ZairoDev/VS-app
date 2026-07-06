import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { booking } from "@/Constants/booking-theme";
import { formatMonthYear, type ReserveBillDetails } from "@/utils/reserve";

const { colors: c } = booking;

/** Reserved slot height for collapsed price summary — keeps layout stable when dates are selected. */
const COLLAPSED_PRICE_SUMMARY_MIN_HEIGHT = 280;

type AppliedCoupon = {
  code: string;
  discountType: string;
  discountValue: number;
};

type PriceSummaryCardProps = {
  datesSelected: boolean;
  longTerm: boolean;
  unitPrice: number;
  billDetails: ReserveBillDetails;
  payableAnimatedValue: number;
  startDate: string;
  quotationExpanded: boolean;
  appliedCoupon?: AppliedCoupon | null;
  onToggleQuotation: () => void;
  onOpenCoupon: () => void;
};

export function PriceSummaryCard({
  datesSelected,
  longTerm,
  unitPrice,
  billDetails,
  payableAnimatedValue,
  startDate,
  quotationExpanded,
  appliedCoupon,
  onToggleQuotation,
  onOpenCoupon,
}: PriceSummaryCardProps) {
  if (!datesSelected) {
    return (
      <View style={[styles.billCard, styles.priceSummarySlot]} accessibilityRole="text">
        <Text style={styles.billTitle}>Price summary</Text>

        <View style={styles.billGroup}>
          <View style={styles.dueTodayHeader}>
            <Ionicons name="information-circle-outline" size={16} color={c.inkPlaceholder} />
            <Text style={[styles.billGroupTitle, styles.placeholderMutedText]}>Due today</Text>
          </View>
          <Text style={styles.placeholderTitle}>Select dates to see pricing</Text>
          <Text style={styles.billNote}>
            Choose your stay dates to view the reservation fee and stay quotation.
          </Text>
        </View>

        <View style={[styles.quotationToggle, styles.placeholderBlock]} accessibilityElementsHidden>
          <View style={styles.quotationToggleTop}>
            <Text style={[styles.quotationToggleTitle, styles.placeholderMutedText]}>Stay quotation</Text>
            <Text style={styles.placeholderDash}>—</Text>
          </View>
          <View style={styles.quotationToggleAction}>
            <Text style={[styles.quotationToggleText, styles.placeholderMutedText]}>Show breakdown</Text>
            <Ionicons name="chevron-down" size={16} color={c.inkPlaceholder} />
          </View>
        </View>

        <View style={styles.billCouponLink} accessibilityElementsHidden>
          <MaterialIcons name="discount" size={18} color={c.inkPlaceholder} />
          <Text style={styles.placeholderCouponText}>Add coupon code</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.billCard, styles.priceSummarySlot]}>
      <Text style={styles.billTitle}>Price summary</Text>

      <View style={styles.billGroup}>
        <View style={styles.dueTodayHeader}>
          <Ionicons name="information-circle-outline" size={16} color={c.inkMuted} />
          <Text style={styles.billGroupTitle}>Due today</Text>
        </View>

        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Platform reservation fee{longTerm ? " (1 month rent)" : ""}</Text>
          <Text style={styles.billTotalAmount}>€{payableAnimatedValue.toFixed(2)}</Text>
        </View>
        <Text style={styles.billNote}>
          This is a reservation fee. Rental payment is arranged with the host after confirmation.
        </Text>
      </View>

      <Pressable
        onPress={onToggleQuotation}
        style={styles.quotationToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: quotationExpanded }}
        accessibilityLabel={quotationExpanded ? "Hide stay breakdown" : "Show stay breakdown"}
      >
        <View style={styles.quotationToggleTop}>
          <Text style={styles.quotationToggleTitle}>Stay quotation</Text>
          <Text style={styles.quotationSummary}>€{billDetails.discountedPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.quotationToggleAction}>
          <Text style={styles.quotationToggleText}>
            {quotationExpanded ? "Hide breakdown" : "Show breakdown"}
          </Text>
          <Ionicons
            name={quotationExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={c.inkMuted}
          />
        </View>
      </Pressable>

      {quotationExpanded ? (
        <View style={styles.billGroup}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>
              {longTerm ? "Monthly rent" : `€${unitPrice} × ${billDetails.totalUnits} night(s)`}
            </Text>
            <Text style={styles.billAmount}>
              {longTerm ? `€${unitPrice.toFixed(2)}/month` : `€${billDetails.basePrice.toFixed(2)}`}
            </Text>
          </View>

          {longTerm ? (
            <>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Move-in month</Text>
                <Text style={styles.billAmount}>{formatMonthYear(startDate)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Duration</Text>
                <Text style={styles.billAmount}>
                  {billDetails.totalUnits} month{billDetails.totalUnits > 1 ? "s" : ""}
                </Text>
              </View>
            </>
          ) : null}

          {appliedCoupon ? (
            <>
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: c.success }]}>Coupon discount</Text>
                <Text style={[styles.billAmount, { color: c.success }]}>
                  -€{billDetails.couponDiscount.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.billNote}>Coupon applies to the stay quotation only.</Text>
            </>
          ) : null}
        </View>
      ) : null}

      <Pressable
        onPress={onOpenCoupon}
        style={styles.billCouponLink}
        accessibilityRole="button"
        accessibilityLabel={appliedCoupon ? `Change coupon ${appliedCoupon.code}` : "Add coupon code"}
      >
        {appliedCoupon ? (
          <>
            <View style={styles.billCouponChip}>
              <MaterialIcons name="discount" size={16} color={c.success} />
              <Text style={styles.billCouponChipText}>{appliedCoupon.code} applied</Text>
            </View>
            <Text style={styles.billCouponChange}>Change</Text>
          </>
        ) : (
          <>
            <MaterialIcons name="discount" size={18} color={c.accent} />
            <Text style={styles.billCouponLinkText}>Add coupon code</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  priceSummarySlot: {
    minHeight: COLLAPSED_PRICE_SUMMARY_MIN_HEIGHT,
  },
  billCard: {
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    padding: 16,
    gap: 12,
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: c.inkPlaceholder,
  },
  placeholderMutedText: {
    color: c.inkPlaceholder,
  },
  placeholderBlock: {
    opacity: 0.55,
  },
  placeholderDash: {
    fontSize: 15,
    fontWeight: "700",
    color: c.inkPlaceholder,
  },
  placeholderCouponText: {
    fontSize: 14,
    fontWeight: "700",
    color: c.inkPlaceholder,
  },
  billTitle: { fontSize: 16, fontWeight: "700", color: c.ink },
  billGroup: {
    backgroundColor: c.bg,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  dueTodayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  billGroupTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: c.ink,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  billRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  billLabel: { fontSize: 15, color: c.inkMuted, fontWeight: "500" },
  billAmount: { fontSize: 15, color: c.ink, fontWeight: "600" },
  billNote: { fontSize: 12, lineHeight: 18, color: c.inkMuted, fontWeight: "600" },
  billTotalAmount: { fontSize: 17, fontWeight: "800", color: c.ink },
  quotationToggle: {
    backgroundColor: c.bg,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  quotationToggleTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  quotationToggleTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: c.ink,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  quotationSummary: {
    fontSize: 15,
    fontWeight: "700",
    color: c.ink,
  },
  quotationToggleAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  quotationToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: c.accent,
  },
  billCouponLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 4,
  },
  billCouponLinkText: {
    fontSize: 14,
    fontWeight: "700",
    color: c.accent,
  },
  billCouponChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: c.successSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  billCouponChipText: {
    fontSize: 13,
    fontWeight: "800",
    color: c.success,
    letterSpacing: 0.3,
  },
  billCouponChange: {
    fontSize: 13,
    fontWeight: "700",
    color: c.inkMuted,
  },
});
