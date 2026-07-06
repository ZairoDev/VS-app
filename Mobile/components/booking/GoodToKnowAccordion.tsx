import React, { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { PropertyInterface } from "@/types"
import { booking } from "@/Constants/booking-theme"
import { buildGoodToKnowItems } from "@/utils/property-display"

type GoodToKnowAccordionProps = {
  property?: PropertyInterface
  longTerm?: boolean
  onViewPropertyRules?: () => void
}

const { colors: c, radius: r, shadow: sh } = booking

export function GoodToKnowAccordion({
  property,
  longTerm = false,
  onViewPropertyRules,
}: GoodToKnowAccordionProps) {
  const [expanded, setExpanded] = useState(false)

  const items = useMemo(
    () => buildGoodToKnowItems(property, { longTerm }),
    [property, longTerm],
  )

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? "Collapse good to know" : "Expand good to know"}
      >
        <Text style={styles.title}>Good to know</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={c.inkMuted}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.row, index < items.length - 1 && styles.rowBorder]}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={18} color={c.accent} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowText}>{item.text}</Text>
                {item.kind === "link" && onViewPropertyRules ? (
                  <Pressable
                    onPress={onViewPropertyRules}
                    style={styles.linkRow}
                    accessibilityRole="link"
                    accessibilityLabel={item.actionLabel}
                  >
                    <Text style={styles.linkText}>{item.actionLabel}</Text>
                    <Ionicons name="chevron-forward" size={14} color={c.accent} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    overflow: "hidden",
    ...sh.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: c.ink,
  },
  body: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.divider,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.divider,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: c.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: c.ink,
  },
  rowText: {
    fontSize: 13,
    lineHeight: 18,
    color: c.inkMuted,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  linkText: {
    fontSize: 13,
    fontWeight: "700",
    color: c.accent,
  },
})
