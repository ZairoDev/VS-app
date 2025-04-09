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
import { Shield, Database, Users, FileText, AlertTriangle, Info, ChevronDown, ChevronUp } from "react-native-feather"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

const PrivacyPolicy = () => {
  const isDarkMode = useColorScheme() === "light"
  const [expandedSections, setExpandedSections] = useState<{
    introduction: boolean;
    dataCollection: boolean;
    thirdParty: boolean;
    intellectualProperty: boolean;
    prohibited: boolean;
    important: boolean;
  }>({
    introduction: false,
    dataCollection: false,
    thirdParty: false,
    intellectualProperty: false,
    prohibited: false,
    important: false,
  });

  type SectionKey =
  | 'introduction'
  | 'dataCollection'
  | 'thirdParty'
  | 'intellectualProperty'
  | 'prohibited'
  | 'important';

  const toggleSection = (section:SectionKey) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  const backgroundColor = isDarkMode ? "#121212" : "#f8f9fa"
  const textColor = isDarkMode ? "#ffffff" : "#333333"
  const cardBg = isDarkMode ? "#1e1e1e" : "#ffffff"
  const accentColor = "#ff9f43"
  const secondaryColor = "#a29bfe"

  const renderSection = (title:String, content:React.ReactNode, icon:React.ReactNode, sectionKey:SectionKey) => {
    const isExpanded = expandedSections[sectionKey]

    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection(sectionKey)} activeOpacity={0.7}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? "#2d2d2d" : "#f0f0f7" }]}>{icon}</View>
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={isDarkMode ? ["#6c5ce7", "#4834d4"] : ["#ffb86b", "#ff9f43"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <Shield width={40} height={40} color="#ffffff" />
                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.subtitle}>Your data, your rights</Text>
              </View>
            </LinearGradient>
          </View>

          {renderSection(
            "Introduction",
            <View>
              <Text style={[styles.paragraph, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                The term "Users" and "customers" refers to people who use our website to find a suitable rental as well
                as to those who list their property with us. Your personal information will be collected and stored in
                our database and will not be shared with any third party.
              </Text>
              <Text style={[styles.paragraph, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                By using our website, you consent to the collection and transfer of your data, including to other
                countries where we have branches.
              </Text>
            </View>,
            <Info width={24} height={24} color={accentColor} />,
            "introduction",
          )}

          {renderSection(
            "Data Collection and Storage",
            <View>
              <View style={styles.bulletPoints}>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    Your personal information is collected and stored in our database.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    We will not share your information with any third party.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    We do not knowingly collect data from users under 18.
                  </Text>
                </View>
              </View>
            </View>,
            <Database width={24} height={24} color={accentColor} />,
            "dataCollection",
          )}

          {renderSection(
            "Third-Party Agreements",
            <View>
              <Text style={[styles.paragraph, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                We are not responsible for any agreements between users, including:
              </Text>
              <View style={styles.bulletPoints}>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    Disputes over property quality or condition.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    Reservation agreements between travelers and property owners.
                  </Text>
                </View>
              </View>
              <Text style={[styles.paragraph, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                We act as a middleman to facilitate smooth transaction between the holiday maker and the property owner.
              </Text>
            </View>,
            <Users width={24} height={24} color={accentColor} />,
            "thirdParty",
          )}

          {renderSection(
            "Intellectual Property and Usage Rights",
            <View>
              <Text style={[styles.paragraph, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                The content on our website belongs solely to us. You may download it for personal use but cannot copy or
                reuse it without our consent.
              </Text>
              <Text style={[styles.paragraph, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                Users are granted a limited license to access the content and services provided by us.
              </Text>
            </View>,
            <FileText width={24} height={24} color={accentColor} />,
            "intellectualProperty",
          )}

          {renderSection(
            "User Consent and Prohibited Activities",
            <View>
              <View style={styles.bulletPoints}>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    Using the website for unauthorized purposes.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    Modifying, translating, or altering any content on the website.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    Selling, offering to sell, transferring, or licensing the website to any third party.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    Posting abusive, unlawful, or defamatory content on the website.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    Infringing upon or violating the rights of the company or any third party.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    Transmitting fraudulent, false, or misleading information.
                  </Text>
                </View>
              </View>
            </View>,
            <AlertTriangle width={24} height={24} color={accentColor} />,
            "prohibited",
          )}
          {renderSection(
            "Important Information",
            <View>
              <View style={styles.bulletPoints}>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    We do not make any exclusive contract with our registered property owners and registered travelers
                    which means you are totally free to work with other companies while working with our company.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    We may provide you with an online payment portal for your convenience but we are not liable for any
                    losses you suffer due to the decision of PayPal and bank.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    You agree to indemnify us from or against any or all the claims or legal fees incurred by you
                    against an action brought by you against the payment gateway.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    In case you find any content, video or photos defamatory or against public policy, you can notify us
                    on the email address provided on the website.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    We provide advertising services for our registered customers and we also serve as an accommodation
                    search system to our travelers, we don't assure personal inspections of the property.
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={[styles.bullet, { backgroundColor: accentColor }]} />
                  <Text style={[styles.bulletText, { color: isDarkMode ? "#cccccc" : "#444444" }]}>
                    We shall only be liable for any direct loss incurred by you due to our website and not for any
                    indirect losses.
                  </Text>
                </View>
              </View>
            </View>,
            <Info width={24} height={24} color={accentColor} />,
            "important",
          )}
          <View style={[styles.footer, { borderTopColor: isDarkMode ? "#333333" : "#e0e0e0" }]}>
            <Text style={[styles.footerText, { color: isDarkMode ? "#999999" : "#777777" }]}>
              Last Updated: April 8, 2025
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
    color: "#333333",
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

export default PrivacyPolicy
