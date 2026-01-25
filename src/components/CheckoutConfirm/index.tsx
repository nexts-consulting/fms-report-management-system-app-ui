import { Icons } from "@/kits/components/icons";
import { IAttendance, ILocation } from "@/types/model";
import {
  ShiftInfoCard,
  TimeInfoCard,
  LocationInfoSection,
  ConfirmationButtons,
} from "@/components/shared";
import moment from "moment";
import React from "react";

interface CheckoutConfirmProps {
  attendanceDetail: IAttendance;
  location: ILocation | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CheckoutConfirm = React.memo((props: CheckoutConfirmProps) => {
  const { attendanceDetail, location, onConfirm, onCancel } = props;

  const totalTrackingTimeFormated = React.useMemo(() => {
    const duration = moment.duration(moment().diff(moment(attendanceDetail.checkin_time)));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    const formatDuration = (hours: number, minutes: number) => {
      const hourText = hours > 0 ? `${hours} giờ` : "";
      const minuteText = minutes > 0 ? `${minutes} phút` : "";
      if (hourText && minuteText) {
        return `${hourText} ${minuteText}`;
      }

      return hourText || minuteText || "--";
    };

    return formatDuration(hours, minutes);
  }, [attendanceDetail]);

  return (
    <>
      <div className="bg-gray-10 p-4">
        {/* Shift Info Tile */}
        <div className="divide-y divide-gray-30">
          <ShiftInfoCard
            name={attendanceDetail.workshift_name}
            startTime={attendanceDetail.shift_start_time}
            endTime={attendanceDetail.shift_end_time}
          />

          <div className="grid grid-cols-2 divide-x divide-gray-30">
            <TimeInfoCard
              icon={Icons.Logout}
              iconColor="text-red-50"
              label="Kết thúc ca"
              time={moment().format("HH:mm A")}
            />
            <TimeInfoCard
              icon={Icons.Time}
              iconColor="text-gray-50"
              label="Tracking time"
              time={totalTrackingTimeFormated}
            />
          </div>
        </div>

        {/* Location Info Section */}
        <LocationInfoSection
          latitude={location?.latitude ?? 0}
          longitude={location?.longitude ?? 0}
          radius={location?.checkin_radius_meters ?? 0}
          name={location?.name ?? ""}
          address={location?.address ?? ""}
        />
      </div>

      {/* Confirmation Buttons */}
      <ConfirmationButtons
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmIcon={Icons.Logout}
        confirmLabel="Check out"
      />
    </>
  );
});

CheckoutConfirm.displayName = "CheckoutConfirm";
