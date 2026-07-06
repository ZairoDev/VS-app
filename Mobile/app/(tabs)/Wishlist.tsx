import React, { useCallback, useState } from "react"
import { FlatList, StatusBar, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, { FadeInDown } from "react-native-reanimated"
import { router } from "expo-router"
import type { PropertyInterface } from "@/types"
import { wl } from "@/Constants/wishlist-theme"
import { useWishlistScreen } from "@/hooks/useWishlistScreen"
import {
  WishlistEmptyState,
  WishlistHeader,
  WishlistOptionsSheet,
  WishlistPropertyCard,
  WishlistSkeletonList,
} from "@/components/wishlist"

const TAB_BAR_PADDING = 88

const Wishlist = () => {
  const {
    user,
    loading,
    refreshing,
    error,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    filters,
    setFilters,
    propertyTypes,
    activeFilterCount,
    wishlistProperties,
    displayedProperties,
    onRefresh,
    handleRemoveFromWishlist,
    retry,
  } = useWishlistScreen()

  const [sheetMode, setSheetMode] = useState<"sort" | "filter" | null>(null)

  const openProperty = useCallback((id: string) => {
    router.push(`/(screens)/property-info/${id}`)
  }, [])

  const clearSearchAndFilters = useCallback(() => {
    setSearchQuery("")
    setFilters({ instantOnly: false, propertyType: null })
  }, [setFilters, setSearchQuery])

  const renderItem = useCallback(
    ({ item, index }: { item: PropertyInterface; index: number }) => (
      <Animated.View entering={FadeInDown.duration(320).delay(Math.min(index * 40, 200))}>
        <WishlistPropertyCard
          property={item}
          onPress={openProperty}
          onRemove={handleRemoveFromWishlist}
        />
      </Animated.View>
    ),
    [handleRemoveFromWishlist, openProperty]
  )

  const keyExtractor = useCallback((item: PropertyInterface) => item._id, [])

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <WishlistHeader
          count={0}
          searchQuery=""
          onSearchChange={() => {}}
          onFilterPress={() => {}}
          onSortPress={() => {}}
          activeFilterCount={0}
        />
        <WishlistSkeletonList />
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <WishlistEmptyState variant="signed_out" />
      </SafeAreaView>
    )
  }

  if (error && wishlistProperties.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <WishlistEmptyState variant="error" onRetry={retry} />
      </SafeAreaView>
    )
  }

  if (wishlistProperties.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <WishlistEmptyState variant="empty" onRefresh={onRefresh} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <WishlistHeader
        count={wishlistProperties.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setSheetMode("filter")}
        onSortPress={() => setSheetMode("sort")}
        activeFilterCount={activeFilterCount}
      />

      {displayedProperties.length === 0 ? (
        <WishlistEmptyState variant="no_results" onRefresh={clearSearchAndFilters} />
      ) : (
        <FlatList
          data={displayedProperties}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          removeClippedSubviews
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={7}
        />
      )}

      <WishlistOptionsSheet
        visible={sheetMode !== null}
        mode={sheetMode ?? "sort"}
        sortKey={sortKey}
        filters={filters}
        propertyTypes={propertyTypes}
        onClose={() => setSheetMode(null)}
        onSortChange={setSortKey}
        onFiltersChange={setFilters}
      />
    </SafeAreaView>
  )
}

export default Wishlist

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: wl.colors.bg,
  },
  list: {
    paddingHorizontal: wl.space.lg,
    paddingTop: wl.space.md,
    paddingBottom: TAB_BAR_PADDING,
  },
})
