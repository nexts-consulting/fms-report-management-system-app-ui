import { supabaseFmsService } from "@/services/supabase";
import type { IAttendance } from "@/types/model";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { useQuery } from "react-query";

export type HttpRequestCurrentShiftParams = {
  username: string;
  project_code: string;
};

export type CurrentShiftResponseData = {
  data: IAttendance | null;
};

export const httpRequestCurrentShift = async (
  params: HttpRequestCurrentShiftParams,
): Promise<CurrentShiftResponseData> => {
  try {
    // Query current attendance record (status = CHECKED_IN, not yet checked out)
    const { data, error } = await supabaseFmsService.client
      .from("fms_app_data_attendance")
      .select("*")
      .eq("username", params.username)
      .eq("project_code", params.project_code)
      .eq("status", "CHECKED_IN")
      .order("checkin_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // If no record found (PGRST116), return null
      if (error.code === "PGRST116") {
        return { data: null };
      }
      throw error;
    }

    // If no data found, return null
    if (!data) {
      return { data: null };
    }

    const attendance = data as IAttendance;
    return { data: attendance };
  } catch (error) {
    console.error("Error fetching current shift attendance:", error);
    throw error;
  }
};

type QueryFnType = typeof httpRequestCurrentShift;

type QueryOptions = {
  params: HttpRequestCurrentShiftParams;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryCurrentShift = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/attendance/current-shift", params],
    queryFn: () => httpRequestCurrentShift(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};
