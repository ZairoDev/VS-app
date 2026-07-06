import React from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { wl } from "@/Constants/wishlist-theme"

type WishlistHeaderProps = {
  count: number
  searchQuery: string
  onSearchChange: (text: string) => void
  onFilterPress: () => void
  onSortPress: () => void
  activeFilterCount: number
}

export function WishlistHeader({
  count,
  searchQuery,
  onSearchChange,
  onFilterPress,
  onSortPress,
  activeFilterCount,
}: WishlistHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.count}>
          {count} {count === 1 ? "saved stay" : "saved stays"}
        </Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={wl.colors.inkMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search your wishlist"
            placeholderTextColor={wl.colors.inkMuted}
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="Search wishlist"
          />
        </View>
        <Pressable
          onPress={onFilterPress}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Filter wishlist"
        >
          <Ionicons name="options-outline" size={20} color={wl.colors.ink} />
          {activeFilterCount > 0 ? (
            <View style={styles.filterDot}>
              <Text style={styles.filterDotText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          onPress={onSortPress}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Sort wishlist"
        >
          <Ionicons name="swap-vertical-outline" size={20} color={wl.colors.ink} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: wl.colors.bg,
    paddingHorizontal: wl.space.lg,
    paddingTop: wl.space.md,
    paddingBottom: wl.space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: wl.colors.border,
  },
  titleBlock: {
    marginBottom: wl.space.lg,
  },
  title: {
    ...wl.type.title,
    color: wl.colors.ink,
  },
  count: {
    ...wl.type.subtitle,
    color: wl.colors.inkMuted,
    marginTop: wl.space.xs,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wl.space.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: wl.space.sm,
    backgroundColor: wl.colors.surface,
    borderRadius: wl.radius.md,
    borderWidth: 1,
    borderColor: wl.colors.border,
    paddingHorizontal: wl.space.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: wl.colors.ink,
    paddingVertical: 0,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: wl.radius.md,
    backgroundColor: wl.colors.surface,
    borderWidth: 1,
    borderColor: wl.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterDot: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: wl.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterDotText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
})
