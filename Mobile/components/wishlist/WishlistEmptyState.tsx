import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { wl } from "@/Constants/wishlist-theme"

type EmptyVariant = "signed_out" | "empty" | "error" | "no_results"

type WishlistEmptyStateProps = {
  variant: EmptyVariant
  onRefresh?: () => void
  onRetry?: () => void
}

export function WishlistEmptyState({ variant, onRefresh, onRetry }: WishlistEmptyStateProps) {
  const config = VARIANTS[variant]

  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name={config.icon} size={40} color={wl.colors.accent} />
      </View>
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.message}>{config.message}</Text>

      {variant === "signed_out" ? (
        <Pressable
          style={styles.primaryBtn}
          onPress={() => router.push("/(tabs)/Menu")}
          accessibilityRole="button"
        >
          <Text style={styles.primaryBtnText}>Sign in</Text>
        </Pressable>
      ) : null}

      {variant === "empty" ? (
        <View style={styles.ctaRow}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push("/(tabs)")}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>Explore stays</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => router.push("/(tabs)")}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryBtnText}>Discover homes</Text>
          </Pressable>
        </View>
      ) : null}

      {variant === "empty" && onRefresh ? (
        <Pressable onPress={onRefresh} style={styles.textBtn} hitSlop={8}>
          <Text style={styles.textBtnLabel}>Refresh</Text>
        </Pressable>
      ) : null}

      {variant === "error" && onRetry ? (
        <Pressable style={styles.primaryBtn} onPress={onRetry} accessibilityRole="button">
          <Text style={styles.primaryBtnText}>Try again</Text>
        </Pressable>
      ) : null}

      {variant === "no_results" ? (
        <Pressable style={styles.secondaryBtn} onPress={onRefresh} accessibilityRole="button">
          <Text style={styles.secondaryBtnText}>Clear search</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const VARIANTS = {
  signed_out: {
    icon: "heart-outline" as const,
    title: "Save places you love",
    message: "Sign in to keep track of your favorite stays and plan your next getaway.",
  },
  empty: {
    icon: "compass-outline" as const,
    title: "Your wishlist is empty",
    message: "As you explore, tap the heart on any stay to save it here for later.",
  },
  error: {
    icon: "cloud-offline-outline" as const,
    title: "Couldn't load wishlist",
    message: "Check your connection and try again.",
  },
  no_results: {
    icon: "search-outline" as const,
    title: "No matches found",
    message: "Try a different search or adjust your filters.",
  },
} as const

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wl.space.xxl,
    paddingBottom: 80,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: wl.colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: wl.space.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: wl.colors.ink,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: wl.space.sm,
  },
  message: {
    ...wl.type.subtitle,
    color: wl.colors.inkSecondary,
    textAlign: "center",
    maxWidth: 300,
    marginBottom: wl.space.xl,
  },
  ctaRow: {
    width: "100%",
    gap: wl.space.sm,
  },
  primaryBtn: {
    width: "100%",
    height: 52,
    borderRadius: wl.radius.md,
    backgroundColor: wl.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: wl.space.sm,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  secondaryBtn: {
    width: "100%",
    height: 52,
    borderRadius: wl.radius.md,
    backgroundColor: wl.colors.surface,
    borderWidth: 1,
    borderColor: wl.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: wl.colors.ink,
  },
  textBtn: {
    marginTop: wl.space.lg,
  },
  textBtnLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: wl.colors.accent,
  },
})
