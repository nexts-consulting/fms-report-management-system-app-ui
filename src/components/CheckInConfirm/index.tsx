import { useShiftDurationFormated } from "@/hooks/shift/use-shift-duration-formated";
import { Icons } from "@/kits/components/icons";
import { IWorkingShiftLocation } from "@/types/model";
import {
  ShiftInfoCard,
  TimeInfoCard,
  LocationInfoSection,
  ConfirmationButtons,
} from "@/components/shared";
import moment from "moment";
import React from "react";

interface CheckInConfirmProps {
  workingShiftLocation: IWorkingShiftLocation;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CheckInConfirm = React.memo((props: CheckInConfirmProps) => {
  const { workingShiftLocation, onConfirm, onCancel } = props;

  const workingDurationFormated = useShiftDurationFormated({
    startTime: new Date(workingShiftLocation.start_time),
    endTime: new Date(workingShiftLocation.end_time),
  });

  return (
    <>
      <div className="bg-gray-10 p-4">
        {/* Shift Info Tile */}
        <div className="divide-y divide-gray-30">
          <ShiftInfoCard
            name={workingShiftLocation.name}
            startTime={workingShiftLocation.start_time}
            endTime={workingShiftLocation.end_time}
          />

          <div className="grid grid-cols-2 divide-x divide-gray-30">
            <TimeInfoCard
              icon={Icons.Login}
              iconColor="text-green-50"
              label="Bắt đầu ca"
              time={moment().format("HH:mm A")}
            />
            <TimeInfoCard
              icon={Icons.Time}
              iconColor="text-gray-50"
              label="Thời lượng ca"
              time={workingDurationFormated}
            />
          </div>
        </div>

        {/* Location Info Section */}
        <LocationInfoSection
          latitude={workingShiftLocation.location.latitude ?? 0}
          longitude={workingShiftLocation.location.longitude ?? 0}
          radius={workingShiftLocation.location.checkin_radius_meters ?? 0}
          name={workingShiftLocation.location.name}
          address={workingShiftLocation.location.address ?? ""}
        />
      </div>

      {/* Confirmation Buttons */}
      <ConfirmationButtons
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmIcon={Icons.Login}
        confirmLabel="Check in"
      />
    </>
  );
});

CheckInConfirm.displayName = "CheckInConfirm";
