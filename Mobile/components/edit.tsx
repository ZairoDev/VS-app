import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal
} from "react-native";


interface modalProps {
    visible: boolean;
    onClose: () => void;
    label: string;
    value: string;
    onSave: (text: string) => void;
}
const EditModal = ({visible,onClose,label,value,onSave}:modalProps) => {

    const [text,setText]=useState(value);

    return (
        <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "#000000aa", justifyContent: "center" }}>
        <View style={{ margin: 20, padding: 20, backgroundColor: "#fff", borderRadius: 10 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>{`Edit ${label}`}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            style={{ borderWidth: 1, padding: 10, borderRadius: 5 }}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
          <View style={{ flexDirection: "row", marginTop: 20, justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={onClose} style={{ marginRight: 10 }}>
              <Text style={{ color: "red" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onSave(text);
                onClose();
              }}
            >
              <Text style={{ color: "green" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    )
}


export default EditModal