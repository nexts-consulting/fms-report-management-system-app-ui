import { Button } from "@/kits/components/Button";
import { Icons } from "@/kits/components/Icons";
import { SelectModal } from "@/kits/components/SelectModal";
import { TextArea } from "@/kits/components/TextArea";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGlobalContext } from "@/contexts/global.context";
import { useNotification } from "@/kits/components/Notification";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { FormErrorMessage } from "../FormErrorMessage";
import { useQueryClient } from "react-query";
import { useMutationCreateStaffLeave } from "@/services/api/application/staff-leaves/create";

const leaveSchema = z.object({
  leaveType: z.string({
    required_error: "Vui lòng chọn lý do",
  }),
  note: z.string().optional(),
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

export const LeaveStartConfirm = React.memo(() => {
  const globalStore = useGlobalContext();
  const notification = useNotification();
  const queryClient = useQueryClient();
  const currentAttendance = globalStore.use.currentAttendance();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
  });

  const createStaffLeaveMutation = useMutationCreateStaffLeave({
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
          queryKey: ["query/attendance/current-shift"],
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
    if (!currentAttendance?.id) return;

    createStaffLeaveMutation.mutate({
      attendanceId: currentAttendance.id,
      leaveType: data.leaveType,
      note: data.note,
    });
  });

  return (
    <>
      <LoadingOverlay active={createStaffLeaveMutation.isLoading} />
      <form onSubmit={onSubmit}>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <SelectModal
                label="Chọn lý do"
                options={[
                  { value: "LUNCH_BREAK", label: "Đi ăn trưa/tối" },
                  { value: "RESTROOM", label: "Đi vệ sinh" },
                  { value: "BREAK_TIME", label: "Giải lao" },
                  { value: "GET_SUPPLIES", label: "Lấy hàng/vật dụng" },
                  { value: "PRIVATE_TASK", label: "Công việc riêng" },
                  { value: "QUICK_MEETING", label: "Họp nhanh với quản lý" },
                  { value: "PHONE_CALL", label: "Nghe điện thoại khẩn" },
                  { value: "OTHER_REASON", label: "Lý do khác" },
                ]}
                defaultOption={null}
                onSelect={(option) => setValue("leaveType", option?.value || "")}
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

            <TextArea
              label="Ghi chú"
              placeholder="Nhập ghi chú (nếu có)"
              rows={3}
              {...register("note")}
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
          disabled={createStaffLeaveMutation.isLoading}
        >
          {createStaffLeaveMutation.isLoading ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </form>
    </>
  );
});

LeaveStartConfirm.displayName = "LeaveStartConfirm";
