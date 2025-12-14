import type { CheckinStep } from "./types";

export const CHECKIN_TIPS = [
  "Ca làm việc của bạn đang được tạo",
  "Chúc bạn có một ngày làm việc tốt lành!",
] as const;

export const DEFAULT_STEPS: CheckinStep[] = ["gps", "capture", "submit"];

export const CHECKIN_SUCCESS_REDIRECT_DELAY = 3000; // 3 seconds
