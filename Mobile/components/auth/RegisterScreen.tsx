import React from "react"
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { FloatingInput, LoginGoogleButton, LoginPrimaryButton } from "@/components/auth/FloatingInput"
import { OrDivider, RoleSelector, authScreenStyles, type AuthRole } from "@/components/auth/AuthShared"

const TAB_BAR_HEIGHT = 52

const stylesVars = {
  orange: "#FD6301",
} as const

type RegisterScreenProps = {
  name: string
  setName: (value: string) => void
  phone: string
  setPhone: (value: string) => void
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  confirmPassword: string
  setConfirmPassword: (value: string) => void
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (value: boolean) => void
  role: AuthRole
  setRole: (value: AuthRole) => void
  isLoading: boolean
  isGoogleLoading: boolean
  onRegister: () => void
  onGoogleSignIn: () => void
  onSignIn: () => void
}

export function RegisterScreen({
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  role,
  setRole,
  isLoading,
  isGoogleLoading,
  onRegister,
  onGoogleSignIn,
  onSignIn,
}: RegisterScreenProps) {
  const insets = useSafeAreaInsets()
  const bottomPad = TAB_BAR_HEIGHT + insets.bottom + 12

  return (
    <SafeAreaView style={authScreenStyles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={authScreenStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          style={authScreenStyles.flex}
          contentContainerStyle={[styles.container, { paddingBottom: bottomPad }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Pressable onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.hero}>
              <View style={styles.brandRow}>
                <View style={styles.brandMark}>
                  <Image source={require("@/assets/images/vs.png")} style={styles.brandMarkImage} />
                </View>
                <View style={styles.brandText}>
                  <Text style={styles.brandName}>Vacation Saga</Text>
                  <Text style={styles.brandTagline}>Discover stays, create memories</Text>
                </View>
              </View>

              <Text style={styles.title} accessibilityRole="header">
                Create account
              </Text>
              <Text style={styles.subtitle}>Join Vacation Saga and start exploring</Text>
            </View>

            <View style={styles.form}>
              <RoleSelector role={role} onChange={setRole} compact />

              <FloatingInput
                label="Full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                textContentType="name"
                returnKeyType="next"
                placeholder="Full name"
                leftIconName="person-outline"
                compact
              />

              <FloatingInput
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                returnKeyType="next"
                placeholder="Phone number"
                leftIconName="call-outline"
                compact
              />

              <FloatingInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                returnKeyType="next"
                autoComplete="email"
                placeholder="Email address"
                leftIconName="mail-outline"
                compact
              />

              <FloatingInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                returnKeyType="next"
                autoComplete="new-password"
                secureToggle
                secureVisible={showPassword}
                onToggleSecure={() => setShowPassword(!showPassword)}
                placeholder="Password"
                leftIconName="lock-closed-outline"
                compact
              />

              <FloatingInput
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={onRegister}
                autoComplete="new-password"
                secureToggle
                secureVisible={showConfirmPassword}
                onToggleSecure={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder="Confirm password"
                leftIconName="lock-closed-outline"
                compact
              />

              <LoginPrimaryButton
                label="Create account"
                onPress={onRegister}
                loading={isLoading}
                disabled={isGoogleLoading}
                compact
              />

              <OrDivider compact />

              <LoginGoogleButton
                onPress={onGoogleSignIn}
                loading={isGoogleLoading}
                disabled={isLoading}
                compact
              />

              <Pressable onPress={onSignIn} style={styles.switchRow} hitSlop={10} accessibilityRole="button">
                <Text style={styles.switchPrompt}>Already have an account?</Text>
                <View style={styles.switchActionRow}>
                  <Text style={styles.switchAction}>Sign in</Text>
                  <Ionicons name="arrow-forward" size={14} color={stylesVars.orange} />
                </View>
              </Pressable>
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 8,
    backgroundColor: "#FFFBF8",
  },
  hero: {
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FD6301",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  brandMarkImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  brandText: {
    gap: 2,
    flexShrink: 1,
  },
  brandName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E1F22",
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: "400",
    color: "#9B9DA2",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E1F22",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "400",
    color: "#9B9DA2",
  },
  form: {
    gap: 8,
  },
  switchRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 4,
  },
  switchPrompt: {
    fontSize: 13,
    fontWeight: "400",
    color: "#9B9DA2",
  },
  switchActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  switchAction: {
    fontSize: 13,
    fontWeight: "600",
    color: stylesVars.orange,
  },
})
