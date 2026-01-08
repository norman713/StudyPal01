import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const SYSTEM_TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * Parse input từ FE (Date | string) → dayjs chuẩn
 * @param date Date | string | dayjs.Dayjs
 */
const parseToDayjs = (date: Date | string | dayjs.Dayjs): dayjs.Dayjs => {
  if (dayjs.isDayjs(date)) return date;
  if (date instanceof Date) return dayjs(date);
  return dayjs(date); // string
};

/**
 * FE → BE
 * Input: Date | string | dayjs
 * Output: yyyy-MM-dd HH:mm:ss (system timezone)
 */
export const convertUserToSystemTime = (
  date: Date | string | dayjs.Dayjs
): string => {
  const parsed = parseToDayjs(date);

  // Convert sang system timezone
  const result = parsed.tz(SYSTEM_TIME_ZONE).format("YYYY-MM-DD HH:mm:ss");

  if (__DEV__) {
    console.log("[convertUserToSystemTime]");
    console.log("Input :", parsed.format());
    console.log("Output:", result);
  }

  return result;
};

/**
 * BE → FE
 * Input: yyyy-MM-dd HH:mm:ss (system timezone)
 * Output: dayjs object theo giờ user
 */
export const convertSystemToUserTime = (dateStr: string): dayjs.Dayjs => {
  return dayjs.tz(dateStr, SYSTEM_TIME_ZONE).local();
};
