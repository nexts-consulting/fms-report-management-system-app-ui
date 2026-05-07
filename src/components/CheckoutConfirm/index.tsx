"use client";

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
import { useGlobalContext } from "@/contexts/global.context";
import { useAuthContext } from "@/contexts/auth.context";
import { validatePostShiftTasks } from "@/services/api/application/attendance/validate-post-shift-tasks";
import { getAllRoles } from "@/utils/auth";

interface CheckoutConfirmProps {
  attendanceDetail: IAttendance;
  location: ILocation | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CheckoutConfirm = React.memo((props: CheckoutConfirmProps) => {
  const { attendanceDetail, location, onConfirm, onCancel } = props;

  const globalStore = useGlobalContext();
  const authStore = useAuthContext();
  const user = authStore.use.user();
  const projectCheckinFlow = globalStore.use.projectCheckinFlow();
  const projectMetadata = globalStore.use.projectMetadata();
  const userRoles = React.useMemo(() => getAllRoles(user), [user]);

  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
  const [isValidating, setIsValidating] = React.useState(false);

  React.useEffect(() => {
    setIsValidating(true);

    validatePostShiftTasks({
      attendanceId: attendanceDetail.id,
      projectCheckinFlow,
      projectMetadata,
      userRoles,
    }).then(({ errors }) => {
      setValidationErrors(errors);
      setIsValidating(false);
    });
  }, [attendanceDetail.id, projectCheckinFlow, projectMetadata, userRoles]);

  const handleConfirm = React.useCallback(() => {
    if (validationErrors.length > 0 || isValidating) return;
    onConfirm();
  }, [validationErrors, isValidating, onConfirm]);

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
            startTime={attendanceDetail.shift_start_time ?? ""}
            endTime={attendanceDetail.shift_end_time ?? ""}
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

        {/* Post-shift task validation */}
        {isValidating && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-60">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-40 border-t-gray-70" />
            <span>Đang kiểm tra nhiệm vụ sau ca...</span>
          </div>
        )}

        {!isValidating && validationErrors.length > 0 && (
          <div className="mt-3 border border-red-30 bg-white p-3">
            <p className="mb-1 text-sm font-medium text-red-60">Lỗi khi kết thúc ca:</p>
            <ul className="list-disc pl-4">
              {validationErrors.map((err, idx) => (
                <li key={idx} className="text-sm">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confirmation Buttons */}
      <ConfirmationButtons
        onCancel={onCancel}
        onConfirm={handleConfirm}
        confirmIcon={Icons.Logout}
        confirmLabel="Check out"
        confirmDisabled={isValidating || validationErrors.length > 0}
      />
    </>
  );
});

CheckoutConfirm.displayName = "CheckoutConfirm";
