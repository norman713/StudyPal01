import dayjs from "dayjs";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendario";

interface HeaderProps {
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
}: HeaderProps) {
  // Normalize dates to YYYY-MM-DD to match local date strings
  const taskSet = new Set(
    markedDates.map((date) => dayjs(date).format("YYYY-MM-DD"))
  );

  const formatMonth = (d: Date) => dayjs(d).format("YYYY-MM-01");
  const [currentMonth, setCurrentMonth] = useState(formatMonth(new Date()));

  const today = dayjs().format("YYYY-MM-DD");
  const getDateStr = (d: Date) => dayjs(d).format("YYYY-MM-DD");

  const goPrev = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    const newMonth = formatMonth(d);
    setCurrentMonth(newMonth);
    onMonthChange(new Date(newMonth));
  };

  const goNext = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    const newMonth = formatMonth(d);
    setCurrentMonth(newMonth);
    onMonthChange(new Date(newMonth));
  };

  return (
    <View style={styles.container}>
      <Text className="text-center text-[16px] mb-2">
        Hi {userName}, you have{" "}
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
            {new Date(currentMonth).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>

          <TouchableOpacity onPress={goNext}>
            <Text style={styles.navBtn}>{">"}</Text>
          </TouchableOpacity>
        </View>

        {/* ==== CALENDAR ==== */}
        <Calendar
          key={`${currentMonth}-${markedDates.length}`}
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

            dayTextStyle: {
              color: "#2d4150",
              fontSize: 15,
            },

            todayTextStyle: {
              color: "#0F0C0D",
              fontWeight: "700",
            },

            // ⭐ XOÁ TOÀN BỘ LỚP SELECTED MẶC ĐỊNH
            dayContainerStyle: {
              backgroundColor: "transparent",
              padding: 0,
              margin: 0,
            },

            activeDayContainerStyle: {
              backgroundColor: "transparent",
              padding: 0,
              margin: 0,
              borderRadius: 0,
            },

            activeDayTextStyle: {
              color: "#000",
            },
          }}
          renderDayContent={({ date }) => {
            const dateStr = getDateStr(date);

            const isToday = dateStr === today;
            const isTaskDay = taskSet.has(dateStr);
            const isSelected =
              selectedDate && dateStr === getDateStr(selectedDate);

            // Using similar colors as in Plan
            let bg = "transparent";
            let color = "#000";
            let radius = 10;

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
                  width: 40,
                  height: 40,
                  borderRadius: radius,
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
