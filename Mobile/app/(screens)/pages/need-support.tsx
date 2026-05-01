import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Linking,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { FontAwesome, MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import { MotiView } from "moti"
import axios from "axios";

const SPACING = 16
const ANIMATION_DURATION = 420

export default function ContactScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("info")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSend = async () => {
    if (!name || !email || !message) {
      alert("Please fill all fields.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/user/contact`, {
        name,
        email,
        message,
      });
  
      if (response.status === 200) {
        setIsSubmitted(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        alert(response.data.error || "Failed to send message.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  const handleEmail = (email:string) => {
    Linking.openURL(`mailto:${email}`)
  }

  const handleMap = () => {
    Linking.openURL("https://maps.google.com/?q=Kakadeo Kanpur")
  }

  const renderSectionIntro = (eyebrow: string, title: string, description: string) => (
    <View style={styles.sectionIntro}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  )

  const renderSupportRow = ({
    label,
    icon,
    content,
    onPress,
    external,
    hideDivider,
  }: {
    label: string
    icon: string
    content: React.ReactNode
    onPress?: () => void
    external?: boolean
    hideDivider?: boolean
  }) => {
    const rowContent = (
      <View style={[styles.supportRow, hideDivider && styles.supportRowLast]}>
        <View style={styles.supportIconBox}>
          <MaterialCommunityIcons name={icon as any} size={18} color="#5f5f5f" />
        </View>
        <View style={styles.supportBody}>
          <Text style={styles.supportLabel}>{label}</Text>
          {content}
        </View>
        {onPress ? (
          <Feather
            name={external ? "external-link" : "chevron-right"}
            size={16}
            color="#b1b1b1"
            style={styles.supportArrow}
          />
        ) : null}
      </View>
    )

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
          {rowContent}
        </TouchableOpacity>
      )
    }

    return rowContent
  }

  const renderInfoTab = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: ANIMATION_DURATION }}
      style={styles.tabContent}
    >
      {renderSectionIntro(
        "SUPPORT",
        "Ways to reach us",
        "Choose the channel that fits your question best. Everything here follows the same calm, flatter style as the rest of the app."
      )}

      <View style={styles.surface}>
        {renderSupportRow({
          label: "Legal name",
          icon: "office-building-outline",
          content: <Text style={styles.supportValue}>Zairo International Pvt. Ltd.</Text>,
        })}

        {renderSupportRow({
          label: "Address",
          icon: "map-marker-outline",
          onPress: handleMap,
          external: true,
          content: (
            <>
              <Text style={styles.supportValue}>117/N/70 3rd Floor Kakadeo Kanpur</Text>
              <Text style={styles.supportMeta}>Open location in maps</Text>
            </>
          ),
        })}

        {renderSupportRow({
          label: "General email",
          icon: "email-outline",
          onPress: () => handleEmail("info@vacationsaga.com"),
          content: <Text style={styles.supportValue}>info@vacationsaga.com</Text>,
        })}

        {renderSupportRow({
          label: "Support email",
          icon: "lifebuoy",
          onPress: () => handleEmail("support@vacationsaga.com"),
          content: <Text style={styles.supportValue}>support@vacationsaga.com</Text>,
        })}

        {renderSupportRow({
          label: "Sales support",
          icon: "phone-outline",
          onPress: () => handleCall("919120851166"),
          content: <Text style={styles.supportValue}>+91 9120851166</Text>,
        })}

        {renderSupportRow({
          label: "Booking support",
          icon: "phone-in-talk-outline",
          content: (
            <View style={styles.phoneStack}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => handleCall("918960980806")}>
                <Text style={styles.inlineLink}>+91 8960980806</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={() => handleCall("919621119484")}>
                <Text style={styles.inlineLink}>+91 9621119484</Text>
              </TouchableOpacity>
            </View>
          ),
        })}

        {renderSupportRow({
          label: "Business hours",
          icon: "clock-outline",
          hideDivider: true,
          content: (
            <View>
              <Text style={styles.supportValue}>Monday - Friday: 9:00 AM - 6:00 PM</Text>
              <Text style={styles.supportMeta}>Saturday: 10:00 AM - 4:00 PM</Text>
              <Text style={styles.supportMeta}>Sunday: Closed</Text>
            </View>
          ),
        })}
      </View>

      <View style={styles.socialSection}>
        <Text style={styles.sectionLabel}>SOCIAL</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}>
            <FontAwesome name="facebook" size={18} color="#ff8c1a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}>
            <FontAwesome name="instagram" size={18} color="#ff8c1a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}>
            <FontAwesome name="twitter" size={18} color="#ff8c1a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}>
            <FontAwesome name="linkedin" size={18} color="#ff8c1a" />
          </TouchableOpacity>
        </View>
      </View>
    </MotiView>
  )

  const renderContactTab = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: ANIMATION_DURATION }}
      style={styles.tabContent}
    >
      {renderSectionIntro(
        "MESSAGE",
        "Send us a note",
        "Share your issue or question and the team will reply as soon as possible."
      )}

      <View style={styles.surface}>
        {isSubmitted ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="check-circle" size={40} color="#22c55e" />
            </View>
            <Text style={styles.successTitle}>Message sent</Text>
            <Text style={styles.successText}>
              Thank you for reaching out. Our team will get back to you shortly.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full name</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputIconBox}>
                  <MaterialCommunityIcons name="account-outline" size={18} color="#6a6a6a" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#a8a8a8"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputIconBox}>
                  <MaterialCommunityIcons name="email-outline" size={18} color="#6a6a6a" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#a8a8a8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={[styles.formGroup, styles.formGroupLast]}>
              <Text style={styles.label}>Message</Text>
              <View style={[styles.inputRow, styles.inputRowMultiline]}>
                <View style={[styles.inputIconBox, styles.inputIconBoxTop]}>
                  <MaterialCommunityIcons name="message-text-outline" size={18} color="#6a6a6a" />
                </View>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="How can we help you?"
                  placeholderTextColor="#a8a8a8"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={17} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Send message</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </MotiView>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerBackdrop} pointerEvents="none">
              <View style={styles.headerAuraPrimary} />
              <View style={styles.headerAuraSecondary} />
              <View style={styles.headerAccentLine} />
            </View>
            <Text style={styles.headerEyebrow}>HELP</Text>
            <Text style={styles.title}>Need support?</Text>
            <Text style={styles.subtitle}>
              Contact the team, find the right support channel, or send us a message in a calmer layout that matches the rest of the app.
            </Text>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "info" && styles.activeTabButton]}
              onPress={() => setActiveTab("info")}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color={activeTab === "info" ? "#ff8c1a" : "#777"}
              />
              <Text style={[styles.tabButtonText, activeTab === "info" && styles.activeTabButtonText]}>Information</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === "contact" && styles.activeTabButton]}
              onPress={() => setActiveTab("contact")}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="message-outline"
                size={18}
                color={activeTab === "contact" ? "#ff8c1a" : "#777"}
              />
              <Text style={[styles.tabButtonText, activeTab === "contact" && styles.activeTabButtonText]}>
                Contact form
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "info" ? renderInfoTab() : renderContactTab()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>© {new Date().getFullYear()} Zairo International Pvt. Ltd.</Text>
            <Text style={styles.footerText}>All rights reserved</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
  },
  header: {
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    backgroundColor: "#FFFFFF",
  },
  headerBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerAuraPrimary: {
    position: "absolute",
    top: -54,
    right: -18,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 196, 122, 0.16)",
  },
  headerAuraSecondary: {
    position: "absolute",
    top: 18,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 234, 214, 0.45)",
  },
  headerAccentLine: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 0,
    height: 1,
    backgroundColor: "#F1F1F1",
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A1A1AA",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 21,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 6,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777",
    marginLeft: 6,
  },
  activeTabButtonText: {
    color: "#ff8c1a",
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionIntro: {
    paddingTop: 12,
    paddingBottom: 14,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A1A1AA",
    marginBottom: 6,
    letterSpacing: 1.1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A1A1AA",
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  surface: {
    backgroundColor: "#FFFFFF",
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  supportRowLast: {
    borderBottomWidth: 0,
  },
  supportIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  supportBody: {
    flex: 1,
    paddingRight: 12,
  },
  supportLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8B8B8B",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  supportValue: {
    fontSize: 16,
    color: "#1F2937",
    lineHeight: 22,
    fontWeight: "500",
  },
  supportMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#757575",
    lineHeight: 19,
  },
  supportArrow: {
    marginTop: 16,
  },
  phoneStack: {
    gap: 10,
  },
  inlineLink: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ff8c1a",
  },
  socialSection: {
    paddingTop: 24,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F8F5F0",
    alignItems: "center",
    justifyContent: "center",
  },
  formGroup: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  formGroupLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3F3F46",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  inputRowMultiline: {
    minHeight: 120,
  },
  inputIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  inputIconBoxTop: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 4,
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  button: {
    borderRadius: 12,
    marginTop: 20,
    backgroundColor: "#ff9f39",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#F4FBF6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#B0B0B0",
    marginBottom: 4,
  },
})


