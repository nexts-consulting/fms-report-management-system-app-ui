"use client";

import { Button } from "@/kits/components/button";
import { Icons } from "@/kits/components/icons";
import { ImageCaptureInputWithUpload } from "@/kits/components/image-capture-input-upload";
import { SelectModal } from "@/kits/components/select-modal";
import { TextArea } from "@/kits/components/text-area";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGlobalContext } from "@/contexts/global.context";
import { useAuthContext } from "@/contexts/auth.context";
import { useNotification } from "@/kits/components/notification";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { FormErrorMessage } from "../FormErrorMessage";
import { useQueryClient } from "react-query";
import { useMutationCreateLeaveRequest } from "@/services/api/application/leave-request/create";
import { useParams } from "next/navigation";

const leaveTypeOptions = [
  { value: "LUNCH_BREAK", label: "Đi ăn trưa/tối" },
  { value: "RESTROOM", label: "Đi vệ sinh" },
  { value: "BREAK_TIME", label: "Giải lao" },
  { value: "GET_SUPPLIES", label: "Lấy hàng/vật dụng" },
  { value: "PRIVATE_TASK", label: "Công việc riêng" },
  { value: "QUICK_MEETING", label: "Họp nhanh với quản lý" },
  { value: "PHONE_CALL", label: "Nghe điện thoại khẩn" },
  { value: "OTHER_REASON", label: "Lý do khác" },
];

const leaveSchema = z.object({
  leaveType: z.string({
    required_error: "Vui lòng chọn lý do",
  }),
  checkoutPhotoUrl: z.string({
    required_error: "Vui lòng chụp ảnh trước khi rời vị trí",
  }),
  note: z.string().optional(),
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

export const LeaveStartConfirm = React.memo(() => {
  const globalStore = useGlobalContext();
  const authStore = useAuthContext();
  const notification = useNotification();
  const queryClient = useQueryClient();
  const params = useParams();

  const user = authStore.use.user();
  const currentAttendance = globalStore.use.currentAttendance();
  const projectCode = params?.project_code as string;

  // Get current GPS position (checkout = rời vị trí)
  const [checkoutLat, setCheckoutLat] = React.useState<number | undefined>();
  const [checkoutLng, setCheckoutLng] = React.useState<number | undefined>();

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCheckoutLat(position.coords.latitude);
          setCheckoutLng(position.coords.longitude);
        },
        (error) => {
          console.warn("Không thể lấy vị trí GPS:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, []);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
  });

  const checkoutPhotoUrl = watch("checkoutPhotoUrl");

  const createLeaveRequestMutation = useMutationCreateLeaveRequest({
    config: {
      onSuccess: () => {
        notification.success({
          title: "Thành công",
          description: "Đã ghi nhận việc tạm rời vị trí của bạn",
          options: {
            duration: 5000,
          },
        });
        globalStore.setState({ showLeaveConfirmation: false, showLeaveEndConfirmation: true });
        queryClient.invalidateQueries({
          queryKey: ["query/leave-request/current"],
          exact: false,
        });
      },
      onError: () => {
        notification.error({
          title: "Lỗi",
          description: "Không thể ghi nhận. Vui lòng thử lại",
          options: {
            duration: 5000,
          },
        });
      },
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (!currentAttendance?.id || !user?.username) return;

    createLeaveRequestMutation.mutate({
      projectCode: projectCode,
      username: user.username,
      workshiftId: currentAttendance.workshift_id ?? 0,
      workshiftName: currentAttendance.workshift_name ?? "",
      locationId: currentAttendance.location_id ?? 0,
      locationCode: currentAttendance.location_code ?? "",
      locationName: currentAttendance.location_name ?? "",
      checkoutPhotoUrl: data.checkoutPhotoUrl,
      checkoutLat: checkoutLat,
      checkoutLng: checkoutLng,
      leaveType: data.leaveType,
    });
  });

  return (
    <>
      <LoadingOverlay active={createLeaveRequestMutation.isLoading} />
      <form onSubmit={onSubmit}>
        <div className="p-4">
          <div className="space-y-4">
            {/* Leave Type */}
            <div>
              <SelectModal
                label="Chọn lý do"
                options={leaveTypeOptions}
                defaultOption={null}
                onSelect={(option) => setValue("leaveType", option?.value || "", { shouldValidate: true })}
                placeholder="Chọn lý do tạm rời vị trí"
                searchPlaceholder="Tìm kiếm lý do"
                messages={{
                  noOptions: "Danh sách lý do trống",
                  noOptionsFound: "Không tìm thấy lý do",
                }}
                error={!!errors.leaveType}
              />
              <FormErrorMessage name="leaveType" errors={errors} />
            </div>

            {/* Checkout Photo (chụp ảnh khi rời vị trí) */}
            <div>
              <ImageCaptureInputWithUpload
                label="Chụp ảnh trước khi rời vị trí"
                helperText="Nhấn để mở camera"
                cloudConfig={{
                  provider: "firebase",
                  path: "leave-requests/checkout-photos",
                }}
                defaultFacingMode="user"
                value={checkoutPhotoUrl || null}
                onChange={(url) => setValue("checkoutPhotoUrl", url || "", { shouldValidate: true })}
                error={!!errors.checkoutPhotoUrl}
              />
              <FormErrorMessage name="checkoutPhotoUrl" errors={errors} />
            </div>

            {/* Note */}
            <TextArea
              label="Ghi chú"
              placeholder="Nhập ghi chú (nếu có)"
              rows={3}
              onChange={(e) => setValue("note", e.target.value)}
              error={!!errors.note}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          variant="primary"
          size="large"
          icon={Icons.Pedestrian}
          disabled={createLeaveRequestMutation.isLoading}
        >
          {createLeaveRequestMutation.isLoading ? "Đang xử lý..." : "Xác nhận rời vị trí"}
        </Button>
      </form>
    </>
  );
});

LeaveStartConfirm.displayName = "LeaveStartConfirm";
