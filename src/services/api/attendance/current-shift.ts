import { axiosApi } from "@/libs/axios";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { IStaffAttendance } from "@/types/model";
import { useQuery } from "react-query";

type HttpRequestCurrentShiftParams = {
  staffId: number;
};

type CurrentShiftResponseData = {
  data: IStaffAttendance;
};

const httpRequestCurrentShift = async (
  params: HttpRequestCurrentShiftParams,
): Promise<CurrentShiftResponseData> => {
  try {
    const res = await axiosApi.get(`/attendance/current-shift`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
      params: {
        staffId: params.staffId,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestCurrentShift;

type QueryOptions = {
  params: HttpRequestCurrentShiftParams;
  config?: QueryConfig<QueryFnType>;
};

const useQueryCurrentShift = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/attendance/current-shift", params],
    queryFn: () => httpRequestCurrentShift(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};

export { httpRequestCurrentShift, useQueryCurrentShift };
export type { CurrentShiftResponseData };
