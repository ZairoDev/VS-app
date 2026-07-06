import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { booking } from "@/Constants/booking-theme"

export type ReviewItem = {
  id: string
  name: string
  dateLabel: string
  rating: number
  text: string
}

type ReviewsSheetProps = {
  rating?: number | null
  reviewCount?: number | null
  items?: ReviewItem[]
  onClose: () => void
}

const { colors: c, radius: r, space: sp, shadow: sh } = booking

export function ReviewsSheet({ rating, reviewCount, items = [], onClose }: ReviewsSheetProps) {
  const insets = useSafeAreaInsets()
  const hasReviews = items.length > 0
  const count = typeof reviewCount === "number" ? reviewCount : items.length
  const showRating = typeof rating === "number" && rating > 0

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.handle} />

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Guest feedback</Text>
          <Text style={styles.title}>Reviews</Text>
          <Text style={styles.subtitle}>
            {showRating ? `★ ${rating!.toFixed(1)} · ${count} review${count === 1 ? "" : "s"}` : "★ New · Be the first to review"}
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close reviews"
        >
          <Ionicons name="close" size={20} color={c.inkSecondary} />
        </Pressable>
      </View>

      {hasReviews ? (
        <View style={styles.list}>
          {items.map((it) => (
            <View key={it.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.name} numberOfLines={1}>
                  {it.name}
                </Text>
                <Text style={styles.meta}>★ {it.rating.toFixed(1)} · {it.dateLabel}</Text>
              </View>
              <Text style={styles.text}>{it.text}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={c.inkMuted} />
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyText}>
            This listing is new. Book and be the first to share feedback.
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: c.bg,
    paddingHorizontal: sp.lg - 4,
    paddingTop: sp.sm,
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
    marginBottom: sp.md,
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
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    padding: 14,
    gap: 8,
    ...sh.card,
  },
  cardTop: {
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    color: c.ink,
  },
  meta: {
    fontSize: 12,
    fontWeight: "600",
    color: c.inkMuted,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: c.inkSecondary,
    fontWeight: "500",
  },
  empty: {
    marginTop: sp.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: sp.xl,
    paddingHorizontal: sp.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: c.ink,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: c.inkMuted,
    textAlign: "center",
  },
})

