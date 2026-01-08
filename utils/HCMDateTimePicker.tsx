import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import React, { useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

export const SYSTEM_TIME_ZONE = "Asia/Ho_Chi_Minh";

type Props = {
  mode: "date" | "time" | "datetime";
  value: string | Date | dayjs.Dayjs; // Input: FE string or Date
  onChange: (date: dayjs.Dayjs) => void; // Output: dayjs object UTC+7
  display?: "default" | "spinner" | "calendar" | "clock";
  is24Hour?: boolean;
};

export const HCMDateTimePicker: React.FC<Props> = ({
  mode,
  value,
  onChange,
  display = "spinner",
  is24Hour = true,
}) => {
  const [show, setShow] = useState(false);

  // Parse input value → dayjs UTC+7
  const parseValue = (v: string | Date | dayjs.Dayjs): Date => {
    let d: dayjs.Dayjs;

    if (dayjs.isDayjs(v)) d = v;
    else if (v instanceof Date) d = dayjs(v);
    else {
      d = dayjs.tz(v, "DD-MM-YYYY HH:mm", SYSTEM_TIME_ZONE); // parse format đúng
    }

    // fallback nếu invalid
    if (!d.isValid()) {
      console.warn("[HCMDateTimePicker] Invalid value, fallback to now");
      d = dayjs().tz(SYSTEM_TIME_ZONE);
    }

    return d.toDate();
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(false);
    if (selectedDate) {
      // Convert selected date → dayjs UTC+7
      const d = dayjs(selectedDate).tz(SYSTEM_TIME_ZONE, true);
      onChange(d);
    }
  };

  return (
    <>
      <DateTimePicker
        value={parseValue(value)}
        mode={mode === "datetime" ? "date" : mode}
        display={display}
        is24Hour={is24Hour}
        onChange={handleChange}
      />
    </>
  );
};
