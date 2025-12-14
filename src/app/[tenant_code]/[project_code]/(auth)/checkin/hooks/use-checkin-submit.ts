import React from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/contexts/global.context";
import { useNotification } from "@/kits/components/Notification";
import { useMutationAttendanceCheckin } from "@/services/api/attendance/checkin";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import type { CheckinStep, CheckinLocation } from "../common/types";
import type { IProjectCheckinFlow } from "@/services/application/management/projects/configs/types";
import type { IWorkingShift } from "@/types/model";
import { createDummyFile } from "../common/utils";
import { CHECKIN_SUCCESS_REDIRECT_DELAY } from "../common/config";

interface UseCheckinSubmitOptions {
  userId: number;
  workingShift: IWorkingShift | null | undefined;
  checkinLocation: CheckinLocation | null;
  checkinFlow: IProjectCheckinFlow | null | undefined;
  availableSteps: CheckinStep[];
  onStepChange: (stepIndex: number) => void;
  onSuccess?: () => void;
}

export const useCheckinSubmit = ({
  userId,
  workingShift,
  checkinLocation,
  checkinFlow,
  availableSteps,
  onStepChange,
  onSuccess,
}: UseCheckinSubmitOptions) => {
  const router = useRouter();
  const notification = useNotification();
  const globalStore = useGlobalContext();
  const { buildPath } = useTenantProjectPath();

  // Handle checkin success
  const handleCheckinSuccess = React.useCallback(
    (data: { data: any }) => {
      globalStore.setState({
        currentAttendance: data.data,
      });

      // Call onSuccess callback if provided
      onSuccess?.();

      setTimeout(() => {
        if (checkinFlow?.require_post_shift_task) {
          const postShiftTaskIndex = availableSteps.indexOf("post_shift_task");
          if (postShiftTaskIndex !== -1) {
            onStepChange(postShiftTaskIndex);
            return;
          }
        }
        router.push(buildPath("/attendance/tracking"));
      }, CHECKIN_SUCCESS_REDIRECT_DELAY);
    },
    [checkinFlow, availableSteps, globalStore, router, buildPath, onStepChange, onSuccess],
  );

  // Handle checkin error
  const handleCheckinError = React.useCallback(
    (error: any) => {
      console.error("Checkin error:", error);
      const errorMessage =
        (error?.response?.data as any)?.message || error?.message || "Không xác định";

      notification.error({
        title: "Lỗi hệ thống",
        description: `Có lỗi xảy ra khi tạo ca làm việc, vui lòng thử lại sau. Chi tiết: ${errorMessage}`,
        options: {
          immortal: true,
        },
      });
    },
    [notification],
  );

  const attendanceCheckinMutation = useMutationAttendanceCheckin({
    config: {
      onSuccess: handleCheckinSuccess,
      onError: handleCheckinError,
    },
  });

  // Submit checkin
  const submitCheckin = React.useCallback(
    (file: File) => {
      if (!workingShift || !checkinLocation) return;

      attendanceCheckinMutation.mutate({
        staffId: userId,
        shiftId: workingShift.id,
        location: checkinLocation,
        file,
      });
    },
    [workingShift, checkinLocation, userId, attendanceCheckinMutation],
  );

  // Handle submit when photo is not required
  const submitWithoutPhoto = React.useCallback(() => {
    const dummyFile = createDummyFile();
    submitCheckin(dummyFile);
  }, [submitCheckin]);

  return {
    submitCheckin,
    submitWithoutPhoto,
    isLoading: attendanceCheckinMutation.isLoading,
    mutation: attendanceCheckinMutation,
  };
};
