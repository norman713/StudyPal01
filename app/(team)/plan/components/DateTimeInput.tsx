import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface DateTimeInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: "time-outline" | "calendar-outline";
  minimumDate?: Date;
}

export default function DateTimeInput({
  label,
  value,
  onChangeText,
  icon,
  minimumDate,
}: DateTimeInputProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, "");

    // =====================
    // ⏰ TIME: HH:mm
    // =====================
    if (icon === "time-outline") {
      const sliced = digits.slice(0, 4);

      let hh = sliced.slice(0, 2);
      let mm = sliced.slice(2, 4);

      // Validate hour
      if (hh.length === 2 && Number(hh) > 23) return;

      // Validate minute
      if (mm.length === 2 && Number(mm) > 59) return;

      let formatted = hh;
      if (mm.length > 0) {
        formatted += `:${mm}`;
      }

      onChangeText(formatted);
      return;
    }

    // =====================
    // 📅 DATE: DD-MM-YYYY
    // =====================
    if (icon === "calendar-outline") {
      const sliced = digits.slice(0, 8);

      let dd = sliced.slice(0, 2);
      let mm = sliced.slice(2, 4);
      let yyyy = sliced.slice(4, 8);

      // Validate day
      if (dd.length === 2 && Number(dd) > 31) return;

      // Validate month
      if (mm.length === 2 && Number(mm) > 12) return;

      let formatted = dd;
      if (mm.length > 0) formatted += `-${mm}`;
      if (yyyy.length > 0) formatted += `-${yyyy}`;

      onChangeText(formatted);
      return;
    }

    onChangeText(text);
  };

  // Function to handle date change in DateTimePicker
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onChangeText(dayjs(selectedDate).format("DD-MM-YYYY"));
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating label */}
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWithIcon}>
        {icon === "calendar-outline" ? (
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.input}>{value}</Text>
          </TouchableOpacity>
        ) : (
          <TextInput
            value={value}
            onChangeText={handleChange}
            keyboardType="number-pad"
            style={styles.input}
          />
        )}

        <Ionicons name={icon} size={22} color="#49454F" style={styles.icon} />
      </View>

      {/* DateTimePicker for date selection */}
      {showDatePicker && icon === "calendar-outline" && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="calendar" // Use calendar display for date selection
          onChange={onDateChange}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
  },

  label: {
    position: "absolute",
    top: -10,
    left: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    fontSize: 12,
    color: "#49454F",
    zIndex: 1,
  },

  inputWithIcon: {
    position: "relative",
    justifyContent: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#79747E",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: "#0F0C0D",
    backgroundColor: "#fff",
  },

  icon: {
    position: "absolute",
    right: 16,
    alignSelf: "center",
  },
});
