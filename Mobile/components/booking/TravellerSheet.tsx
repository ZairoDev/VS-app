import React, { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { booking } from "@/Constants/booking-theme"
import { useTravellerStore } from "@/store/traveller-store"
import { TravellerForm, type TravellerDraft, type TravellerType } from "./TravellerForm"

type TravellerSheetProps = {
  bookingId: string
  guests: { adults: number; children: number; infants: number }
  onClose: () => void
}

const { colors: c, radius: r, space: sp, shadow: sh } = booking

export function TravellerSheet({ bookingId, guests, onClose }: TravellerSheetProps) {
  const insets = useSafeAreaInsets()
  const { travellers, maxAdults, maxChildren, maxInfants, setLimits, addTraveller, removeTraveller } =
    useTravellerStore()

  // Sync limits for this booking on mount/render when guests change.
  React.useEffect(() => {
    if (!bookingId) return
    if (
      maxAdults !== guests.adults ||
      maxChildren !== guests.children ||
      maxInfants !== guests.infants ||
      bookingId !== (useTravellerStore.getState().bookingId ?? "")
    ) {
      setLimits(guests.adults, guests.children, guests.infants, bookingId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, guests.adults, guests.children, guests.infants])

  const countByType = useMemo(() => {
    const out: Record<TravellerType, number> = { adult: 0, child: 0, infant: 0 }
    for (const t of travellers) out[t.type] += 1
    return out
  }, [travellers])

  const remainingByType = useMemo(
    () => ({
      adult: Math.max(0, guests.adults - countByType.adult),
      child: Math.max(0, guests.children - countByType.child),
      infant: Math.max(0, guests.infants - countByType.infant),
    }),
    [countByType.adult, countByType.child, countByType.infant, guests.adults, guests.children, guests.infants],
  )

  const [draft, setDraft] = useState<TravellerDraft>({
    name: "",
    age: "",
    gender: "male",
    nationality: "",
    type: "adult",
  })
  const [error, setError] = useState<string | null>(null)

  const validate = (): string | null => {
    if (!draft.name.trim()) return "Please enter a name"
    const ageNum = Number.parseInt(draft.age, 10)
    if (Number.isNaN(ageNum)) return "Please enter a valid age"

    if (draft.type === "adult" && ageNum < 13) return "Adults must be 13+ years"
    if (draft.type === "child" && (ageNum < 2 || ageNum > 12)) return "Children must be 2–12 years"
    if (draft.type === "infant" && ageNum >= 2) return "Infants must be under 2 years"

    if (remainingByType[draft.type] <= 0) return `Maximum ${draft.type}s reached`
    if (!draft.nationality.trim()) return "Please enter nationality"

    return null
  }

  const handleAdd = () => {
    const msg = validate()
    if (msg) {
      setError(msg)
      return
    }
    setError(null)
    addTraveller({
      name: draft.name.trim(),
      age: draft.age,
      gender: draft.gender,
      nationality: draft.nationality.trim(),
      type: draft.type,
    })
    setDraft((d) => ({ ...d, name: "", age: "", nationality: "" }))
  }

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.handle} />

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Booking requirement</Text>
          <Text style={styles.title}>Traveller details</Text>
          <Text style={styles.subtitle}>
            Add {guests.adults} adult{guests.adults !== 1 ? "s" : ""}
            {guests.children ? `, ${guests.children} child${guests.children !== 1 ? "ren" : ""}` : ""}
            {guests.infants ? `, ${guests.infants} infant${guests.infants !== 1 ? "s" : ""}` : ""}
          </Text>
        </View>

        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close traveller details"
        >
          <Ionicons name="close" size={20} color={c.inkSecondary} />
        </Pressable>
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>
          Added travellers ({travellers.length})
        </Text>

        {travellers.length ? (
          <View style={styles.list}>
            {travellers.map((t, idx) => (
              <View key={t.id} style={[styles.row, idx < travellers.length - 1 && styles.rowBorder]}>
                <View style={styles.rowLeft}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{t.type.toUpperCase()}</Text>
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowName} numberOfLines={1}>
                      {t.name}
                    </Text>
                    <Text style={styles.rowMeta} numberOfLines={1}>
                      {t.age} · {t.gender} · {t.nationality}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => removeTraveller(t.id)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${t.name}`}
                >
                  <Ionicons name="trash-outline" size={20} color={c.inkMuted} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="information-circle-outline" size={18} color={c.inkMuted} />
            <Text style={styles.emptyText}>No travellers added yet.</Text>
          </View>
        )}
      </View>

      <TravellerForm
        value={draft}
        onChange={(next) => {
          setDraft(next)
          setError(null)
        }}
        remainingByType={remainingByType}
        onSubmit={handleAdd}
        error={error}
        disabled={!bookingId}
      />
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
  listCard: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    overflow: "hidden",
    ...sh.card,
  },
  listTitle: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    fontSize: 14,
    fontWeight: "800",
    color: c.ink,
  },
  list: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.divider,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: c.accentSoft,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: c.accentPressed,
    letterSpacing: 0.8,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 14,
    fontWeight: "800",
    color: c.ink,
  },
  rowMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: c.inkMuted,
  },
  empty: {
    paddingHorizontal: 14,
    paddingBottom: 14,
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

