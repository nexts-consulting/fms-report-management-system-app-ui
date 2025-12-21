import type { CheckinStep, UserGeolocation, CheckinLocation } from "./types";
import type { IProjectAttendancePhotoConfig, IProjectCheckinFlow, IProjectGpsConfig, IWorkingShiftLocation, IWorkshift } from "@/types/model";
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
  if (checkinFlow.require_gps_verification) steps.push("gps");
  if (checkinFlow.require_photo_verification) {
    steps.push("capture");
  }
  // Always add submit step at the end (before post_shift_task)
  steps.push("submit");
  if (checkinFlow.require_post_shift_task) steps.push("post_shift_task");

  return steps.length > 0 ? steps : DEFAULT_STEPS;
};

/**
 * Check if GPS mode requires GPS coordinates
 */
const isGpsModeRequiringCoordinates = (mode: string): boolean => {
  return (
    mode === "REQUIRED_AT_LOCATION" ||
    mode === "REQUIRED_BUT_NOT_STRICT" ||
    mode === "VISIBLE_OPTIONAL"
  );
};

/**
 * Determine if GPS is required based on config
 */
const isGpsRequired = (
  gpsConfig: IProjectGpsConfig | null | undefined,
  checkinFlow: IProjectCheckinFlow | null | undefined,
): boolean => {
  if (gpsConfig) {
    // is_required: whether user needs to have GPS coordinates (not about strict mode)
    // If is_required is explicitly set, use it; otherwise check if mode requires GPS
    return isGpsModeRequiringCoordinates(gpsConfig.mode);
  }

  if (checkinFlow) {
    return checkinFlow.require_gps_verification ?? false;
  }

  return false;
};

/**
 * Get checkin location based on GPS config and user location
 */
export const getCheckinLocation = (
  checkinFlow: IProjectCheckinFlow | null | undefined,
  gpsConfig: IProjectGpsConfig | null | undefined,
  userGeolocation: UserGeolocation | null,
  workingShift: IWorkingShiftLocation,
): CheckinLocation => {
  const requiresGps = isGpsRequired(gpsConfig, checkinFlow);

  // Use user GPS location if GPS is required and available
  if (requiresGps && userGeolocation) {
    return {
      lat: userGeolocation.lat,
      lng: userGeolocation.lng,
      acc: userGeolocation.accuracy,
    };
  }

  // Fallback
  return {
    lat: 0,
    lng: 0,
    acc: 0,
  };
};

/**
 * Check if photo mode requires face verification
 */
const isFaceVerificationMode = (mode: string | undefined): boolean => {
  return mode === "REQUIRE_IDENTITY_VERIFICATION" || mode === "REQUIRE_FACE_PHOTO";
};

/**
 * Get photo capture description based on photo config mode
 */
export const getPhotoCaptureDescription = (
  photoConfig: IProjectAttendancePhotoConfig | null | undefined,
): string => {
  const mode = photoConfig?.mode;

  if (isFaceVerificationMode(mode)) {
    return "Vui lòng chụp rõ khuôn mặt của bạn để xác thực";
  }

  return "Vui lòng chụp ảnh";
};
