import { axiosApi } from "@/libs/axios";
import { MutationConfig } from "@/libs/react-query";
import { useMutation } from "react-query";

type HttpRequestCreateStockOutReportParams = {
  attendanceId: number;
  data: Record<string, any>[];
};

const httpRequestCreateStockOutReport = async (params: HttpRequestCreateStockOutReportParams) => {
  const payload = {
    attendanceId: params.attendanceId,
    data: params.data,
  };

  try {
    const res = await axiosApi.post(`/reports/stock-out`, payload, {
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type UseMutationOptions = {
  config?: MutationConfig<typeof httpRequestCreateStockOutReport>;
};

const useMutationCreateStockOutReport = ({ config }: UseMutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestCreateStockOutReport,
    retry: 5,
    retryDelay: 1000,
    ...config,
  });
};

export { httpRequestCreateStockOutReport, useMutationCreateStockOutReport };
export type { HttpRequestCreateStockOutReportParams };
