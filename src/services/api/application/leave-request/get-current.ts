import { supabaseFmsService } from "@/services/supabase";
import { ILeaveRequest } from "@/types/model";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { useQuery } from "react-query";

export type GetCurrentLeaveRequestParams = {
  username: string;
  projectCode: string;
};

export type GetCurrentLeaveRequestResponseData = {
  data: ILeaveRequest | null;
};

/**
 * Get current incomplete leave request (checkin_time is null = chưa quay lại vị trí)
 * checkout = rời vị trí, checkin = quay lại vị trí
 */
export const httpRequestGetCurrentLeaveRequest = async (
  params: GetCurrentLeaveRequestParams,
): Promise<GetCurrentLeaveRequestResponseData> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_app_data_leave_request")
      .select("*")
      .eq("username", params.username)
      .eq("project_code", params.projectCode)
      .is("checkin_time", null)
      .order("checkout_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST116") {
        return { data: null };
      }
      throw error;
    }

    if (!data) {
      return { data: null };
    }

    return { data: data as ILeaveRequest };
  } catch (error) {
    console.error("Error fetching current leave request:", error);
    throw error;
  }
};

type QueryFnType = typeof httpRequestGetCurrentLeaveRequest;

type UseQueryCurrentLeaveRequestOptions = {
  params: GetCurrentLeaveRequestParams;
  config?: QueryConfig<QueryFnType>;
};

/**
 * Hook for querying current incomplete leave request
 */
export const useQueryCurrentLeaveRequest = ({
  params,
  config,
}: UseQueryCurrentLeaveRequestOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/leave-request/current", params.username, params.projectCode],
    queryFn: () => httpRequestGetCurrentLeaveRequest(params),
    retry: false,
    refetchOnWindowFocus: false,
    ...config,
  });
};
