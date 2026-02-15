import { supabaseFmsService } from "@/services/supabase";
import { ILeaveRequest } from "@/types/model";
import dayjs from "dayjs";
import { useMutation } from "react-query";

export type CreateLeaveRequestParams = {
  projectCode: string;
  username: string;
  workshiftId: number;
  workshiftName: string;
  locationId: number;
  locationCode: string;
  locationName: string;
  checkoutPhotoUrl?: string;
  checkoutLat?: number;
  checkoutLng?: number;
  leaveType?: string;
};

export type CreateLeaveRequestResponseData = {
  data: ILeaveRequest;
};

/**
 * Create a new leave request (checkout - start leaving position)
 * checkout = rời vị trí, checkin = quay lại vị trí
 */
export const httpRequestCreateLeaveRequest = async (
  params: CreateLeaveRequestParams,
): Promise<CreateLeaveRequestResponseData> => {
  try {
    const checkoutTime = dayjs().toISOString();

    const { data, error } = await supabaseFmsService.client
      .from("fms_app_data_leave_request")
      .insert({
        project_code: params.projectCode,
        username: params.username,
        workshift_id: params.workshiftId,
        workshift_name: params.workshiftName,
        location_id: params.locationId,
        location_code: params.locationCode,
        location_name: params.locationName,
        checkout_time: checkoutTime,
        checkin_time: null,
        checkout_photo_url: params.checkoutPhotoUrl || null,
        checkin_photo_url: null,
        checkout_lat: params.checkoutLat ?? null,
        checkout_lng: params.checkoutLng ?? null,
        checkin_lat: null,
        checkin_lng: null,
        leave_type: params.leaveType || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data: data as ILeaveRequest };
  } catch (error) {
    console.error("Error creating leave request:", error);
    throw error;
  }
};

type UseMutationCreateLeaveRequestOptions = {
  config?: {
    onSuccess?: (data: CreateLeaveRequestResponseData, variables: CreateLeaveRequestParams, context: unknown) => void | Promise<unknown>;
    onError?: (error: Error, variables: CreateLeaveRequestParams, context: unknown) => void | Promise<unknown>;
    onSettled?: (data: CreateLeaveRequestResponseData | undefined, error: Error | null, variables: CreateLeaveRequestParams, context: unknown) => void | Promise<unknown>;
  };
};

/**
 * Hook for creating leave request mutation
 */
export const useMutationCreateLeaveRequest = ({ config }: UseMutationCreateLeaveRequestOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestCreateLeaveRequest,
    retry: 3,
    retryDelay: 1000,
    ...config,
  });
};
