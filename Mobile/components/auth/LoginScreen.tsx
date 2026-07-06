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
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { FloatingInput, LoginGoogleButton, LoginPrimaryButton } from "@/components/auth/FloatingInput"
import { AuthSwitchLink, OrDivider, RoleSelector, authScreenStyles, type AuthRole } from "@/components/auth/AuthShared"

const stylesVars = {
  orange: "#FD6301",
} as const

export type { AuthRole as LoginRole }

type LoginScreenProps = {
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  role: AuthRole
  setRole: (value: AuthRole) => void
  isLoading: boolean
  isGoogleLoading: boolean
  onLogin: () => void
  onGoogleSignIn: () => void
  onForgotPassword?: () => void
  onSignUp?: () => void
}

export function LoginScreen({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  role,
  setRole,
  isLoading,
  isGoogleLoading,
  onLogin,
  onGoogleSignIn,
  onForgotPassword,
  onSignUp,
}: LoginScreenProps) {
  return (
    <SafeAreaView style={authScreenStyles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={authScreenStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          style={authScreenStyles.flex}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Pressable onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.hero}>
              <View style={styles.heroRow}>
                <View style={styles.brandRow}>
                  <View style={styles.brandMark}>
                    <Image source={require("@/assets/images/vs.png")} style={styles.brandMarkImage} />
                  </View>
                  <View style={styles.brandText}>
                    <Text style={styles.brandName}>Vacation Saga</Text>
                    <Text style={styles.brandTagline}>Discover stays, create memories</Text>
                  </View>
                </View>

                <View style={styles.heroImageClip} pointerEvents="none">
                  <Image source={require("@/assets/images/santorini.jpeg")} style={styles.heroImage} />
                </View>
              </View>

              <Text style={styles.title} accessibilityRole="header">
                Welcome back
              </Text>
              <Text style={styles.subtitle}>Sign in to continue your journey</Text>
            </View>

            <View style={styles.form}>
              <RoleSelector role={role} onChange={setRole} />

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
                placeholder="Enter your email"
                leftIconName="mail-outline"
              />

              <FloatingInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={onLogin}
                autoComplete="password"
                secureToggle
                secureVisible={showPassword}
                onToggleSecure={() => setShowPassword(!showPassword)}
                placeholder="Enter your password"
                leftIconName="lock-closed-outline"
                headerRight={
                  onForgotPassword ? (
                    <Pressable
                      onPress={onForgotPassword}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel="Forgot password"
                    >
                      <Text style={styles.forgotLinkInline} />
                    </Pressable>
                  ) : undefined
                }
              />

              {onForgotPassword ? (
                <Pressable
                  onPress={onForgotPassword}
                  style={styles.forgotWrap}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                >
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </Pressable>
              ) : null}

              <LoginPrimaryButton
                label="Log in"
                onPress={onLogin}
                loading={isLoading}
                disabled={isGoogleLoading}
              />

              <OrDivider />

              <LoginGoogleButton
                onPress={onGoogleSignIn}
                loading={isGoogleLoading}
                disabled={isLoading}
              />

              {onSignUp ? (
                <Pressable onPress={onSignUp} style={styles.switchRow} hitSlop={10} accessibilityRole="button">
                  <Text style={styles.switchPrompt}>Don't have an account?</Text>
                  <View style={styles.switchActionRow}>
                    <Text style={styles.switchAction}>Create account</Text>
                    <Ionicons name="arrow-forward" size={16} color={stylesVars.orange} />
                  </View>
                </Pressable>
              ) : null}
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
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: "#FFFBF8",
  },
  hero: {
    marginBottom: 12,
  },
  heroRow: {
    height: 120,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 14,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FD6301",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  brandMarkImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  brandText: {
    gap: 2,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E1F22",
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: "400",
    color: "#9B9DA2",
  },
  heroImageClip: {
    width: 180,
    height: 108,
    borderBottomLeftRadius: 90,
    overflow: "hidden",
    backgroundColor: "#F3F3F3",
    marginTop: -4,
  },
  heroImage: {
    width: 180,
    height: 108,
    resizeMode: "cover",
  },
  title: {
    marginTop: 4,
    fontSize: 36,
    fontWeight: "800",
    color: "#1E1F22",
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "400",
    color: "#9B9DA2",
  },
  form: {
    gap: 14,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: -6,
    marginBottom: 2,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: "600",
    color: stylesVars.orange,
  },
  // placeholder used to keep layout stable when headerRight present
  forgotLinkInline: {
    height: 0,
    width: 0,
  },
  switchRow: {
    marginTop: 2,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  switchPrompt: {
    fontSize: 14,
    fontWeight: "400",
    color: "#9B9DA2",
  },
  switchActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchAction: {
    fontSize: 14,
    fontWeight: "600",
    color: stylesVars.orange,
  },
})
