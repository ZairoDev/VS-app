import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { profile } from "@/Constants/profile-theme"
import { getDisplayName, getRoleLabel } from "@/utils/profile"
import type { UserDataType } from "@/types"
import { ProfileAvatar } from "./ProfileAvatar"

const { colors: c, space: sp, type: t, radius: r, shadow: sh } = profile

type ProfileHeaderProps = {
  user: UserDataType
  isPhotoUploading: boolean
  onOpenPersonalInfo: () => void
  onChangePhoto: () => void
}

export function ProfileHeader({
  user,
  isPhotoUploading,
  onOpenPersonalInfo,
  onChangePhoto,
}: ProfileHeaderProps) {
  const displayName = getDisplayName(user)
  const roleLabel = getRoleLabel(user)

  const openInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    onOpenPersonalInfo()
  }

  const metaParts: string[] = []
  if (roleLabel) metaParts.push(roleLabel)
  if (user.isVerified) metaParts.push("Verified guest")

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.avatarCol}>
          <ProfileAvatar
            user={user}
            isUploading={isPhotoUploading}
            onPress={onChangePhoto}
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>

          {user.email ? (
            <Text style={styles.email} numberOfLines={1}>
              {user.email}
            </Text>
          ) : null}

          {metaParts.length > 0 ? (
            <View style={styles.metaRow}>
              {user.isVerified ? (
                <Feather name="check-circle" size={13} color={c.success} />
              ) : null}
              <Text style={styles.meta} numberOfLines={1}>
                {metaParts.join(" · ")}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={openInfo}
            style={({ pressed }) => [pressed && styles.linkPressed]}
            accessibilityRole="button"
            accessibilityLabel="Show profile"
            accessibilityHint="Opens your personal details"
            hitSlop={6}
          >
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>Show profile</Text>
              <Feather
                name="chevron-right"
                size={16}
                color={c.inkSecondary}
                style={styles.linkIcon}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: sp.sm,
    paddingHorizontal: sp.md,
    paddingBottom: sp.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    paddingVertical: 18,
    paddingHorizontal: sp.md,
    ...sh.card,
  },
  avatarCol: {
    marginRight: 16,
    paddingRight: 4,
    paddingBottom: 4,
  },
  info: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 28,
    color: c.ink,
  },
  email: {
    ...t.meta,
    color: c.inkMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 5,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    color: c.inkSecondary,
    fontWeight: "500",
    flexShrink: 1,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  linkPressed: {
    opacity: 0.6,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
    color: c.inkSecondary,
    textDecorationLine: "underline",
  },
  linkIcon: {
    marginLeft: 2,
    marginTop: 1,
  },
})
