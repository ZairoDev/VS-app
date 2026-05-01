import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native"
import { Shield, Database, Users, FileText, AlertTriangle, Info, ChevronDown, ChevronUp } from "react-native-feather"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

type SectionKey =
  | "introduction"
  | "dataCollection"
  | "thirdParty"
  | "intellectualProperty"
  | "prohibited"
  | "important"

type PolicySection = {
  key: SectionKey
  title: string
  icon: React.ReactNode
  paragraphs?: string[]
  bullets?: string[]
}

const PrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    introduction: false,
    dataCollection: false,
    thirdParty: false,
    intellectualProperty: false,
    prohibited: false,
    important: false,
  })

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const sections: PolicySection[] = [
    {
      key: "introduction",
      title: "Introduction",
      icon: <Info width={20} height={20} color="#ff9f43" />,
      paragraphs: [
        'The term "Users" and "customers" refers to people who use our website to find a suitable rental as well as to those who list their property with us. Your personal information will be collected and stored in our database and will not be shared with any third party.',
        "By using our website, you consent to the collection and transfer of your data, including to other countries where we have branches.",
      ],
    },
    {
      key: "dataCollection",
      title: "Data Collection and Storage",
      icon: <Database width={20} height={20} color="#ff9f43" />,
      bullets: [
        "Your personal information is collected and stored in our database.",
        "We will not share your information with any third party.",
        "We do not knowingly collect data from users under 18.",
      ],
    },
    {
      key: "thirdParty",
      title: "Third-Party Agreements",
      icon: <Users width={20} height={20} color="#ff9f43" />,
      paragraphs: [
        "We are not responsible for any agreements between users, including:",
        "We act as a middleman to facilitate smooth transaction between the holiday maker and the property owner.",
      ],
      bullets: [
        "Disputes over property quality or condition.",
        "Reservation agreements between travelers and property owners.",
      ],
    },
    {
      key: "intellectualProperty",
      title: "Intellectual Property and Usage Rights",
      icon: <FileText width={20} height={20} color="#ff9f43" />,
      paragraphs: [
        "The content on our website belongs solely to us. You may download it for personal use but cannot copy or reuse it without our consent.",
        "Users are granted a limited license to access the content and services provided by us.",
      ],
    },
    {
      key: "prohibited",
      title: "User Consent and Prohibited Activities",
      icon: <AlertTriangle width={20} height={20} color="#ff9f43" />,
      bullets: [
        "Using the website for unauthorized purposes.",
        "Modifying, translating, or altering any content on the website.",
        "Selling, offering to sell, transferring, or licensing the website to any third party.",
        "Posting abusive, unlawful, or defamatory content on the website.",
        "Infringing upon or violating the rights of the company or any third party.",
        "Transmitting fraudulent, false, or misleading information.",
      ],
    },
    {
      key: "important",
      title: "Important Information",
      icon: <Shield width={20} height={20} color="#ff9f43" />,
      bullets: [
        "We do not make any exclusive contract with our registered property owners and registered travelers which means you are totally free to work with other companies while working with our company.",
        "We may provide you with an online payment portal for your convenience but we are not liable for any losses you suffer due to the decision of PayPal and bank.",
        "You agree to indemnify us from or against any or all the claims or legal fees incurred by you against an action brought by you against the payment gateway.",
        "In case you find any content, video or photos defamatory or against public policy, you can notify us on the email address provided on the website.",
        "We provide advertising services for our registered customers and we also serve as an accommodation search system to our travelers, we don't assure personal inspections of the property.",
        "We shall only be liable for any direct loss incurred by you due to our website and not for any indirect losses.",
      ],
    },
  ]

  const renderSection = (section: PolicySection, index: number) => {
    const isExpanded = expandedSections[section.key]
    const isLast = index === sections.length - 1

    return (
      <View key={section.key} style={[styles.sectionRow, isLast && styles.sectionRowLast]}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(section.key)}
          activeOpacity={0.75}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.iconContainer}>{section.icon}</View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          {isExpanded ? (
            <ChevronUp width={18} height={18} color="#ff9f43" />
          ) : (
            <ChevronDown width={18} height={18} color="#ff9f43" />
          )}
        </TouchableOpacity>

        {isExpanded ? (
          <View style={styles.sectionContent}>
            {section.paragraphs?.map((paragraph, paragraphIndex) => (
              <Text key={`${section.key}-paragraph-${paragraphIndex}`} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}

            {section.bullets?.length ? (
              <View style={styles.bulletList}>
                {section.bullets.map((bullet, bulletIndex) => (
                  <View key={`${section.key}-bullet-${bulletIndex}`} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.topBar}>
        <View style={styles.topBarBackdrop} pointerEvents="none">
          <View style={styles.headerAuraPrimary} />
          <View style={styles.headerAuraSecondary} />
          <View style={styles.headerAccentLine} />
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.heroBlock}>
            <Text style={styles.heroEyebrow}>LEGAL</Text>
            <Text style={styles.heroTitle}>Your data, your rights</Text>
            <Text style={styles.heroSubtitle}>
              Review how your information is handled, what responsibilities apply, and the important legal details connected to using the platform.
            </Text>
          </View>

          <View style={styles.policyContainer}>{sections.map((section, index) => renderSection(section, index))}</View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Last Updated: 2026</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    position: "relative",
    overflow: "hidden",
  },
  topBarBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerAuraPrimary: {
    position: "absolute",
    top: -42,
    right: -12,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(254, 168, 80, 0.10)",
  },
  headerAuraSecondary: {
    position: "absolute",
    top: 16,
    left: -30,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 228, 196, 0.55)",
  },
  headerAccentLine: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 0,
    height: 1,
    backgroundColor: "#F1F1F1",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A1A",
    marginLeft: 12,
    flex: 1,
  },
  heroBlock: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A1A1AA",
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
  },
  policyContainer: {
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  sectionRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
    paddingVertical: 18,
  },
  sectionRowLast: {
    borderBottomWidth: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    paddingRight: 14,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#F6F6F6",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    lineHeight: 23,
    paddingTop: 4,
  },
  sectionContent: {
    paddingLeft: 46,
    paddingTop: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 23,
    color: "#4B5563",
    marginBottom: 12,
  },
  bulletList: {
    marginTop: 2,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
    backgroundColor: "#ff9f43",
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: "#4B5563",
  },
  footer: {
    marginTop: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#B0B0B0",
    textAlign: "center",
  },
})

export default PrivacyPolicy
