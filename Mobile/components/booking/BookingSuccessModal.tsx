import React from "react"
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { booking } from "@/Constants/booking-theme"

type BookingSuccessModalProps = {
  visible: boolean
  onClose?: () => void
  onViewBookings: () => void
  title?: string
  subtitle?: string
}

const { colors: c, radius: r, space: sp, shadow: sh } = booking

export function BookingSuccessModal({
  visible,
  onClose,
  onViewBookings,
  title = "Request sent",
  subtitle = "Your booking request has been sent. You can track it under My Bookings.",
}: BookingSuccessModalProps) {
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { marginBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.hero}>
            <View style={styles.checkWrap}>
              <Ionicons name="checkmark" size={28} color={c.surface} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <Pressable
            onPress={onViewBookings}
            style={styles.primaryBtn}
            accessibilityRole="button"
            accessibilityLabel="View bookings"
          >
            <Text style={styles.primaryText}>View bookings</Text>
          </Pressable>

          {onClose ? (
            <Pressable
              onPress={onClose}
              style={styles.secondaryBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.secondaryText}>Not now</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: c.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: sp.lg,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: c.surface,
    borderRadius: r.sheet,
    padding: sp.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    ...sh.card,
  },
  hero: {
    alignItems: "center",
    gap: 10,
    marginBottom: sp.lg,
  },
  checkWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.success,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: c.ink,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: c.inkMuted,
    textAlign: "center",
    fontWeight: "600",
  },
  primaryBtn: {
    height: booking.button.height,
    borderRadius: booking.button.radius,
    backgroundColor: c.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    fontSize: 15,
    fontWeight: "900",
    color: c.surface,
  },
  secondaryBtn: {
    marginTop: 10,
    height: booking.button.height,
    borderRadius: booking.button.radius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: c.inkSecondary,
  },
})

