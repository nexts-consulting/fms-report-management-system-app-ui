import { useShiftDurationFormated } from "@/hooks/use-shift-duration-formated";
import { Button } from "@/kits/components/Button";
import { Icons } from "@/kits/components/Icons";
import { StringUtil } from "@/kits/utils";
import { OutletMap } from "@/kits/widgets/OutletMap";
import { IStaffAttendance } from "@/types/model";
import moment from "moment";
import React from "react";

interface CheckoutConfirmProps {
  attendance: IStaffAttendance;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CheckoutConfirm = React.memo((props: CheckoutConfirmProps) => {
  const { attendance, onConfirm, onCancel } = props;

  const totalTrackingTimeFormated = React.useMemo(() => {
    const duration = moment.duration(moment().diff(moment(attendance.checkinTime)));
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
  }, [attendance]);

  return (
    <>
      <div className="bg-gray-10 p-4">
        {/* Shift Info Tile */}
        <div className="divide-y divide-gray-30">
          <div className="flex items-center justify-start gap-4 bg-white p-4">
            <Icons.TaskLocation className="shrink-0 text-gray-50" />
            <div>
              <p className="line-clamp-1 text-sm font-medium text-gray-100">
                {attendance.shift.name}
              </p>
              <p className="line-clamp-1 text-xs text-gray-50">
                <span>
                  {`${StringUtil.toTitleCase(moment(attendance.shift.startTime).format("dddd, "))}${moment(attendance.shift.startTime).format("DD/MM/YYYY")}`}
                </span>
                <span className="px-1">•</span>
                <span>{moment(attendance.shift.startTime).format("HH:mm A")}</span>
                <span> → </span>
                <span>{moment(attendance.shift.endTime).format("HH:mm A")}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-30">
            <div className="flex items-center justify-start gap-4 bg-white p-4">
              <Icons.Logout className="shrink-0 text-red-50" />
              <div>
                <p className="line-clamp-1 text-sm font-medium text-gray-100">Kết thúc ca</p>
                <p className="line-clamp-1 text-xs text-gray-50">
                  {moment(attendance.shift.endTime).format("HH:mm A")}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4 bg-white p-4">
              <Icons.Time className="shrink-0 text-gray-50" />
              <div>
                <p className="line-clamp-1 text-sm font-medium text-gray-100">Tracking time</p>
                <p className="line-clamp-1 text-xs text-gray-50">{totalTrackingTimeFormated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Outlet Map Tile */}
        <div className="mt-4 divide-y divide-gray-30">
          <div className="aspect-[3/2] h-auto w-full bg-white p-4">
            <OutletMap
              gps={{
                lat: attendance.shift.outlet.latitude,
                lng: attendance.shift.outlet.longitude,
              }}
              radius={attendance.shift.outlet.checkinRadiusMeters}
            />
          </div>
          <div className="flex items-center justify-start gap-4 bg-white p-4">
            <Icons.Location className="shrink-0 text-gray-50" />
            <div>
              <p className="line-clamp-1 text-sm font-medium text-gray-100">
                {attendance.shift.outlet.name}
              </p>
              <p className="line-clamp-1 text-xs text-gray-50">{attendance.shift.outlet.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm */}
      <div className="grid grid-cols-2">
        <Button
          variant="secondary"
          size="large"
          icon={Icons.Close}
          className="w-full"
          onClick={onCancel}
        >
          Hủy bỏ
        </Button>
        <Button icon={Icons.Logout} size="large" className="w-full" onClick={onConfirm}>
          Check out
        </Button>
      </div>
    </>
  );
});

CheckoutConfirm.displayName = "CheckoutConfirm";
