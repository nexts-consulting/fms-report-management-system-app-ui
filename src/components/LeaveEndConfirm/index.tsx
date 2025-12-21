"use client";

import { useGlobalContext } from "@/contexts/global.context";
import { Modal } from "@/kits/components/Modal";
import React from "react";
import { Button } from "@/kits/components/button";
import moment from "moment";
import { useNotification } from "@/kits/components/Notification";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { useTick } from "@/kits/hooks/use-tick";
import { NotificationBanner } from "@/kits/components/NotificationBanner";
import { useQueryClient } from "react-query";
import { Spinner } from "@/kits/components/Spinner";
import { useMutationEndStaffLeave } from "@/services/api/application/staff-leaves/end";

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

export const LeaveEndConfirm = React.memo(() => {
  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();
  const showLeaveEndConfirmation = globalStore.use.showLeaveEndConfirmation();

  const [now, controls] = useTick({ unit: "minute" });
  const notification = useNotification();
  const queryClient = useQueryClient();

  // Find last incomplete leave
  const lastIncompleteLeave = React.useMemo(() => {
    if (!currentAttendance?.staffLeaves?.length) return null;
    return currentAttendance.staffLeaves.find((leave) => !leave.endTime);
  }, [currentAttendance?.staffLeaves]);

  // Calculate elapsed time
  const elapsedTime = React.useMemo(() => {
    if (!lastIncompleteLeave) return "";
    const start = moment(lastIncompleteLeave.startTime);
    const duration = moment.duration(now.diff(start));

    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    if (minutes > 0) {
      return `${minutes} phút`;
    }
    return `1 phút`;
  }, [lastIncompleteLeave, now]);

  const endLeaveMutation = useMutationEndStaffLeave({
    config: {
      onSuccess: () => {
        globalStore.setState({ showLeaveEndConfirmation: false });
        notification.success({
          title: "Thành công",
          description: "Đã ghi nhận việc kết thúc tạm rời vị trí",
          options: { duration: 5000 },
        });
        queryClient.invalidateQueries({
          queryKey: ["query/attendance/current-shift"],
          exact: false,
        });
      },
      onError: () => {
        notification.error({
          title: "Lỗi",
          description: "Không thể ghi nhận. Vui lòng thử lại",
          options: { duration: 5000 },
        });
      },
    },
  });

  const handleEndLeave = React.useCallback(() => {
    if (!lastIncompleteLeave?.id) return;
    endLeaveMutation.mutate({ leaveId: lastIncompleteLeave.id });
  }, [lastIncompleteLeave?.id, endLeaveMutation]);

  React.useEffect(() => {
    if (lastIncompleteLeave) {
      globalStore.setState({ showLeaveEndConfirmation: true });
    }
  }, [lastIncompleteLeave, globalStore]);

  React.useEffect(() => {
    if (showLeaveEndConfirmation) {
      controls.on();
    } else {
      controls.off();
    }
  }, [controls, showLeaveEndConfirmation]);

  return (
    <>
      <LoadingOverlay active={endLeaveMutation.isLoading} />
      <Modal
        isOpen={showLeaveEndConfirmation}
        closeable={false}
        onClose={() => {}}
        title="Bạn đang tạm rời vị trí"
      >
        {!lastIncompleteLeave && (
          <>
            <div className="my-8 flex h-full w-full items-center justify-center">
              <Spinner size="large" />
            </div>
          </>
        )}

        {lastIncompleteLeave && (
          <>
            <div className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <NotificationBanner
                    type="info"
                    title="Thời gian đã rời đi"
                    description={
                      <>
                        <p className="text-xs">{elapsedTime}</p>
                      </>
                    }
                    closeable={false}
                  />
                  <NotificationBanner
                    type="warning"
                    title="Lưu ý"
                    description={
                      <>
                        Bạn sẽ không thể thực hiện các hành động khác trong thời gian tạm rời vị
                        trí.
                      </>
                    }
                    closeable={false}
                  />
                </div>

                <div className="bg-gray-10 p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-90">
                      Lý do:{" "}
                      {
                        leaveTypes.find((type) => type.value === lastIncompleteLeave.leaveType)
                          ?.label
                      }
                    </p>
                    {lastIncompleteLeave.note && (
                      <p className="mt-1 text-sm">Ghi chú: {lastIncompleteLeave.note}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full"
              size="large"
              onClick={handleEndLeave}
              disabled={endLeaveMutation.isLoading}
            >
              {endLeaveMutation.isLoading ? "Đang xử lý..." : "Kết thúc rời vị trí"}
            </Button>
          </>
        )}
      </Modal>
    </>
  );
});

LeaveEndConfirm.displayName = "LeaveEndConfirm";
