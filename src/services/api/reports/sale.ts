import { axiosApi } from "@/libs/axios";
import { MutationConfig } from "@/libs/react-query";
import { useMutation } from "react-query";

type HttpRequestCreateSalesReportParams = {
  attendanceId: number;
  data: Record<string, any>[];
};

const httpRequestCreateSalesReport = async (params: HttpRequestCreateSalesReportParams) => {
  const payload = {
    attendanceId: params.attendanceId,
    data: params.data,
  };

  try {
    const res = await axiosApi.post(`/reports/sale`, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

type UseMutationOptions = {
  config?: MutationConfig<typeof httpRequestCreateSalesReport>;
};

const useMutationCreateSalesReport = ({ config }: UseMutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestCreateSalesReport,
    ...config,
  });
};

export { httpRequestCreateSalesReport, useMutationCreateSalesReport };
export type { HttpRequestCreateSalesReportParams };
