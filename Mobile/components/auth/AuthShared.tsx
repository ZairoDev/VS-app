import React, { useEffect } from "react"
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { Ionicons } from "@expo/vector-icons"
import { auth } from "@/Constants/auth-theme"

export type AuthRole = "Owner" | "Traveller"

const ROLES: AuthRole[] = ["Traveller", "Owner"]
const SPRING = { damping: 22, stiffness: 280, mass: 0.8 }
const stylesVars = {
  orange: "#FD6301",
  icon: "#111827",
} as const

export function RoleSelector({
  role,
  onChange,
  compact,
}: {
  role: AuthRole
  onChange: (role: AuthRole) => void
  compact?: boolean
}) {
  const trackWidth = useSharedValue(0)
  const selectedIndex = useSharedValue(role === "Traveller" ? 0 : 1)

  useEffect(() => {
    selectedIndex.value = withSpring(role === "Traveller" ? 0 : 1, SPRING)
  }, [role, selectedIndex])

  const underlineStyle = useAnimatedStyle(() => {
    const segmentWidth = trackWidth.value / 2
    // underline centered under label/icon group
    return {
      transform: [{ translateX: segmentWidth * selectedIndex.value }],
    }
  })

  const handleLayout = (event: LayoutChangeEvent) => {
    trackWidth.value = event.nativeEvent.layout.width
  }

  const handleSelect = (next: AuthRole) => {
    if (next === role) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    onChange(next)
  }

  return (
    <View style={[styles.roleBlock, compact && styles.roleBlockCompact]}>
      <View style={[styles.segmentTrack, compact && styles.segmentTrackCompact]} onLayout={handleLayout}>
        <View style={styles.segmentRow}>
          {ROLES.map((item) => {
            const active = role === item
            const icon = item === "Traveller" ? "person-outline" : "home-outline"
            return (
              <Pressable
                key={item}
                onPress={() => handleSelect(item)}
                style={[styles.segment, active ? styles.segmentActive : styles.segmentInactive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={item}
              >
                <Ionicons
                  name={icon}
                  size={compact ? 16 : 18}
                  color={active ? stylesVars.orange : stylesVars.icon}
                />
                <Text style={[styles.segmentText, compact && styles.segmentTextCompact, active && styles.segmentTextActive]}>
                  {item}
                </Text>
              </Pressable>
            )
          })}
        </View>
        <Animated.View style={[styles.underlineWrap, underlineStyle]}>
          <View style={styles.underline} />
        </Animated.View>
      </View>
    </View>
  )
}

export function OrDivider({ compact }: { compact?: boolean }) {
  return (
    <View style={[styles.dividerRow, compact && styles.dividerRowCompact]} accessibilityElementsHidden>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or continue with</Text>
      <View style={styles.dividerLine} />
    </View>
  )
}

export function AuthSwitchLink({
  prompt,
  action,
  onPress,
}: {
  prompt: string
  action: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.switchWrap}
      hitSlop={auth.space.sm}
      accessibilityRole="button"
      accessibilityLabel={`${prompt} ${action}`}
    >
      <Text style={styles.switchText}>
        {prompt}{" "}
        <Text style={styles.switchAction}>{action}</Text>
      </Text>
    </Pressable>
  )
}

export const authScreenStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: auth.colors.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: auth.space.lg,
    paddingTop: auth.space.xl,
    paddingBottom: auth.space.xl,
  },
  scrollContentCompact: {
    paddingTop: auth.space.lg,
  },
  hero: {
    marginBottom: auth.space.xl,
  },
  heroCompact: {
    marginBottom: auth.space.lg,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: auth.radius.md,
    marginBottom: auth.space.lg,
  },
  logoCompact: {
    width: 40,
    height: 40,
    marginBottom: auth.space.md,
  },
  title: {
    ...auth.type.display,
    color: auth.colors.ink,
    marginBottom: auth.space.sm,
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  subtitle: {
    ...auth.type.subtitle,
    color: auth.colors.inkSecondary,
    maxWidth: 320,
  },
  form: {
    gap: auth.space.lg,
  },
})

const styles = StyleSheet.create({
  roleBlock: {
    marginTop: 2,
  },
  roleBlockCompact: {
    marginTop: 0,
  },
  segmentTrack: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F3F3F3",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  segmentTrackCompact: {
    height: 48,
    borderRadius: 14,
  },
  segmentRow: {
    flexDirection: "row",
    flex: 1,
  },
  segment: {
    flex: 1,
    minHeight: auth.touch.min,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
  },
  segmentActive: {
    backgroundColor: "#FFFFFF",
  },
  segmentInactive: {
    backgroundColor: "#F3F3F3",
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E2F33",
  },
  segmentTextCompact: {
    fontSize: 14,
  },
  segmentTextActive: {
    color: stylesVars.orange,
  },
  underlineWrap: {
    position: "absolute",
    left: 0,
    right: "50%",
    bottom: 0,
    height: 3,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 1,
  },
  underline: {
    width: 44,
    height: 2,
    borderRadius: 2,
    backgroundColor: stylesVars.orange,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginVertical: 8,
  },
  dividerRowCompact: {
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E9E9E9",
  },
  dividerText: {
    fontSize: 13,
    color: "#9B9DA2",
    fontWeight: "500",
  },
  switchWrap: {
    alignItems: "center",
    paddingVertical: auth.space.md,
    minHeight: auth.touch.min,
    justifyContent: "center",
  },
  switchText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#9B9DA2",
  },
  switchAction: {
    color: stylesVars.orange,
    fontWeight: "600",
  },
})
