import { useShiftDurationFormated } from "@/hooks/shift/use-shift-duration-formated";
import { Button } from "@/kits/components/Button";
import { Icons } from "@/kits/components/Icons";
import { StringUtil } from "@/kits/utils";
import { OutletMap } from "@/kits/widgets/OutletMap";
import { IWorkingShiftLocation } from "@/types/model";
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
          <div className="flex items-center justify-start gap-4 bg-white p-4">
            <Icons.TaskLocation className="shrink-0 text-gray-50" />
            <div>
              <p className="line-clamp-1 text-sm font-medium text-gray-100">{workingShiftLocation.name}</p>
              <p className="line-clamp-1 text-xs text-gray-50">
                <span>
                  {`${StringUtil.toTitleCase(moment(workingShiftLocation.start_time).format("dddd, "))}${moment(workingShiftLocation.start_time).format("DD/MM/YYYY")}`}
                </span>
                <span className="px-1">•</span>
                <span>{moment(workingShiftLocation.start_time).format("HH:mm A")}</span>
                <span> → </span>
                <span>{moment(workingShiftLocation.end_time).format("HH:mm A")}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-30">
            <div className="flex items-center justify-start gap-4 bg-white p-4">
              <Icons.Login className="shrink-0 text-green-50" />
              <div>
                <p className="line-clamp-1 text-sm font-medium text-gray-100">Bắt đầu ca</p>
                <p className="line-clamp-1 text-xs text-gray-50">
                  {moment(workingShiftLocation.start_time).format("HH:mm A")}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4 bg-white p-4">
              <Icons.Time className="shrink-0 text-gray-50" />
              <div>
                <p className="line-clamp-1 text-sm font-medium text-gray-100">Thời lượng ca</p>
                <p className="line-clamp-1 text-xs text-gray-50">{workingDurationFormated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Outlet Map Tile */}
        <div className="mt-4 divide-y divide-gray-30">
          <div className="aspect-[3/2] h-auto w-full bg-white p-4">
            <OutletMap
              gps={{
                lat: workingShiftLocation.location.latitude ?? 0,
                lng: workingShiftLocation.location.longitude ?? 0,
              }}
              radius={workingShiftLocation.location.checkin_radius_meters ?? 0}
            />
          </div>
          <div className="flex items-center justify-start gap-4 bg-white p-4">
            <Icons.Location className="shrink-0 text-gray-50" />
            <div>
              <p className="line-clamp-1 text-sm font-medium text-gray-100">
                {workingShiftLocation.location.name}
              </p>
              <p className="line-clamp-1 text-xs text-gray-50">{workingShiftLocation.location.address}</p>
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
        <Button icon={Icons.Login} size="large" className="w-full" onClick={onConfirm}>
          Check in
        </Button>
      </div>
    </>
  );
});

CheckInConfirm.displayName = "CheckInConfirm";
