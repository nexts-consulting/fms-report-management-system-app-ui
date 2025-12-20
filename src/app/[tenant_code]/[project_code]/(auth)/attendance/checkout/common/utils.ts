import type { UserGeolocation, CheckoutLocation } from "./types";
import type { IAttendance } from "@/types/model";

/**
 * Get checkout location based on GPS config and user location
 */
export const getCheckoutLocation = (
  userGeolocation: UserGeolocation | null,
  attendance: IAttendance | null | undefined,
): CheckoutLocation => {
  // Use user GPS location if available
  if (userGeolocation) {
    return {
      lat: userGeolocation.lat,
      lng: userGeolocation.lng,
      acc: userGeolocation.accuracy,
    };
  }

  // Fallback to attendance location
  if (attendance?.shift?.outlet) {
    return {
      lat: attendance.shift.outlet.latitude ?? 0,
      lng: attendance.shift.outlet.longitude ?? 0,
      acc: 0,
    };
  }

  return {
    lat: 0,
    lng: 0,
    acc: 0,
  };
};
