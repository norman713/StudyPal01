import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function HeaderSection() {
  // ===== FAKE DATA =====
  const name = "Nguyetlun115";
  const taskCount = 3;

  const taskDates = ["2025-12-16", "2025-12-18", "2025-12-07"]; // ngày có task
  const today = new Date().toISOString().split("T")[0];

  const [selected, setSelected] = useState("");

  // Build marked dates
  const marked: any = {};

  // 🔴 Task dates → đỏ
  taskDates.forEach((date) => {
    marked[date] = {
      customStyles: {
        container: {
          backgroundColor: "#FF6B6B",
          borderRadius: 8,
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
        },
        text: {
          color: "white",
          fontWeight: "700",
        },
      },
    };
  });

  // 🟣 Selected → nâu
  if (selected) {
    marked[selected] = {
      customStyles: {
        container: {
          backgroundColor: "#90717E",
          borderRadius: 8,
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
        },
        text: { color: "white", fontWeight: "700" },
      },
    };
  }

  // 🟢 Today → xanh
  marked[today] = {
    customStyles: {
      container: {
        backgroundColor: "#B8C6B6",
        borderRadius: 8,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
      },
      text: {
        color: "white",
        fontWeight: "700",
      },
    },
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text className="text-center text-[16px] mb-2">
        Hi {name}, you have{" "}
        <Text className="text-[#90717E] font-bold">{taskCount}</Text>{" "}
        {taskCount > 1 ? "tasks" : "task"} today.
      </Text>

      <View style={styles.calendarWrapper}>
        <Calendar
          onDayPress={(day) => setSelected(day.dateString)}
          markingType="custom"
          markedDates={marked}
          theme={{
            arrowColor: "#90717E",
            monthTextColor: "#0F0C0D",
            todayTextColor: "#0F0C0D",
            textDayFontSize: 14,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 12,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "400",
  },
  calendarWrapper: {
    backgroundColor: "#fff",
    padding: 12,
  },
});
