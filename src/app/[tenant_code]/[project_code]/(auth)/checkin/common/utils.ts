import type { CheckinStep, UserGeolocation, CheckinLocation } from "./types";
import type {
  IProjectCheckinFlow,
  IProjectAttendancePhotoConfig,
  IProjectGpsConfig,
} from "@/services/application/management/projects/configs/types";
import type { IWorkingShift } from "@/types/model";
import { DEFAULT_STEPS } from "./config";

/**
 * Calculate available checkin steps based on project config
 */
export const calculateAvailableSteps = (
  checkinFlow: IProjectCheckinFlow | null | undefined,
): CheckinStep[] => {
  if (!checkinFlow) {
    return DEFAULT_STEPS;
  }

  const steps: CheckinStep[] = [];

  if (checkinFlow.require_survey) steps.push("survey");
  if (checkinFlow.require_pre_shift_task) steps.push("pre_shift_task");
  if (checkinFlow.require_gps_at_location) steps.push("gps");
  if (checkinFlow.require_attendance) {
    steps.push("capture");
    steps.push("submit");
  }
  if (checkinFlow.require_post_shift_task) steps.push("post_shift_task");

  return steps.length > 0 ? steps : DEFAULT_STEPS;
};

/**
 * Get checkin location based on GPS config and user location
 */
export const getCheckinLocation = (
  checkinFlow: IProjectCheckinFlow | null | undefined,
  gpsConfig: IProjectGpsConfig | null | undefined,
  userGeolocation: UserGeolocation | null,
  workingShift: IWorkingShift,
): CheckinLocation => {
  // Priority: Use GPS config if available, otherwise fallback to checkinFlow
  let isGpsRequired = false;

  if (gpsConfig) {
    // is_required: whether user needs to have GPS coordinates (not about strict mode)
    // If is_required is explicitly set, use it; otherwise check if mode requires GPS
    isGpsRequired =
      gpsConfig.is_required ??
      (gpsConfig.mode === "REQUIRED_AT_LOCATION" ||
        gpsConfig.mode === "REQUIRED_BUT_NOT_STRICT" ||
        gpsConfig.mode === "VISIBLE_OPTIONAL");
  } else if (checkinFlow) {
    // Fallback to checkinFlow
    isGpsRequired = checkinFlow.require_gps_at_location ?? false;
  }

  // Use user GPS location if GPS is required and available
  if (isGpsRequired && userGeolocation) {
    return {
      lat: userGeolocation.lat,
      lng: userGeolocation.lng,
      acc: userGeolocation.accuracy,
    };
  }

  // Fallback to working shift location
  return {
    lat: workingShift.location.latitude,
    lng: workingShift.location.longitude,
    acc: 0,
  };
};

/**
 * Get photo capture description based on photo config mode
 */
export const getPhotoCaptureDescription = (
  photoConfig: IProjectAttendancePhotoConfig | null | undefined,
): string => {
  const mode = photoConfig?.mode;

  if (mode === "REQUIRE_IDENTITY_VERIFICATION" || mode === "REQUIRE_FACE_PHOTO") {
    return "Vui lòng chụp rõ khuôn mặt của bạn để xác thực";
  }

  return "Vui lòng chụp ảnh";
};

/**
 * Create a dummy file for checkin when photo is not required
 */
export const createDummyFile = (): File => {
  return new File([""], "dummy.jpg", { type: "image/jpeg" });
};
