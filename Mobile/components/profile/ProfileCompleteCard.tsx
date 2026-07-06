import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { MotiView } from "moti"
import * as Haptics from "expo-haptics"
import { profile } from "@/Constants/profile-theme"
import { getProfileGaps } from "@/utils/profile"
import type { UserDataType } from "@/types"

const { colors: c, radius: r, space: sp, type: t, shadow: sh } = profile

type ProfileCompleteCardProps = {
  user: UserDataType
  onPress: () => void
}

const GAP_COPY: Record<string, string> = {
  photo: "Add a profile photo",
  phone: "Add a phone number",
  address: "Add your address",
  name: "Add your name",
}

export function ProfileCompleteCard({ user, onPress }: ProfileCompleteCardProps) {
  const gaps = getProfileGaps(user)
  if (gaps.length === 0) return null

  const primary = GAP_COPY[gaps[0]] ?? "Finish setting up your profile"
  const remaining = gaps.length

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 280, delay: 20 }}
      style={styles.wrap}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
          onPress()
        }}
        style={({ pressed }) => [pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Complete your profile"
        accessibilityHint="Opens personal info so you can finish your profile"
      >
        <View style={styles.card}>
          <View style={styles.iconWell}>
            <Feather name="user-check" size={20} color={c.accent} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Complete your profile</Text>
            <Text style={styles.meta} numberOfLines={2}>
              {primary}
              {remaining > 1 ? ` · ${remaining} steps left` : ""}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={c.inkPlaceholder} />
        </View>
      </Pressable>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: sp.md,
    marginBottom: sp.md,
  },
  pressed: {
    opacity: 0.88,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.accentSoft,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 102, 0, 0.18)",
    padding: 14,
    ...sh.card,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: r.md,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  title: {
    ...t.body,
    fontWeight: "700",
    color: c.ink,
  },
  meta: {
    ...t.meta,
    color: c.inkSecondary,
    marginTop: 2,
  },
})
