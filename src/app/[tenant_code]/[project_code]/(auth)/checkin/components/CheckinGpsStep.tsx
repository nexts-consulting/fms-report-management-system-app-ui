import React from "react";
import { Localize } from "@/kits/widgets/Localize";
import type { IWorkingShiftLocation, IProjectGpsConfig, KeycloakUser, ILocation } from "@/types/model";
import { UserGeolocation } from "../common/types";

interface CheckinGpsStepProps {
  user: KeycloakUser;
  location: ILocation | null;
  userLocation: UserGeolocation | null;
  workingShift: IWorkingShiftLocation;
  gpsConfig: IProjectGpsConfig | null | undefined;
  onUpdateGps: (e: { isUserInLocationScope: boolean | undefined }) => void;
  onContinue: () => void;
}

/**
 * GPS step component for check-in process
 */
export const CheckinGpsStep: React.FC<CheckinGpsStepProps> = ({
  user,
  location,
  userLocation,
  workingShift,
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
                  lat: userLocation.lat,
                  lng: userLocation.lng,
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
          name: workingShift.name,
          startTime: new Date(workingShift.start_time),
          endTime: new Date(workingShift.end_time),
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
