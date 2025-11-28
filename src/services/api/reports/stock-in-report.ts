import { axiosApi } from "@/libs/axios";
import { MutationConfig } from "@/libs/react-query";
import { useMutation } from "react-query";

type HttpRequestCreateStockInReportParams = {
  attendanceId: number;
  data: Record<string, any>[];
};

const httpRequestCreateStockInReport = async (params: HttpRequestCreateStockInReportParams) => {
  const payload = {
    attendanceId: params.attendanceId,
    data: params.data,
  };

  try {
    const res = await axiosApi.post(`/reports/stock-in`, payload, {
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type UseMutationOptions = {
  config?: MutationConfig<typeof httpRequestCreateStockInReport>;
};

const useMutationCreateStockInReport = ({ config }: UseMutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestCreateStockInReport,
    retry: 5,
    retryDelay: 1000,
    ...config,
  });
};

export { httpRequestCreateStockInReport, useMutationCreateStockInReport };
export type { HttpRequestCreateStockInReportParams };
