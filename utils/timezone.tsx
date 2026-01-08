import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Timezone chuẩn của hệ thống (BE đang dùng)
 * FE sẽ convert mọi time về timezone này trước khi gửi API
 */
export const SYSTEM_TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * Detect timezone của user (theo device)
 */
export const getUserTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Convert time user chọn → system timezone → string gửi BE
 * @param date Dayjs (theo giờ user)
 */
export const convertUserToSystemTime = (date: dayjs.Dayjs): string => {
  const userTZ = getUserTimeZone();

  return date
    .tz(userTZ, true) // giữ nguyên giờ user chọn
    .tz(SYSTEM_TIME_ZONE) // convert sang system timezone
    .format("YYYY-MM-DD HH:mm:ss");
};

/**
 * Convert time từ BE (system timezone) → giờ user để hiển thị
 * @param dateStr string yyyy-MM-dd HH:mm:ss
 */
export const convertSystemToUserTime = (dateStr: string): dayjs.Dayjs => {
  const userTZ = getUserTimeZone();

  return dayjs.tz(dateStr, SYSTEM_TIME_ZONE).tz(userTZ);
};
