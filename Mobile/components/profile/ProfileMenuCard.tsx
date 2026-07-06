import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { MotiView } from "moti"
import { profile } from "@/Constants/profile-theme"
import { ProfileMenuRow, type ProfileMenuItem } from "./ProfileMenuRow"

const { colors: c, radius: r, space: sp, type: t, shadow: sh } = profile

type ProfileMenuCardProps = {
  /** Sentence-case section title (Airbnb: Settings, Support). */
  label: string
  items: ProfileMenuItem[]
  delay?: number
}

export function ProfileMenuCard({ label, items, delay = 0 }: ProfileMenuCardProps) {
  if (items.length === 0) return null

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 280, delay }}
      style={styles.section}
    >
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <ProfileMenuRow
            key={item.label}
            {...item}
            isLast={index === items.length - 1}
          />
        ))}
      </View>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: sp.md,
    marginBottom: sp.lg,
  },
  sectionTitle: {
    ...t.sectionTitle,
    color: c.ink,
    marginBottom: 10,
    marginLeft: 2,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    paddingHorizontal: sp.md,
    ...sh.card,
  },
})
