import { axiosApi } from "@/libs/axios";
import { ExtractFnReturnType } from "@/libs/react-query";
import { QueryConfig } from "@/libs/react-query";
import { IWorkingShift } from "@/types/model";
import { useQuery } from "react-query";

type HttpRequestWorkingShiftListByOutlet = {
  outletId: number;
};

type WorkingShiftListByOutletResponseData = {
  data: IWorkingShift[];
};

const httpRequestWorkingShiftListByOutlet = async (
  params: HttpRequestWorkingShiftListByOutlet,
): Promise<WorkingShiftListByOutletResponseData> => {
  try {
    const res = await axiosApi.get(`/working-shifts/${params.outletId}`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestWorkingShiftListByOutlet;

type QueryOptions = {
  params: HttpRequestWorkingShiftListByOutlet;
  config?: QueryConfig<QueryFnType>;
};

const useQueryWorkingShiftListByOutlet = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/working-shift/list-by-outlet", params],
    queryFn: () => httpRequestWorkingShiftListByOutlet(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};

export { httpRequestWorkingShiftListByOutlet, useQueryWorkingShiftListByOutlet };
export type { WorkingShiftListByOutletResponseData };
