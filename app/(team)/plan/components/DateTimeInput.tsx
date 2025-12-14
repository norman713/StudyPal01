import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native-paper";

interface DateTimeInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: "time-outline" | "calendar-outline";
}

export default function DateTimeInput({
  label,
  value,
  onChangeText,
  icon,
}: DateTimeInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWithIcon}>
        <TextInput
          mode="outlined"
          label=""
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          contentStyle={styles.inputContent}
          theme={{
            roundness: 30,
            colors: {
              background: "#F8F6F7",
              outline: "#79747E",
            },
          }}
        />
        <Ionicons name={icon} size={24} color="#49454F" style={styles.icon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 0,
  },
  label: {
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#F8F6F7",
    paddingHorizontal: 4,
    fontSize: 12,
    color: "#49454F",
    fontFamily: "PoppinsBold",
    zIndex: 1,
  },
  inputWithIcon: {
    position: "relative",
  },
  input: {
    backgroundColor: "#F8F6F7",
  },
  inputOutline: {
    borderRadius: 30,
    borderWidth: 1,
  },
  inputContent: {
    fontSize: 16,
    fontFamily: "PoppinsRegular",
    color: "#0F0C0D",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  icon: {
    position: "absolute",
    right: 16,
    top: 8,
  },
});
