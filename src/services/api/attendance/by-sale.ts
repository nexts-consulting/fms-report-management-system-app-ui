import { axiosApi } from "@/libs/axios";
import { useQuery } from "react-query";
import { IOutlet, IStaffAttendance, IUserAccount, IWorkingShift } from "@/types/model";
import { IStaffProfile } from "@/types/model";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { DataUtil } from "@/utils/data.util";

type HttpRequestAttendanceBySaleParams = {
  saleProfileId: number;
  fromDate: string;
  toDate: string;
};

type AttendanceBySaleResponseData = {
  success: boolean;
  data: (IStaffAttendance & {
    staff: IStaffProfile & {
      account: IUserAccount;
    };
    shift: IWorkingShift & {
      outlet: IOutlet;
    };
  })[];
};

const httpRequestAttendanceBySale = async (
  params: HttpRequestAttendanceBySaleParams,
): Promise<AttendanceBySaleResponseData> => {
  try {
    const res = await axiosApi.get(`/reports/attendance/by-sale`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
      params,
    });
    return DataUtil.transformData(res.data);
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestAttendanceBySale;

type QueryOptions = {
  params: HttpRequestAttendanceBySaleParams;
  config?: QueryConfig<QueryFnType>;
};

const useQueryAttendanceBySale = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/attendance/by-sale", params],
    queryFn: () => httpRequestAttendanceBySale(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};

export { httpRequestAttendanceBySale, useQueryAttendanceBySale };
export type { AttendanceBySaleResponseData };
