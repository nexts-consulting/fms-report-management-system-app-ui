import React from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/contexts/global.context";
import { useAuthContext } from "@/contexts/auth.context";
import { useNotification } from "@/kits/components/Notification";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import type { CheckinStep, CheckinLocation } from "../../app/[tenant_code]/[project_code]/(auth)/checkin/common/types";
import type { IProjectCheckinFlow } from "@/types/model";
import type { IWorkingShiftLocation, KeycloakUser } from "@/types/model";
import { CHECKIN_SUCCESS_REDIRECT_DELAY } from "../../app/[tenant_code]/[project_code]/(auth)/checkin/common/config";
import { useMutationAttendanceCheckin } from "@/services/api/application/attendance/checkin";

interface UseCheckinSubmitOptions {
  user: KeycloakUser;
  workingShiftLocation: IWorkingShiftLocation | null | undefined;
  checkinLocation: CheckinLocation | null;
  checkinFlow: IProjectCheckinFlow | null | undefined;
  availableSteps: CheckinStep[];
  onStepChange: (stepIndex: number) => void;
  onSuccess?: () => void;
}

export const useCheckinSubmit = ({
  user,
  workingShiftLocation,
  checkinLocation,
  checkinFlow,
  availableSteps,
  onStepChange,
  onSuccess,
}: UseCheckinSubmitOptions) => {
  const router = useRouter();
  const notification = useNotification();
  const globalStore = useGlobalContext();
  const { buildPath, projectCode } = useTenantProjectPath();

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

  /**
   * Extract error message from error object
   */
  const getErrorMessage = (error: any): string => {
    const responseMessage = error?.response?.data?.message;
    const errorMessage = error?.message;
    return responseMessage || errorMessage || "Không xác định";
  };

  // Handle checkin error
  const handleCheckinError = React.useCallback(
    (error: any) => {
      console.error("Checkin error:", error);
      const errorMessage = getErrorMessage(error);

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

  const submitCheckin = React.useCallback(
    (photoUrl?: string) => {
      if (!workingShiftLocation || !checkinLocation || !projectCode || !user?.username) {
        return;
      }
      attendanceCheckinMutation.mutate({
        userId: user.id,
        shiftId: workingShiftLocation.id,
        location: checkinLocation ? {
          lat: checkinLocation.lat,
          lng: checkinLocation.lng,
          acc: checkinLocation.acc,
        } : {
          lat: 0,
          lng: 0,
          acc: 0,
        },
        photoUrl: photoUrl || "",
        projectCode,
        username: user.username,
        workshiftName: workingShiftLocation.name,
        locationId: workingShiftLocation.location.id,
        locationCode: workingShiftLocation.location.code,
        locationName: workingShiftLocation.location.name,
        workshiftStartTime: workingShiftLocation.start_time,
        workshiftEndTime: workingShiftLocation.end_time
      });
    },
    [workingShiftLocation, checkinLocation, user, attendanceCheckinMutation, projectCode],
  );

  return {
    submitCheckin,
    isLoading: attendanceCheckinMutation.isLoading,
    mutation: attendanceCheckinMutation,
  };
};
