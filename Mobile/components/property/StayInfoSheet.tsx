import React, { useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import type { PropertyInterface } from "@/types"
import { booking } from "@/Constants/booking-theme"

const { colors: c, radius: r, space: sp, shadow: sh } = booking

type StayInfoData = {
  description: string
  specItems: string[]
  extendedDetails: { title: string; value: string }[]
}

type StayInfoSheetProps = {
  property?: PropertyInterface
  stayInfo: StayInfoData
  onClose: () => void
  onContentHeight?: (height: number) => void
}

const RULE_KEYS = new Set([
  "Smoking",
  "Pets",
  "Parties",
  "Cooking",
  "Suitable for students",
  "Instant booking",
])

function specIcon(label: string): React.ComponentProps<typeof Ionicons>["name"] {
  const lower = label.toLowerCase()
  if (lower.includes("kitchen")) return "restaurant-outline"
  if (lower.includes("floor") || lower.includes("levels")) return "layers-outline"
  if (lower.includes("bedroom")) return "bed-outline"
  if (lower.includes("beds")) return "bed-outline"
  if (lower.includes("m²")) return "scan-outline"
  return "home-outline"
}

function detailIcon(title: string): React.ComponentProps<typeof Ionicons>["name"] {
  if (RULE_KEYS.has(title)) {
    if (title === "Smoking") return "ban-outline"
    if (title === "Pets") return "paw-outline"
    if (title === "Parties") return "musical-notes-outline"
    if (title === "Cooking") return "flame-outline"
    return "shield-checkmark-outline"
  }
  if (title.includes("Energy")) return "leaf-outline"
  if (title.includes("Heating")) return "thermometer-outline"
  if (title.includes("Rental")) return "calendar-outline"
  if (title.includes("Orientation")) return "compass-outline"
  return "information-circle-outline"
}

export function StayInfoSheet({ property, stayInfo, onClose, onContentHeight }: StayInfoSheetProps) {
  const insets = useSafeAreaInsets()

  const grouped = useMemo(() => {
    const propertyDetails = stayInfo.extendedDetails.filter((row) => !RULE_KEYS.has(row.title))
    const houseRules = stayInfo.extendedDetails.filter((row) => RULE_KEYS.has(row.title))
    return { propertyDetails, houseRules }
  }, [stayInfo.extendedDetails])

  const locationLine = [property?.city, property?.country].filter(Boolean).join(", ")

  return (
    <View
      style={[styles.root, { paddingBottom: Math.max(insets.bottom, 20) }]}
      onLayout={(e) => onContentHeight?.(e.nativeEvent.layout.height)}
    >
      <View style={styles.handle} />

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>About this stay</Text>
          <Text style={styles.title}>Stay Information</Text>
          {property?.propertyName || locationLine ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {[property?.propertyName, locationLine].filter(Boolean).join(" · ")}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close stay information"
        >
          <Ionicons name="close" size={20} color={c.inkSecondary} />
        </Pressable>
      </View>

      {stayInfo.description ? (
        <View style={styles.aboutCard}>
          <View style={styles.aboutAccent} />
          <Text style={styles.aboutText}>{stayInfo.description}</Text>
        </View>
      ) : null}

      {stayInfo.specItems.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The space</Text>
          <View style={styles.specGrid}>
            {stayInfo.specItems.map((item) => (
              <View key={item} style={styles.specCard}>
                <View style={styles.specIconWrap}>
                  <Ionicons name={specIcon(item)} size={18} color={c.accent} />
                </View>
                <Text style={styles.specLabel}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {grouped.propertyDetails.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property details</Text>
          <View style={styles.detailCard}>
            {grouped.propertyDetails.map((row, index) => (
              <View
                key={row.title}
                style={[
                  styles.detailRow,
                  index < grouped.propertyDetails.length - 1 && styles.detailRowBorder,
                ]}
              >
                <View style={styles.detailLeft}>
                  <View style={styles.detailIconWrap}>
                    <Ionicons name={detailIcon(row.title)} size={16} color={c.inkSecondary} />
                  </View>
                  <Text style={styles.detailLabel}>{row.title}</Text>
                </View>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {grouped.houseRules.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>House rules & policies</Text>
          <View style={styles.rulesCard}>
            {grouped.houseRules.map((row, index) => (
              <View
                key={row.title}
                style={[
                  styles.ruleRow,
                  index < grouped.houseRules.length - 1 && styles.detailRowBorder,
                ]}
              >
                <View style={styles.ruleIconWrap}>
                  <Ionicons name={detailIcon(row.title)} size={16} color={c.accent} />
                </View>
                <View style={styles.ruleCopy}>
                  <Text style={styles.ruleTitle}>{row.title}</Text>
                  <Text style={styles.ruleValue}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}
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
  aboutCard: {
    flexDirection: "row",
    backgroundColor: c.surface,
    borderRadius: r.lg,
    padding: sp.md,
    marginBottom: sp.lg - 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    ...sh.card,
  },
  aboutAccent: {
    width: 3,
    borderRadius: 2,
    backgroundColor: c.accent,
    marginRight: 12,
    alignSelf: "stretch",
  },
  aboutText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 25,
    color: c.inkSecondary,
  },
  section: {
    marginBottom: sp.lg - 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: c.ink,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  specCard: {
    width: "48%",
    flexGrow: 1,
    minWidth: "46%",
    backgroundColor: c.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  specIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: c.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  specLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: c.ink,
  },
  detailCard: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  detailRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.divider,
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  detailIconWrap: {
    width: 30,
    height: 30,
    borderRadius: r.sm,
    backgroundColor: c.track,
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: c.inkSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: c.ink,
    textAlign: "right",
    maxWidth: "42%",
  },
  rulesCard: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    overflow: "hidden",
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  ruleIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: c.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  ruleCopy: {
    flex: 1,
    gap: 2,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: c.ink,
  },
  ruleValue: {
    fontSize: 14,
    lineHeight: 20,
    color: c.inkSecondary,
  },
})
