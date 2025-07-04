"use client"

import React , {useState}from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import {  FileText, ChevronDown, ChevronUp,File, CreditCard, Percent, MessageCircle, Globe, Star, PieChart } from "react-native-feather"
import { router } from "expo-router"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

const TermsAndConditions = () => {
  const isDarkMode = useColorScheme() === "light"
  const [expandedSections, setExpandedSections] = useState<{
    introduction: boolean;
    dataCollection: boolean;
    thirdParty: boolean;
    intellectualProperty: boolean;
    prohibited: boolean;
    important: boolean;
    personal: boolean;
    reviews: boolean;
    return: boolean;
  }>({
    introduction: false,
    dataCollection: false,
    thirdParty: false,
    intellectualProperty: false,
    prohibited: false,
    important: false,
    personal: false,
    reviews: false,
    return:false
  });

  type SectionKey =
  | 'introduction'
  | 'dataCollection'
  | 'thirdParty'
  | 'intellectualProperty'
  | 'prohibited'
  | 'important'
  | 'personal'
  | 'reviews'
  | 'return'

  const toggleSection = (section:SectionKey) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  const backgroundColor =  "#f8f9fa"
  const textColor = "black"
  const cardBg = "#ffffff"
  const accentColor = "#ff9f43"
  const secondaryColor = "#a29bfe"

  const renderSection = (title:String, content:React.ReactNode, icon:React.ReactNode, sectionKey:SectionKey) => {
    const isExpanded = expandedSections[sectionKey]

    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection(sectionKey)} activeOpacity={0.7}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor:  "#f0f0f7" }]}>{icon}</View>
          </View>
            <Text style={styles.headerTitle}>{title}</Text>
          {isExpanded ? (
            <ChevronUp width={20} height={20} color={accentColor} />
          ) : (
            <ChevronDown width={20} height={20} color={accentColor} />
          )}
        </TouchableOpacity>

        {isExpanded && <View style={styles.cardContent}>{content}</View>}
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms And Conditions</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={  ["#ffb86b", "#ff9f43"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <File width={40} height={40} color="#ffffff" />
                <Text style={styles.title}>Terms and Conditions</Text>
                <Text style={styles.subtitle}>Our service, your consent</Text>
              </View>
            </LinearGradient>
          </View>

          {renderSection(
          "Contract",
            <View>
              <Text style={[styles.paragraph, { color: "#444444" }]}>
              Vacation Saga is not liable for any contract made between the travelers and property owners. Any amount paid by the traveler shall be received by the owner and in case of cancellation, the owner shall refund the amount directly to the traveler according to the cancellation policies provided by the owner and Vacation Saga shall have no involvement in such transactions.
              </Text>
              
            </View>,
            <FileText width={24} height={24} color={accentColor} />,
            "introduction",
          )}

          {renderSection(
            "Booking Denied",
            <View>
              <Text style={[styles.paragraph, { color:"#444444" }]}>
              If a customer is working with other websites also and receives a booking through us and through the other site also and the booking request received through Vacation Saga is cancelled by the owner due to non-availability, such booking request shall be considered as booking provided. Since we have provided a booking request and such booking is denied by the owner, then Vacation Saga shall not be liable for not providing booking or charge back or money back guarantee.
              </Text>
            </View>,
            <MaterialIcons name="app-blocking" size={24}  color={accentColor} />,
            "dataCollection",
          )}

          {renderSection(
            "Pricing",
            <View>
              <Text style={[styles.paragraph, { color:  "#444444" }]}>
              The subscription price offered by us may vary according to the offers introduced by us from time to time. A customer availing an offer cannot claim the same benefits that are promised to the customer taking our regular subscription package. The results may vary according to the plan since we have different marketing strategies for different subscriptions and properties.
              </Text>
              
              
            </View>,
            <CreditCard width={24} height={24} color={accentColor} />,
            "thirdParty",
          )}

          {renderSection(
            "Discount",
            <View>
              <Text style={[styles.paragraph, { color: "#444444" }]}>
              A customer availing discount cannot claim the same discount on their renewal of the same description since we give discounted rates only when the company introduces offers. Thus, the chances of availing the same offer on the expiration of the subscription are very less. The discount totally depends on the offer introduced by the company at that time and on the offer that is expired or availed by the customer before. If no offer is ongoing at the time of the expiry of the subscription, the customer will have to pay the regular price for the renewal of the subscription.
              </Text>
            </View>,
            <Percent width={24} height={24} color={accentColor} />,
            "intellectualProperty",
          )}
          {renderSection(
            "Inquiries",
            <View>
              <Text style={[styles.paragraph, { color:  "#444444" }]}>
              Once a property owner receives an inquiry through us, he shall be solely responsible for answering such inquiry. Vacation Saga will have no role in entertaining such inquiry. Our role is limited to forwarding the inquiry so received to the customers.
              </Text>
            </View>,
            <MessageCircle width={24} height={24} color={accentColor} />,
            "prohibited",
          )}
          {renderSection(
            "Payments",
            <View>
              <Text style={[styles.paragraph, { color: "#444444" }]}>
              Where any customer's property is listed for free under any offer for the time period provided in the offer, such property shall be removed after the expiry of the offer and shall be visible on the site only when the customer pays for the amount subscription package opted by him.
              </Text>
            </View>,
            <Ionicons  size={24} name="cash-outline" color={accentColor} />,
            "important",
          )}
          {renderSection(
            "Personal website",
            <View>
              <Text style={[styles.paragraph, { color:  "#444444" }]}>
              Where a person takes a subscription which includes a personal website, then the customer shall provide us with the domain to be used for his personal website. The credentials for such domain shall be shared by the customers and the website shall be made on the domain so provided.
              </Text>
            </View>,
            <Globe width={24} height={24} color={accentColor} />,
            "personal",
          )}
          {renderSection(
            "Reviews",
            <View>
              <Text style={[styles.paragraph, { color:  "#444444" }]}>
              In case two bad reviews are given by our registered travelers regarding the condition of the property, Vacation Saga shall remove the Property from the site and the same shall not be visible for 45 days.
              </Text>
            </View>,
            <Star width={24} height={24} color={accentColor} />,
            "reviews",
          )}
          {renderSection(
            "Returing Investments",
            <View>
              <Text style={[styles.paragraph, { color: "#444444" }]}>
              In case a property does not receive a booking guaranteed by us in the time period according to subscription,
then we shall promote such property for another nine months on the cost incurred by vacation saga and still
if such owner does not receive any inquires, then investment shall be returned to him, provided that customer
comes under the criteria provided by us. In order to claim the feature of money back guarantee, the customer
should have
              </Text>
            </View>,
            <PieChart width={24} height={24} color={accentColor} />,
            "return",
          )}
          <View style={[styles.footer, { borderTopColor:  "#e0e0e0" }]}>
            <Text style={[styles.footerText, { color:  "#777777" }]}>
              Last Updated:  2025
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 15,
  },
  headerContainer: {
    marginBottom: 18,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerGradient: {
    borderRadius: 16,
  },
  headerContent: {
    padding: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 12,
    marginBottom: 8,
   
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  card: {
    marginBottom: 14,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "black",
    flex: 1,
    
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    
    

  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
    // borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoints: {
    marginTop: 8,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 20,
    height: "7%",
    backgroundColor: "#fff",
    elevation: 5,
    gap: 10,
  }
})

export default TermsAndConditions
