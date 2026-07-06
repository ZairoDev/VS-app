import React, { memo, useCallback, useState } from "react"
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { Image } from "expo-image"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import type { PropertyInterface } from "@/types"
import { wl } from "@/Constants/wishlist-theme"
import {
  formatLocation,
  formatPrice,
  getPropertyImages,
  getPropertyRating,
} from "@/utils/property-display"

const CARD_WIDTH = Dimensions.get("window").width - wl.space.lg * 2
const IMAGE_HEIGHT = 260

type WishlistPropertyCardProps = {
  property: PropertyInterface
  onPress: (id: string) => void
  onRemove: (id: string) => void
}

function WishlistPropertyCardComponent({ property, onPress, onRemove }: WishlistPropertyCardProps) {
  const images = getPropertyImages(property)
  const rating = getPropertyRating(property)
  const price = formatPrice(property)
  const [imageIndex, setImageIndex] = useState(0)
  const heartScale = useSharedValue(1)

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }))

  const onHeartPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    heartScale.value = withSequence(
      withSpring(1.35, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    )
    onRemove(property._id)
  }, [heartScale, onRemove, property._id])

  const onImageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH)
    if (idx !== imageIndex) setImageIndex(idx)
  }

  return (
    <Pressable
      onPress={() => onPress(property._id)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${property.propertyName}, ${formatLocation(property)}`}
    >
      <View style={styles.imageWrap}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onImageScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          nestedScrollEnabled
        >
          {images.map((uri, i) => (
            <Image
              key={`${property._id}-img-${i}`}
              source={{ uri }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              accessibilityLabel={`Photo ${i + 1} of ${property.propertyName}`}
            />
          ))}
        </ScrollView>

        {images.length > 1 ? (
          <View style={styles.dots} pointerEvents="none">
            {images.slice(0, 5).map((_, i) => (
              <View key={i} style={[styles.dot, i === imageIndex && styles.dotActive]} />
            ))}
          </View>
        ) : null}

        {property.isInstantBooking ? (
          <View style={styles.instantBadge} pointerEvents="none">
            <Ionicons name="flash" size={12} color={wl.colors.ink} />
            <Text style={styles.badgeText}>Instant book</Text>
          </View>
        ) : null}

        <Pressable
          onPress={onHeartPress}
          style={styles.heartBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Remove from wishlist"
        >
          <Animated.View style={[styles.heartInner, heartStyle]}>
            <Ionicons name="heart" size={20} color={wl.colors.accent} />
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {property.propertyName}
          </Text>
          {rating != null ? (
            <View style={styles.ratingInline}>
              <Ionicons name="star" size={13} color={wl.colors.star} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.location} numberOfLines={1}>
          {formatLocation(property)}
        </Text>

        <View style={styles.amenities}>
          {property.guests ? (
            <Amenity icon="people-outline" label={`${property.guests} guests`} />
          ) : null}
          {property.bedrooms ? (
            <Amenity icon="home-outline" label={`${property.bedrooms} bed`} />
          ) : null}
          {property.bathroom ? (
            <Amenity icon="water-outline" label={`${property.bathroom} bath`} />
          ) : null}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {price.amount}
            <Text style={styles.priceSuffix}>{price.suffix}</Text>
          </Text>
          {property.propertyType ? (
            <Text style={styles.typeTag}>{property.propertyType}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}

function Amenity({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string }) {
  return (
    <View style={styles.amenity}>
      <Ionicons name={icon} size={14} color={wl.colors.inkMuted} />
      <Text style={styles.amenityText}>{label}</Text>
    </View>
  )
}

export const WishlistPropertyCard = memo(WishlistPropertyCardComponent)

const styles = StyleSheet.create({
  card: {
    backgroundColor: wl.colors.surface,
    borderRadius: wl.radius.xl,
    marginBottom: wl.space.xxl,
    overflow: "hidden",
    ...wl.shadow.card,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.992 }],
  },
  imageWrap: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: wl.colors.border,
  },
  image: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
  },
  dots: {
    position: "absolute",
    bottom: wl.space.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 8,
  },
  instantBadge: {
    position: "absolute",
    top: wl.space.md,
    left: wl.space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: wl.radius.pill,
    ...wl.shadow.fab,
  },
  badgeText: {
    ...wl.type.badge,
    color: wl.colors.ink,
  },
  heartBtn: {
    position: "absolute",
    top: wl.space.md,
    right: wl.space.md,
  },
  heartInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
    ...wl.shadow.fab,
  },
  ratingText: {
    ...wl.type.badge,
    color: wl.colors.ink,
  },
  body: {
    padding: wl.space.lg,
    gap: wl.space.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: wl.space.sm,
  },
  ratingInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingTop: 2,
  },
  title: {
    ...wl.type.cardTitle,
    color: wl.colors.ink,
    flex: 1,
  },
  location: {
    ...wl.type.cardMeta,
    color: wl.colors.inkSecondary,
  },
  amenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wl.space.md,
    marginTop: wl.space.xs,
  },
  amenity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  amenityText: {
    fontSize: 13,
    color: wl.colors.inkMuted,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: wl.space.xs,
  },
  price: {
    ...wl.type.price,
    color: wl.colors.ink,
  },
  priceSuffix: {
    fontSize: 14,
    fontWeight: "400",
    color: wl.colors.inkSecondary,
  },
  typeTag: {
    fontSize: 12,
    fontWeight: "500",
    color: wl.colors.inkMuted,
    textTransform: "capitalize",
  },
})
