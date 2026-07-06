import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import * as Haptics from "expo-haptics"
import { MotiView } from "moti"
import { profile } from "@/Constants/profile-theme"

const { colors: c, space: sp } = profile

type ProfileLogoutButtonProps = {
  onPress: () => void
  delay?: number
}

export function ProfileLogoutButton({ onPress, delay = 0 }: ProfileLogoutButtonProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 280, delay }}
      style={styles.wrap}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
          onPress()
        }}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Log out"
        accessibilityHint="Signs you out of Vacation Saga"
        hitSlop={8}
      >
        <Text style={styles.label}>Log out</Text>
      </Pressable>

      <Text style={styles.version}>
        {profile.appName} · v{profile.appVersion}
      </Text>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: sp.md,
    marginTop: sp.sm,
    marginBottom: sp.md,
    alignItems: "center",
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.55,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: c.ink,
    textDecorationLine: "underline",
  },
  version: {
    marginTop: 18,
    fontSize: 12,
    color: c.inkPlaceholder,
    letterSpacing: 0.2,
  },
})
