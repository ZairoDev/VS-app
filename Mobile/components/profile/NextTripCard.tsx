import React from "react"
import { View, Text, Image, Pressable, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { MotiView } from "moti"
import * as Haptics from "expo-haptics"
import { profile } from "@/Constants/profile-theme"
import { formatDaysUntil, formatStayRange } from "@/utils/profile"
import type { Booking } from "@/types"

const { colors: c, radius: r, space: sp, type: t, shadow: sh } = profile

type NextTripCardProps = {
  booking: Booking
  onPress: () => void
}

export function NextTripCard({ booking, onPress }: NextTripCardProps) {
  const property = booking.propertyId
  const title = property?.propertyName || property?.placeName || "Upcoming stay"
  const city = property?.city
  const cover = property?.propertyCoverFileUrl
  const timing = formatDaysUntil(booking.startDate, booking.endDate)
  const dates = formatStayRange(booking.startDate, booking.endDate)
  const locationLine = [city, dates].filter(Boolean).join(" · ")

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 280, delay: 40 }}
      style={styles.wrap}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
          onPress()
        }}
        style={({ pressed }) => [pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Your next stay: ${title}${city ? ` in ${city}` : ""}. ${timing}`}
        accessibilityHint="Opens your bookings"
      >
        <View style={styles.card}>
          <View style={styles.media}>
            {cover ? (
              <Image source={{ uri: cover }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverFallback]}>
                <Feather name="home" size={28} color={c.accent} />
              </View>
            )}
            <LinearGradient
              colors={["transparent", "rgba(28,25,23,0.55)"]}
              style={styles.coverFade}
            />
            <View style={styles.timingPill}>
              <Text style={styles.timingText}>{timing}</Text>
            </View>
          </View>

          <View style={styles.body}>
            <Text style={styles.eyebrow}>Your next stay</Text>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {locationLine ? (
              <Text style={styles.meta} numberOfLines={1}>
                {locationLine}
              </Text>
            ) : null}

            <View style={styles.ctaRow}>
              <Text style={styles.cta}>View trip details</Text>
              <Feather name="arrow-right" size={15} color={c.accent} />
            </View>
          </View>
        </View>
      </Pressable>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: sp.md,
    marginBottom: sp.lg,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: r.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    overflow: "hidden",
    ...sh.hero,
  },
  media: {
    height: 132,
    backgroundColor: c.track,
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  coverFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.accentSoft,
  },
  coverFade: {
    ...StyleSheet.absoluteFillObject,
  },
  timingPill: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: c.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: r.pill,
  },
  timingText: {
    fontSize: 12,
    fontWeight: "700",
    color: c.ink,
  },
  body: {
    paddingHorizontal: sp.md,
    paddingTop: 14,
    paddingBottom: 16,
  },
  eyebrow: {
    ...t.eyebrow,
    color: c.accent,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: c.ink,
  },
  meta: {
    ...t.meta,
    color: c.inkMuted,
    marginTop: 4,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  cta: {
    ...t.link,
    color: c.accent,
  },
})
