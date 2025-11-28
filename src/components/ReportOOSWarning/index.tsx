import { useGlobalContext } from "@/contexts/global.context";
import { NotificationBanner } from "@/kits/components/NotificationBanner";
import { useLockTimer } from "@/kits/hooks/use-lock-timer";
import React from "react";
import { AppConfig } from "@/config";

export const ReportOOSWarning = () => {
  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();

  const timer = useLockTimer({
    startTime: new Date(currentAttendance?.shift.startTime ?? ""),
    lockAfterHours: AppConfig.oosReportCloseAfterHours,
  });

  const timeDisplay = React.useMemo(() => {
    if (timer.isLocked) return "Đã hết thời gian";

    const parts = [];
    if (timer.hours > 0) parts.push(`${timer.hours} giờ`);
    if (timer.minutes > 0) parts.push(`${timer.minutes} phút`);

    return parts.join(" ");
  }, [timer]);

  return (
    <NotificationBanner
      type={timer.isLocked ? "error" : "warning"}
      title="Lưu ý"
      description={
        <p>
          <strong>Báo cáo OOS</strong> {timer.isLocked ? "đã được đóng" : "sẽ được đóng"} sau{" "}
          <strong>{AppConfig.oosReportCloseAfterHours} tiếng</strong> kể từ lúc ca làm việc bắt đầu.
          <br />
          {!timer.isLocked && (
            <>
              Thời gian còn lại: <strong>{timeDisplay}</strong>
              <br />
              Vui lòng thực hiện trước khi hết thời hạn!
            </>
          )}
        </p>
      }
      closeable={false}
    />
  );
};
