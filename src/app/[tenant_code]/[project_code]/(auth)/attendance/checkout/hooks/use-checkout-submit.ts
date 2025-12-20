import React from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/contexts/global.context";
import { useNotification } from "@/kits/components/Notification";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import type { CheckoutLocation } from "../common/types";
import type { IAttendance } from "@/types/model";
import { CHECKOUT_SUCCESS_REDIRECT_DELAY } from "../common/config";
import { useMutationAttendanceCheckout } from "@/services/api/application/attendance/checkout";

interface UseCheckoutSubmitOptions {
  attendance: IAttendance | null | undefined;
  checkoutLocation: CheckoutLocation | null;
  onSuccess?: () => void;
}

/**
 * Hook to handle checkout submission
 */
export const useCheckoutSubmit = ({
  attendance,
  checkoutLocation,
  onSuccess,
}: UseCheckoutSubmitOptions) => {
  const router = useRouter();
  const notification = useNotification();
  const globalStore = useGlobalContext();
  const { buildPath } = useTenantProjectPath();

  // Handle checkout success
  const handleCheckoutSuccess = React.useCallback(
    (data: { data: IAttendance }) => {
      globalStore.setState({
        selectedWorkingShift: null,
        currentAttendance: null,
      });

      // Call onSuccess callback if provided
      onSuccess?.();

      setTimeout(() => {
        notification.clear();
        router.replace(buildPath("/lobby?force=true"));
      }, CHECKOUT_SUCCESS_REDIRECT_DELAY);
    },
    [globalStore, router, buildPath, notification, onSuccess],
  );

  /**
   * Extract error message from error object
   */
  const getErrorMessage = (error: any): string => {
    const responseMessage = error?.response?.data?.message;
    const errorMessage = error?.message;
    return responseMessage || errorMessage || "Không xác định";
  };

  // Handle checkout error
  const handleCheckoutError = React.useCallback(
    (error: any) => {
      console.error("Checkout error:", error);
      const errorMessage = getErrorMessage(error);

      notification.error({
        title: "Lỗi hệ thống",
        description: `Có lỗi xảy ra khi kết thúc ca làm việc, vui lòng thử lại sau. Chi tiết: ${errorMessage}`,
        options: {
          immortal: true,
        },
      });
    },
    [notification],
  );

  const attendanceCheckoutMutation = useMutationAttendanceCheckout({
    config: {
      onSuccess: handleCheckoutSuccess,
      onError: handleCheckoutError,
    },
  });

  const submitCheckout = React.useCallback(
    (photoUrl?: string) => {
      if (!attendance || !checkoutLocation) {
        return;
      }
      attendanceCheckoutMutation.mutate({
        attendanceId: attendance.id,
        location: checkoutLocation,
        photoUrl: photoUrl || "",
      });
    },
    [attendance, checkoutLocation, attendanceCheckoutMutation],
  );

  return {
    submitCheckout,
    isLoading: attendanceCheckoutMutation.isLoading,
    mutation: attendanceCheckoutMutation,
  };
};
