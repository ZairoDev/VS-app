import React from "react"
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type { WishlistFilters, WishlistSortKey } from "@/Constants/wishlist-theme"
import { wl } from "@/Constants/wishlist-theme"

const SORT_OPTIONS: { key: WishlistSortKey; label: string }[] = [
  { key: "default", label: "Recently saved" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
  { key: "name", label: "Name: A to Z" },
]

type WishlistOptionsSheetProps = {
  visible: boolean
  mode: "sort" | "filter"
  sortKey: WishlistSortKey
  filters: WishlistFilters
  propertyTypes: string[]
  onClose: () => void
  onSortChange: (key: WishlistSortKey) => void
  onFiltersChange: (filters: WishlistFilters) => void
}

export function WishlistOptionsSheet({
  visible,
  mode,
  sortKey,
  filters,
  propertyTypes,
  onClose,
  onSortChange,
  onFiltersChange,
}: WishlistOptionsSheetProps) {
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + wl.space.lg }]}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>{mode === "sort" ? "Sort by" : "Filters"}</Text>

        {mode === "sort"
          ? SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                style={styles.option}
                onPress={() => {
                  onSortChange(opt.key)
                  onClose()
                }}
              >
                <Text style={[styles.optionText, sortKey === opt.key && styles.optionActive]}>
                  {opt.label}
                </Text>
                {sortKey === opt.key ? (
                  <Ionicons name="checkmark" size={20} color={wl.colors.accent} />
                ) : null}
              </Pressable>
            ))
          : null}

        {mode === "filter" ? (
          <>
            <Pressable
              style={styles.option}
              onPress={() =>
                onFiltersChange({ ...filters, instantOnly: !filters.instantOnly })
              }
            >
              <Text style={styles.optionText}>Instant book only</Text>
              <Ionicons
                name={filters.instantOnly ? "checkbox" : "square-outline"}
                size={22}
                color={filters.instantOnly ? wl.colors.accent : wl.colors.inkMuted}
              />
            </Pressable>

            {propertyTypes.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>Property type</Text>
                {propertyTypes.map((type) => {
                  const active = filters.propertyType === type
                  return (
                    <Pressable
                      key={type}
                      style={styles.option}
                      onPress={() =>
                        onFiltersChange({
                          ...filters,
                          propertyType: active ? null : type,
                        })
                      }
                    >
                      <Text style={[styles.optionText, active && styles.optionActive]}>{type}</Text>
                      {active ? (
                        <Ionicons name="checkmark" size={20} color={wl.colors.accent} />
                      ) : null}
                    </Pressable>
                  )
                })}
              </>
            ) : null}

            <Pressable
              style={styles.clearBtn}
              onPress={() => {
                onFiltersChange({ instantOnly: false, propertyType: null })
                onClose()
              }}
            >
              <Text style={styles.clearText}>Clear all filters</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: wl.colors.surface,
    borderTopLeftRadius: wl.radius.xl,
    borderTopRightRadius: wl.radius.xl,
    paddingHorizontal: wl.space.lg,
    paddingTop: wl.space.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: wl.colors.border,
    alignSelf: "center",
    marginBottom: wl.space.lg,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: wl.colors.ink,
    marginBottom: wl.space.lg,
  },
  sectionLabel: {
    ...wl.type.label,
    color: wl.colors.inkMuted,
    marginTop: wl.space.md,
    marginBottom: wl.space.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: wl.colors.border,
  },
  optionText: {
    fontSize: 16,
    color: wl.colors.ink,
  },
  optionActive: {
    fontWeight: "600",
    color: wl.colors.accent,
  },
  clearBtn: {
    alignItems: "center",
    paddingVertical: wl.space.lg,
    marginTop: wl.space.sm,
  },
  clearText: {
    fontSize: 15,
    fontWeight: "600",
    color: wl.colors.accent,
  },
})
