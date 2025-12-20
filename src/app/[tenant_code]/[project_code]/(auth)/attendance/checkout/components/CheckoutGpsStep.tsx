import React from "react";
import { Localize } from "@/kits/widgets/Localize";
import type { IProjectGpsConfig, KeycloakUser, IAttendance, ILocation } from "@/types/model";
import { UserGeolocation } from "../common/types";

interface CheckoutGpsStepProps {
  user: KeycloakUser;
  location: ILocation | null;
  userLocation: UserGeolocation | null;
  attendance: IAttendance;
  gpsConfig: IProjectGpsConfig | null | undefined;
  onUpdateGps: (e: { isUserInLocationScope: boolean | undefined }) => void;
  onContinue: () => void;
} 

/**
 * GPS step component for check-out process
 */
export const CheckoutGpsStep: React.FC<CheckoutGpsStepProps> = ({
  user,
  location,
  userLocation,
  attendance,
  gpsConfig,
  onUpdateGps,
  onContinue,
}) => {

  return (
    <div className="flex flex-1">
      <Localize
        user={
          userLocation
            ? {
                id: user.id.toString(),
                avatar: "",
                gps: {
                  lat: userLocation?.lat,
                  lng: userLocation?.lng,
                },
              }
            : null
        }
        location={{
          name: location?.name ?? "",
          address: location?.address ?? "",
          adminDivision: "",
          gps: {
            lat: location?.latitude ?? 0,
            lng: location?.longitude ?? 0,
          },
          radius: location?.checkin_radius_meters ?? gpsConfig?.gps_radius_meters ?? 100,
        }}
        shift={{
          name: attendance.workshift_name ?? "",
          startTime: new Date(attendance.shift_start_time ?? new Date()),
          endTime: new Date(attendance.shift_end_time ?? new Date()),
        }}
        gpsConfig={
          gpsConfig
            ? {
                mode: gpsConfig.mode,
                is_required: gpsConfig.mode === "REQUIRED_AT_LOCATION",
              }
            : undefined
        }
        onUpdateGps={onUpdateGps}
        onContinue={onContinue}
      />
    </div>
  );
};
