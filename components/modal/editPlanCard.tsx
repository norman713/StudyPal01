import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for close button
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, TextInput } from "react-native-paper"; // For TextInput and Button

// Define the types for the props
interface EditPlanCardProps {
  visible: boolean; // To control visibility of the modal
  onDismiss: () => void; // To handle dismiss action (close the modal)
  onSave: (data: { planName: string; planDescription: string }) => void; // Save data handler
  initialName?: string;
  initialDescription?: string;
}

const EditPlanCard: React.FC<EditPlanCardProps> = ({
  visible,
  onDismiss,
  onSave,
  initialName = "",
  initialDescription = "",
}) => {
  const [planName, setPlanName] = useState(initialName);
  const [planDescription, setPlanDescription] = useState(initialDescription);

  // Update state when initial props change or modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setPlanName(initialName);
      setPlanDescription(initialDescription);
    }
  }, [visible, initialName, initialDescription]);

  const handleSave = () => {
    onSave({ planName, planDescription });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Ionicons name="close" size={30} color="#90717E" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Edit Plan</Text>

          <TextInput
            label="Plan name"
            value={planName}
            onChangeText={(text) => setPlanName(text)}
            mode="outlined"
            theme={{ roundness: 10, colors: { background: "#FFFFFF" } }}
            style={styles.input}
          />

          <TextInput
            label="Plan description"
            value={planDescription}
            onChangeText={(text) => setPlanDescription(text)}
            multiline
            numberOfLines={6}
            mode="outlined"
            theme={{ roundness: 20, colors: { background: "#FFFFFF" } }}
            style={[styles.input, styles.descriptionInput]}
          />

          <View style={styles.actions}>
            <Button
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
              labelStyle={styles.saveButtonText}
            >
              Save
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 24,
    width: "85%",
    paddingTop: 40,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  descriptionInput: {
    height: 150, // Make the description input larger
  },
  actions: {
    marginTop: 20,
  },
  button: {
    width: "100%", // Full width for the Save button
  },
  saveButton: {
    backgroundColor: "#90717E",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
  },
});

export default EditPlanCard;
