import dayjs from "dayjs";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendario";

const DAY_SIZE = 40;
const DAY_RADIUS = 10;

interface HeaderApiProps {
  userName: string;
  taskCount: number;
  markedDates: string[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export default function HeaderSection({
  userName,
  taskCount,
  markedDates,
  selectedDate,
  onDateSelect,
  onMonthChange,
}: HeaderApiProps) {
  const taskSet = new Set(markedDates);

  const formatMonth = (d: Date) => dayjs(d).format("YYYY-MM-01");
  const [currentMonth, setCurrentMonth] = useState(formatMonth(new Date()));

  // ✅ LOCAL timezone
  const today = dayjs().format("YYYY-MM-DD");
  const getDateStr = (d: Date) => dayjs(d).format("YYYY-MM-DD");

  const goPrev = () => {
    const prev = dayjs(currentMonth).subtract(1, "month").toDate();
    const prevStr = dayjs(prev).format("YYYY-MM-01");
    setCurrentMonth(prevStr);
    onMonthChange(new Date(prevStr));
  };

  const goNext = () => {
    const next = dayjs(currentMonth).add(1, "month").toDate();
    const nextStr = dayjs(next).format("YYYY-MM-01");
    setCurrentMonth(nextStr);
    onMonthChange(new Date(nextStr));
  };

  return (
    <View style={styles.container}>
      <Text className="text-center text-[16px] mb-2">
        Hi {userName}, you have{" "}
        <Text className="text-[#90717E] font-bold">{taskCount}</Text>{" "}
        {taskCount > 1 ? "plans" : "plan"} today.
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
          startDate={selectedDate ?? undefined}
          onPress={(date: Date) => onDateSelect(date)}
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
            const isSelected =
              selectedDate && dateStr === getDateStr(selectedDate);

            // Priority: Selected (Brown) > TaskDay (Red) > Today (Green)
            // Wait, requirement says:
            // Green = Today
            // Red = Deadline
            // Brown = Selected

            let bg = "transparent";
            let color = "#0F0C0D"; // Default black

            if (isToday) {
              bg = "#B8C6B6"; // Green
              color = "white";
            }

            if (isTaskDay) {
              bg = "#FF6B6B"; // Red
              color = "white";
            }

            if (isSelected) {
              bg = "#90717E"; // Brown
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
