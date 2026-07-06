import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native"
import { profile } from "@/Constants/profile-theme"

const { colors: c, radius: r, space: sp, type: t } = profile

interface ModalProps {
  visible: boolean
  onClose: () => void
  label: string
  value: string
  onSave: (text: string) => void | Promise<void>
}

const EditModal = ({ visible, onClose, label, value, onSave }: ModalProps) => {
  const [text, setText] = useState(value)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (visible) {
      setText(value)
      setSaving(false)
    }
  }, [visible, value])

  const handleSave = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    try {
      setSaving(true)
      await onSave(trimmed)
      onClose()
    } catch {
      // Parent handles error feedback
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
        <View style={styles.sheet}>
          <Text style={styles.title}>Edit {label}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            style={styles.input}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor={c.inkPlaceholder}
            autoFocus
            editable={!saving}
            accessibilityLabel={label}
          />
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              disabled={saving}
              style={styles.cancelBtn}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || !text.trim()}
              style={[styles.saveBtn, (!text.trim() || saving) && styles.saveBtnDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Save"
            >
              {saving ? (
                <ActivityIndicator color={c.surface} />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: "center",
    paddingHorizontal: sp.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: c.surface,
    borderRadius: r.lg,
    padding: sp.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: c.ink,
    marginBottom: sp.md,
  },
  input: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: r.md,
    paddingHorizontal: sp.md,
    paddingVertical: 14,
    fontSize: 16,
    color: c.ink,
    backgroundColor: c.bg,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: sp.lg,
    gap: sp.sm,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: sp.md,
  },
  cancelText: {
    ...t.row,
    color: c.inkMuted,
  },
  saveBtn: {
    minWidth: 88,
    height: 44,
    borderRadius: r.md,
    backgroundColor: c.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: sp.md,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    ...t.row,
    color: c.surface,
    fontWeight: "600",
  },
})

export default EditModal
