import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HeaderSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi Nguyetlun115, you have 3 tasks today.</Text>

      {/* Calendar Component bạn tự nhét vào đây */}
      <View style={styles.calendarWrapper}>{/* Calendar */}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
  },
  calendarWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
});
