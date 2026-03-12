import type { CameraCaptureTimeMarkConfig } from "@/kits/widgets/CameraCapture";

export interface AttendancePhotoTimeMarkOptions {
  actionLabel: string;
  shiftName?: string | null;
  employeeName?: string | null;
  locationName?: string | null;
}

const FALLBACK_VALUE = "N/A";

export const buildAttendancePhotoTimeMarkConfig = (
  options: AttendancePhotoTimeMarkOptions,
): CameraCaptureTimeMarkConfig => {
  const { actionLabel, shiftName, employeeName, locationName } = options;

  return {
    position: "bottom-left",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    textColor: "#FFFFFF",
    timestampLabel: "Thời gian",
    showTimestamp: true,
    textLines: [
      `Loại: ${actionLabel}`,
      `Ca: ${shiftName?.trim() || FALLBACK_VALUE}`,
      `Nhân sự: ${employeeName?.trim() || FALLBACK_VALUE}`,
      `Địa điểm: ${locationName?.trim() || FALLBACK_VALUE}`,
    ],
  };
};
