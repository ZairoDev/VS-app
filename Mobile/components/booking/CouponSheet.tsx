import React, { useEffect, useMemo, useState } from "react"
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import axios from "axios"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { booking } from "@/Constants/booking-theme"
import { useCouponStore } from "@/store/coupon-store"

type Coupon = {
  _id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  expiryDate: string
  usageLimit: number
  usedCount: number
  minOrderValue: number
}

type CouponSheetProps = {
  onClose: () => void
}

const { colors: c, radius: r, space: sp, shadow: sh } = booking

function formatCouponSubtitle(coupon: Coupon): string {
  if (coupon.discountType === "percentage") {
    return `${coupon.discountValue}% off · min €${coupon.minOrderValue}`
  }
  return `€${coupon.discountValue} off · min €${coupon.minOrderValue}`
}

export function CouponSheet({ onClose }: CouponSheetProps) {
  const insets = useSafeAreaInsets()
  const { appliedCoupon, applyCoupon, resetCoupon } = useCouponStore()

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])

  useEffect(() => {
    let alive = true
    setLoading(true)
    axios
      .get<{ coupons: Coupon[] }>(`${process.env.EXPO_PUBLIC_BASE_URL}/coupon/get-all`)
      .then((res) => {
        if (!alive) return
        setCoupons(res.data?.coupons ?? [])
      })
      .catch(() => {
        if (!alive) return
        // keep silent; UI shows empty state
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    // Reflect store state in the input.
    if (appliedCoupon?.code) setCode(appliedCoupon.code)
  }, [appliedCoupon?.code])

  const normalized = code.trim().toUpperCase()
  const selected = useMemo(
    () => coupons.find((c) => c.code.toUpperCase() === normalized),
    [coupons, normalized],
  )

  const handleApply = () => {
    if (!normalized) {
      Alert.alert("Enter a code", "Please enter a valid coupon code.")
      return
    }
    if (!selected) {
      Alert.alert("Invalid coupon", "This coupon code is not available.")
      return
    }
    if (appliedCoupon?._id === selected._id) {
      Alert.alert("Already applied", `Coupon "${selected.code}" is already applied.`)
      return
    }
    applyCoupon(selected as any)
    Alert.alert("Coupon applied", `Coupon "${selected.code}" has been applied.`)
    onClose()
  }

  const handleRemove = () => {
    if (!appliedCoupon) return
    resetCoupon()
    setCode("")
  }

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.handle} />

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Optional discount</Text>
          <Text style={styles.title}>Apply coupon</Text>
          <Text style={styles.subtitle}>
            {appliedCoupon ? `Applied: ${appliedCoupon.code}` : "Enter a code or choose from available coupons."}
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close coupon sheet"
        >
          <Ionicons name="close" size={20} color={c.inkSecondary} />
        </Pressable>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.label}>Coupon code</Text>
        <View style={styles.inputRow}>
          <MaterialIcons name="discount" size={18} color={c.accent} />
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="e.g. SUMMER10"
            placeholderTextColor={c.inkPlaceholder}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
          />
          {appliedCoupon ? (
            <Pressable
              onPress={handleRemove}
              accessibilityRole="button"
              accessibilityLabel="Remove applied coupon"
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={20} color={c.inkMuted} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={handleApply}
          style={[styles.primaryBtn, (!selected || loading) && styles.primaryBtnDisabled]}
          disabled={!selected || loading}
          accessibilityRole="button"
          accessibilityLabel="Apply coupon"
        >
          <Text style={styles.primaryBtnText}>
            {loading ? "Loading…" : appliedCoupon ? "Update coupon" : "Apply coupon"}
          </Text>
        </Pressable>

        {appliedCoupon ? (
          <Text style={styles.note}>
            Note: coupons may apply to the stay quotation only (not the due-today fee), depending on the offer.
          </Text>
        ) : null}
      </View>

      <View style={styles.listCard}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Available coupons</Text>
          <Text style={styles.listMeta}>{coupons.length ? `${coupons.length}` : ""}</Text>
        </View>

        {coupons.length ? (
          <View style={styles.list}>
            {coupons.map((coupon, idx) => {
              const active = appliedCoupon?._id === coupon._id
              const isPicked = normalized && coupon.code.toUpperCase() === normalized
              return (
                <Pressable
                  key={coupon._id}
                  onPress={() => setCode(coupon.code)}
                  style={[
                    styles.couponRow,
                    idx < coupons.length - 1 && styles.couponRowBorder,
                    isPicked && styles.couponRowPicked,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Select coupon ${coupon.code}`}
                >
                  <View style={styles.couponLeft}>
                    <View style={[styles.badge, active && styles.badgeActive]}>
                      <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{coupon.code}</Text>
                    </View>
                    <Text style={styles.couponSub} numberOfLines={1}>
                      {formatCouponSubtitle(coupon)}
                    </Text>
                  </View>

                  {active ? (
                    <Ionicons name="checkmark-circle" size={20} color={c.success} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={c.inkPlaceholder} />
                  )}
                </Pressable>
              )
            })}
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="information-circle-outline" size={18} color={c.inkMuted} />
            <Text style={styles.emptyText}>No coupons available right now.</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: c.bg,
    paddingHorizontal: sp.lg - 4,
    paddingTop: sp.sm,
    gap: sp.md,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.border,
    marginBottom: sp.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    ...booking.type.eyebrow,
    color: c.accent,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: c.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: c.inkMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  inputCard: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    padding: sp.md,
    gap: 12,
    ...sh.card,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: c.inkMuted,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: r.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: c.ink,
  },
  primaryBtn: {
    height: booking.button.height,
    borderRadius: booking.button.radius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.accent,
  },
  primaryBtnDisabled: {
    opacity: 0.55,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: c.surface,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: c.inkMuted,
    fontWeight: "600",
  },
  listCard: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    overflow: "hidden",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: c.ink,
  },
  listMeta: {
    fontSize: 12,
    fontWeight: "800",
    color: c.inkMuted,
  },
  list: {},
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  couponRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.divider,
  },
  couponRowPicked: {
    backgroundColor: c.bg,
  },
  couponLeft: {
    flex: 1,
    gap: 6,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: c.track,
  },
  badgeActive: {
    backgroundColor: c.successSoft,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: c.ink,
    letterSpacing: 0.8,
  },
  badgeTextActive: {
    color: c.success,
  },
  couponSub: {
    fontSize: 12,
    fontWeight: "600",
    color: c.inkMuted,
  },
  empty: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    color: c.inkMuted,
  },
})

