import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DateRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onAnalyze: (fromDate: Date, toDate: Date) => void;
  initialFromDate?: Date;
  initialToDate?: Date;
}

export default function DateRangeModal({
  visible,
  onClose,
  onAnalyze,
  initialFromDate,
  initialToDate,
}: DateRangeModalProps) {
  const [fromDate, setFromDate] = useState(initialFromDate || new Date());
  const [toDate, setToDate] = useState(initialToDate || new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleAnalyze = () => {
    onAnalyze(fromDate, toDate);
    onClose();
  };

  const onFromChange = (event: any, selectedDate?: Date) => {
    setShowFromPicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const onToChange = (event: any, selectedDate?: Date) => {
    setShowToPicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <FontAwesome5 name="times" size={16} color="#666" />
          </Pressable>

          <Text style={styles.modalTitle}>Duration</Text>
          <Text style={styles.modalSubtitle}>Choose time for analysis.</Text>

          <View style={styles.dateInputsContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowFromPicker(true)}
            >
              <FontAwesome5 name="calendar-alt" size={14} color="#90717E" />
              <Text className="font-bold" style={styles.dateText}>
                {dayjs(fromDate).format("DD-MM-YYYY")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowToPicker(true)}
            >
              <FontAwesome5 name="calendar-alt" size={14} color="#90717E" />
              <Text className="font-bold" style={styles.dateText}>
                {dayjs(toDate).format("DD-MM-YYYY")}
              </Text>
            </TouchableOpacity>
          </View>

          {showFromPicker && (
            <DateTimePicker
              value={fromDate}
              mode="date"
              display="default"
              onChange={onFromChange}
            />
          )}

          {showToPicker && (
            <DateTimePicker
              value={toDate}
              mode="date"
              display="default"
              onChange={onToChange}
            />
          )}

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={handleAnalyze}
          >
            <Text style={styles.analyzeButtonText}>Analyze</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
  },
  dateInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    gap: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#333",
  },
  analyzeButton: {
    backgroundColor: "#90717E",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: "100%",
    alignItems: "center",
  },
  analyzeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
