import { axiosApi } from "@/libs/axios";
import { ExtractFnReturnType } from "@/libs/react-query";
import { QueryConfig } from "@/libs/react-query";
import { IReportItem } from "@/types/model";
import { useQuery } from "react-query";

type HttpRequestReportItemsListByReportType = {
  reportType: "OOS" | "SALES" | "SAMPLING" | "STOCK_IN" | "STOCK_OUT";
};

type ReportItemsListByReportTypeResponseData = {
  data: IReportItem[];
};

const httpRequestReportItemsListByReportType = async (
  params: HttpRequestReportItemsListByReportType,
): Promise<ReportItemsListByReportTypeResponseData> => {
  const queryParams = {
    type: params.reportType,
  };

  try {
    const res = await axiosApi.get(`/report-items/by-report-type`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
      params: queryParams,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestReportItemsListByReportType;

type QueryOptions = {
  params: HttpRequestReportItemsListByReportType;
  config?: QueryConfig<QueryFnType>;
};

const useQueryReportItemsListByReportType = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/report-items/list-by-report-type", params],
    queryFn: () => httpRequestReportItemsListByReportType(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};

export { httpRequestReportItemsListByReportType, useQueryReportItemsListByReportType };
export type { ReportItemsListByReportTypeResponseData };
