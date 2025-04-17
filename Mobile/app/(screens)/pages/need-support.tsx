
import { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  Platform,
  Linking,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { FontAwesome, MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons"
import { MotiView, MotiText } from "moti"
import axios from "axios";

const { width, height } = Dimensions.get("window")
const SPACING = 16
const CARD_PADDING = 20
const ANIMATION_DURATION = 600

export default function ContactScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("info")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const scrollY = useRef(new Animated.Value(0)).current

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  })

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 120],
    extrapolate: "clamp",
  })

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

  const renderInfoTab = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: ANIMATION_DURATION }}
      style={styles.tabContent}
    >
      <View style={styles.card}>
        <LinearGradient
          colors={["#fea850", "orange"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardHeader}
        >
          <View style={styles.cardHeaderContent}>
            <Text style={styles.cardTitle}>Company Information</Text>
            <Text style={styles.cardSubtitle}>Reach out to us through any of these channels</Text>
          </View>
        </LinearGradient>

        <View style={styles.cardContent}>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>LEGAL NAME</Text>
            <Text style={styles.infoText}>Zairo International Pvt. Ltd.</Text>
          </View>

          <TouchableOpacity style={styles.infoSection} onPress={handleMap}>
            <Text style={styles.infoLabel}>ADDRESS</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={18} color="orange" />
              <Text style={styles.infoText}>117/N/70 3rd Floor Kakadeo Kanpur</Text>
              <Feather name="external-link" size={14} color="orange" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoSection} onPress={() => handleEmail("info@vacationsaga.com")}>
            <Text style={styles.infoLabel}>EMAIL</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email" size={18} color="orange" />
              <Text style={styles.infoText}>info@vacationsaga.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoSection} onPress={() => handleEmail("support@vacationsaga.com")}>
            <Text style={styles.infoLabel}>FOR SUPPORT</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email" size={18} color="orange" />
              <Text style={styles.infoText}>support@vacationsaga.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoSection} onPress={() => handleCall("919120851166")}>
            <Text style={styles.infoLabel}>FOR SALES SUPPORT</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={18} color="orange" />
              <Text style={styles.infoText}>+91 9120851166</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>FOR BOOKING SUPPORT</Text>
            <View style={styles.phoneContainer}>
              <TouchableOpacity style={styles.infoRow} onPress={() => handleCall("918960980806")}>
                <MaterialCommunityIcons name="phone" size={18} color="orange" />
                <Text style={styles.infoText}>+91 8960980806</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.infoRow} onPress={() => handleCall("919621119484")}>
                <MaterialCommunityIcons name="phone" size={18} color="orange" />
                <Text style={styles.infoText}>+91 9621119484</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>BUSINESS HOURS</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="orange" />
              <View>
                <Text style={styles.infoText}>Monday - Friday: 9:00 AM - 6:00 PM</Text>
                <Text style={styles.infoText}>Saturday: 10:00 AM - 4:00 PM</Text>
                <Text style={styles.infoText}>Sunday: Closed</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>SOCIALS</Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="facebook" size={20} color="orange" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="instagram" size={20} color="orange" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="twitter" size={20} color="orange" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="linkedin" size={20} color="orange" />
              </TouchableOpacity>
            </View>
          </View>
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
      <View style={styles.card}>
        <LinearGradient
          colors={["#fea850", "orange"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardHeader}
        >
          <View style={styles.cardHeaderContent}>
            <Text style={styles.cardTitle}>Send Us a Message</Text>
            <Text style={styles.cardSubtitle}>We'll get back to you as soon as possible</Text>
          </View>
        </LinearGradient>

        <View style={styles.cardContent}>
          {isSubmitted ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <MaterialCommunityIcons name="check-circle" size={60} color="#4ade80" />
              </View>
              <Text style={styles.successTitle}>Message Sent!</Text>
              <Text style={styles.successText}>Thank you for reaching out. We'll get back to you shortly.</Text>
            </View>
          ) : (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="account" size={20} color="orange" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#aaa"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="email-outline" size={20} color="orange" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email address"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Message</Text>
                <View style={[styles.inputContainer, styles.textareaContainer]}>
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={20}
                    color="orange"
                    style={[styles.inputIcon, { alignSelf: "flex-start", marginTop: 12 }]}
                  />
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    placeholder="How can we help you?"
                    placeholderTextColor="#aaa"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSend} disabled={isSubmitting} activeOpacity={0.8}>
                <LinearGradient
                  colors={["#fea850", "orange"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="send" size={18} color="#fff" style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>Send Message</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </MotiView>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#fea850" />

      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <LinearGradient
           colors={["#fea850", "orange"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
        
          <View style={styles.headerContent}>
            <MotiText
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: ANIMATION_DURATION }}
              style={styles.title}
            >
              Contact Us
            </MotiText>
            <MotiText
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: ANIMATION_DURATION, delay: 200 }}
              style={styles.subtitle}
            >
              Have questions or need assistance? Our team is here to help you with any inquiries.
            </MotiText>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "info" && styles.activeTabButton]}
          onPress={() => setActiveTab("info")}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={activeTab === "info" ? "orange" : "#666"}
          />
          <Text style={[styles.tabButtonText, activeTab === "info" && styles.activeTabButtonText]}>Information</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "contact" && styles.activeTabButton]}
          onPress={() => setActiveTab("contact")}
        >
          <MaterialCommunityIcons
            name="message-outline"
            size={20}
            color={activeTab === "contact" ? "orange" : "#666"}
          />
          <Text style={[styles.tabButtonText, activeTab === "contact" && styles.activeTabButtonText]}>
            Contact Form
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <Animated.ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        >
          {activeTab === "info" ? renderInfoTab() : renderContactTab()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>© {new Date().getFullYear()} Zairo International Pvt. Ltd.</Text>
            <Text style={styles.footerText}>All rights reserved</Text>
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: SPACING,
    paddingTop: 0,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    overflow: "hidden",
  },
  headerGradient: {
    flex: 1,
    justifyContent: "flex-end",
  },
  headerPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  headerContent: {
    padding: SPACING,
    paddingBottom: SPACING * 2,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "left",
    maxWidth: "90%",
    lineHeight: 22,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: SPACING,
    paddingVertical: SPACING / 2,
    borderRadius: 12,
    marginTop: -SPACING,
    marginHorizontal: SPACING,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "rgba(249, 115, 22, 0.1)",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  activeTabButtonText: {
    color: "orange",
  },
  tabContent: {
    marginTop: SPACING,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: SPACING,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  cardHeader: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardHeaderContent: {
    padding: CARD_PADDING,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  cardContent: {
    padding: CARD_PADDING,
  },
  infoSection: {
    marginBottom: SPACING,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffa500",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  phoneContainer: {
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: "#444",
    flex: 1,
  },
  socialIcons: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },
  socialButton: {
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  formGroup: {
    marginBottom: SPACING,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    padding: 12,
  },
  textareaContainer: {
    alignItems: "flex-start",
  },
  textarea: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f97316",
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  faqButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginBottom: SPACING,
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    borderRadius: 12,
  },
  faqButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f97316",
    marginRight: 6,
  },
  faqContainer: {
    marginBottom: SPACING,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    padding: SPACING,
    overflow: "hidden",
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    paddingLeft: 26,
  },
  footer: {
    alignItems: "center",
    marginTop: SPACING,
    marginBottom: SPACING * 2,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
})


