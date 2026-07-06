import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { profile } from "@/Constants/profile-theme"

const { colors: c, size: s } = profile

export type ProfileIconName = React.ComponentProps<typeof Feather>["name"]

export type ProfileMenuItem = {
  label: string
  icon: ProfileIconName
  onPress: () => void
  subtitle?: string
  accessibilityHint?: string
}

type ProfileMenuRowProps = ProfileMenuItem & {
  isLast?: boolean
}

export function ProfileMenuRow({
  label,
  icon,
  onPress,
  subtitle,
  accessibilityHint,
  isLast,
}: ProfileMenuRowProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        onPress()
      }}
      style={({ pressed }) => [pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
    >
      <View style={[styles.row, isLast && styles.rowLast]}>
        <View style={styles.iconWrap}>
          <Feather name={icon} size={20} color={c.ink} />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Feather name="chevron-right" size={18} color={c.inkPlaceholder} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.55,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: s.rowMinHeight,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.divider,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 28,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    paddingRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: c.ink,
    letterSpacing: -0.1,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: c.inkMuted,
  },
})
