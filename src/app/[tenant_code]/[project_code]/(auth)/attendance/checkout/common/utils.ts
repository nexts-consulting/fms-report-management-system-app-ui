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

  return {
    lat: 0,
    lng: 0,
    acc: 0,
  };
};
