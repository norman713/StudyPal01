import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendario";

export default function HeaderSection() {
  const name = "Nguyetlun115";
  const taskCount = 3;

  const taskDates = ["2025-12-16", "2025-12-18", "2025-12-07"];
  const taskSet = new Set(taskDates);

  const [selected, setSelected] = useState<Date | null>(null);

  // --- Month state --- (YYYY-MM-01)
  const formatMonth = (d: Date) =>
    d.toISOString().slice(0, 7) + "-01";

  const [currentMonth, setCurrentMonth] = useState(
    formatMonth(new Date())
  );

  const today = new Date().toISOString().split("T")[0];

  const getDateStr = (d: Date) => d.toISOString().split("T")[0];

  const goPrev = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(formatMonth(d));
  };

  const goNext = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(formatMonth(d));
  };

  return (
    <View style={styles.container}>
      <Text className="text-center text-[16px] mb-2">
        Hi {name}, you have{" "}
        <Text className="text-[#90717E] font-bold">{taskCount}</Text>{" "}
        {taskCount > 1 ? "tasks" : "task"} today.
      </Text>

      <View style={styles.calendarWrapper}>
        {/* ==== NÚT MONTH NAVIGATION ==== */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={goPrev}>
            <Text style={styles.navBtn}>{"<"}</Text>
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {new Date(currentMonth).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>

          <TouchableOpacity onPress={goNext}>
            <Text style={styles.navBtn}>{">"}</Text>
          </TouchableOpacity>
        </View>

        {/* ==== CALENDAR (1 month only) ==== */}
        <Calendar
          key={currentMonth} // ép render lại đúng 1 tháng
          numberOfMonths={1}
          startingMonth={currentMonth}
          startDate={selected ?? undefined}
          onPress={(date: Date) => {
            setSelected(date);
          }}
theme={{
  monthTitleTextStyle: {
    display: "none",   // Ẩn title mặc định của calendario
  },
  weekColumnTextStyle: {
    color: "#90717E",
    fontSize: 12,
    fontWeight: "500",
  },
  dayTextStyle: {
    color: "#2d4150",
    fontSize: 15,
    fontWeight: "400",
  },
  todayTextStyle: {
    color: "#0F0C0D",
    fontWeight: "700",
  },
  activeDayContainerStyle: {
    backgroundColor: "#90717E",
  },
  activeDayTextStyle: {
    color: "white",
  },
}}

          renderDayContent={({ date }) => {
            const dateStr = getDateStr(date);

            const isToday = dateStr === today;
            const isTaskDay = taskSet.has(dateStr);
            const isSelected = selected && dateStr === getDateStr(selected);

            let bg = "transparent";
            let color = "#000";

            if (isTaskDay) {
              bg = "#FF6B6B";
              color = "white";
            }
            if (isSelected) {
              bg = "#90717E";
              color = "white";
            }
            if (isToday && !isSelected && !isTaskDay) {
              bg = "#B8C6B6";
              color = "white";
            }

            return (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: bg,
                }}
              >
                <Text style={{ color, fontWeight: "700" }}>
                  {date.getDate()}
                </Text>
              </View>
            );
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
  calendarWrapper: {
    backgroundColor: "#fff",
    padding: 12,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  navBtn: {
    fontSize: 22,
    color: "#90717E",
    fontWeight: "700",
    paddingHorizontal: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F0C0D",
  },
});
