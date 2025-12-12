import dayjs from "dayjs";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendario";

const DAY_SIZE = 40;
const DAY_RADIUS = 10;

export default function HeaderSection() {
  const name = "Nguyetlun115";
  const taskCount = 3;

  const taskDates = ["2025-12-16", "2025-12-18", "2025-12-07"];
  const taskSet = new Set(taskDates);

  const [selected, setSelected] = useState<Date | null>(null);

  const formatMonth = (d: Date) => dayjs(d).format("YYYY-MM-01");
  const [currentMonth, setCurrentMonth] = useState(formatMonth(new Date()));

  // ✅ LOCAL timezone
  const today = dayjs().format("YYYY-MM-DD");
  const getDateStr = (d: Date) => dayjs(d).format("YYYY-MM-DD");

  const goPrev = () => {
    setCurrentMonth(
      dayjs(currentMonth).subtract(1, "month").format("YYYY-MM-01")
    );
  };

  const goNext = () => {
    setCurrentMonth(dayjs(currentMonth).add(1, "month").format("YYYY-MM-01"));
  };

  return (
    <View style={styles.container}>
      <Text className="text-center text-[16px] mb-2">
        Hi {name}, you have{" "}
        <Text className="text-[#90717E] font-bold">{taskCount}</Text>{" "}
        {taskCount > 1 ? "tasks" : "task"} today.
      </Text>

      <View style={styles.calendarWrapper}>
        {/* ==== MONTH NAV BAR ==== */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={goPrev}>
            <Text style={styles.navBtn}>{"<"}</Text>
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {dayjs(currentMonth).format("MMMM YYYY")}
          </Text>

          <TouchableOpacity onPress={goNext}>
            <Text style={styles.navBtn}>{">"}</Text>
          </TouchableOpacity>
        </View>

        {/* ==== CALENDAR ==== */}
        <Calendar
          key={currentMonth}
          numberOfMonths={1}
          startingMonth={currentMonth}
          startDate={selected ?? undefined}
          onPress={(date: Date) => setSelected(date)}
          theme={{
            monthTitleTextStyle: { display: "none" },

            weekColumnTextStyle: {
              color: "#90717E",
              fontSize: 12,
              fontWeight: "500",
            },

            // 👇 giữ wrapper gốc, KHÔNG ép size
            dayContainerStyle: {
              margin: 2,
              backgroundColor: "transparent",
            },

            // 🚨 BẮT BUỘC: phá active wrapper
            activeDayContainerStyle: {
              margin: 2,
              backgroundColor: "transparent",
              borderRadius: 10,
              padding: 0,
            },

            activeDayTextStyle: {
              color: "transparent",
            },
          }}
          renderDayContent={({ date }) => {
            const dateStr = getDateStr(date);

            const isToday = dateStr === today;
            const isTaskDay = taskSet.has(dateStr);
            const isSelected = selected && dateStr === getDateStr(selected);

            let bg = "transparent";
            let color = "#000";

            // 🔽 ưu tiên thấp → cao
            if (isToday) {
              bg = "#B8C6B6";
              color = "white";
            }

            if (isTaskDay) {
              bg = "#FF6B6B";
              color = "white";
            }

            if (isSelected) {
              bg = "#90717E";
              color = "white";
            }

            return (
              <View
                style={{
                  width: DAY_SIZE,
                  height: DAY_SIZE,
                  borderRadius: DAY_RADIUS,
                  backgroundColor: bg,
                  alignItems: "center",
                  justifyContent: "center",
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
