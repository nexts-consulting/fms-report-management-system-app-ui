import { supabaseFmsService } from "@/services/supabase";
import { IAttendance } from "@/types/model";
import type { CheckoutLocation } from "@/app/[tenant_code]/[project_code]/(auth)/attendance/checkout/common/types";
import dayjs from "dayjs";
import { useMutation } from "react-query";

export type CheckoutMutationParams = {
  attendanceId: number;
  location: CheckoutLocation;
  photoUrl?: string;
};

export type AttendanceCheckoutResponseData = {
  data: IAttendance;
};

/**
 * Update attendance checkout record
 */
export const httpRequestAttendanceCheckout = async (
  params: CheckoutMutationParams,
): Promise<AttendanceCheckoutResponseData> => {
  try {
    const { attendanceId, location, photoUrl } = params;

    // Get current timestamp
    const checkoutTime = dayjs().toISOString();

    // Update attendance record
    const { data, error } = await supabaseFmsService.client
      .from("fms_app_data_attendance")
      .update({
        checkout_time: checkoutTime,
        checkout_photo_url: photoUrl || null,
        checkout_lat: location.lat,
        checkout_lng: location.lng,
        status: "CHECKED_OUT",
      })
      .eq("id", attendanceId)
      .eq("status", "CHECKED_IN")
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data: data as IAttendance };
  } catch (error) {
    console.error("Error updating attendance checkout:", error);
    throw error;
  }
};

type MutationFnType = typeof httpRequestAttendanceCheckout;

type UseMutationAttendanceCheckoutOptions = {
  config?: {
    onSuccess?: (data: AttendanceCheckoutResponseData, variables: CheckoutMutationParams, context: unknown) => void | Promise<unknown>;
    onError?: (error: Error, variables: CheckoutMutationParams, context: unknown) => void | Promise<unknown>;
    onSettled?: (data: AttendanceCheckoutResponseData | undefined, error: Error | null, variables: CheckoutMutationParams, context: unknown) => void | Promise<unknown>;
  };
};

/**
 * Hook for attendance checkout mutation
 */
export const useMutationAttendanceCheckout = ({ config }: UseMutationAttendanceCheckoutOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestAttendanceCheckout,
    ...config,
  });
};
