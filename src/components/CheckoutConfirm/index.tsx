import { useShiftDurationFormated } from "@/hooks/shift/use-shift-duration-formated";
import { Button } from "@/kits/components/button";
import { Icons } from "@/kits/components/icons";
import { StringUtil } from "@/kits/utils";
import { OutletMap } from "@/kits/widgets/OutletMap";
import { IAttendance, ILocation } from "@/types/model";
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
          <div className="flex items-center justify-start gap-4 bg-white p-4">
            <Icons.TaskLocation className="shrink-0 text-gray-50" />
            <div>
              <p className="line-clamp-1 text-sm font-medium text-gray-100">
                {attendanceDetail.workshift_name}
              </p>
              <p className="line-clamp-1 text-xs text-gray-50">
                <span>
                  {`${StringUtil.toTitleCase(moment(attendanceDetail.shift_start_time).format("dddd, "))}${moment(attendanceDetail.shift_start_time).format("DD/MM/YYYY")}`}
                </span>
                <span className="px-1">•</span>
                <span>{moment(attendanceDetail.shift_start_time).format("HH:mm A")}</span>
                <span> → </span>
                <span>{moment(attendanceDetail.shift_end_time).format("HH:mm A")}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-30">
            <div className="flex items-center justify-start gap-4 bg-white p-4">
              <Icons.Logout className="shrink-0 text-red-50" />
              <div>
                <p className="line-clamp-1 text-sm font-medium text-gray-100">Kết thúc ca</p>
                <p className="line-clamp-1 text-xs text-gray-50">
                  {moment().format("HH:mm A")}
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
                lat: location?.latitude ?? 0,
                lng: location?.longitude ?? 0,
              }}
              radius={location?.checkin_radius_meters ?? 0}
            />
          </div>
          <div className="flex items-center justify-start gap-4 bg-white p-4">
            <Icons.Location className="shrink-0 text-gray-50" />
            <div>
              <p className="line-clamp-1 text-sm font-medium text-gray-100">
                {location?.name}
              </p>
              <p className="line-clamp-1 text-xs text-gray-50">{location?.address ?? ""}</p>
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
