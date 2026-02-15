import { supabaseFmsService } from "@/services/supabase";
import { ILeaveRequest } from "@/types/model";
import dayjs from "dayjs";
import { useMutation } from "react-query";

export type EndLeaveRequestParams = {
  leaveRequestId: number;
  checkinPhotoUrl?: string;
  checkinLat?: number;
  checkinLng?: number;
};

export type EndLeaveRequestResponseData = {
  data: ILeaveRequest;
};

/**
 * End a leave request (checkin - return to position)
 * checkout = rời vị trí, checkin = quay lại vị trí
 */
export const httpRequestEndLeaveRequest = async (
  params: EndLeaveRequestParams,
): Promise<EndLeaveRequestResponseData> => {
  try {
    const checkinTime = dayjs().toISOString();

    const { data, error } = await supabaseFmsService.client
      .from("fms_app_data_leave_request")
      .update({
        checkin_time: checkinTime,
        checkin_photo_url: params.checkinPhotoUrl || null,
        checkin_lat: params.checkinLat ?? null,
        checkin_lng: params.checkinLng ?? null,
      })
      .eq("id", params.leaveRequestId)
      .is("checkin_time", null)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data: data as ILeaveRequest };
  } catch (error) {
    console.error("Error ending leave request:", error);
    throw error;
  }
};

type UseMutationEndLeaveRequestOptions = {
  config?: {
    onSuccess?: (data: EndLeaveRequestResponseData, variables: EndLeaveRequestParams, context: unknown) => void | Promise<unknown>;
    onError?: (error: Error, variables: EndLeaveRequestParams, context: unknown) => void | Promise<unknown>;
    onSettled?: (data: EndLeaveRequestResponseData | undefined, error: Error | null, variables: EndLeaveRequestParams, context: unknown) => void | Promise<unknown>;
  };
};

/**
 * Hook for ending leave request mutation
 */
export const useMutationEndLeaveRequest = ({ config }: UseMutationEndLeaveRequestOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestEndLeaveRequest,
    retry: 3,
    retryDelay: 1000,
    ...config,
  });
};
