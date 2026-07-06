import React, { useMemo } from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { booking } from "@/Constants/booking-theme"

export type TravellerGender = "male" | "female" | "other"
export type TravellerType = "adult" | "child" | "infant"

export type TravellerDraft = {
  name: string
  age: string
  gender: TravellerGender
  nationality: string
  type: TravellerType
}

type TravellerFormProps = {
  value: TravellerDraft
  onChange: (next: TravellerDraft) => void
  remainingByType: Record<TravellerType, number>
  onSubmit: () => void
  submitLabel?: string
  disabled?: boolean
  error?: string | null
}

const { colors: c, radius: r, space: sp } = booking

export function TravellerForm({
  value,
  onChange,
  remainingByType,
  onSubmit,
  submitLabel = "Add traveller",
  disabled,
  error,
}: TravellerFormProps) {
  const typeOptions: { key: TravellerType; label: string }[] = useMemo(
    () => [
      { key: "adult", label: `Adult (${remainingByType.adult})` },
      { key: "child", label: `Child (${remainingByType.child})` },
      { key: "infant", label: `Infant (${remainingByType.infant})` },
    ],
    [remainingByType.adult, remainingByType.child, remainingByType.infant],
  )

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Add traveller</Text>

      <View style={styles.typeRow}>
        {typeOptions.map((opt) => {
          const active = value.type === opt.key
          const canSelect = remainingByType[opt.key] > 0
          return (
            <Pressable
              key={opt.key}
              onPress={() => canSelect && onChange({ ...value, type: opt.key })}
              style={[
                styles.typeChip,
                active && styles.typeChipActive,
                !canSelect && styles.typeChipDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${opt.key}`}
            >
              <Text
                style={[
                  styles.typeChipText,
                  active && styles.typeChipTextActive,
                  !canSelect && styles.typeChipTextDisabled,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          value={value.name}
          onChangeText={(t) => onChange({ ...value, name: t })}
          placeholder="Enter full name"
          placeholderTextColor={c.inkPlaceholder}
          style={styles.input}
          autoCorrect={false}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.rowCol]}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            value={value.age}
            onChangeText={(t) => onChange({ ...value, age: t })}
            placeholder="e.g. 29"
            placeholderTextColor={c.inkPlaceholder}
            style={styles.input}
            keyboardType="number-pad"
          />
        </View>

        <View style={[styles.field, styles.rowCol]}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {(["male", "female", "other"] as const).map((g) => {
              const active = value.gender === g
              return (
                <Pressable
                  key={g}
                  onPress={() => onChange({ ...value, gender: g })}
                  style={[styles.genderChip, active && styles.genderChipActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Gender ${g}`}
                >
                  <Text style={[styles.genderText, active && styles.genderTextActive]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nationality</Text>
        <TextInput
          value={value.nationality}
          onChangeText={(t) => onChange({ ...value, nationality: t })}
          placeholder="e.g. Indian"
          placeholderTextColor={c.inkPlaceholder}
          style={styles.input}
          autoCorrect={false}
        />
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={16} color={c.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={onSubmit}
        disabled={disabled}
        style={[styles.submitBtn, disabled && styles.submitBtnDisabled]}
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
      >
        <Text style={styles.submitText}>{submitLabel}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    padding: sp.md,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: c.ink,
    letterSpacing: -0.2,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: r.md,
    backgroundColor: c.track,
  },
  typeChipActive: {
    backgroundColor: c.accentSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.accent,
  },
  typeChipDisabled: {
    opacity: 0.45,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: c.ink,
  },
  typeChipTextActive: {
    color: c.accentPressed,
  },
  typeChipTextDisabled: {
    color: c.inkMuted,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: c.inkMuted,
  },
  input: {
    height: 48,
    borderRadius: r.md,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    backgroundColor: c.surface,
    fontSize: 15,
    color: c.ink,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowCol: {
    flex: 1,
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: r.md,
    backgroundColor: c.track,
  },
  genderChipActive: {
    backgroundColor: c.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.ink,
  },
  genderText: {
    fontSize: 13,
    fontWeight: "700",
    color: c.inkMuted,
  },
  genderTextActive: {
    color: c.ink,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: c.error,
  },
  submitBtn: {
    height: booking.button.height,
    borderRadius: booking.button.radius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.accent,
  },
  submitBtnDisabled: {
    opacity: 0.55,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "800",
    color: c.surface,
  },
})

