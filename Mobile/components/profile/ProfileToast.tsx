import React, { useEffect } from "react"
import { Text, StyleSheet } from "react-native"
import { MotiView } from "moti"
import { profile } from "@/Constants/profile-theme"

const { colors: c, radius: r, space: sp, type: t, shadow: sh } = profile

type ProfileToastProps = {
  message: string | null
  variant?: "success" | "error"
  onDismiss: () => void
  durationMs?: number
}

export function ProfileToast({
  message,
  variant = "success",
  onDismiss,
  durationMs = 2000,
}: ProfileToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [message, durationMs, onDismiss])

  if (!message) return null

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: 8 }}
      transition={{ type: "timing", duration: 220 }}
      style={[
        styles.toast,
        variant === "error" ? styles.toastError : styles.toastSuccess,
      ]}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
    >
      <Text style={styles.text}>{message}</Text>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: sp.lg,
    right: sp.lg,
    bottom: 88,
    paddingVertical: 14,
    paddingHorizontal: sp.md,
    borderRadius: r.md,
    alignItems: "center",
    ...sh.card,
  },
  toastSuccess: {
    backgroundColor: c.ink,
  },
  toastError: {
    backgroundColor: c.danger,
  },
  text: {
    ...t.body,
    color: c.surface,
    fontWeight: "600",
  },
})
