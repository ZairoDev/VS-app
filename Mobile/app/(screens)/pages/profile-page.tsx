import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native"
import axios from "axios"
import { Feather } from "@expo/vector-icons"
import { useAuthStore } from "@/store/auth-store"
import { useNavigation } from "@react-navigation/native"
import { UserDataType } from "@/types"
import AsyncStorage from "@react-native-async-storage/async-storage"
import EditModal from "@/components/edit"
import { profile } from "@/Constants/profile-theme"

const { colors: c, radius: r, space: sp, type: t, size: s, shadow: sh } = profile

type FeatherIconName = React.ComponentProps<typeof Feather>["name"]

interface ProfileFieldProps {
  icon: FeatherIconName
  label: string
  value: string
  actionText: string
  description?: string
  onEdit?: () => void
  isLast?: boolean
}

const ProfileCard = ({
  icon,
  label,
  value,
  actionText,
  description,
  onEdit,
  isLast,
}: ProfileFieldProps) => {
  const isEmpty = value === "Not provided"

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <Feather name={icon} size={18} color={c.inkSecondary} />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text
            style={isEmpty ? styles.emptyValue : styles.valueText}
            numberOfLines={3}
          >
            {value}
          </Text>
          {description ? (
            <Text style={styles.descriptionText}>{description}</Text>
          ) : null}
        </View>
      </View>
      {onEdit ? (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onEdit}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${actionText} ${label}`}
        >
          <Text style={styles.actionText}>{actionText}</Text>
          <Feather
            name={isEmpty ? "plus" : "edit-2"}
            size={14}
            color={c.accent}
            style={styles.actionIcon}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.staticMetaRow}>
          <Feather name="check-circle" size={13} color={c.success} />
          <Text style={styles.staticMeta}>Verified</Text>
        </View>
      )}
    </View>
  )
}

const ProfilePage = () => {
  const { user, setUser } = useAuthStore()
  const navigation = useNavigation()
  const [modalVisible, setModalVisible] = useState(false)
  const [fieldLabel, setFieldLabel] = useState("")
  const [fieldKey, setFieldKey] = useState("")
  const [fieldValue, setFieldValue] = useState("")

  const handleEdit = (label: string, key: string, value: string) => {
    setFieldLabel(label)
    setFieldKey(key)
    setFieldValue(value)
    setModalVisible(true)
  }

  const saveChanges = async (newValue: string) => {
    try {
      await axios.put(`${process.env.EXPO_PUBLIC_BASE_URL}/user/update`, {
        [fieldKey]: newValue,
        userId: user?._id,
      })

      const updatedUser: UserDataType = {
        ...(user as UserDataType),
        [fieldKey]: newValue,
      }

      setUser(updatedUser)
      await AsyncStorage.setItem("authUser", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Error saving changes:", error)
      Alert.alert("Couldn't save", "Please try again in a moment.")
      throw error
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={c.bg} />

      <View style={styles.header}>
        <View style={styles.headerBackdrop} pointerEvents="none">
          <View style={styles.headerAuraPrimary} />
          <View style={styles.headerAuraSecondary} />
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color={c.ink} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Personal info</Text>
          <Text style={styles.headerSubtitle}>
            Details used for bookings and support
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introBlock}>
          <Text style={styles.introText}>
            Keep your contact details up to date so hosts and support can reach
            you about your stays.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Identity</Text>
        <View style={styles.cardsContainer}>
          <ProfileCard
            icon="user"
            label="Legal name"
            value={user?.name || "Not provided"}
            actionText={user?.name ? "Edit" : "Add"}
            onEdit={() => handleEdit("Legal name", "name", user?.name || "")}
          />
          <ProfileCard
            icon="smile"
            label="Preferred first name"
            value={user?.preferredName || "Not provided"}
            actionText={user?.preferredName ? "Edit" : "Add"}
            onEdit={() =>
              handleEdit("Preferred name", "preferredName", user?.preferredName || "")
            }
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.cardsContainer}>
          <ProfileCard
            icon="phone"
            label="Phone number"
            value={user?.phone || "Not provided"}
            actionText={user?.phone ? "Edit" : "Add"}
            description="Shared with hosts after a booking is confirmed."
            onEdit={() => handleEdit("Phone number", "phone", user?.phone || "")}
          />
          <ProfileCard
            icon="mail"
            label="Email"
            value={user?.email || "Not provided"}
            actionText={user?.email ? "Edit" : "Add"}
          />
          <ProfileCard
            icon="map-pin"
            label="Address"
            value={user?.address || "Not provided"}
            actionText={user?.address ? "Edit" : "Add"}
            onEdit={() => handleEdit("Address", "address", user?.address || "")}
            isLast
          />
        </View>
      </ScrollView>

      <EditModal
        visible={modalVisible}
        label={fieldLabel}
        value={fieldValue}
        onClose={() => setModalVisible(false)}
        onSave={saveChanges}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  header: {
    flexDirection: "row",
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: sp.lg - 4,
    backgroundColor: c.bg,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
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
    top: -42,
    right: -12,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 102, 0, 0.10)",
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: r.md,
    backgroundColor: c.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: { paddingLeft: 12, flex: 1 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: c.ink,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    ...t.meta,
    color: c.inkMuted,
    marginTop: 4,
  },
  content: { flex: 1 },
  contentInner: {
    paddingBottom: sp.xl,
  },
  introBlock: {
    paddingHorizontal: sp.lg - 4,
    paddingTop: 8,
    paddingBottom: 18,
  },
  introText: {
    ...t.meta,
    color: c.inkSecondary,
  },
  sectionTitle: {
    ...t.sectionTitle,
    color: c.ink,
    marginLeft: sp.md + 2,
    marginRight: sp.md,
    marginBottom: 10,
  },
  cardsContainer: {
    marginHorizontal: sp.md,
    marginBottom: sp.lg,
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    paddingHorizontal: sp.md,
    ...sh.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.divider,
    minHeight: s.rowMinHeight,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 16,
  },
  iconContainer: {
    width: s.iconWell,
    height: s.iconWell,
    borderRadius: r.md,
    backgroundColor: c.track,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowContent: { flex: 1 },
  cardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: c.inkMuted,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 16,
    color: c.ink,
    fontWeight: "500",
    lineHeight: 22,
  },
  emptyValue: {
    fontSize: 16,
    color: c.inkPlaceholder,
    fontStyle: "italic",
    lineHeight: 22,
  },
  descriptionText: {
    marginTop: 4,
    fontSize: 13,
    color: c.inkMuted,
    lineHeight: 19,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    minHeight: 44,
    justifyContent: "center",
    paddingLeft: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
    color: c.accent,
  },
  actionIcon: { marginLeft: 4 },
  staticMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "center",
  },
  staticMeta: {
    fontSize: 13,
    fontWeight: "600",
    color: c.success,
  },
})

export default ProfilePage
