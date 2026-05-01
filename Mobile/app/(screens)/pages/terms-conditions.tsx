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
import {
  FileText,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Percent,
  MessageCircle,
  Globe,
  Star,
  PieChart,
} from "react-native-feather"
import { router } from "expo-router"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"

type SectionKey =
  | "contract"
  | "bookingDenied"
  | "pricing"
  | "discount"
  | "inquiries"
  | "payments"
  | "personal"
  | "reviews"
  | "returns"

type TermsSection = {
  key: SectionKey
  title: string
  icon: React.ReactNode
  paragraphs: string[]
}

const TermsAndConditions = () => {
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    contract: false,
    bookingDenied: false,
    pricing: false,
    discount: false,
    inquiries: false,
    payments: false,
    personal: false,
    reviews: false,
    returns: false,
  })

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const sections: TermsSection[] = [
    {
      key: "contract",
      title: "Contract",
      icon: <FileText width={20} height={20} color="#ff9f43" />,
      paragraphs: [
        "Vacation Saga is not liable for any contract made between the travelers and property owners.",
        "Any amount paid by the traveler shall be received by the owner and in case of cancellation, the owner shall refund the amount directly to the traveler according to the cancellation policies provided by the owner and Vacation Saga shall have no involvement in such transactions.",
      ],
    },
    {
      key: "bookingDenied",
      title: "Booking Denied",
      icon: <MaterialIcons name="app-blocking" size={20} color="#ff9f43" />,
      paragraphs: [
        "If a customer is working with other websites also and receives a booking through us and through the other site also and the booking request received through Vacation Saga is cancelled by the owner due to non-availability, such booking request shall be considered as booking provided.",
        "Since we have provided a booking request and such booking is denied by the owner, then Vacation Saga shall not be liable for not providing booking or charge back or money back guarantee.",
      ],
    },
    {
      key: "pricing",
      title: "Pricing",
      icon: <CreditCard width={20} height={20} color="#ff9f43" />,
      paragraphs: [
        "The subscription price offered by us may vary according to the offers introduced by us from time to time.",
        "A customer availing an offer cannot claim the same benefits that are promised to the customer taking our regular subscription package. The results may vary according to the plan since we have different marketing strategies for different subscriptions and properties.",
      ],
    },
    {
      key: "discount",
      title: "Discount",
      icon: <Percent width={20} height={20} color="#ff9f43" />,
      paragraphs: [
        "A customer availing discount cannot claim the same discount on their renewal of the same description since we give discounted rates only when the company introduces offers.",
        "Thus, the chances of availing the same offer on the expiration of the subscription are very less. The discount totally depends on the offer introduced by the company at that time and on the offer that is expired or availed by the customer before. If no offer is ongoing at the time of the expiry of the subscription, the customer will have to pay the regular price for the renewal of the subscription.",
      ],
    },
    {
      key: "inquiries",
      title: "Inquiries",
      icon: <MessageCircle width={20} height={20} color="#ff9f43" />,
      paragraphs: [
        "Once a property owner receives an inquiry through us, he shall be solely responsible for answering such inquiry.",
        "Vacation Saga will have no role in entertaining such inquiry. Our role is limited to forwarding the inquiry so received to the customers.",
      ],
    },
    {
      key: "payments",
      title: "Payments",
      icon: <Ionicons size={20} name="cash-outline" color="#ff9f43" />,
      paragraphs: [
        "Where any customer's property is listed for free under any offer for the time period provided in the offer, such property shall be removed after the expiry of the offer and shall be visible on the site only when the customer pays for the amount subscription package opted by him.",
      ],
    },
    {
      key: "personal",
      title: "Personal website",
      icon: <Globe width={20} height={20} color="#ff9f43" />,
      paragraphs: [
        "Where a person takes a subscription which includes a personal website, then the customer shall provide us with the domain to be used for his personal website.",
        "The credentials for such domain shall be shared by the customers and the website shall be made on the domain so provided.",
      ],
    },
    {
      key: "reviews",
      title: "Reviews",
      icon: <Star width={20} height={20} color="#ff9f43" />,
      paragraphs: [
        "In case two bad reviews are given by our registered travelers regarding the condition of the property, Vacation Saga shall remove the property from the site and the same shall not be visible for 45 days.",
      ],
    },
    {
      key: "returns",
      title: "Returning investments",
      icon: <PieChart width={20} height={20} color="#ff9f43" />,
      paragraphs: [
        "In case a property does not receive a booking guaranteed by us in the time period according to subscription, then we shall promote such property for another nine months on the cost incurred by Vacation Saga.",
        "If such owner does not receive any inquiries, then investment shall be returned to him, provided that customer comes under the criteria provided by us. In order to claim the feature of money back guarantee, the customer should have fulfilled the applicable conditions shared by us.",
      ],
    },
  ]

  const renderSection = (section: TermsSection, index: number) => {
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
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <Text key={`${section.key}-paragraph-${paragraphIndex}`} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
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
        <Text style={styles.topBarTitle}>Terms and Conditions</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.heroBlock}>
            <Text style={styles.heroEyebrow}>LEGAL</Text>
            <Text style={styles.heroTitle}>Our service, your consent</Text>
            <Text style={styles.heroSubtitle}>
              Review the key terms around bookings, pricing, payments, subscriptions, and responsibilities while using the platform.
            </Text>
          </View>

          <View style={styles.termsContainer}>{sections.map((section, index) => renderSection(section, index))}</View>

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
  termsContainer: {
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

export default TermsAndConditions
