import { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import type { PropertyInterface } from "@/types"
import { useAuthStore } from "@/store/auth-store"
import { useFocusEffect } from "@react-navigation/native"
import type { WishlistFilters, WishlistSortKey } from "@/Constants/wishlist-theme"
import {
  fetchWishlistIds,
  normalizeWishlistIds,
  persistUserWishlist,
  toggleWishlistProperty,
} from "@/utils/wishlist"

export function useWishlistScreen() {
  const { user, token } = useAuthStore()
  const [wishlistProperties, setWishlistProperties] = useState<PropertyInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<WishlistSortKey>("default")
  const [filters, setFilters] = useState<WishlistFilters>({
    instantOnly: false,
    propertyType: null,
  })

  const fetchWishlist = useCallback(
    async (isRefreshing = false) => {
      try {
        if (!isRefreshing) setLoading(true)
        setError(null)

        if (!user || !token) {
          setWishlistProperties([])
          return
        }

        const wishlistIds = await fetchWishlistIds(user._id)
        const currentIds = normalizeWishlistIds(user.wishlist)
        const idsChanged =
          wishlistIds.length !== currentIds.length ||
          wishlistIds.some((id) => !currentIds.some((c) => String(c) === String(id)))

        if (idsChanged) {
          const { setUser } = useAuthStore.getState()
          await persistUserWishlist(user, wishlistIds, setUser)
        }

        if (!wishlistIds.length) {
          setWishlistProperties([])
          return
        }

        const propertyDetails = (
          await Promise.all(
            wishlistIds.map(async (propertyId) => {
              try {
                const res = await axios.post(
                  `${process.env.EXPO_PUBLIC_BASE_URL}/properties/getParticularProperty`,
                  { propertyId }
                )
                return res.data?.data as PropertyInterface
              } catch {
                return null
              }
            })
          )
        ).filter((p): p is PropertyInterface => !!p?._id)

        setWishlistProperties(propertyDetails)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Could not load wishlist"
        console.error("Error fetching wishlist:", message)
        setError(message)
        setWishlistProperties([])
      } finally {
        if (isRefreshing) setRefreshing(false)
        else setLoading(false)
      }
    },
    [user, token]
  )

  useFocusEffect(
    useCallback(() => {
      fetchWishlist()
    }, [fetchWishlist])
  )

  useEffect(() => {
    if (user?.wishlist) fetchWishlist(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.wishlist?.join(",")])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchWishlist(true)
  }, [fetchWishlist])

  const handleRemoveFromWishlist = useCallback(
    async (propertyId: string) => {
      setWishlistProperties((prev) => prev.filter((p) => p._id !== propertyId))
      try {
        await toggleWishlistProperty(propertyId)
      } catch (err: unknown) {
        fetchWishlist()
        console.error("Error removing from wishlist:", err)
      }
    },
    [fetchWishlist]
  )

  const propertyTypes = useMemo(() => {
    const types = new Set<string>()
    wishlistProperties.forEach((p) => {
      if (p.propertyType?.trim()) types.add(p.propertyType.trim())
    })
    return Array.from(types).sort()
  }, [wishlistProperties])

  const displayedProperties = useMemo(() => {
    let list = [...wishlistProperties]
    const q = searchQuery.trim().toLowerCase()

    if (q) {
      list = list.filter((p) => {
        const haystack = [p.propertyName, p.city, p.country, p.placeName, p.propertyType]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        return haystack.includes(q)
      })
    }

    if (filters.instantOnly) {
      list = list.filter((p) => p.isInstantBooking)
    }

    if (filters.propertyType) {
      list = list.filter((p) => p.propertyType === filters.propertyType)
    }

    switch (sortKey) {
      case "price_asc":
        list.sort((a, b) => (a.basePrice ?? 0) - (b.basePrice ?? 0))
        break
      case "price_desc":
        list.sort((a, b) => (b.basePrice ?? 0) - (a.basePrice ?? 0))
        break
      case "name":
        list.sort((a, b) => (a.propertyName ?? "").localeCompare(b.propertyName ?? ""))
        break
      default:
        break
    }

    return list
  }, [wishlistProperties, searchQuery, sortKey, filters])

  const activeFilterCount =
    (filters.instantOnly ? 1 : 0) + (filters.propertyType ? 1 : 0)

  return {
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
    retry: () => fetchWishlist(),
  }
}
