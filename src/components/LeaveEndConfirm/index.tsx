"use client";

import { useGlobalContext } from "@/contexts/global.context";
import { useAuthContext } from "@/contexts/auth.context";
import { Modal } from "@/kits/components/modal";
import React from "react";
import { Button } from "@/kits/components/button";
import moment from "moment";
import { useNotification } from "@/kits/components/notification";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { useTick } from "@/kits/hooks/use-tick";
import { NotificationBanner } from "@/kits/components/notification-banner";
import { useQueryClient } from "react-query";
import { Spinner } from "@/kits/components/spinner";
import { ImageCaptureInputWithUpload } from "@/kits/components/image-capture-input-upload";
import { useMutationEndLeaveRequest } from "@/services/api/application/leave-request/end";
import { useQueryCurrentLeaveRequest } from "@/services/api/application/leave-request/get-current";
import { useParams } from "next/navigation";

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
  const authStore = useAuthContext();
  const currentAttendance = globalStore.use.currentAttendance();
  const showLeaveEndConfirmation = globalStore.use.showLeaveEndConfirmation();

  const user = authStore.use.user();
  const params = useParams();
  const projectCode = params?.project_code as string;

  const [now, controls] = useTick({ unit: "minute" });
  const notification = useNotification();
  const queryClient = useQueryClient();

  // Checkin photo URL (ảnh khi quay lại vị trí)
  const [checkinPhotoUrl, setCheckinPhotoUrl] = React.useState<string | null>(null);

  // Get current GPS position (checkin = quay lại vị trí)
  const [checkinLat, setCheckinLat] = React.useState<number | undefined>();
  const [checkinLng, setCheckinLng] = React.useState<number | undefined>();

  React.useEffect(() => {
    if (showLeaveEndConfirmation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCheckinLat(position.coords.latitude);
          setCheckinLng(position.coords.longitude);
        },
        (error) => {
          console.warn("Không thể lấy vị trí GPS:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, [showLeaveEndConfirmation]);

  // Query current incomplete leave request (checkin_time is null = chưa quay lại)
  const currentLeaveQuery = useQueryCurrentLeaveRequest({
    params: {
      username: user?.username || "",
      projectCode: projectCode || "",
    },
    config: {
      enabled: Boolean(showLeaveEndConfirmation && user?.username && projectCode),
      refetchInterval: false,
    },
  });

  const lastIncompleteLeave = currentLeaveQuery.data?.data || null;

  // Calculate elapsed time since checkout (rời vị trí)
  const elapsedTime = React.useMemo(() => {
    if (!lastIncompleteLeave?.checkout_time) return "";
    const start = moment(lastIncompleteLeave.checkout_time);
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

  const endLeaveRequestMutation = useMutationEndLeaveRequest({
    config: {
      onSuccess: () => {
        globalStore.setState({ showLeaveEndConfirmation: false });
        setCheckinPhotoUrl(null);
        notification.success({
          title: "Thành công",
          description: "Đã ghi nhận việc kết thúc tạm rời vị trí",
          options: { duration: 5000 },
        });
        queryClient.invalidateQueries({
          queryKey: ["query/leave-request/current"],
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
    endLeaveRequestMutation.mutate({
      leaveRequestId: lastIncompleteLeave.id,
      checkinPhotoUrl: checkinPhotoUrl || undefined,
      checkinLat: checkinLat,
      checkinLng: checkinLng,
    });
  }, [lastIncompleteLeave?.id, endLeaveRequestMutation, checkinPhotoUrl, checkinLat, checkinLng]);

  React.useEffect(() => {
    if (showLeaveEndConfirmation) {
      controls.on();
    } else {
      controls.off();
    }
  }, [controls, showLeaveEndConfirmation]);

  return (
    <>
      <LoadingOverlay active={endLeaveRequestMutation.isLoading} />
      <Modal
        isOpen={showLeaveEndConfirmation}
        closeable={false}
        onClose={() => {}}
        title="Bạn đang tạm rời vị trí"
      >
        {currentLeaveQuery.isLoading && (
          <>
            <div className="my-8 flex h-full w-full items-center justify-center">
              <Spinner size="large" />
            </div>
          </>
        )}

        {!currentLeaveQuery.isLoading && lastIncompleteLeave && (
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
                    {lastIncompleteLeave.leave_type && (
                      <p className="text-sm font-medium text-gray-90">
                        Lý do:{" "}
                        {leaveTypes.find((t) => t.value === lastIncompleteLeave.leave_type)?.label ||
                          lastIncompleteLeave.leave_type}
                      </p>
                    )}
                    <p className="text-sm text-gray-70">
                      Vị trí: {lastIncompleteLeave.location_name}
                    </p>
                    <p className="text-sm text-gray-70">
                      Ca: {lastIncompleteLeave.workshift_name}
                    </p>
                  </div>
                </div>

                {/* Checkout photo preview (ảnh khi rời vị trí) */}
                {lastIncompleteLeave.checkout_photo_url && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-70">Ảnh khi rời vị trí</p>
                    <img
                      src={lastIncompleteLeave.checkout_photo_url}
                      alt="Ảnh rời vị trí"
                      className="aspect-[3/2] w-full bg-gray-10 object-contain object-center"
                    />
                  </div>
                )}

                {/* Checkin Photo (chụp ảnh khi quay lại vị trí) */}
                <ImageCaptureInputWithUpload
                  label="Chụp ảnh khi quay lại vị trí"
                  helperText="Nhấn để mở camera"
                  cloudConfig={{
                    provider: "firebase",
                    path: "leave-requests/checkin-photos",
                  }}
                  defaultFacingMode="user"
                  value={checkinPhotoUrl}
                  onChange={(url) => setCheckinPhotoUrl(url)}
                />
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full"
              size="large"
              onClick={handleEndLeave}
              disabled={endLeaveRequestMutation.isLoading}
            >
              {endLeaveRequestMutation.isLoading ? "Đang xử lý..." : "Kết thúc rời vị trí"}
            </Button>
          </>
        )}

        {!currentLeaveQuery.isLoading && !lastIncompleteLeave && (
          <div className="p-4">
            <NotificationBanner
              type="info"
              title="Thông báo"
              description="Không tìm thấy yêu cầu tạm rời vị trí nào đang mở."
              closeable={false}
            />
            <Button
              variant="secondary"
              className="mt-4 w-full"
              size="large"
              onClick={() => globalStore.setState({ showLeaveEndConfirmation: false })}
            >
              Đóng
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
});

LeaveEndConfirm.displayName = "LeaveEndConfirm";
