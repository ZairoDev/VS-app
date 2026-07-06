import React, { useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type { PropertyInterface } from "@/types"
import { booking } from "@/Constants/booking-theme"
import { getActiveAmenities } from "@/utils/property-display"
import { AmenityIcon } from "@/components/property/AmenityIcon"

type AmenitiesSheetProps = {
  property?: PropertyInterface
  onClose: () => void
}

type AmenitySection = { title: string; items: string[] }

function getTrueKeys(map: unknown): string[] {
  if (!map || typeof map !== "object") return []
  const entries = Object.entries(map as Record<string, unknown>)
  return entries.filter(([, v]) => v === true).map(([k]) => k)
}

function buildAmenitySections(property: PropertyInterface): AmenitySection[] {
  const general = getTrueKeys(property.generalAmenities)
  const safety = getTrueKeys(property.safeAmenities)
  const other = getTrueKeys(property.otherAmenities)

  const sections: AmenitySection[] = []
  if (general.length) sections.push({ title: "Essentials", items: general })
  if (safety.length) sections.push({ title: "Safety", items: safety })
  if (other.length) sections.push({ title: "Other", items: other })

  // If everything is empty or maps are inconsistent, fall back to merged list.
  if (!sections.length) {
    const merged = getActiveAmenities(property)
    if (merged.length) sections.push({ title: "Amenities", items: merged })
  }

  return sections
}

const { colors: c, radius: r, space: sp, shadow: sh } = booking

export function AmenitiesSheet({ property, onClose }: AmenitiesSheetProps) {
  const insets = useSafeAreaInsets()

  const sections = useMemo(() => {
    if (!property) return [] as AmenitySection[]
    return buildAmenitySections(property)
  }, [property])

  const total = sections.reduce((acc, s) => acc + s.items.length, 0)

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.handle} />

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>What this place offers</Text>
          <Text style={styles.title}>Amenities</Text>
          <Text style={styles.subtitle}>{total ? `${total} amenities` : "No amenities listed"}</Text>
        </View>

        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close amenities"
        >
          <Ionicons name="close" size={20} color={c.inkSecondary} />
        </Pressable>
      </View>

      {sections.length ? (
        <View style={styles.sections}>
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.card}>
                {section.items.map((name, idx) => (
                  <View
                    key={`${section.title}:${name}`}
                    style={[styles.row, idx < section.items.length - 1 && styles.rowBorder]}
                  >
                    <View style={styles.iconWrap}>
                      <AmenityIcon amenity={name} size={18} color={c.accent} />
                    </View>
                    <Text style={styles.rowText}>{name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="information-circle-outline" size={22} color={c.inkMuted} />
          <Text style={styles.emptyText}>No amenities available yet.</Text>
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
  sections: {
    gap: sp.lg - 4,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: c.ink,
    letterSpacing: -0.2,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    overflow: "hidden",
    ...sh.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.divider,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: c.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: c.ink,
  },
  empty: {
    marginTop: sp.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: sp.xl,
    paddingHorizontal: sp.lg,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: c.inkMuted,
    textAlign: "center",
    fontWeight: "600",
  },
})

