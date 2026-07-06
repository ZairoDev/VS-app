import React, { memo, useMemo, useState } from "react"
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { booking } from "@/Constants/booking-theme"

const { colors: c } = booking

export const BENTO_GRID_PADDING = 8
export const BENTO_GRID_GAP = 4

const BENTO_HEIGHTS = [200, 200, 200, 300, 150, 150] as const
const BENTO_WIDTH_MODES = ["full", "half", "half", "full", "half", "half"] as const

function getBentoContentWidth(screenWidth: number) {
  return screenWidth - BENTO_GRID_PADDING * 2
}

export function getBentoTileStyle(index: number, screenWidth: number): ViewStyle {
  const contentWidth = getBentoContentWidth(screenWidth)
  const halfWidth = (contentWidth - BENTO_GRID_GAP) / 2
  const patternIndex = index % BENTO_WIDTH_MODES.length
  const widthMode = BENTO_WIDTH_MODES[patternIndex]
  const height = BENTO_HEIGHTS[patternIndex]

  return {
    width: widthMode === "full" ? contentWidth : halfWidth,
    height,
  }
}

type PropertyGalleryImageProps = {
  uri: string
  style?: StyleProp<ImageStyle>
  containerStyle?: StyleProp<ViewStyle>
}

export const PropertyGalleryImage = memo(function PropertyGalleryImage({
  uri,
  style,
  containerStyle,
}: PropertyGalleryImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <View style={[styles.imageShell, containerStyle]}>
      {!loaded && !failed ? <View style={styles.imagePlaceholder} /> : null}
      {!failed ? (
        <Image
          source={{ uri }}
          style={[styles.image, style, !loaded && styles.imageHidden]}
          resizeMode="cover"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true)
            setLoaded(false)
          }}
        />
      ) : (
        <View style={styles.imageError}>
          <Ionicons name="image-outline" size={22} color={c.inkMuted} />
        </View>
      )}
    </View>
  )
})

type PropertyBentoGridProps = {
  images: string[]
  onImagePress?: (index: number) => void
}

export const PropertyBentoGrid = memo(function PropertyBentoGrid({
  images,
  onImagePress,
}: PropertyBentoGridProps) {
  const { width: screenWidth } = useWindowDimensions()

  const tileStyles = useMemo(
    () => images.map((_, index) => getBentoTileStyle(index, screenWidth)),
    [images, screenWidth],
  )

  return (
    <View style={styles.grid}>
      {images.map((uri, index) => {
        const tileStyle = tileStyles[index]
        const key = `property-photo-${index}-${uri}`

        const tile = (
          <View style={[styles.gridItem, tileStyle]}>
            <PropertyGalleryImage uri={uri} containerStyle={styles.gridImageFill} />
          </View>
        )

        if (!onImagePress) return <View key={key}>{tile}</View>

        return (
          <Pressable
            key={key}
            onPress={() => onImagePress(index)}
            accessibilityRole="button"
            accessibilityLabel={`View photo ${index + 1} of ${images.length}`}
          >
            {tile}
          </Pressable>
        )
      })}
    </View>
  )
})

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    padding: BENTO_GRID_PADDING,
    gap: BENTO_GRID_GAP,
  },
  gridItem: {
    overflow: "hidden",
  },
  gridImageFill: {
    width: "100%",
    height: "100%",
  },
  imageShell: {
    width: "100%",
    height: "100%",
    backgroundColor: c.track,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageHidden: {
    opacity: 0,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: c.track,
  },
  imageError: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.track,
  },
})
