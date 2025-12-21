import React from "react";
import moment from "moment";
import { useGlobalContext } from "@/contexts/global.context";
import { useTick } from "@/kits/hooks/use-tick";

const leaveTypes = [
  { value: "LUNCH_BREAK", label: "Đi ăn trưa/tối" },
  { value: "RESTROOM", label: "Đi vệ sinh" },
  { value: "BREAK_TIME", label: "Giải lao" },
  { value: "GET_SUPPLIES", label: "Lấy hàng/vật dụng" },
  { value: "PRIVATE_TASK", label: "Công việc riêng" },
  { value: "QUICK_MEETING", label: "Họp nhanh với quản lý" },
  { value: "PHONE_CALL", label: "Nghe điện thoại khẩn" },
  { value: "OTHER_REASON", label: "Lý do khác" },
];

export const LeaveList = React.memo(() => {
  const globalStore = useGlobalContext();
  const [now, controls] = useTick({ unit: "minute" });

  const leaves = React.useMemo(() => {
    return [{
      id: "1",
      leaveType: "LUNCH_BREAK",
      startTime: "2025-01-01 10:00:00",
      endTime: "2025-01-01 12:00:00",
    }];
  }, []);

  const calculateDuration = (startTime: string, endTime?: string) => {
    const start = moment(startTime);
    const end = endTime ? moment(endTime) : now;
    const duration = moment.duration(end.diff(start));

    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    if (minutes > 0) {
      return `${minutes} phút`;
    }
    return `1 phút`;
  };

  React.useEffect(() => {
    if (leaves.length && leaves.some((leave) => !leave.endTime)) {
      controls.on();
    } else {
      controls.off();
    }

    return () => {
      controls.off();
    };
  }, [controls, leaves]);

  if (!leaves.length) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-gray-500">Chưa có lịch sử tạm rời vị trí</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leaves.map((leave) => (
        <div key={leave.id}>
          <div className="bg-white p-4">
            <div className="mb-3 flex items-center justify-start gap-3 bg-white">
              <div className="inline-block h-2 w-2 shrink-0 bg-primary-60" />
              <p className="line-clamp-1 text-sm font-medium">
                <span>{leaveTypes.find((type) => type.value === leave.leaveType)?.label}</span>{" "}
                <span className="text-xs text-gray-50">
                  ({calculateDuration(leave.startTime, leave.endTime)})
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-30 text-sm">
              <div className="bg-gray-10 p-2">
                <p className="mb-1 line-clamp-1 text-xs text-gray-50">Bắt đầu</p>
                <p className="line-clamp-1 text-sm font-medium">
                  {moment(leave.startTime).format("HH:mm:ss A")}
                </p>
              </div>
              <div className="bg-gray-10 p-2">
                <p className="mb-1 line-clamp-1 text-xs text-gray-50">Kết thúc</p>
                <p className="line-clamp-1 text-sm font-medium">
                  {leave.endTime ? moment(leave.endTime).format("HH:mm:ss A") : "Đang diễn ra"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

LeaveList.displayName = "LeaveList";
