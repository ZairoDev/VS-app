import React from "react"
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native"
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { auth } from "@/Constants/auth-theme"
import { GoogleLogo } from "@/components/auth/GoogleLogo"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const TIMING = { duration: 180 }

type FloatingInputProps = TextInputProps & {
  label: string
  error?: string
  compact?: boolean
  grouped?: boolean
  showDivider?: boolean
  headerRight?: React.ReactNode
  leftIconName?: React.ComponentProps<typeof Ionicons>["name"]
  secureToggle?: boolean
  secureVisible?: boolean
  onToggleSecure?: () => void
}

export function AuthFieldGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.fieldGroup}>{children}</View>
}

export function FloatingInput({
  label,
  value,
  error,
  compact,
  grouped,
  showDivider,
  headerRight,
  leftIconName,
  secureToggle,
  secureVisible,
  onToggleSecure,
  onFocus,
  onBlur,
  placeholder,
  ...props
}: FloatingInputProps) {
  const focused = useSharedValue(0)

  const fieldStyle = useAnimatedStyle(() => {
    const style: {
      borderColor: string
      backgroundColor?: string
    } = {
      borderColor: error
        ? auth.colors.error
        : grouped
          ? "transparent"
          : interpolateColor(focused.value, [0, 1], [auth.colors.border, auth.colors.borderFocus]),
    }

    if (grouped) {
      style.backgroundColor = interpolateColor(focused.value, [0, 1], ["#FFFFFF", "#FAFAFA"])
    }

    return style
  })

  const displayPlaceholder = placeholder ?? (grouped ? label : undefined)

  return (
    <View style={[styles.wrap, compact && !grouped && styles.wrapCompact, grouped && styles.wrapGrouped]}>
      {!grouped && (label || headerRight) ? (
        <View style={styles.labelRow}>
          {label ? <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text> : <View />}
          {headerRight}
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.field,
          compact && styles.fieldCompact,
          grouped && styles.fieldGrouped,
          showDivider && styles.fieldGroupedDivider,
          error && styles.fieldError,
          fieldStyle,
        ]}
      >
        {leftIconName ? (
          <View style={[styles.leftIcon, grouped && styles.leftIconGrouped]} pointerEvents="none">
            <Ionicons name={leftIconName} size={compact || grouped ? 16 : 18} color={stylesVars.icon} />
          </View>
        ) : null}
        <TextInput
          {...props}
          value={value}
          placeholder={displayPlaceholder}
          style={[
            styles.input,
            (compact || grouped) && styles.inputCompact,
            leftIconName && styles.inputWithLeftIcon,
            secureToggle && styles.inputWithToggle,
          ]}
          placeholderTextColor={auth.colors.inkPlaceholder}
          selectionColor={auth.colors.accent}
          onFocus={(e) => {
            focused.value = withTiming(1, TIMING)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            focused.value = withTiming(0, TIMING)
            onBlur?.(e)
          }}
        />
        {secureToggle ? (
          <Pressable
            onPress={onToggleSecure}
            hitSlop={auth.space.md}
            style={styles.eye}
            accessibilityRole="button"
            accessibilityLabel={secureVisible ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={secureVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={auth.colors.inkMuted}
            />
          </Pressable>
        ) : null}
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

export function LoginPrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  compact,
}: {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  compact?: boolean
}) {
  const scale = useSharedValue(1)
  const pressed = useSharedValue(0)
  const off = Boolean(loading || disabled)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      pressed.value,
      [0, 1],
      [auth.colors.accent, auth.colors.accentPressed],
    ),
  }))

  return (
    <AnimatedPressable
      onPressIn={() => {
        if (off) return
        scale.value = withTiming(0.98, { duration: 80 })
        pressed.value = withTiming(1, { duration: 80 })
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 140 })
        pressed.value = withTiming(0, { duration: 140 })
      }}
      onPress={() => {
        if (!off) onPress()
      }}
      disabled={off}
      style={[
        styles.primaryButton,
        compact && styles.primaryButtonCompact,
        animStyle,
        off && styles.buttonDisabled,
        !off && auth.shadow.cta,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={[styles.primaryRow, compact && styles.primaryRowCompact]}>
          <View style={styles.primarySide} />
          <Text style={[styles.primaryButtonText, compact && styles.primaryButtonTextCompact]}>{label}</Text>
          <View style={styles.primarySide}>
            <Ionicons name="arrow-forward" size={compact ? 16 : 18} color="#FFFFFF" />
          </View>
        </View>
      )}
    </AnimatedPressable>
  )
}

export function LoginGoogleButton({
  onPress,
  loading,
  disabled,
  compact,
}: {
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  compact?: boolean
}) {
  const scale = useSharedValue(1)
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))
  const off = Boolean(loading || disabled)

  return (
    <AnimatedPressable
      onPressIn={() => {
        if (off) return
        scale.value = withTiming(0.98, { duration: 80 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 140 })
      }}
      onPress={() => {
        if (!off) onPress()
      }}
      disabled={off}
      style={[styles.googleButton, compact && styles.googleButtonCompact, animStyle, off && styles.buttonDisabled]}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Google"
      accessibilityState={{ disabled: off, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={auth.colors.inkSecondary} size="small" />
      ) : (
        <>
          <GoogleLogo size={compact ? 18 : 20} />
          <Text style={[styles.googleLabel, compact && styles.googleLabelCompact]}>Continue with Google</Text>
        </>
      )}
    </AnimatedPressable>
  )
}

const stylesVars = {
  icon: "#9AA0A6",
} as const

const styles = StyleSheet.create({
  fieldGroup: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  wrap: {
    gap: 10,
  },
  wrapCompact: {
    gap: 4,
  },
  wrapGrouped: {
    gap: 0,
  },
  labelCompact: {
    fontSize: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#7B7F86",
  },
  fieldCompact: {
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  fieldGrouped: {
    height: 48,
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 14,
    shadowOpacity: 0,
    elevation: 0,
  },
  fieldGroupedDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECEC",
  },
  field: {
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  fieldError: {
    backgroundColor: auth.colors.errorSoft,
  },
  leftIcon: {
    position: "absolute",
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 24,
  },
  leftIconGrouped: {
    left: 14,
  },
  input: {
    fontSize: 16,
    fontWeight: "400",
    color: "#1E1F22",
    paddingVertical: 0,
    height: 56,
  },
  inputCompact: {
    fontSize: 15,
    height: 48,
  },
  inputWithLeftIcon: {
    paddingLeft: 34,
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  eye: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    minWidth: auth.touch.min,
    alignItems: "center",
  },
  error: {
    marginTop: auth.space.xs,
    fontSize: 13,
    color: auth.colors.error,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: auth.space.sm,
  },
  primaryButtonCompact: {
    height: 50,
    borderRadius: 14,
    marginTop: 4,
  },
  primaryRowCompact: {
    height: 50,
  },
  primaryButtonTextCompact: {
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryRow: {
    height: 56,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  primarySide: {
    width: 22,
    alignItems: "flex-end",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  googleButtonCompact: {
    height: 50,
    borderRadius: 14,
  },
  googleLabelCompact: {
    fontSize: 15,
  },
  googleButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: auth.space.md,
    paddingHorizontal: auth.space.md,
  },
  googleLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F1F1F",
    letterSpacing: 0.1,
  },
})
