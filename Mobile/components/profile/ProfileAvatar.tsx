import React from "react"
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { profile } from "@/Constants/profile-theme"
import { getInitials } from "@/utils/profile"
import type { UserDataType } from "@/types"

const { colors: c } = profile

type ProfileAvatarProps = {
  user: UserDataType
  isUploading: boolean
  onPress: () => void
  /** Diameter in px. Defaults to compact size for the identity card row. */
  size?: number
  showBadge?: boolean
}

export function ProfileAvatar({
  user,
  isUploading,
  onPress,
  size = profile.size.avatar,
  showBadge = true,
}: ProfileAvatarProps) {
  const hasPhoto = Boolean(user.profilePic && user.profilePic.trim() !== "")
  const badge = Math.max(28, Math.round(size * 0.34))

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View
        style={[
          styles.avatarClip,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {hasPhoto ? (
          <Image
            style={[styles.image, isUploading && styles.dimmed]}
            source={{ uri: user.profilePic }}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={[styles.initials, isUploading && styles.dimmed]}>
            <Text style={[styles.initialsText, { fontSize: size * 0.36 }]}>
              {getInitials(user)}
            </Text>
          </View>
        )}

        {isUploading ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator color={c.accent} size="small" />
          </View>
        ) : null}
      </View>

      {showBadge ? (
        <Pressable
          onPress={onPress}
          disabled={isUploading}
          hitSlop={8}
          style={({ pressed }) => [
            styles.badge,
            {
              width: badge,
              height: badge,
              borderRadius: badge / 2,
            },
            pressed && !isUploading && styles.badgePressed,
            isUploading && styles.badgeDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          accessibilityState={{ disabled: isUploading, busy: isUploading }}
        >
          <Feather name="camera" size={13} color={c.ink} />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    flexShrink: 0,
  },
  avatarClip: {
    overflow: "hidden",
    backgroundColor: c.track,
    borderWidth: 2,
    borderColor: c.surface,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  initials: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.accentSoft,
  },
  initialsText: {
    fontWeight: "700",
    color: c.accent,
    letterSpacing: -0.5,
  },
  dimmed: {
    opacity: 0.45,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  badge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 4,
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
  },
  badgePressed: {
    opacity: 0.75,
  },
  badgeDisabled: {
    opacity: 0.5,
  },
})
